import { useState, useRef, useCallback } from "react";
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
  Upload,
  X,
  ImageIcon,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const POLLUTION_TYPES = [
  "Crop Burning",
  "Industrial Smoke",
  "Vehicle Emissions",
  "Construction Dust",
  "Waste Burning",
  "Other",
];

/** Compress and resize an image file, returning a base64 data URL. */
async function compressImage(file: File, maxDim = 1024, quality = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          const scale = maxDim / Math.max(width, height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas error"));
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

export default function ComplaintForm({
  userId,
  userName,
}: {
  userId: string;
  userName?: string;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [pollutionType, setPollutionType] = useState("");
  const [locationName, setLocationName] = useState("");
  const [latitude, setLatitude] = useState(22.7196);
  const [longitude, setLongitude] = useState(75.8577);
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedImageUrl, setSubmittedImageUrl] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<{
    pollutionType: string;
    confidence: number;
    severity: string;
    notes: string;
    analyzedImage: boolean;
  } | null>(null);

  // Image upload state
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createComplaint = useMutation(api.complaints.create);
  const setAiVerification = useMutation(api.complaints.setAiVerification);
  const verifyComplaint = useAction(api.aiVerify.verifyComplaint);

  const handleImageFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setIsCompressing(true);
    try {
      const compressed = await compressImage(file);
      setImageDataUrl(compressed);
    } catch {
      // Silently fail — image is optional
    } finally {
      setIsCompressing(false);
    }
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleImageFile(file);
    },
    [handleImageFile]
  );

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageFile(file);
  };

  const removeImage = () => {
    setImageDataUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

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
      const complaintId = await createComplaint({
        userId,
        userName,
        title: title.trim(),
        description: description.trim(),
        pollutionType: pollutionType || undefined,
        latitude,
        longitude,
        locationName: locationName || undefined,
        imageDataUrl: imageDataUrl || undefined,
      });

      // Run AI verification (with photo analysis if an image was uploaded)
      setIsVerifying(true);
      try {
        const verification = await verifyComplaint({
          title: title.trim(),
          description: description.trim(),
          pollutionType: pollutionType || undefined,
          imageDataUrl: imageDataUrl || undefined,
        });

        setAiResult(verification);

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
      }

      setSubmittedImageUrl(imageDataUrl);
      setSubmitted(true);
    } catch (error) {
      console.error("Submit error:", error);
    } finally {
      setIsSubmitting(false);
      setIsVerifying(false);
    }
  };

  if (submitted) {
    const confidencePct = aiResult ? Math.round(aiResult.confidence * 100) : null;
    const confidenceColor =
      confidencePct === null
        ? ""
        : confidencePct >= 75
          ? "text-neo-green"
          : confidencePct >= 50
            ? "text-neo-yellow"
            : "text-neo-orange";

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-6"
      >
        <div className="neo-card bg-neo-green/10 p-8 text-center space-y-4">
          <div className="neo-border bg-neo-green p-4 inline-block mx-auto">
            <CheckCircle2 className="size-8 text-foreground" />
          </div>
          <h3 className="font-bold text-lg uppercase tracking-tight">
            Report Submitted
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
            Your pollution report has been submitted and sent for AI
            verification. An admin will review it shortly. If no admin reviews
            it within 2 hours, it will be automatically verified.
          </p>
        </div>

        {/* Gemini verification result with confidence score */}
        {aiResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="neo-card bg-card p-5 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="neo-border bg-neo-blue p-1.5">
                  <Sparkles className="size-4 text-white" />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider">
                  Gemini AI Verification
                </p>
              </div>
              {aiResult.analyzedImage && (
                <span className="neo-tag bg-neo-purple/20 text-neo-purple border-neo-purple px-2 py-0.5 text-[10px]">
                  Photo Analyzed
                </span>
              )}
            </div>

            {/* Confidence score bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Confidence Score</span>
                <span className={`font-black text-lg ${confidenceColor}`}>
                  {confidencePct}%
                </span>
              </div>
              <div className="neo-border h-3 bg-muted overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${confidencePct}%` }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                  className={`h-full ${
                    (confidencePct ?? 0) >= 75
                      ? "bg-neo-green"
                      : (confidencePct ?? 0) >= 50
                        ? "bg-neo-yellow"
                        : "bg-neo-orange"
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="neo-border bg-background p-2">
                <p className="text-muted-foreground text-[10px] uppercase">Type</p>
                <p className="font-bold">{aiResult.pollutionType}</p>
              </div>
              <div className="neo-border bg-background p-2">
                <p className="text-muted-foreground text-[10px] uppercase">Severity</p>
                <p className="font-bold uppercase">{aiResult.severity}</p>
              </div>
            </div>

            {aiResult.notes && (
              <div className="neo-border bg-neo-blue/5 p-3">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <span className="font-bold text-foreground">AI Notes: </span>
                  {aiResult.notes}
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* Show the submitted image if there was one */}
        {submittedImageUrl && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="neo-card bg-card p-4"
          >
            <p className="text-xs font-bold uppercase tracking-wider mb-3 text-muted-foreground">
              Submitted Photo
            </p>
            <div className="neo-border overflow-hidden">
              <img
                src={submittedImageUrl}
                alt="Submitted pollution photo"
                className="w-full h-48 object-cover"
              />
            </div>
            {aiResult?.analyzedImage && (
              <div className="mt-3 flex items-center gap-2 text-xs text-neo-green">
                <CheckCircle2 className="size-3" />
                <span>Gemini Vision analyzed this photo as part of verification.</span>
              </div>
            )}
          </motion.div>
        )}

        <Button
          onClick={() => {
            setSubmitted(false);
            setTitle("");
            setDescription("");
            setPollutionType("");
            setImageDataUrl(null);
            setSubmittedImageUrl(null);
            setAiResult(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
          }}
          className="neo-btn bg-primary text-primary-foreground w-full"
        >
          Submit Another Report
        </Button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Image Upload Zone — Drag & Drop */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
          <Camera className="size-3" />
          Photo Evidence
          <span className="text-muted-foreground font-normal normal-case">
            (optional)
          </span>
        </label>

        <AnimatePresence mode="wait">
          {imageDataUrl ? (
            /* ---- Image Preview ---- */
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative neo-card bg-card overflow-hidden"
            >
              <div className="neo-border overflow-hidden">
                <img
                  src={imageDataUrl}
                  alt="Uploaded pollution photo"
                  className="w-full h-48 object-cover"
                />
              </div>
              <div className="absolute top-2 right-2 flex gap-2">
                <button
                  type="button"
                  onClick={removeImage}
                  className="neo-border bg-neo-red text-white p-1.5 hover:bg-neo-red/80 transition-colors cursor-pointer"
                >
                  <X className="size-3" />
                </button>
              </div>
              <div className="p-3 flex items-center gap-2 text-xs text-neo-green">
                <CheckCircle2 className="size-3" />
                <span className="font-medium">Photo ready for submission</span>
              </div>
            </motion.div>
          ) : /* ---- Drop Zone ---- */
          isCompressing ? (
            <motion.div
              key="compressing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="neo-border bg-card p-8 text-center"
            >
              <Loader2 className="size-8 mx-auto mb-3 animate-spin text-neo-blue" />
              <p className="text-xs font-bold uppercase">Processing image...</p>
            </motion.div>
          ) : (
            <motion.div
              key="dropzone"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`
                neo-border border-dashed cursor-pointer transition-all duration-200
                ${
                  isDragOver
                    ? "bg-neo-yellow/20 border-neo-yellow scale-[1.02]"
                    : "bg-card hover:bg-muted/50 hover:border-neo-blue"
                }
                p-8 text-center group
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={onFileSelect}
                className="hidden"
              />

              <div
                className={`
                  neo-border p-3 inline-block mb-3 transition-colors
                  ${
                    isDragOver
                      ? "bg-neo-yellow text-foreground"
                      : "bg-muted group-hover:bg-neo-blue/10"
                  }
                `}
              >
                {isDragOver ? (
                  <Upload className="size-6 text-foreground" />
                ) : (
                  <ImageIcon className="size-6 text-muted-foreground group-hover:text-neo-blue transition-colors" />
                )}
              </div>

              <p className="font-bold text-sm uppercase tracking-tight mb-1">
                {isDragOver ? "Drop your photo here" : "Drag & drop a photo"}
              </p>
              <p className="text-xs text-muted-foreground">
                or{" "}
                <span className="text-neo-blue font-medium underline">
                  browse files
                </span>
              </p>
              <p className="text-[10px] text-muted-foreground mt-2">
                JPG, PNG, WebP — max 10 MB
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Title */}
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

      {/* Description */}
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

      {/* Pollution Type */}
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

      {/* Location */}
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

      {/* Submit */}
      <Button
        type="submit"
        disabled={!title.trim() || !description.trim() || isSubmitting}
        className="neo-btn bg-primary text-primary-foreground w-full py-6"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            {isVerifying ? "Gemini AI Verifying..." : "Submitting..."}
          </>
        ) : (
          <>
            <Send className="mr-2 size-4" />
            Submit Report
          </>
        )}
      </Button>

      {/* Process Note */}
      <div className="neo-border bg-neo-yellow/10 p-3 flex items-start gap-2">
        <AlertTriangle className="size-3 mt-0.5 shrink-0 text-neo-yellow" />
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Your report will be verified by{" "}
          <span className="font-bold text-foreground">Gemini AI</span> (including
          any photo you upload) and then reviewed by an admin. Unreviewed reports
          auto-verify after 2 hours.
        </p>
      </div>
    </form>
  );
}
