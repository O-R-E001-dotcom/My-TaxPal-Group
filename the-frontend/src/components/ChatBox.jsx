
import { useState, useEffect, useRef } from "react";
import { Smile, NotebookPen, Settings, LogOut, Calculator, PanelLeftClose, PanelLeftOpen, SendHorizontal } from "lucide-react";
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const sessionId = getSessionId();
  const bottomRef = useRef(null);

  // Scroll to bottom when messages update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- Handlers ---
  const startNewChat = () => {
    setMessages([]);
    setSummary(null);
  };

  async function sendMessage() {
    if (!input.trim()) return;

    const userMsg = { id: crypto.randomUUID(), role: "user", content: input };
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
      console.log("Full Backend Payload:", data);

      const assistantMsg = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.answer || "⚠️ Assistant did not return a message.",
        sources: data.sources || [],
      };

      setMessages((prev) => [...prev, assistantMsg]);

      if (data.summary) {
        setSummary(data.summary);
      }
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", content: "⚠️ Error contacting the server." },
      ]);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function calculateVAT() {
    const q = "Based on the provided tax reform documents, calculate the VAT derivation impact for me if VAT generated is ₦1m. Please cite the specific section and page number.";
    setInput(q);
    await sendMessage(q);
  }

  function logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  }

  return (
    <div className="flex h-screen w-full bg-[#0b0b0b] text-white overflow-hidden font-sans">
      
      {/* --- SIDEBAR --- */}
      <aside 
        className={`${
          isSidebarOpen ? "w-72" : "w-0"
        } relative flex flex-col bg-black border-r border-white/10 transition-all duration-300 ease-in-out z-20`}
      >
        <div className={`${!isSidebarOpen && "invisible opacity-0"} flex flex-col h-full p-3 min-w-[18rem] transition-opacity duration-200`}>
          
          <div className="flex items-center justify-between mb-6">
            <button
              className="p-2 rounded-lg hover:bg-white/10 text-zinc-400"
            >
              <Smile />
            </button>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 rounded-lg hover:bg-white/10 text-zinc-400"
            >
              <PanelLeftClose size={20} />
            </button>
            
          </div>

          <button 
          onClick={startNewChat}
          className="flex items-center gap-3 w-full rounded-lg border border-white/20 px-3 py-3 text-sm transition-colors hover:bg-white/10 mb-4">
            <NotebookPen />
             New chat
          </button>

          <div className="flex-1 overflow-y-auto space-y-1">
            <p className="text-xs text-zinc-500 font-semibold px-3 mb-2 uppercase tracking-wider">Recent</p>
            {/* History Items... */}
          </div>

          <div className="mt-auto border-t border-white/10 pt-4 space-y-1">
            <button onClick={calculateVAT} className="flex w-full items-center gap-3 rounded-md px-3 py-3 text-sm hover:bg-white/5">
              <Calculator size={18} /> VAT Calculator
            </button>
          </div>

          <div className="mt-auto border-t border-white/10 pt-4 space-y-1">
             <button className="flex w-full items-center gap-3 rounded-md px-3 py-3 text-sm hover:bg-white/5">
                <Settings size={18} /> Settings
             </button>
             <button onClick={logout} className="flex w-full items-center gap-3 rounded-md px-3 py-3 text-sm text-red-400 hover:bg-red-500/10">
                <LogOut size={18} /> Logout
             </button>
          </div>
        </div>
      </aside>
      {/* --- MAIN CHAT AREA --- */}
      <main className="flex-1 flex flex-col relative bg-[#171717]">
        {!isSidebarOpen && (
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="absolute top-4 left-4 z-30 p-2 bg-zinc-800 border border-white/10 rounded-lg hover:bg-zinc-700 transition-colors"
          >
            <PanelLeftOpen size={20} />
          </button>
        )}

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scrollbar-thin scrollbar-thumb-zinc-700">
          <h1 className="font-bold text-xl">My-TaxPal</h1>
          <div className="max-w-3xl mx-auto w-full">
            {summary && (
              <div className="bg-zinc-800/50 border border-zinc-700 text-sm p-4 rounded-xl mb-6 text-zinc-300">
                <span className="text-green-400 font-bold">Summary:</span> {summary}
              </div>
            )}

            {messages.map((msg, index) => (
              <div className="mb-8">
                <Message key={msg.id || index} 
                  role={msg?.role} 
                  content={msg?.content} 
                  sources={msg.sources}
                  isStreaming={loading && index === messages.length - 1}/>
                {msg.sources?.length > 0 && (
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {msg.sources.map((src, i) => <SourceCard key={i} source={src} />)}
                  </div>
                )}
              </div>
            ))}
            {loading && <div className="text-zinc-500 animate-pulse">Assistant is typing...</div>}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 bg-transparent">
          <div className="max-w-3xl mx-auto relative">
            <input
              className="w-full bg-[#2f2f2f] border border-white/10 rounded-2xl px-4 py-4 pr-16 focus:outline-none focus:ring-2 focus:ring-white text-white placeholder-zinc-500 shadow-2xl"
              placeholder="Ask about the tax reform bills..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="absolute right-3 top-3 bg-green-600 p-2 rounded-xl hover:bg-green-500 transition-all"
            >
              <SendHorizontal size={20} />
            </button>
          </div>
          <p className="text-[10px] text-center mt-3 text-zinc-500">
            My-TaxPal can make mistakes. Check important info.
          </p>
        </div>
      </main>
    </div>
  );
}
