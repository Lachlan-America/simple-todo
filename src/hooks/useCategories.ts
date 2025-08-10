import { useEffect, useMemo, useState } from "react";
import { Todo } from "./useTodos";

export type Category = {
    name: string;
    selected: boolean;
}

export function useCategories(
    todos: Todo[], 
    categories: Category[], 
    setCategories: React.Dispatch<React.SetStateAction<Category[]>>, 
    setTodos: React.Dispatch<React.SetStateAction<Todo[]>>) {

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const debounceTime = 5000; // 5 seconds

    // Dependency is related to a change in todos, but only categorizes them if there are uncategorized todos (prevents infinite loop)
    useEffect(() => {
        const uncategorized = todos.filter(todo => !todo.category || todo.category.length === 0);
        if (uncategorized.length === 0) return;
        setIsLoading(true);
        const handler = setTimeout(() => {
            categorizeTodos(uncategorized);
        }, debounceTime);

        return () => clearTimeout(handler); // reset timer if todos changes before debounceTime
    }, [todos]);

    const categorizeTodos = async (uncategorizedTodos: Todo[], retryCount = 0) => {
        try {
            // Categorizes many-to-many to reduce token overhead
            const res = await fetch("/api/categorize", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    todos: uncategorizedTodos.map((todo) => ({
                        id: todo.id,
                        text: todo.text,
                    })),
                }),
                credentials: "include",
            });

            const data: {categories: { id: string; name: string }[]} = await res.json();

            if (res.status === 429) { // rate limit error
                if (retryCount >= 5) throw new Error("Max retries reached");

                const retryAfter = 10_000; // 10 seconds, or get from response header if available
                await new Promise((resolve) => setTimeout(resolve, retryAfter));
                return categorizeTodos(uncategorizedTodos, retryCount + 1); // retry recursively
            }
            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            // Unpack the data
            const results = data.categories;
            console.log(results);

            // Update the todos that were previously uncategorized and update via the recently fetched category
            setTodos((prev) =>
                prev.map((todo) => {
                    const match = results.find((r: { id: string; name: string }) => r.id === todo.id);
                    return match ? { ...todo, category: match.name } : todo;
                })
            );

            // Specify a new categories variable using the Category interface (easier to write the following mapping)
            // Remove duplicates in newCats itself by name
            const uniqueNewCatsMap = new Map<string, Category>();
            for (const r of results) {
                if (!uniqueNewCatsMap.has(r.name)) {
                    uniqueNewCatsMap.set(r.name, { name: r.name, selected: false });
                }
            }
            const newCats = Array.from(uniqueNewCatsMap.values());
            setIsLoading(false);
            // Only adds unique categories not currently a part of the set
            setCategories((prev) => {
                // Yield unique names only
                const existingNames = new Set(prev.map((c) => c.name));
                // If it isn't unique, don't append
                return [...prev, ...newCats.filter((c: Category) => !existingNames.has(c.name))];
            });

        } catch (err) {
            console.error("Failed to categorize:", err);
        }
    };

    const selectedCategoryNames = useMemo(() => {
        return categories.filter((cat) => cat.selected).map((cat) => cat.name);
    }, [categories]);

    function changeSelectedCategory(name: string): void {
        setCategories(prev =>
            prev.map(category =>
                category.name === name ? { ...category, selected: !category.selected } : category
            )
        );
    }

    return {
        changeSelectedCategory,
        selectedCategoryNames,
        isLoading
    };
}