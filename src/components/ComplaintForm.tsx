import { useState } from "react";
import { useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MapPin,
  Send,
  Loader2,
  CheckCircle2,
  Camera,
  Navigation,
} from "lucide-react";
import { motion } from "framer-motion";

const POLLUTION_TYPES = [
  "Crop Burning",
  "Industrial Smoke",
  "Vehicle Emissions",
  "Construction Dust",
  "Waste Burning",
  "Other",
];

export default function ComplaintForm({ userId, userName }: { userId: string; userName?: string }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [pollutionType, setPollutionType] = useState("");
  const [locationName, setLocationName] = useState("");
  const [latitude, setLatitude] = useState(22.7196); // Indore default
  const [longitude, setLongitude] = useState(75.8577);
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const createComplaint = useMutation(api.complaints.create);
  const setAiVerification = useMutation(api.complaints.setAiVerification);
  const verifyComplaint = useAction(api.aiVerify.verifyComplaint);

  const detectLocation = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
          setLocationName(
            `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`
          );
          setIsLocating(false);
        },
        () => {
          // Fallback to Indore
          setLatitude(22.7196);
          setLongitude(75.8577);
          setLocationName("Indore, MP");
          setIsLocating(false);
        }
      );
    } else {
      setLatitude(22.7196);
      setLongitude(75.8577);
      setLocationName("Indore, MP");
      setIsLocating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsSubmitting(true);

    try {
      // Create the complaint
      const complaintId = await createComplaint({
        userId,
        userName,
        title: title.trim(),
        description: description.trim(),
        pollutionType: pollutionType || undefined,
        latitude,
        longitude,
        locationName: locationName || undefined,
      });

      // Run AI verification
      setIsVerifying(true);
      try {
        const verification = await verifyComplaint({
          title: title.trim(),
          description: description.trim(),
          pollutionType: pollutionType || undefined,
        });

        await setAiVerification({
          complaintId: complaintId as string,
          aiVerification: {
            pollutionType: verification.pollutionType,
            confidence: verification.confidence,
            severity: verification.severity,
            notes: verification.notes,
          },
        });
      } catch (aiError) {
        console.error("AI verification failed:", aiError);
        // Complaint is still submitted, just not AI-verified
      }

      setSubmitted(true);
    } catch (error) {
      console.error("Submit error:", error);
    } finally {
      setIsSubmitting(false);
      setIsVerifying(false);
    }
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="neo-card bg-neo-green/10 p-8 text-center space-y-4"
      >
        <div className="neo-border bg-neo-green p-4 inline-block mx-auto">
          <CheckCircle2 className="size-8 text-foreground" />
        </div>
        <h3 className="font-bold text-lg uppercase">Report Submitted</h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Your pollution report has been submitted and sent for AI verification.
          An admin will review it shortly. If no admin reviews it within 2
          hours, it will be automatically verified.
        </p>
        <Button
          onClick={() => {
            setSubmitted(false);
            setTitle("");
            setDescription("");
            setPollutionType("");
          }}
          className="neo-btn bg-primary text-primary-foreground"
        >
          Submit Another Report
        </Button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider">
          Report Title
        </label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Heavy smoke near Pithampur factory"
          className="neo-input"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider">
          Description
        </label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe what you observed — visible smoke, smell, duration, nearby landmarks..."
          className="neo-input min-h-[100px]"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider">
          Pollution Type
        </label>
        <Select value={pollutionType} onValueChange={setPollutionType}>
          <SelectTrigger className="neo-input">
            <SelectValue placeholder="Select type (optional)" />
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
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider">
            Location
          </label>
          <button
            type="button"
            onClick={detectLocation}
            className="text-xs text-neo-blue hover:underline flex items-center gap-1 cursor-pointer"
            disabled={isLocating}
          >
            {isLocating ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <Navigation className="size-3" />
            )}
            {isLocating ? "Detecting..." : "Use my location"}
          </button>
        </div>
        <Input
          value={locationName}
          onChange={(e) => setLocationName(e.target.value)}
          placeholder="Location name (optional)"
          className="neo-input"
        />
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            value={latitude}
            onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
            placeholder="Latitude"
            className="neo-input text-xs"
            step="any"
          />
          <Input
            type="number"
            value={longitude}
            onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
            placeholder="Longitude"
            className="neo-input text-xs"
            step="any"
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={!title.trim() || !description.trim() || isSubmitting}
        className="neo-btn bg-primary text-primary-foreground w-full py-6"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            {isVerifying ? "AI Verifying..." : "Submitting..."}
          </>
        ) : (
          <>
            <Send className="mr-2 size-4" />
            Submit Report
          </>
        )}
      </Button>

      <p className="text-[10px] text-muted-foreground text-center">
        Your report will be verified by Gemini AI and then reviewed by an
        admin. Unreviewed reports auto-verify after 2 hours.
      </p>
    </form>
  );
}
