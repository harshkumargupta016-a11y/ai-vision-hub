import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, MessageCircle, HelpCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

/** Floating action button that opens the AI chatbot from anywhere in the app. */
export default function FloatingChatButton() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  // Hide on the chat page itself to avoid a redundant button
  if (location.pathname === "/chat") return null;

  const goToChat = () => {
    setOpen(false);
    navigate("/chat");
  };

  const goToHelp = () => {
    setOpen(false);
    navigate("/help");
  };

  const handleMainClick = () => {
    if (!isAuthenticated) {
      navigate("/auth?returnTo=/chat");
      return;
    }
    setOpen((v) => !v);
  };

  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col items-end gap-3">
      {/* Expanded menu items */}
      <AnimatePresence>
        {open && (
          <>
            <motion.button
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              transition={{ duration: 0.15 }}
              onClick={goToHelp}
              className="neo-btn bg-card flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase tracking-wide cursor-pointer"
            >
              <HelpCircle className="size-4" />
              Help &amp; FAQ
            </motion.button>
            <motion.button
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              transition={{ duration: 0.15, delay: 0.05 }}
              onClick={goToChat}
              className="neo-btn bg-neo-yellow flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase tracking-wide cursor-pointer"
            >
              <MessageCircle className="size-4" />
              AI Chat
            </motion.button>
          </>
        )}
      </AnimatePresence>

      {/* Main FAB */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={handleMainClick}
        aria-label="Open AI chatbot"
        className="neo-border bg-neo-green p-4 cursor-pointer animate-float shadow-[4px_4px_0px_0px_#1A1A1A]"
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="block"
            >
              <X className="size-6 text-foreground" />
            </motion.span>
          ) : (
            <motion.span
              key="bot"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="block"
            >
              <Bot className="size-6 text-foreground" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
