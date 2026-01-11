import { useState } from "react";
import ChatBox from "./ChatBox";

export default function ChatPage() {
  const [sessionId, setSessionId] = useState(() => crypto.randomUUID());

  function resetConversation() {
    setSessionId(crypto.randomUUID());
  }

  return (
    <ChatBox
      sessionId={sessionId}
      onReset={resetConversation}
    />
  );
}
