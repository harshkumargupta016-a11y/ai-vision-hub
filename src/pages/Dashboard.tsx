import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import { Leaf, LogOut, Bot } from "lucide-react";
import ChatAssistant from "@/components/ChatAssistant";

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top Bar */}
      <header className="neo-border-b border-border bg-card px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div
            className="neo-border bg-neo-yellow p-2 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <Leaf className="size-4" />
          </div>
          <div>
            <h1 className="font-bold text-sm uppercase tracking-wide">
              AirSentinel
            </h1>
            <p className="text-[10px] text-muted-foreground">
              Welcome{user?.name ? `, ${user.name}` : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="neo-border bg-neo-green px-3 py-1 text-xs font-bold hidden sm:flex items-center gap-1.5">
            <span className="size-1.5 bg-foreground rounded-full" />
            AI Online
          </div>
          <div className="neo-border bg-neo-blue text-white p-2 hidden sm:block">
            <Bot className="size-4" />
          </div>
          <button
            onClick={handleSignOut}
            className="neo-border bg-card p-2 hover:bg-muted transition-colors cursor-pointer"
            title="Sign out"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 min-h-0">
        <ChatAssistant />
      </div>
    </div>
  );
}
