import { useState, memo } from "react";
import SourceCard from "./SourceCard";
import TypingText from "./TypingText";

const Message = memo(({ role, content, sources = [], isStreaming }) => {
  const isUser = role === "user";
  const [isTypingDone, setIsTypingDone] = useState(false);

  const showSources = !isUser && sources.length > 0 && !isStreaming && isTypingDone;

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      <div className={`max-w-[85%] px-4 py-2 rounded-lg text-sm ${
          isUser ? "bg-black text-white" : "bg-white text-black border border-gray-100 shadow-sm"
        }`}
      >
        <p className="text-[10px] font-bold uppercase opacity-40 mb-1">
          {isUser ? "You" : "TaxPal"}
        </p>

        <div className="whitespace-pre-wrap">
          {isUser ? (
            content
          ) : (
            <TypingText 
              content={content} 
              onComplete={() => setIsTypingDone(true)} 
            />
          )}
        </div>

        {showSources && (
          <div className="animate-in fade-in slide-in-from-top-1 duration-500">
            <SourceCard sources={sources} />
          </div>
        )}
      </div>
    </div>
  );
});

export default Message;