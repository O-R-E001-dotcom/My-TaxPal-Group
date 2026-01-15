import React, { useState, useEffect } from "react";

export default function TypingText({ content, speed = 10, onComplete }) {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    let i = 0;
    setDisplayedText(""); // Reset text when content changes
    
    const interval = setInterval(() => {
      setDisplayedText((prev) => content.slice(0, i + 1));
      i++;
      
      if (i >= content.length) {
        clearInterval(interval);
        if (onComplete) onComplete(); // Trigger the callback!
      }
    }, speed);

    return () => clearInterval(interval);
  }, [content, speed, onComplete]);

  return <span>{displayedText}</span>;
}