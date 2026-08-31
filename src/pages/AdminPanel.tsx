import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate } from "react-router";
import { useState } from "react";
import {
  Eye,
  LogOut,
  Shield,
  CheckCircle2,
  XCircle,
  Clock,
  Bot,
  AlertTriangle,
  ArrowLeft,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";

const POLLUTION_TYPES = [
  "Crop Burning",
  "Industrial Smoke",
  "Vehicle Emissions",
  "Construction Dust",
  "Waste Burning",
  "Other",
];

export default function AdminPanel() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<string>("pending");
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [overrideType, setOverrideType] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const pendingComplaints = useQuery(api.complaints.pending);
  const awaitingAdmin = useQuery(api.complaints.awaitingAdmin);
  const allComplaints = useQuery(api.complaints.list, { limit: 100 });
  const adminVerify = useMutation(api.complaints.adminVerify);
  const autoVerify = useMutation(api.complaints.autoVerifyExpired);
  const alerts = useQuery(api.alerts.list);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleVerify = async (status: "admin_verified" | "rejected") => {
    if (!selectedComplaint || !user) return;
    setIsProcessing(true);

    try {
      await adminVerify({
        complaintId: selectedComplaint._id,
        adminId: user._id,
        status,
        adminNotes: adminNotes || undefined,
        pollutionType: overrideType || undefined,
      });
      setSelectedComplaint(null);
      setAdminNotes("");
      setOverrideType("");
    } catch (error) {
      console.error("Verify error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAutoVerify = async () => {
    try {
      const result = await autoVerify();
      alert(`Auto-verified ${result.autoVerified} expired complaints`);
    } catch (error) {
      console.error("Auto-verify error:", error);
    }
  };

  const getFilteredComplaints = () => {
    switch (filter) {
      case "pending":
        return pendingComplaints || [];
      case "ai_verified":
        return awaitingAdmin || [];
      case "all":
        return allComplaints || [];
      default:
        return (allComplaints || []).filter((c) => c.status === filter);
    }
  };

  const filteredComplaints = getFilteredComplaints();

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <header className="neo-border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="neo-border bg-card p-2 hover:bg-muted transition-colors cursor-pointer"
            >
              <ArrowLeft className="size-4" />
            </button>
            <div className="neo-border bg-neo-purple p-2">
              <Shield className="size-4 text-white" />
            </div>
            <div>
              <h1 className="font-black text-sm uppercase tracking-wide">
                Admin Panel
              </h1>
              <p className="text-[10px] text-muted-foreground">
                Review and manage reports
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              className="neo-btn bg-neo-yellow text-primary-foreground text-xs"
              onClick={handleAutoVerify}
            >
              <Clock className="mr-1 size-3" />
              Auto-Verify Expired
            </Button>
            <button
              onClick={handleSignOut}
              className="neo-border bg-card p-2 hover:bg-muted transition-colors cursor-pointer"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Filter Bar */}
      <div className="neo-border-b border-border bg-card px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto">
          <Filter className="size-4 shrink-0 text-muted-foreground" />
          {[
            { value: "pending", label: "Pending", count: pendingComplaints?.length || 0 },
            { value: "ai_verified", label: "AI Verified", count: awaitingAdmin?.length || 0 },
            { value: "all", label: "All Reports", count: allComplaints?.length || 0 },
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => setFilter(item.value)}
              className={`neo-tag px-3 py-1 shrink-0 cursor-pointer transition-all ${
                filter === item.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-card"
              }`}
            >
              {item.label} ({item.count})
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Complaints List */}
          <div className="space-y-3">
            <h2 className="font-bold text-sm uppercase tracking-wide">
              Reports ({filteredComplaints.length})
            </h2>

            {filteredComplaints.length === 0 && (
              <div className="neo-card bg-card p-8 text-center">
                <CheckCircle2 className="size-8 mx-auto mb-2 text-neo-green" />
                <p className="text-sm text-muted-foreground">
                  No reports to review. All clear!
                </p>
              </div>
            )}

            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {filteredComplaints.map((complaint) => (
                <motion.div
                  key={complaint._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`neo-card bg-card p-4 cursor-pointer transition-all ${
                    selectedComplaint?._id === complaint._id
                      ? "neo-shadow-lg ring-2 ring-primary"
                      : "hover:neo-shadow-sm"
                  }`}
                  onClick={() => setSelectedComplaint(complaint)}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-sm">{complaint.title}</h3>
                    <span
                      className={`neo-tag px-2 py-0.5 shrink-0 ${
                        complaint.status === "admin_verified"
                          ? "bg-neo-green/20 text-neo-green border-neo-green"
                          : complaint.status === "ai_verified"
                          ? "bg-neo-blue/20 text-neo-blue border-neo-blue"
                          : complaint.status === "auto_verified"
                          ? "bg-neo-yellow/20 text-neo-yellow border-neo-yellow"
                          : complaint.status === "rejected"
                          ? "bg-neo-red/20 text-neo-red border-neo-red"
                          : "bg-neo-orange/20 text-neo-orange border-neo-orange"
                      }`}
                    >
                      {complaint.status.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                    {complaint.description}
                  </p>
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                    {complaint.pollutionType && (
                      <span className="flex items-center gap-1">
                        <AlertTriangle className="size-3" />
                        {complaint.pollutionType}
                      </span>
                    )}
                    <span>
                      {new Date(complaint.createdAt).toLocaleString()}
                    </span>
                  </div>
                  {complaint.aiVerification && (
                    <div className="mt-2 neo-border bg-neo-blue/10 p-2 text-[10px]">
                      <span className="text-neo-blue font-bold">AI: </span>
                      {complaint.aiVerification.pollutionType} • Confidence:{" "}
                      {Math.round(complaint.aiVerification.confidence * 100)}%
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Review Panel */}
          <div className="lg:sticky lg:top-20 lg:self-start">
            {selectedComplaint ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="neo-card bg-card p-6 space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-bold text-sm uppercase">
                    Review Report
                  </h3>
                  <button
                    onClick={() => setSelectedComplaint(null)}
                    className="cursor-pointer"
                  >
                    <XCircle className="size-4" />
                  </button>
                </div>

                <div className="neo-border bg-background p-3 space-y-2">
                  <p className="font-bold text-sm">{selectedComplaint.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedComplaint.description}
                  </p>
                  <div className="text-[10px] text-muted-foreground">
                    <p>
                      Submitted:{" "}
                      {new Date(selectedComplaint.createdAt).toLocaleString()}
                    </p>
                    <p>
                      Location: {selectedComplaint.latitude},{" "}
                      {selectedComplaint.longitude}
                    </p>
                  </div>
                </div>

                {selectedComplaint.aiVerification && (
                  <div className="neo-border bg-neo-blue/10 p-3 space-y-1 text-xs">
                    <p className="font-bold text-neo-blue">
                      Gemini AI Analysis
                    </p>
                    <p>
                      Type: {selectedComplaint.aiVerification.pollutionType}
                    </p>
                    <p>
                      Confidence:{" "}
                      {Math.round(
                        selectedComplaint.aiVerification.confidence * 100
                      )}
                      %
                    </p>
                    <p>
                      Severity:{" "}
                      {selectedComplaint.aiVerification.severity.toUpperCase()}
                    </p>
                    {selectedComplaint.aiVerification.notes && (
                      <p className="text-muted-foreground">
                        {selectedComplaint.aiVerification.notes}
                      </p>
                    )}
                  </div>
                )}

                {/* Override Section */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider">
                    Override Pollution Type (optional)
                  </label>
                  <Select
                    value={overrideType}
                    onValueChange={setOverrideType}
                  >
                    <SelectTrigger className="neo-input">
                      <SelectValue placeholder="Keep AI classification" />
                    </SelectTrigger>
                    <SelectContent className="bg-card neo-border">
                      {POLLUTION_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider">
                    Admin Notes
                  </label>
                  <Textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add notes about your review decision..."
                    className="neo-input min-h-[80px]"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleVerify("admin_verified")}
                    disabled={isProcessing}
                    className="neo-btn bg-neo-green text-primary-foreground flex-1"
                  >
                    <CheckCircle2 className="mr-1 size-4" />
                    {isProcessing ? "Processing..." : "Verify"}
                  </Button>
                  <Button
                    onClick={() => handleVerify("rejected")}
                    disabled={isProcessing}
                    className="neo-btn bg-neo-red text-white flex-1"
                  >
                    <XCircle className="mr-1 size-4" />
                    Reject
                  </Button>
                </div>
              </motion.div>
            ) : (
              <div className="neo-card bg-card p-8 text-center">
                <Shield className="size-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm text-muted-foreground">
                  Select a report to review
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
