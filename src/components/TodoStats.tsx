'use client';
import type { Todo } from "./TodoItem";
import { CheckCircle, Circle, Target } from "lucide-react";

interface TodoStatsProps {
  todos: Todo[];
}

export default function TodoStats({ todos }: TodoStatsProps) {
  const total = todos.length;
  const completed = todos.filter(todo => todo.completed).length;
  const remaining = total - completed;

  // If no items in the todo list
  if (total === 0) {
    return (
      <div className="text-center py-4">
        <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p>No todos yet. Add one to get started!</p>
      </div>
    );
  }

  // Items in the todo list
  return (
    <div className="flex items-center justify-center gap-6 py-4 text-sm">
      <div className="flex items-center gap-2">
        <Circle className="h-4 w-4" />
        <span>{remaining} remaining</span>
      </div>
      
      <div className="w-px h-4 bg-border" />
      
      <div className="flex items-center gap-2 text-success">
        <CheckCircle className="h-4 w-4" />
        <span>{completed} completed</span>
      </div>
      
      <div className="w-px h-4 bg-border" />
      
      <div className="flex items-center gap-2 text-foreground">
        <Target className="h-4 w-4" />
        <span>{total} total</span>
      </div>
    </div>
  );
};