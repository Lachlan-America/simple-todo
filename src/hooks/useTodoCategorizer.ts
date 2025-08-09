import { useRef } from "react";
import { Todo } from "./useTodos";
import { Category } from "./useCategories";

export default function useTodoCategorizer(setTodos: React.Dispatch<React.SetStateAction<Todo[]>>,
    setCategories: React.Dispatch<React.SetStateAction<Category[]>>) {

    const categorizeQueue = useRef<Todo[]>([]);
    const timer = useRef<NodeJS.Timeout | null>(null);

    const addTodo = (text: string) => {
        const newTodo: Todo = {
            id: crypto.randomUUID(),
            text,
            completed: false,
            createdAt: new Date(),
            category: null,
        };
        setTodos(prev => [newTodo, ...prev]);
        categorizeQueue.current.push(newTodo);

        if (!timer.current) {
            timer.current = setTimeout(() => {
                runCategorizeBatch();
            }, 3000);  // Wait 3 seconds of inactivity before categorizing
        }
    };

    const runCategorizeBatch = async () => {
        const batch = [...categorizeQueue.current];
        categorizeQueue.current = [];
        timer.current = null;

        for (const todo of batch) {
            // await your categorizeTodo call here, spaced out if needed
            await categorizeTodo(todo);
        }
    };

    const categorizeTodo = async (todo: Todo) => {
        try {
            const res = await fetch("/api/categorize", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ todos: [todo] }),
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

    return { addTodo };
}
