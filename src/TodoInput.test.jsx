import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom'; 
import { test, expect } from 'vitest';
import TodoInput from './components/TodoInput';

const addTodo = (text) => {
    const newTodo = {
      id: crypto.randomUUID(),
      text,
      completed: false,
      createdAt: new Date(),
    };
};

test('renders input field with placeholder', () => {
  render(<TodoInput onAdd={() => {}} />);
  expect(screen.getByPlaceholderText(/Add a new todo.../i)).toBeInTheDocument();
});

test('allows typing into the input field', () => {
  render(<TodoInput onAdd={() => {}} />);
  const input = screen.getByPlaceholderText(/Add a new todo.../i);
  fireEvent.change(input, { target: { value: 'Buy milk' } });
  expect(input).toHaveValue('Buy milk');
});

test('calls onAddTodo with input value on button click', () => {
  render(<TodoInput onAdd={addTodo} />);
  const input = screen.getByPlaceholderText(/Add a new todo.../i);
  fireEvent.change(input, { target: { value: 'Go to gym' } });

  const button = screen.getByRole('button', { name: /add todo/i });
  fireEvent.click(button);

  expect(addTodo).toHaveBeenCalledWith('Go to gym');
});

// test('clears input after submission', () => {
//   const mockAddTodo = vi.fn();
//   render(<TodoInput onAddTodo={mockAddTodo} />);
//   const input = screen.getByPlaceholderText(/add todo/i);
//   const button = screen.getByRole('button', { name: /add/i });

//   fireEvent.change(input, { target: { value: 'Read book' } });
//   fireEvent.click(button);

//   expect(input).toHaveValue('');
// });

// test('does not call onAddTodo with empty input', () => {
//   const mockAddTodo = vi.fn();
//   render(<TodoInput onAddTodo={mockAddTodo} />);
//   const button = screen.getByRole('button', { name: /add/i });
//   fireEvent.click(button);
//   expect(mockAddTodo).not.toHaveBeenCalled();
// });

// test('submits on Enter key press', () => {
//   const mockAddTodo = vi.fn();
//   render(<TodoInput onAddTodo={mockAddTodo} />);
//   const input = screen.getByPlaceholderText(/add todo/i);
//   fireEvent.change(input, { target: { value: 'Walk dog' } });
//   fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

//   expect(mockAddTodo).toHaveBeenCalledWith('Walk dog');
// });