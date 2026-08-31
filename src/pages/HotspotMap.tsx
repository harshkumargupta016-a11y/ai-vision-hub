import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate } from "react-router";
import { useState, useEffect } from "react";
import {
  Eye,
  LogOut,
  Bot,
  Map,
  Plus,
  Shield,
  Layers,
  Satellite,
  MapIcon,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

function getSeverityColor(status: string) {
  switch (status) {
    case "admin_verified":
      return "#00E676";
    case "ai_verified":
      return "#00B0FF";
    case "auto_verified":
      return "#FFD600";
    default:
      return "#FF9100";
  }
}

function getSeverityLabel(status: string) {
  switch (status) {
    case "admin_verified":
      return "Admin Verified";
    case "ai_verified":
      return "AI Verified";
    case "auto_verified":
      return "Auto Verified";
    default:
      return "Pending";
  }
}

// Simulated hotspot data for Indore-Pithampur corridor
const SIMULATED_HOTSPOTS = [
  {
    id: "sim-1",
    lat: 22.7196,
    lng: 75.8577,
    title: "Pithampur Industrial Zone",
    severity: "high",
    aqi: 185,
    type: "Industrial Smoke",
  },
  {
    id: "sim-2",
    lat: 22.6856,
    lng: 75.8234,
    title: "Dhar Road Corridor",
    severity: "moderate",
    aqi: 120,
    type: "Vehicle Emissions",
  },
  {
    id: "sim-3",
    lat: 22.7456,
    lng: 75.8934,
    title: "SEZ Industrial Area",
    severity: "critical",
    aqi: 210,
    type: "Crop Burning",
  },
  {
    id: "sim-4",
    lat: 22.6956,
    lng: 75.8477,
    title: "Mhow-Nemawar Road",
    severity: "low",
    aqi: 85,
    type: "Construction Dust",
  },
  {
    id: "sim-5",
    lat: 22.7356,
    lng: 75.8777,
    title: "Sanwer Industrial Belt",
    severity: "moderate",
    aqi: 135,
    type: "Waste Burning",
  },
];

function SeverityIcon({ color, size = 12 }: { color: string; size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        border: "2px solid #F5F5F5",
      }}
    />
  );
}

function MapController({
  satellite,
}: {
  satellite: boolean;
}) {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
  }, [map, satellite]);
  return null;
}

export default function HotspotMap() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [satellite, setSatellite] = useState(false);
  const [selectedHotspot, setSelectedHotspot] = useState<any>(null);
  const complaints = useQuery(api.complaints.hotspots);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const allHotspots = [
    ...(complaints || []).map((c) => ({
      id: c._id,
      lat: c.latitude,
      lng: c.longitude,
      title: c.title,
      severity: c.status === "admin_verified" ? "high" : "moderate",
      aqi: c.aqi || 100,
      type: c.pollutionType || "Unknown",
      status: c.status,
    })),
    ...SIMULATED_HOTSPOTS,
  ];

  const center: [number, number] = [22.7196, 75.8577];

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top Bar */}
      <header className="neo-border-b border-border bg-card px-4 py-3 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div
            className="neo-border bg-neo-yellow p-2 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <Eye className="size-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-black text-sm uppercase tracking-wide">
              VayuNetra
            </h1>
            <p className="text-[10px] text-muted-foreground">Hotspot Map</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            className={`neo-btn text-xs ${satellite ? "bg-neo-blue text-white" : ""}`}
            onClick={() => setSatellite(!satellite)}
          >
            {satellite ? (
              <Satellite className="mr-1 size-4" />
            ) : (
              <MapIcon className="mr-1 size-4" />
            )}
            {satellite ? "Satellite" : "Street"}
          </Button>
          <Button
            className="neo-btn bg-neo-yellow text-primary-foreground text-xs"
            onClick={() => navigate("/report")}
          >
            <Plus className="mr-1 size-4" />
            Report
          </Button>
        </div>
      </header>

      {/* Map */}
      <div className="flex-1 relative">
        <MapContainer
          center={center}
          zoom={12}
          className="h-full w-full"
          zoomControl={true}
        >
          <MapController satellite={satellite} />
          <TileLayer
            url={
              satellite
                ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            }
            attribution={
              satellite
                ? '&copy; Esri'
                : '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
            }
          />

          {allHotspots.map((hotspot) => (
            <Marker
              key={hotspot.id}
              position={[hotspot.lat, hotspot.lng]}
              eventHandlers={{
                click: () => setSelectedHotspot(hotspot),
              }}
            >
              <Popup>
                <div className="p-1">
                  <p className="font-bold text-sm">{hotspot.title}</p>
                  <p className="text-xs text-gray-600">{hotspot.type}</p>
                  <p className="text-xs">AQI: {hotspot.aqi}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 neo-card bg-card p-3 z-[1000] max-w-[200px]">
          <p className="text-[10px] font-bold uppercase mb-2">Legend</p>
          <div className="space-y-1.5">
            {[
              { color: "#00E676", label: "Admin Verified" },
              { color: "#00B0FF", label: "AI Verified" },
              { color: "#FFD600", label: "Auto Verified" },
              { color: "#FF9100", label: "Pending Review" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <SeverityIcon color={item.color} />
                <span className="text-[10px]">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 72-Hour Forecast Badge */}
        <div className="absolute top-4 right-4 neo-card bg-card p-3 z-[1000]">
          <p className="text-[10px] font-bold uppercase mb-1">72-Hour Forecast</p>
          <div className="flex gap-1">
            {["Now", "+24h", "+48h", "+72h"].map((time, i) => (
              <div
                key={time}
                className="neo-border px-2 py-1 text-center"
                style={{
                  backgroundColor:
                    i === 0
                      ? "rgba(255, 145, 0, 0.2)"
                      : i === 1
                      ? "rgba(255, 23, 68, 0.2)"
                      : i === 2
                      ? "rgba(255, 214, 0, 0.2)"
                      : "rgba(0, 230, 118, 0.2)",
                }}
              >
                <p className="text-[9px] text-muted-foreground">{time}</p>
                <p className="text-xs font-bold">
                  {120 + Math.round(Math.random() * 80)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Hotspot Detail Panel */}
        {selectedHotspot && (
          <div className="absolute bottom-4 right-4 neo-card bg-card p-4 z-[1000] w-72">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-bold text-sm">{selectedHotspot.title}</h3>
              <button
                onClick={() => setSelectedHotspot(null)}
                className="cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="space-y-2">
              <div className="neo-border bg-background p-2 flex justify-between">
                <span className="text-xs text-muted-foreground">AQI</span>
                <span className="text-sm font-bold">{selectedHotspot.aqi}</span>
              </div>
              <div className="neo-border bg-background p-2 flex justify-between">
                <span className="text-xs text-muted-foreground">Type</span>
                <span className="text-xs font-medium">
                  {selectedHotspot.type}
                </span>
              </div>
              <div className="neo-border bg-background p-2 flex justify-between">
                <span className="text-xs text-muted-foreground">Status</span>
                <span className="text-xs font-medium">
                  {getSeverityLabel(selectedHotspot.status || "pending")}
                </span>
              </div>
              <div className="neo-border bg-background p-2 flex justify-between">
                <span className="text-xs text-muted-foreground">Location</span>
                <span className="text-[10px] font-mono">
                  {selectedHotspot.lat.toFixed(4)}, {selectedHotspot.lng.toFixed(4)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
