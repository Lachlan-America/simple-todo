import { fireEvent, render, screen } from '@testing-library/react';
import TodoInput from '../components/TodoInput';

// Basic render test
test('renders input field with placeholder', () => {
    render(<TodoInput onAdd={() => { }} />);
    expect(screen.getByPlaceholderText(/Add a new todo.../i)).toBeInTheDocument();
});

// Typing input test
test('allows typing into the input field', () => {
    render(<TodoInput onAdd={() => { }} />);
    const input = screen.getByPlaceholderText(/Add a new todo.../i);
    fireEvent.change(input, { target: { value: 'Buy milk' } });
    expect(input).toHaveValue('Buy milk');
});

// Button click submits input
test('calls onAdd with input value on button click', () => {
    const mockAddTodo = jest.fn();
    render(<TodoInput onAdd={mockAddTodo} />);
    const input = screen.getByPlaceholderText(/Add a new todo.../i);
    fireEvent.change(input, { target: { value: 'Go to gym' } });

    const button = screen.getByRole('button', { name: /add todo/i });
    fireEvent.click(button);

    expect(mockAddTodo).toHaveBeenCalledWith('Go to gym');
});

// Input clears after submission
test('clears input after submission', () => {
    const mockAddTodo = jest.fn();
    render(<TodoInput onAdd={mockAddTodo} />);
    const input = screen.getByPlaceholderText(/Add a new todo.../);
    const button = screen.getByRole('button', { name: /add todo/i });

    fireEvent.change(input, { target: { value: 'Read book' } });
    fireEvent.click(button);

    expect(input).toHaveValue('');
});

// Prevents submission if input is empty
test('does not call onAdd with empty input', () => {
    const mockAddTodo = jest.fn();
    render(<TodoInput onAdd={mockAddTodo} />);
    const button = screen.getByRole('button', { name: /add/i });
    fireEvent.click(button);
    expect(mockAddTodo).not.toHaveBeenCalled();
});

// Submits on Enter key press
test('submits form on Enter key press', () => {
    const mockAddTodo = jest.fn();

    render(<TodoInput onAdd={mockAddTodo} />);

    const input = screen.getByPlaceholderText(/add a new todo.../i);
    const form = input.closest('form');

    fireEvent.change(input, { target: { value: 'Walk dog' } });
    fireEvent.submit(form);

    expect(mockAddTodo).toHaveBeenCalledWith('Walk dog');
});

// Test if whitespace input does not submit
it("does not submit when input is empty or whitespace", () => {
    const mockOnAdd = jest.fn();
    render(<TodoInput onAdd={mockOnAdd} />);

    const input = screen.getByPlaceholderText(/add a new todo.../i);
    const form = input.closest('form');

    fireEvent.change(input, { target: { value: "    " } });
    fireEvent.submit(form);

    expect(mockOnAdd).not.toHaveBeenCalled();
});