import { render, screen, act } from '@testing-library/react';
import TypingParagraph from '@/components/TypingParagraph';

jest.useFakeTimers();

describe('TypingParagraph', () => {
    it('should render the full text after the typing interval', () => {
        const testText = 'Hello, world!';
        render(<TypingParagraph text={testText} />);

        act(() => {
            jest.runAllTimers(); // Fast-forward all intervals
        });

        const element = screen.getByTestId('typing-paragraph');
        expect(element.textContent).toContain(testText);
    });
});