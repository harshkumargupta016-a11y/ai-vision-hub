import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AlertTriangle, XCircle, Info, Flame } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SEVERITY_CONFIG = {
  info: {
    bg: "bg-neo-blue",
    icon: <Info className="size-4" />,
    label: "INFO",
  },
  warning: {
    bg: "bg-neo-orange",
    icon: <AlertTriangle className="size-4" />,
    label: "WARNING",
  },
  danger: {
    bg: "bg-neo-red",
    icon: <Flame className="size-4" />,
    label: "DANGER",
  },
  critical: {
    bg: "bg-neo-purple",
    icon: <XCircle className="size-4" />,
    label: "CRITICAL",
  },
};

export default function AlertBanner() {
  const alerts = useQuery(api.alerts.active);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  if (!alerts || alerts.length === 0) return null;

  const visibleAlerts = alerts.filter((a) => !dismissed.has(a._id));

  if (visibleAlerts.length === 0) return null;

  return (
    <div className="space-y-1">
      <AnimatePresence>
        {visibleAlerts.slice(0, 3).map((alert) => {
          const config = SEVERITY_CONFIG[alert.severity];
          return (
            <motion.div
              key={alert._id}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className={`${config.bg} text-foreground neo-border overflow-hidden`}
            >
              <div className="px-3 py-2 flex items-center gap-2 text-xs font-bold">
                {config.icon}
                <span className="neo-tag bg-primary/20 text-foreground px-2 py-0.5">
                  {config.label}
                </span>
                <span className="font-medium flex-1 truncate">
                  {alert.title}
                </span>
                <span className="hidden sm:inline opacity-70 font-normal">
                  {alert.message}
                </span>
                <button
                  onClick={() =>
                    setDismissed((prev) => new Set([...prev, alert._id]))
                  }
                  className="ml-2 opacity-70 hover:opacity-100 cursor-pointer"
                >
                  <XCircle className="size-3" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
