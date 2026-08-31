import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Bot,
  Shield,
  Timer,
} from "lucide-react";

interface Complaint {
  _id: string;
  title: string;
  description: string;
  pollutionType?: string;
  latitude: number;
  longitude: number;
  locationName?: string;
  status: "pending" | "ai_verified" | "admin_verified" | "auto_verified" | "rejected";
  aiVerification?: {
    pollutionType: string;
    confidence: number;
    severity: string;
    notes?: string;
  };
  createdAt: number;
  verifiedAt?: number;
}

const STATUS_CONFIG = {
  pending: {
    label: "Pending Review",
    icon: <Clock className="size-3" />,
    bg: "bg-neo-orange/20 text-neo-orange border-neo-orange",
  },
  ai_verified: {
    label: "AI Verified",
    icon: <Bot className="size-3" />,
    bg: "bg-neo-blue/20 text-neo-blue border-neo-blue",
  },
  admin_verified: {
    label: "Admin Verified",
    icon: <Shield className="size-3" />,
    bg: "bg-neo-green/20 text-neo-green border-neo-green",
  },
  auto_verified: {
    label: "Auto Verified",
    icon: <Timer className="size-3" />,
    bg: "bg-neo-yellow/20 text-neo-yellow border-neo-yellow",
  },
  rejected: {
    label: "Rejected",
    icon: <XCircle className="size-3" />,
    bg: "bg-neo-red/20 text-neo-red border-neo-red",
  },
};

function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function ReportCard({
  complaint,
  onClick,
}: {
  complaint: Complaint;
  onClick?: () => void;
}) {
  const status = STATUS_CONFIG[complaint.status];

  return (
    <Card
      className="neo-card bg-card cursor-pointer hover:neo-shadow-lg transition-all"
      onClick={onClick}
    >
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-sm leading-tight">{complaint.title}</h3>
          <span className={`neo-tag px-2 py-0.5 shrink-0 flex items-center gap-1 ${status.bg}`}>
            {status.icon}
            {status.label}
          </span>
        </div>

        <p className="text-xs text-muted-foreground line-clamp-2">
          {complaint.description}
        </p>

        {complaint.pollutionType && (
          <div className="neo-border bg-neo-yellow/10 px-2 py-1 text-xs font-medium inline-flex items-center gap-1">
            <AlertTriangle className="size-3" />
            {complaint.pollutionType}
          </div>
        )}

        {complaint.aiVerification && (
          <div className="neo-border bg-neo-blue/10 p-2 text-xs space-y-1">
            <p className="font-bold text-neo-blue">
              Gemini AI Analysis
            </p>
            <p>
              Severity:{" "}
              <span className="font-bold uppercase">
                {complaint.aiVerification.severity}
              </span>
            </p>
            <p>
              Confidence:{" "}
              <span className="font-bold">
                {Math.round(complaint.aiVerification.confidence * 100)}%
              </span>
            </p>
          </div>
        )}

        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin className="size-3" />
            {complaint.locationName || `${complaint.latitude.toFixed(4)}, ${complaint.longitude.toFixed(4)}`}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="size-3" />
            {timeAgo(complaint.createdAt)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
