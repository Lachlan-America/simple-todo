import { useState, useEffect } from "react";

export default function TypingParagraph({ text }: { text: string }) {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
  setDisplayedText(""); // reset immediately

  let index = 0;
  let currentText = "";

  const interval = setInterval(() => {
    currentText += text.charAt(index);
    setDisplayedText(currentText);

    index++;
    if (index >= text.length) clearInterval(interval);
  }, 30);

  return () => clearInterval(interval);
}, [text]);

  return (
    <p className="whitespace-pre-wrap font-mono text-white p-4 bg-[#232223]">
      {displayedText}
      <span className="typing text-white"></span>
    </p>
  );
}
