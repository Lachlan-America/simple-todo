'use client'
import { useEffect, useState, useMemo } from "react";
import TodoInput from "../components/TodoInput";
// Update the path below to the correct relative path where TodoItem and Todo are exported
import TodoItem, { type Todo } from "../components/TodoItem";
import TodoStats from "../components/TodoStats";
import TypingParagraph from "@/components/TypingParagraph";

export type Category = {
    name: string;
    selected: boolean;
}

const LOCAL_STORAGE_KEYS = {
    todos: "todos",
    categories: "categories",
    summary: "ai_summary",
};

export default function Home() {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [AISummary, setAISummary] = useState<string>("");

    // === Load from localStorage on mount ===
    useEffect(() => {
        const storedTodos = localStorage.getItem(LOCAL_STORAGE_KEYS.todos);
        const storedCategories = localStorage.getItem(LOCAL_STORAGE_KEYS.categories);
        const storedSummary = localStorage.getItem(LOCAL_STORAGE_KEYS.summary);

        if (storedTodos) setTodos(JSON.parse(storedTodos));
        if (storedCategories) setCategories(JSON.parse(storedCategories));
        if (storedSummary) setAISummary(JSON.parse(storedSummary));
    }, []);

    // === Save todos to localStorage whenever they change ===
    useEffect(() => {
        localStorage.setItem(LOCAL_STORAGE_KEYS.todos, JSON.stringify(todos));
    }, [todos]);

    useEffect(() => {
        localStorage.setItem(LOCAL_STORAGE_KEYS.categories, JSON.stringify(categories));
    }, [categories]);

    useEffect(() => {
        localStorage.setItem(LOCAL_STORAGE_KEYS.summary, JSON.stringify(AISummary));
    }, [AISummary]);

    // Where the todo item is added
    const addTodo = (text: string) => {

        const newTodo: Todo = {
            id: crypto.randomUUID(),
            text,
            completed: false,
            createdAt: new Date(),
            category: null,
        };
        // Add the new todo to the state and wait asynchronously for categorization
        setTodos(prev => [newTodo, ...prev]);
        categorizeTodo(newTodo);
    };

    const categorizeTodo = async (todo: Todo) => {
        try {
            const res = await fetch("/api/categorize", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: todo.text }),
            });

            const data = await res.json();
            // Ensure the response is cleaned
            const normalized = data.name.trim().toLowerCase().replace(/^\w/, (c: string) => c.toUpperCase());
            const category = { name: normalized, selected: false };

            // If the category already exists, do not add it again
            setCategories(prev => {
                if (prev.some(cat => cat.name === category.name)) return prev;
                return [...prev, category];
            });
            // Update the todo with the categorized name if it exists
            setTodos(prev =>
                prev.map(t =>
                    t.id === todo.id ? { ...t, category: data.name } : t
                )
            );
        } catch (err) {
            console.error("Failed to categorize:", err);
        }
    };

    const getAISummary = async () => {
        try {
            const res = await fetch("/api/summary", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ todos: todos }),
            });
            const data = await res.json();
            console.log("AI Summary response:", data);
            setAISummary(() => data.summary);

        } catch (err) {
            console.error("Failed to get AI summary:", err);
        }
    };

    const toggleTodo = (id: string) => {
        setTodos(prev =>
            prev.map(todo =>
                todo.id === id ? { ...todo, completed: !todo.completed } : todo
            )
        );
    };

    const deleteTodo = (id: string) => {
        setTodos(prev => prev.filter(todo => todo.id !== id));
    };

    const reorderTodos = (dragIndex: number, hoverIndex: number) => {
        setTodos(prev => {
            const incompleteTodos = prev.filter(todo => !todo.completed);
            const completedTodos = prev.filter(todo => todo.completed);

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

    const selectedCategoryNames = useMemo(() => {
        return categories.filter((cat) => cat.selected).map((cat) => cat.name);
    }, [categories]);

    const visibleTodos = useMemo(() => {
        return selectedCategoryNames.length > 0
            ? sortedTodos.filter((todo) => selectedCategoryNames.includes(todo.category || ""))
            : sortedTodos;
    }, [sortedTodos, selectedCategoryNames]);

    function changeSelectedCategory(name: string): void {
        setCategories(prev =>
            prev.map(category =>
                category.name === name ? { ...category, selected: !category.selected } : category
            )
        );
    }

    return (
        <div className="min-h-screen">
            <div className="container max-w-2xl mx-auto py-8 px-4">
                <div className="text-center mb-8">
                    <h1 className="text-5xl font-bold text-white mb-8">Todo List</h1>
                    <p className="text-lg">
                        Stay organized and get things done
                    </p>
                </div>
                <div className="space-y-4">
                    <TodoInput onAdd={addTodo} />

                    <div className="flex flex-col gap-4 items-center justify-between w-full">
                        {AISummary && <TypingParagraph text={AISummary} />}
                        <button
                            onClick={getAISummary}
                            disabled={todos.length === 0}
                            className="bg-gradient-primary hover:shadow-glow transition-all duration-200 h-10 px-4
                                hover:border hover:border-white focus:border-white active:border-white border border-transparent rounded-xl bg-[#232223]">
                            Generate AI Summary
                        </button>
                    </div>

                    <TodoStats todos={todos} />

                    {categories.length > 0 && (
                        <div className="flex items-center justify-center gap-4 mb-4">
                            {categories.map(category => (
                                <div key={category.name} className={"text-sm p-2 rounded-full" + (category.selected ? " bg-blue-500" : " bg-gray-500")} onClick={() => changeSelectedCategory(category.name)}>
                                    {category.name}
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="space-y-3">
                        {visibleTodos.map((todo, index) => (
                            <TodoItem
                                key={todo.id}
                                todo={todo}
                                index={index}
                                onToggle={toggleTodo}
                                onDelete={deleteTodo}
                                onReorder={reorderTodos}
                                isDraggable={!todo.completed}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
