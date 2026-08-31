import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Eye, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex flex-col items-center justify-center bg-background"
    >
      <div className="max-w-lg mx-auto px-4 text-center space-y-6">
        <div className="neo-border bg-neo-yellow p-4 inline-block mx-auto">
          <Eye className="size-12 text-primary-foreground" />
        </div>
        <h1 className="text-6xl font-black uppercase">404</h1>
        <p className="text-lg font-bold uppercase">Page Not Found</p>
        <p className="text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-3 justify-center">
          <Button
            className="neo-btn bg-primary text-primary-foreground"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="mr-2 size-4" />
            Back to Home
          </Button>
          <Button
            variant="outline"
            className="neo-btn"
            onClick={() => navigate("/dashboard")}
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
