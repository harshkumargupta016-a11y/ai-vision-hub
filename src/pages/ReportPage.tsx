import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate, useSearchParams } from "react-router";
import {
  Eye,
  LogOut,
  Bot,
  Map,
  Plus,
  Shield,
  ArrowLeft,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ComplaintForm from "@/components/ComplaintForm";
import ReportCard from "@/components/ReportCard";
import { motion } from "framer-motion";

export default function ReportPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedId = searchParams.get("id");
  const selectedComplaint = useQuery(
    api.complaints.get,
    // @ts-expect-error - URL params are strings but Convex expects typed IDs
    selectedId ? { id: selectedId } : "skip"
  );
  const myComplaints = useQuery(
    api.complaints.byUser,
    user ? { userId: user._id } : "skip"
  );

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  // If a specific complaint is selected, show detail view
  if (selectedId && selectedComplaint) {
    return (
      <div className="min-h-screen bg-background">
        <header className="neo-border-b border-border bg-card sticky top-0 z-50">
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/report")}
                className="neo-border bg-card p-2 hover:bg-muted transition-colors cursor-pointer"
              >
                <ArrowLeft className="size-4" />
              </button>
              <h1 className="font-bold text-sm uppercase">Report Detail</h1>
            </div>
            <button
              onClick={handleSignOut}
              className="neo-border bg-card p-2 hover:bg-muted transition-colors cursor-pointer"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 py-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="neo-card bg-card p-6 space-y-4"
          >
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-bold text-lg">{selectedComplaint.title}</h2>
              <span
                className={`neo-tag px-2 py-0.5 shrink-0 ${
                  selectedComplaint.status === "admin_verified"
                    ? "bg-neo-green/20 text-neo-green border-neo-green"
                    : selectedComplaint.status === "ai_verified"
                    ? "bg-neo-blue/20 text-neo-blue border-neo-blue"
                    : selectedComplaint.status === "auto_verified"
                    ? "bg-neo-yellow/20 text-neo-yellow border-neo-yellow"
                    : selectedComplaint.status === "rejected"
                    ? "bg-neo-red/20 text-neo-red border-neo-red"
                    : "bg-neo-orange/20 text-neo-orange border-neo-orange"
                }`}
              >
                {selectedComplaint.status.replace("_", " ")}
              </span>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              {selectedComplaint.description}
            </p>

            {selectedComplaint.pollutionType && (
              <div className="neo-border bg-neo-yellow/10 px-3 py-2 text-xs font-medium inline-block">
                Type: {selectedComplaint.pollutionType}
              </div>
            )}

            {selectedComplaint.aiVerification && (
              <div className="neo-border bg-neo-blue/10 p-4 space-y-2">
                <p className="font-bold text-sm text-neo-blue">
                  Gemini AI Verification
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Pollution Type: </span>
                    <span className="font-bold">
                      {selectedComplaint.aiVerification.pollutionType}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Confidence: </span>
                    <span className="font-bold">
                      {Math.round(selectedComplaint.aiVerification.confidence * 100)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Severity: </span>
                    <span className="font-bold uppercase">
                      {selectedComplaint.aiVerification.severity}
                    </span>
                  </div>
                </div>
                {selectedComplaint.aiVerification.notes && (
                  <p className="text-xs text-muted-foreground">
                    {selectedComplaint.aiVerification.notes}
                  </p>
                )}
              </div>
            )}

            <div className="neo-border bg-background p-3 text-xs space-y-1">
              <p>
                <span className="text-muted-foreground">Location: </span>
                {selectedComplaint.locationName ||
                  `${selectedComplaint.latitude}, ${selectedComplaint.longitude}`}
              </p>
              <p>
                <span className="text-muted-foreground">Submitted: </span>
                {new Date(selectedComplaint.createdAt).toLocaleString()}
              </p>
              {selectedComplaint.verifiedAt && (
                <p>
                  <span className="text-muted-foreground">Verified: </span>
                  {new Date(selectedComplaint.verifiedAt).toLocaleString()}
                </p>
              )}
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  // Default view: submission form + my reports
  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <header className="neo-border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="neo-border bg-neo-yellow p-2 cursor-pointer"
              onClick={() => navigate("/")}
            >
              <Eye className="size-4 text-primary-foreground" />
            </div>
            <h1 className="font-black text-sm uppercase tracking-wide">
              Submit Report
            </h1>
          </div>
          <button
            onClick={handleSignOut}
            className="neo-border bg-card p-2 hover:bg-muted transition-colors cursor-pointer"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Complaint Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="neo-card bg-card p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="neo-border bg-neo-green p-2">
              <FileText className="size-4 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-bold text-sm uppercase">
                Report Pollution
              </h2>
              <p className="text-xs text-muted-foreground">
                Describe what you observed. Gemini AI will verify your report.
              </p>
            </div>
          </div>
          <ComplaintForm
            userId={user?._id || ""}
            userName={user?.name}
          />
        </motion.div>

        {/* My Reports */}
        {myComplaints && myComplaints.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-bold text-sm uppercase tracking-wide">
              My Reports
            </h2>
            <div className="space-y-2">
              {myComplaints.map((complaint) => (
                <ReportCard
                  key={complaint._id}
                  complaint={complaint}
                  onClick={() => navigate(`/report?id=${complaint._id}`)}
                />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
