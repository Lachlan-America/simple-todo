import { Console } from "console";
import { Category } from "./useCategories";
import { useEffect, useMemo, useState } from "react";

export interface Todo {
    id: string;
    text: string;
    completed: boolean;
    createdAt: Date;
    category: string | null;
}

export function useTodos(setTodos: React.Dispatch<React.SetStateAction<Todo[]>>,
    setCategories: React.Dispatch<React.SetStateAction<Category[]>>,
    setAISummary: React.Dispatch<React.SetStateAction<string>>,
    todos: Todo[],
    selectedCategoryNames: string[]
) {
    const [lastAddedId, setLastAddedId] = useState<string | null>(null);
    // state, add, toggle, delete, reorder
    // sync with localStorage

    const getAISummary = async () => {
        try {
            const res = await fetch("/api/summary", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ todos: todos }),
                credentials: "include",
            });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(`HTTP ${res.status}: ${data?.error || "Unknown error"}`);
            }

            console.log("AI Summary response:", data);
            setAISummary(() => data.summary);
        } catch (err) {
            console.error("Failed to get AI summary:", err);
        }
    };
    const categorizeTodo = async (todo: Todo) => {
        try {
            const res = await fetch("/api/categorize", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: todo.text }),
                credentials: "include",
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(`HTTP ${res.status}: ${data?.error || "Unknown error"}`);
            }

            // Update categories
            setCategories((prev) =>
                prev.some((cat) => cat.name === data.name) ? prev : [...prev, data]
            );

            return data;
        } catch (err) {
            console.error("Failed to categorize:", err);
            return null;
        }
    };

    const addTodo = (text: string) => {
        const newTodo: Todo = {
            id: crypto.randomUUID(),
            text,
            completed: false,
            createdAt: new Date(),
            category: null,
        };

        setTodos((prev) => [newTodo, ...prev]);
        setLastAddedId(newTodo.id); // <-- trigger useEffect to run categorize
    };

    // Watch for changes in `lastAddedId`
    useEffect(() => {
        if (!lastAddedId) return;

        const todo = todos.find((t) => t.id === lastAddedId && t.category === null);
        if (!todo) return;

        const runCategorization = async () => {
            try {
                const category = await categorizeTodo(todo);
                if (category) {
                    setTodos((prev) =>
                        prev.map((t) =>
                            t.id === todo.id ? { ...t, category: category.name } : t
                        )
                    );
                }
            } catch (err) {
                console.error("Categorization failed", err);
            }
        };

        runCategorization();
    }, [lastAddedId, todos]); // Trigger when either changes
    
    const deleteTodo = (id: string) => {
        setTodos((prev: Todo[]) => prev.filter((todo) => todo.id !== id));
    };
    const toggleTodo = (id: string) => {
        setTodos((prev: Todo[]) =>
            prev.map((todo) => todo.id === id ? { ...todo, completed: !todo.completed } : todo)
        );
    };
    const reorderTodos = (dragIndex: number, hoverIndex: number) => {
        setTodos((prev: Todo[]) => {
            const incompleteTodos = prev.filter((todo) => !todo.completed);
            const completedTodos = prev.filter((todo) => todo.completed);

            // Only allow reordering within incomplete todos
            if (dragIndex >= incompleteTodos.length || hoverIndex >= incompleteTodos.length) {
                return prev;
            }

            const result = [...incompleteTodos];
            const [removed] = result.splice(dragIndex, 1);
            result.splice(hoverIndex, 0, removed);

            return [...result, ...completedTodos];
        });
    };

    const sortedTodos = useMemo(() => {
        return [...todos].sort((a, b) => {
            if (a.completed && !b.completed) return 1;
            if (!a.completed && b.completed) return -1;
            return 0;
        });
    }, [todos]);

    const visibleTodos = useMemo(() => {
        return selectedCategoryNames.length > 0 ? sortedTodos.filter((todo) => selectedCategoryNames.includes(todo.category || "")) : sortedTodos;
    }, [sortedTodos, selectedCategoryNames]);

    return {
        addTodo,
        deleteTodo,
        toggleTodo,
        reorderTodos,
        getAISummary,
        visibleTodos
    };
}