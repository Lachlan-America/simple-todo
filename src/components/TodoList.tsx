'use client'
import { useCategories, type Category } from "@/hooks/useCategories";
import useLocalStorage from "@/hooks/useLocalStorage";
import useTodos, { Todo } from "@/hooks/useTodos";
import TodoInput from "./TodoInput";
import TodoStats from "./TodoStats";
import TypingParagraph from "./TypingParagraph";
import TodoItem from "./TodoItem";
import AuthButton from "./AuthButton";
import { Loader2 } from "lucide-react";

const LOCAL_STORAGE_KEYS = {
    todos: "todos",
    categories: "categories",
    summary: "ai_summary",
};

export default function TodoList() {
    // Custom Setter and Getter hooks for localStorage
    const [todos, setTodos] = useLocalStorage<Todo[]>(LOCAL_STORAGE_KEYS.todos, []);
    const [categories, setCategories] = useLocalStorage<Category[]>(LOCAL_STORAGE_KEYS.categories, []);
    const [AISummary, setAISummary] = useLocalStorage<string>(LOCAL_STORAGE_KEYS.summary, "");

    const { selectedCategoryNames, changeSelectedCategory, isLoading } = useCategories(todos, categories, setCategories, setTodos);
    const { addTodo, deleteTodo, toggleTodo, reorderTodos, getAISummary, visibleTodos, errorMessage } = useTodos(setTodos, setCategories, setAISummary, todos, selectedCategoryNames);

    return (
        <div>
            <TodoInput onAdd={addTodo} />

            <div className="mt-4 flex flex-col gap-4 items-center justify-between w-full">
                {AISummary && <TypingParagraph text={AISummary} />}
                {errorMessage && <p className="text-red-500 bold">{errorMessage}</p>}
                <div className="flex flex-row gap-4 items-center"> 
                    <AuthButton />
                    <button
                        onClick={getAISummary}
                        disabled={todos.length === 0}
                        className={`bg-gradient-primary hover:shadow-glow transition-all duration-200 h-10 px-4
                            hover:border hover:border-white focus:border-white active:border-white border border-transparent rounded-xl bg-[#232223]`}
                    >
                        Generate AI Summary
                    </button>
                </div>
            </div>
            <hr className="mt-8 mb-4 border-t border-gray-300" />
            <TodoStats todos={todos} />
            <hr className="my-4 border-t border-gray-300" />
            
            {categories.length === 0 && isLoading && (
            <div className="flex justify-center mb-8">
                <Loader2 className="animate-spin" />
            </div>
            )}
            {categories.length > 0 && (
                <div className="flex items-center justify-center gap-4 mb-8">
                    {categories.map(category => (
                    <div
                        key={category.name}
                        className={`text-sm p-2 rounded-full ${category.selected ? "bg-blue-500" : "bg-gray-500"}`}
                        onClick={() => changeSelectedCategory(category.name)}
                    >
                        {category.name}
                    </div>
                    ))}
                    {isLoading && <Loader2 className="animate-spin ml-2" />}
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
    );
}