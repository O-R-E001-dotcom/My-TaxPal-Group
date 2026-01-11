import SourceCard from "./SourceCard"
import TypingText from "./TypingText"

export default function Message({ role, content, sources = [] }) {
  const isUser = role === "user"

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      <div
        className={`max-w-lg px-4 py-2 rounded-lg text-sm ${
          isUser ? "bg-black text-white" : "bg-white text-black"
        }`}
      >
        {/* Header */}
        <p className="text-xs font-semibold mb-1 opacity-80">
          {isUser ? "You" : "Assistant"}
        </p>

        {/* Message text */}
        <p className="whitespace-pre-wrap break-words">
          {isUser ? content : <TypingText content={content} />}
        </p>

        {/* Sources */}
        {!isUser && sources.length > 0 && (
          <SourceCard sources={sources} />
        )}
      </div>
    </div>
  )
}
