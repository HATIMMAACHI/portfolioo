import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import {
  Send,
  Trash2,
  Sparkles,
  MessageSquare,
  AlertCircle,
} from "lucide-react";

const SUGGESTIONS = [
  "Quels sont tes projets majeurs ?",
  "Quel est ton parcours académique ?",
  "Recherches-tu un stage actuellement ?",
  "Quelles sont tes coordonnées ?",
];

const getApiUrl = () => {
  // If running on the FastAPI port (8000), use relative API path
  if (window.location.port === "8000") {
    return "/api/chat";
  }
  // If running locally on a different port (Vite 5173, Live Server, etc.) or file protocol,
  // target the local FastAPI backend on port 8000
  if (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.protocol === "file:"
  ) {
    return "http://localhost:8000/api/chat";
  }
  // Default for production deployment
  return "/api/chat";
};

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // 1. Synchronize Light/Dark theme from parent portfolio page
  useEffect(() => {
    // Check initial search parameters
    const params = new URLSearchParams(window.location.search);
    const initialTheme = params.get("theme") || "dark";
    if (initialTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Listen to parent message events (theme changes)
    const handleMessage = (e) => {
      if (e.data && e.data.type === "theme-change") {
        if (e.data.theme === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // 2. Scroll to bottom of the chat list on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // 3. Clear Chat History
  const handleReset = () => {
    setMessages([]);
    setError(null);
  };

  // 4. Send message handler
  const handleSend = async (textToSend) => {
    const text = textToSend?.trim() || input.trim();
    if (!text) return;

    if (textToSend === undefined) {
      setInput("");
    }

    setError(null);
    const newMessages = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await fetch(getApiUrl(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
          history: messages,
        }),
      });

      if (!response.ok) {
        throw new Error(`Erreur serveur (${response.status})`);
      }

      const data = await response.json();
      setMessages([
        ...newMessages,
        { role: "assistant", content: data.response },
      ]);
    } catch (err) {
      console.error(err);
      setError(
        "Désolé, impossible de contacter l'assistant. Assure-toi que le serveur backend est démarré.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full max-h-full bg-chatBg-light dark:bg-chatBg-dark text-slate-800 dark:text-slate-200 overflow-hidden border border-slate-200/50 dark:border-slate-800/50 rounded-2xl shadow-2xl glass">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-3.5 py-2.5 border-b border-slate-200/50 dark:border-slate-850/50 bg-white/40 dark:bg-black/30 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center w-7 h-7 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold shadow-md">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xs md:text-sm font-semibold tracking-wide flex items-center gap-1.5">
              Hatim AI Assistant
            </h1>
            <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span>En ligne</span>
            </div>
          </div>
        </div>

        {messages.length > 0 && (
          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-red-500 transition-colors"
            title="Réinitialiser la conversation"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Message List Area */}
      <div className="flex-1 overflow-y-auto px-3.5 py-3 space-y-3">
        {messages.length === 0 ? (
          // Welcome Screen
          <div className="h-full flex flex-col justify-center items-center text-center space-y-3 px-2 animate-fade-in">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center shadow-inner border border-slate-200/10">
              <MessageSquare className="w-6 h-6 text-slate-500 dark:text-slate-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold">
                Pose-moi une question !
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 max-w-[260px]">
                Je suis le double virtuel de Hatim. Je peux te parler de ses
                projets, son parcours académique ou son CV.
              </p>
            </div>

            {/* Suggestion Chips */}
            <div className="grid grid-cols-1 gap-1.5 w-full max-w-[300px]">
              {SUGGESTIONS.map((sug, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(sug)}
                  className="text-left text-[11px] px-3 py-2 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all shadow-sm hover:scale-[1.01]"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"} animate-slide-up`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs md:text-sm shadow-sm ${
                  msg.role === "user"
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-tr-none font-medium"
                    : "bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200/20"
                }`}
              >
                <div className="prose dark:prose-invert text-xs md:text-sm leading-relaxed max-w-none break-words [&>ul]:list-disc [&>ul]:pl-4 [&>ol]:list-decimal [&>ol]:pl-4 [&>p]:mb-1 last:[&>p]:mb-0">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
            </div>
          ))
        )}

        {/* Loading Bubble */}
        {isLoading && (
          <div className="flex w-full justify-start animate-pulse">
            <div className="bg-slate-100 dark:bg-slate-900 rounded-2xl rounded-tl-none px-3.5 py-2.5 text-slate-800 dark:text-slate-200 border border-slate-200/20 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-slate-500 dark:bg-slate-400 rounded-full dot"></span>
              <span className="w-1.5 h-1.5 bg-slate-500 dark:bg-slate-400 rounded-full dot"></span>
              <span className="w-1.5 h-1.5 bg-slate-500 dark:bg-slate-400 rounded-full dot"></span>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="flex w-full justify-center">
            <div className="flex items-center gap-2 bg-red-500/10 dark:bg-red-500/5 text-red-500 text-xs px-3 py-2 rounded-xl border border-red-500/20 max-w-[90%]">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="shrink-0 px-3 py-2.5 bg-white/40 dark:bg-black/30 backdrop-blur-md border-t border-slate-200/50 dark:border-slate-850/50">
        <div className="flex items-center gap-2 bg-white dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-250/50 dark:border-slate-800/80 shadow-inner">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Écris ton message ici..."
            rows={1}
            disabled={isLoading}
            className="flex-1 bg-transparent border-0 outline-none text-xs md:text-sm py-1 max-h-24 resize-none disabled:opacity-50 text-slate-800 dark:text-slate-200"
          />
          <button
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim()}
            className="p-1.5 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:scale-[1.04] active:scale-[0.98] transition-all disabled:opacity-40 disabled:scale-100 disabled:pointer-events-none cursor-pointer"
          >
            <Send className="w-3.5 h-3.5 md:w-4 md:h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
