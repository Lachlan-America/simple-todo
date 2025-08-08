'use client'
import { useState, useEffect } from "react";

export default function TypingParagraph({ text }: { text: string }) {
    const [displayedText, setDisplayedText] = useState<string>("");

    useEffect(() => {
        setDisplayedText("");

        let index = 0;
        let currentText = "";

        const interval = setInterval(() => {
            currentText += text.charAt(index);
            setDisplayedText(currentText);

            index++;
            if (index >= text.length) clearInterval(interval);
        }, 30);
        // Clean up function to avoid overlapping intervals
        return () => clearInterval(interval);
    }, [text]);

    return (
        <p data-testid="typing-paragraph" className="whitespace-pre-wrap font-mono text-white p-4 bg-[#232223]">
            {displayedText}
            <span className="typing text-white"></span>
        </p>
    );
}
