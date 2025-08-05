'use client';
import { useState } from "react";
import { Plus } from "lucide-react";

interface TodoInputProps {
  onAdd: (text: string) => void;
}

export default function TodoInput({ onAdd }: TodoInputProps) {
  const [text, setText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onAdd(text.trim());
      // Resets the input field after adding a todo
      setText("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add a new todo..."
        className="flex-1 border-border focus-visible:ring-primary transition-all duration-200 p-2"
      />
      <button 
        type="submit" 
        className="flex items-center justify-center bg-gradient-primary hover:shadow-glow transition-all duration-200 w-10 h-10"
        disabled={!text.trim()}
        aria-label="Add todo"
      >
        <Plus className="h-4 w-4" />
      </button>
    </form>
  );
};