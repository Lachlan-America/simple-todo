'use client'
import TodoList from "@/components/TodoList";

export default function Home() {
    return (
        <div className="min-h-screen">
            <div className="container max-w-2xl mx-auto py-8 px-4">
                <div className="text-center mb-8">
                    <h1 className="text-6xl font-bold text-white mb-12">Todo List</h1>
                    <p className="text-lg italic">Stay organized and get things done!</p>
                </div>
                <TodoList />
            </div>
        </div>
    );
};
