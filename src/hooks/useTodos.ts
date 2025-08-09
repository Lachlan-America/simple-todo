import { Category } from "./useCategories";
import { useEffect, useMemo, useState } from "react";

export interface Todo {
    id: string;
    text: string;
    completed: boolean;
    createdAt: Date;
    category: string | null;
}

export default function useTodos(setTodos: React.Dispatch<React.SetStateAction<Todo[]>>,
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
        deleteTodo,
        toggleTodo,
        reorderTodos,
        getAISummary,
        visibleTodos
    };
}