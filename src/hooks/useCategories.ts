import { useEffect, useMemo } from "react";
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

    // Dependency is related to a change in todos, but only categorizes them if there are uncategorized todos (prevents infinite loop)
    useEffect(() => {
        const uncategorized = todos.filter((todo) => !todo.category || todo.category.length === 0);
        if (uncategorized.length === 0) return;

        categorizeTodos(uncategorized);
    }, [todos]);

    const categorizeTodos = async (uncategorizedTodos: Todo[]) => {
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
            const newCats = results.map((r: { id: string; name: string }) => ({ name: r.name, selected: false }));

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
    };
}