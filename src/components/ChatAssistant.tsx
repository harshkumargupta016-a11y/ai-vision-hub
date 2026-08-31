import { useState, useRef, useEffect } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Send,
  Bot,
  User,
  Leaf,
  AlertTriangle,
  Info,
  Sparkles,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp: Date;
}

const SUGGESTED_PROMPTS = [
  {
    icon: <AlertTriangle className="size-4" />,
    text: "What's the current AQI in Indore?",
    color: "bg-neo-red/10 border-neo-red",
  },
  {
    icon: <Leaf className="size-4" />,
    text: "How does crop burning affect air quality?",
    color: "bg-neo-green/10 border-neo-green",
  },
  {
    icon: <Info className="size-4" />,
    text: "Explain PM2.5 and its health impacts",
    color: "bg-neo-blue/10 border-neo-blue",
  },
  {
    icon: <Sparkles className="size-4" />,
    text: "What industries pollute in Pithampur?",
    color: "bg-neo-orange/10 border-neo-orange",
  },
];

export default function ChatAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const chat = useAction(api.chat.chat);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isLoading) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await chat({
        messages: [...messages, userMsg].map((m) => ({
          role: m.role,
          content: m.content,
        })),
      });

      const modelMsg: Message = {
        id: crypto.randomUUID(),
        role: "model",
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, modelMsg]);
    } catch (error) {
      console.error("Chat error:", error);
      const errMessage = error instanceof Error ? error.message : String(error);
      const isApiKey = errMessage.includes("API key not configured");
      const errorMsg: Message = {
        id: crypto.randomUUID(),
        role: "model",
        content: isApiKey
          ? "Gemini API key is not configured. Please add GOOGLE_API_KEY to your Convex environment in the Keys tab."
          : `Sorry, something went wrong: ${errMessage}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatContent = (content: string) => {
    return content.split("\n").map((line, i) => {
      if (line.startsWith("**") && line.endsWith("**")) {
        return (
          <p key={i} className="font-bold mt-3 mb-1">
            {line.replace(/\*\*/g, "")}
          </p>
        );
      }
      if (line.startsWith("- ")) {
        return (
          <li key={i} className="ml-4 list-disc">
            {line.substring(2)}
          </li>
        );
      }
      if (line.match(/^\d+\./)) {
        return (
          <li key={i} className="ml-4 list-decimal">
            {line.replace(/^\d+\.\s*/, "")}
          </li>
        );
      }
      return (
        <p key={i} className={line === "" ? "h-2" : ""}>
          {line}
        </p>
      );
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="neo-border bg-gradient-to-r from-neo-yellow via-neo-orange to-neo-red px-4 py-3 flex items-center gap-3 animate-gradient">            <div className="neo-border bg-primary text-primary-foreground p-2 neo-shadow-sm">
              <Bot className="size-5" />
            </div>
        <div>
          <h2 className="font-bold text-sm uppercase tracking-wide">
            VayuNetra AI
          </h2>
          <p className="text-xs text-muted-foreground">
            Powered by Google Gemini
          </p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="size-2 bg-neo-green neo-border rounded-full pulse-live" />
          <span className="text-xs font-bold">Online</span>
        </div>
      </div>

      {/* Messages Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center h-full gap-6"
            >
              <div className="neo-border bg-primary text-primary-foreground p-6 neo-shadow-colored">
                <Bot className="size-12" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-lg font-bold uppercase tracking-wide">
                  VayuNetra AI
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Your expert environmental assistant for air quality monitoring
                  in the Indore-Pithampur corridor.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md">
                {SUGGESTED_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(prompt.text)}
                    className={`neo-border neo-shadow-sm ${prompt.color} p-3 text-left text-xs font-medium hover:neo-shadow transition-all cursor-pointer`}
                  >
                    <div className="flex items-start gap-2">
                      {prompt.icon}
                      <span>{prompt.text}</span>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex gap-3 ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.role === "model" && (
                <div className="neo-border bg-neo-yellow p-2 h-fit shrink-0">
                  <Bot className="size-4 text-foreground" />
                </div>
              )}
              <div
                className={`neo-border max-w-[80%] p-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card"
                }`}
              >
                <div className="space-y-1">{formatContent(msg.content)}</div>
                <p className="text-[10px] opacity-50 mt-2">
                  {msg.timestamp.toLocaleTimeString()}
                </p>
              </div>
              {msg.role === "user" && (
                <div className="neo-border bg-neo-blue text-white p-2 h-fit shrink-0">
                  <User className="size-4" />
                </div>
              )}
            </motion.div>
          ))}

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3"
            >
              <div className="neo-border bg-neo-yellow p-2 h-fit shrink-0">
                <Bot className="size-4 text-primary-foreground" />
              </div>
              <div className="neo-border bg-card p-3">
                <div className="flex items-center gap-1">
                  <span className="typing-dot size-1.5 bg-muted-foreground rounded-full" />
                  <span className="typing-dot size-1.5 bg-muted-foreground rounded-full" />
                  <span className="typing-dot size-1.5 bg-muted-foreground rounded-full" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input Area */}
      <div className="neo-border-t border-border bg-card p-4">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about air quality, pollution, AQI..."
            className="neo-input flex-1"
            disabled={isLoading}
          />
          <Button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="neo-btn bg-primary text-primary-foreground px-4"
          >
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-2 text-center">
          Powered by Google Gemini AI • Indore-Pithampur corridor
        </p>
      </div>
    </div>
  );
}
