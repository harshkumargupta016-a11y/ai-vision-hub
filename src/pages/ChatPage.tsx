import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import { Eye, LogOut, ArrowLeft } from "lucide-react";
import ChatAssistant from "@/components/ChatAssistant";

export default function ChatPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top Bar */}
      <header className="neo-border-b border-border bg-card px-4 py-3 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="neo-border bg-card p-2 hover:bg-muted transition-colors cursor-pointer"
          >
            <ArrowLeft className="size-4" />
          </button>
          <div className="neo-border bg-neo-yellow p-2">
            <Eye className="size-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-black text-sm uppercase tracking-wide">
              VayuNetra
            </h1>
            <p className="text-[10px] text-muted-foreground">AI Assistant</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="neo-border bg-card p-2 hover:bg-muted transition-colors cursor-pointer"
        >
          <LogOut className="size-4" />
        </button>
      </header>

      {/* Chat Area */}
      <div className="flex-1 min-h-0">
        <ChatAssistant />
      </div>
    </div>
  );
}
