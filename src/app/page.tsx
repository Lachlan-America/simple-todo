'use client'
import { useState } from "react";
import TodoInput from "../components/TodoInput";
// Update the path below to the correct relative path where TodoItem and Todo are exported
import TodoItem, { type Todo } from "../components/TodoItem";
import TodoStats from "../components/TodoStats";
import { getCategoryFromGPT } from "../api/categorize";

export type Category = {
    name: string;
    selected: boolean;
}

export default function Home() {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);

    // Where the todo item is added
    const addTodo = (text: string) => {

        const newTodo: Todo = {
            id: crypto.randomUUID(),
            text,
            completed: false,
            createdAt: new Date(),
            category: null,
        };

        setTodos(prev => [newTodo, ...prev]);

        categorizeTodo(newTodo);
    };

    const categorizeTodo = async (todo: Todo) => {
        try {
            const category_name = await getCategoryFromGPT(todo.text);
            const category = { name: category_name, selected: false };

            setCategories(prev => [...prev, category]);
            setTodos(prev => [...prev, { ...todo, category: category_name }]);
        } catch (err) {
            console.error("Failed to categorize:", err);
            // Optionally set a 'failed' or 'uncategorized' label
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

    // Sort todos: incomplete first, completed last
    const sortedTodos = [...todos].sort((a, b) => {
        if (a.completed && !b.completed) return 1;
        if (!a.completed && b.completed) return -1;
        return 0;
    });

    // Returns the filtered categories based on selected state
    const selectedCategoryNames = categories
        .filter((cat) => cat.selected)
        .map((cat) => cat.name);

    // Returns the todos that match the selected categories
    const visibleTodos = selectedCategoryNames.length > 0 ? sortedTodos.filter((todo) => selectedCategoryNames.includes(todo.category || "")) : sortedTodos;

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

                    <TodoStats todos={todos} />

                    {categories.length > 0 && (
                        <div className="text-sm mb-4">
                            {categories.map(category => (
                                <button key={category.name} className="text-sm" onClick={() => changeSelectedCategory(category.name)}>
                                    {category.name}
                                </button>
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
