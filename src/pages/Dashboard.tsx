import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate } from "react-router";
import {
  Leaf,
  LogOut,
  Bot,
  Map,
  AlertTriangle,
  Activity,
  Clock,
  Plus,
  Eye,
  Shield,
  Navigation,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import AlertBanner from "@/components/AlertBanner";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

// Simulated real-time AQI data for Indore
function generateAQI() {
  const base = 120 + Math.random() * 60;
  return {
    overall: Math.round(base),
    pm25: Math.round(35 + Math.random() * 40),
    pm10: Math.round(80 + Math.random() * 60),
    so2: Math.round(10 + Math.random() * 20),
    no2: Math.round(25 + Math.random() * 30),
    co: +(Math.random() * 2).toFixed(1),
    o3: Math.round(20 + Math.random() * 25),
  };
}

function getAQILevel(aqi: number) {
  if (aqi <= 50) return { label: "Good", color: "bg-neo-green", textColor: "text-primary-foreground", icon: "🟢" };
  if (aqi <= 100) return { label: "Moderate", color: "bg-neo-yellow", textColor: "text-primary-foreground", icon: "🟡" };
  if (aqi <= 150) return { label: "Unhealthy (Sensitive)", color: "bg-neo-orange", textColor: "text-primary-foreground", icon: "🟠" };
  if (aqi <= 200) return { label: "Unhealthy", color: "bg-neo-red", textColor: "text-white", icon: "🔴" };
  if (aqi <= 300) return { label: "Very Unhealthy", color: "bg-neo-purple", textColor: "text-white", icon: "🟣" };
  return { label: "Hazardous", color: "bg-[#880E4F]", textColor: "text-white", icon: "⚫" };
}

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [aqiData, setAqiData] = useState(generateAQI());
  const stats = useQuery(api.complaints.stats);
  const recentComplaints = useQuery(api.complaints.list, { limit: 5 });
  const autoVerify = useMutation(api.complaints.autoVerifyExpired);

  // Refresh AQI every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setAqiData(generateAQI());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Auto-verify expired complaints on load
  useEffect(() => {
    autoVerify().catch(console.error);
  }, [autoVerify]);

  const aqiLevel = getAQILevel(aqiData.overall);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const NAV_ITEMS = [
    { icon: <Bot className="size-4" />, label: "AI Chat", path: "/chat" },
    { icon: <Map className="size-4" />, label: "Hotspot Map", path: "/hotspots" },
    { icon: <Plus className="size-4" />, label: "Report", path: "/report" },
    { icon: <Shield className="size-4" />, label: "Admin", path: "/admin" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Alert Banner */}
      <AlertBanner />

      {/* Top Bar */}
      <header className="neo-border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="neo-border bg-neo-yellow p-2">
              <Eye className="size-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-black text-sm uppercase tracking-wide">
                VayuNetra
              </h1>
              <p className="text-[10px] text-muted-foreground">
                Welcome{user?.name ? `, ${user.name}` : ""}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {NAV_ITEMS.map((item) => (
              <Button
                key={item.path}
                variant="ghost"
                className="neo-btn hidden sm:flex gap-2 text-xs"
                onClick={() => navigate(item.path)}
              >
                {item.icon}
                {item.label}
              </Button>
            ))}
            <button
              onClick={handleSignOut}
              className="neo-border bg-card p-2 hover:bg-muted transition-colors cursor-pointer"
              title="Sign out"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* AQI Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="neo-card bg-card overflow-hidden"
        >
          <div className={`${aqiLevel.color} ${aqiLevel.textColor} px-4 py-2 flex items-center justify-between`}>
            <div className="flex items-center gap-2">
              <span className="neo-tag bg-white/20 text-white px-2 py-0.5">LIVE</span>
              <span className="text-xs font-bold uppercase">Indore — Real-Time AQI</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="size-1.5 bg-white rounded-full pulse-live" />
              <span className="text-[10px] font-bold">UPDATED JUST NOW</span>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="neo-border bg-background p-4 text-center">
                <p className="text-4xl font-black">{aqiData.overall}</p>
                <p className="text-xs text-muted-foreground uppercase mt-1">AQI</p>
                <p className={`text-xs font-bold mt-1 ${aqiLevel.textColor}`}>
                  {aqiLevel.icon} {aqiLevel.label}
                </p>
              </div>
              <div className="space-y-2">
                <div className="neo-border bg-background p-2 flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">PM2.5</span>
                  <span className="text-sm font-bold">{aqiData.pm25} µg/m³</span>
                </div>
                <div className="neo-border bg-background p-2 flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">PM10</span>
                  <span className="text-sm font-bold">{aqiData.pm10} µg/m³</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="neo-border bg-background p-2 flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">SO₂</span>
                  <span className="text-sm font-bold">{aqiData.so2} ppb</span>
                </div>
                <div className="neo-border bg-background p-2 flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">NO₂</span>
                  <span className="text-sm font-bold">{aqiData.no2} ppb</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="neo-border bg-background p-2 flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">CO</span>
                  <span className="text-sm font-bold">{aqiData.co} ppm</span>
                </div>
                <div className="neo-border bg-background p-2 flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">O₃</span>
                  <span className="text-sm font-bold">{aqiData.o3} ppb</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <Button
                className="neo-btn bg-neo-yellow text-primary-foreground text-xs py-4"
                onClick={() => navigate("/chat")}
              >
                <Bot className="mr-1 size-4" />
                AI Chat
              </Button>
              <Button
                className="neo-btn bg-neo-green text-primary-foreground text-xs py-4"
                onClick={() => navigate("/report")}
              >
                <Plus className="mr-1 size-4" />
                Report
              </Button>
              <Button
                className="neo-btn bg-neo-blue text-white text-xs py-4"
                onClick={() => navigate("/hotspots")}
              >
                <Map className="mr-1 size-4" />
                Hotspots
              </Button>
              <Button
                className="neo-btn bg-card text-foreground text-xs py-4"
                onClick={() => navigate("/admin")}
              >
                <Shield className="mr-1 size-4" />
                Admin
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats Row */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Total Reports", value: stats.total, color: "bg-neo-yellow" },
              { label: "Pending Review", value: stats.pending, color: "bg-neo-orange" },
              { label: "Verified", value: stats.verified, color: "bg-neo-green" },
              { label: "Rejected", value: stats.rejected, color: "bg-neo-red" },
            ].map((stat, i) => (
              <Card key={i} className="neo-card bg-card">
                <CardContent className="p-3 text-center">
                  <p className="text-2xl font-black">{stat.value}</p>
                  <p className="text-[10px] text-muted-foreground uppercase mt-1">
                    {stat.label}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Recent Reports */}
        <div className="neo-card bg-card p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-sm uppercase tracking-wide">
              Recent Reports
            </h2>
            <Button
              variant="ghost"
              className="neo-btn text-xs"
              onClick={() => navigate("/hotspots")}
            >
              View All
            </Button>
          </div>

          {recentComplaints && recentComplaints.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="size-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No reports yet. Be the first to report pollution.</p>
            </div>
          )}

          {recentComplaints && recentComplaints.length > 0 && (
            <div className="space-y-2">
              {recentComplaints.map((complaint) => (
                <div
                  key={complaint._id}
                  className="neo-border bg-background p-3 flex items-center gap-3 cursor-pointer hover:neo-shadow-sm transition-all"
                  onClick={() => navigate(`/report?id=${complaint._id}`)}
                >
                  <div
                    className={`neo-border p-2 shrink-0 ${
                      complaint.status === "admin_verified"
                        ? "bg-neo-green"
                        : complaint.status === "ai_verified"
                        ? "bg-neo-blue"
                        : complaint.status === "auto_verified"
                        ? "bg-neo-yellow"
                        : complaint.status === "rejected"
                        ? "bg-neo-red"
                        : "bg-neo-orange"
                    }`}
                  >
                    <AlertTriangle className="size-4 text-primary-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-xs truncate">{complaint.title}</p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {complaint.pollutionType || "Pollution report"} •{" "}
                      {complaint.locationName || "Indore"}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="neo-tag bg-background px-2 py-0.5 text-[9px]">
                      {complaint.status.replace("_", " ")}
                    </span>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {new Date(complaint.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
