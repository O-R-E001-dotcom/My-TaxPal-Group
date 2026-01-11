import { useState, useEffect, useRef } from "react";
import Message from "./Message";
import SourceCard from "./SourceCard";

function getSessionId() {
  let id = localStorage.getItem("session_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("session_id", id);
  }
  return id;
}

export default function ChatBox() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);

  const sessionId = getSessionId();
  const bottomRef = useRef(null);

  // Scroll to bottom when messages update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    if (!input.trim()) return;

    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    const headers = {
      "Content-Type": "application/json",
    }

    const token = localStorage.getItem("access_token")
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    try {
      const res = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers,
        body: JSON.stringify({
          message: userMsg.content,
          session_id: sessionId,
        }),
      });

      if (!res.ok) throw new Error("API error");
      if (res.status === 401) {
        alert("Session expired. Please login again.")
        localStorage.removeItem("access_token")
        navigate("/login")
        return
      }

      const data = await res.json();

      const assistantMsg = {
        role: "assistant",
        content: data.answer || "⚠️ Assistant did not return a message.",
        sources: data.sources || [],
      };

      setMessages((prev) => [...prev, assistantMsg]);

      if (data.summary) {
        setSummary(data.summary);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ Error contacting the server." },
      ]);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function calculateVAT() {
    const q = "Calculate VAT derivation impact for me if VAT generated is ₦1m";
    setInput(q);
    await send();
  }

  function logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  }


  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-[#380e60] via-[#925fabcb] to-[#9f4bdf] rounded-lg shadow-lg max-w-[700px] mx-auto my-6 font-sans px-4 py-6 bg-black sm:bg-blue-500 border sm:border-purple-300 sm:rounded-lg sm:shadow-sm">
      {summary && (
        <div className="bg-yellow-100 text-sm p-3 rounded mb-3">
          <strong>Conversation summary:</strong>
          <p>{summary}</p>
        </div>
      )}
      
      <div className="flex-1 overflow-y-auto mb-4">
        {messages.map((msg, idx) => (
          <div key={idx}>
            <Message role={msg?.role} content={msg?.content} sources={msg?.sources} />

            {/* Sources */}
            {msg.sources?.length > 0 && (
              <div className="ml-2 mb-3 space-y-2">
                <p className="text-xs text-gray-500">Sources:</p>
                {msg.sources.map((src, i) => (
                  <SourceCard key={i} source={src} />
                ))}
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="text-gray-400 italic">Thinking…</div>
        )}
        <div ref={bottomRef} />
      </div>
      
      <div className="p-4 border-t flex gap-2 bg-pink-100 rounded-tl-xl">
        <input
          className="flex-1 border rounded-tl-2xl px-3 py-2 bg-black text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
          placeholder="Ask about the tax reform bills..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="bg-[#410976] text-white px-4 py-2 rounded-md hover:bg-[#410974]/90 cursor-pointer"
        >
          Send
        </button>

        <button
          onClick={calculateVAT}
          className="bg-[#410976] text-white px-4 py-2 rounded-md hover:bg-[#410974]/90 cursor-pointer"
        >
          VAT Impact
        </button>

        <button onClick={logout}
        className="bg-red-700 text-white px-4 py-2 rounded-md hover:bg-red-900 cursor-pointer"
        >Logout</button>

      </div>
    </div>
  );
}
