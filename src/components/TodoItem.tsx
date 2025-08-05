'use client';
import { useState, useRef } from "react";
import { Trash2, GripVertical } from "lucide-react";
import { cn } from "../lib/utils";

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
  category: string | null;
}

interface TodoItemProps {
  todo: Todo;
  index: number;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onReorder: (dragIndex: number, hoverIndex: number) => void;
  isDraggable: boolean;
}

export default function TodoItem ({ todo, index, onToggle, onDelete, onReorder, isDraggable }: TodoItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);

  const handleDelete = () => {
    setIsDeleting(true);
    setTimeout(() => onDelete(todo.id), 150);
  };

  const handleDragStart = (e: React.DragEvent) => {
    if (!isDraggable) return;
    setIsDragging(true);
    e.dataTransfer.setData("text/plain", index.toString());
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!isDraggable) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent) => {
    if (!isDraggable) return;
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData("text/plain"));
    const hoverIndex = index;
    
    if (dragIndex !== hoverIndex) {
      onReorder(dragIndex, hoverIndex);
    }
  };

  return (
    <div 
      ref={dragRef}
      draggable={isDraggable}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={cn(
        "group flex items-center gap-3 p-4 bg-gradient-card border border-border rounded-lg shadow-soft transition-all duration-300 hover:shadow-glow animate-fade-in",
        isDeleting && "opacity-0 scale-95 transition-all duration-150",
        isDragging && "opacity-50 scale-95",
        isDraggable && "cursor-grab active:cursor-grabbing",
        !isDraggable && "opacity-75"
      )}
    >
      {isDraggable && (
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-muted-foreground cursor-grab">
          <GripVertical className="h-4 w-4" />
        </div>
      )}
      
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
        className="data-[state=checked]:bg-success data-[state=checked]:border-success"
      />
      
      <span 
        className={cn(
          "flex-1 text-sm transition-all duration-200",
          todo.completed 
            ? "line-through text-muted-foreground" 
            : "text-foreground"
        )}
      >
        {todo.text}
      </span>
      
      <button
        onClick={handleDelete}
        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-muted-foreground hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
};