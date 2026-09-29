import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Eye,
  LogOut,
  ArrowLeft,
  Bot,
  FileText,
  Map,
  MessageCircle,
  Search,
  BookOpen,
  LifeBuoy,
  Mail,
  Clock,
  Shield,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

/* ---------------- Dummy Q/A data ---------------- */

const FAQS = [
  {
    category: "Getting Started",
    question: "What is VayuNetra?",
    answer:
      "VayuNetra (\"Eye on the Air\") is an AI-powered air quality monitoring platform for the Indore-Pithampur corridor. It combines real-time AQI data, satellite imagery, community pollution reports, and Google Gemini AI verification to help citizens and authorities understand and act on air pollution.",
  },
  {
    category: "Getting Started",
    question: "How do I submit a pollution report?",
    answer:
      "Go to the Report page, drag and drop a photo (optional), give your report a title and description, pick a pollution type, and either type your location or use the 'Use my location' button. When you submit, Gemini AI analyzes your report — including the photo — and assigns a type, severity, and confidence score instantly.",
  },
  {
    category: "Getting Started",
    question: "Do I need an account to use VayuNetra?",
    answer:
      "Yes — you can sign up with an email or continue as a guest. An account lets you track your submitted reports, receive verification updates, and get personalized alerts for your area.",
  },
  {
    category: "Reports & Verification",
    question: "How does AI verification work?",
    answer:
      "Every submitted report is analyzed by Google Gemini. If you upload a photo, Gemini Vision examines it for visible pollution indicators — smoke density and color, dust clouds, burning vegetation, industrial activity. The AI classifies the pollution type, rates the severity, and returns a confidence score. High-confidence reports (75%+) are shown with a green score; lower ones with yellow or orange.",
  },
  {
    category: "Reports & Verification",
    question: "What happens after AI verification?",
    answer:
      "AI-verified reports go to an admin for human review. If an admin approves it, the report becomes 'Admin Verified'. If nobody reviews the report within 2 hours, it is automatically verified so it still appears on the hotspot map.",
  },
  {
    category: "Reports & Verification",
    question: "Why was my report rejected?",
    answer:
      "Admins may reject reports that are duplicates, off-topic, low-quality, or that the AI flagged with very low confidence. You'll receive an email with the rejection reason. You can always submit a new report with clearer photos and a more detailed description.",
  },
  {
    category: "Maps & Data",
    question: "What are hotspots?",
    answer:
      "Hotspots are locations where verified pollution reports cluster. The Hotspot Map shows them as color-coded markers — yellow for low severity up to red for critical — using a satellite view so you can see exactly what's on the ground at each location.",
  },
  {
    category: "Maps & Data",
    question: "How accurate is the 72-hour forecast?",
    answer:
      "The forecast combines recent AQI trends, wind patterns, and seasonal factors. It's a planning guide, not a guarantee — conditions can change quickly around industrial zones. Check back often; the forecast refreshes every few hours.",
  },
  {
    category: "Maps & Data",
    question: "How often does the AQI update?",
    answer:
      "The dashboard AQI reading refreshes automatically. During high-pollution events (crop burning season, festival periods) readings may update more frequently alongside new community reports.",
  },
  {
    category: "Account & Privacy",
    question: "How do I delete my account or data?",
    answer:
      "Contact support using the options below and we'll remove your account and submitted reports. Comments and public reports already visible on the map may take up to 30 days to fully clear from backups.",
  },
  {
    category: "Account & Privacy",
    question: "Who can see my reports?",
    answer:
      "Verified reports appear publicly on the hotspot map with your display name. Your email address is never shown publicly — it's only used for verification status notifications.",
  },
];

const CATEGORIES = ["All", "Getting Started", "Reports & Verification", "Maps & Data", "Account & Privacy"];

const TOPICS = [
  {
    icon: <Bot className="size-5" />,
    title: "AI Chat Assistant",
    desc: "Ask VayuNetra AI anything about air quality, health impacts, or pollution sources.",
    action: "Open chat",
    route: "/chat",
    color: "bg-neo-yellow",
  },
  {
    icon: <FileText className="size-5" />,
    title: "Submitting Reports",
    desc: "Learn how photo verification and confidence scoring work.",
    action: "Report an issue",
    route: "/report",
    color: "bg-neo-green",
  },
  {
    icon: <Map className="size-5" />,
    title: "Hotspot Map",
    desc: "See active pollution hotspots and the 72-hour forecast.",
    action: "View map",
    route: "/hotspots",
    color: "bg-neo-blue",
  },
  {
    icon: <Shield className="size-5" />,
    title: "Alerts & Warnings",
    desc: "Understand alert levels and how location warnings reach you.",
    action: "Go to dashboard",
    route: "/dashboard",
    color: "bg-neo-orange",
  },
];

/* ---------------- Page ---------------- */

export default function HelpPage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const filtered = FAQS.filter((f) => {
    const matchesCategory = category === "All" || f.category === category;
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      f.question.toLowerCase().includes(q) ||
      f.answer.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="neo-border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="neo-border bg-card p-2 hover:bg-muted transition-colors cursor-pointer"
              aria-label="Go back"
            >
              <ArrowLeft className="size-4" />
            </button>
            <div className="neo-border bg-neo-yellow p-2">
              <LifeBuoy className="size-4 text-foreground" />
            </div>
            <h1 className="font-black text-sm uppercase tracking-wide">Help &amp; FAQ</h1>
          </div>
          <button
            onClick={handleSignOut}
            className="neo-border bg-card p-2 hover:bg-muted transition-colors cursor-pointer"
            aria-label="Sign out"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-10">
        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3"
        >
          <div className="neo-tag bg-neo-green text-foreground inline-block px-3 py-1">
            Support Center
          </div>
          <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight">
            How can we
            <span className="bg-neo-yellow neo-border inline-block px-2 ml-2 text-foreground">help?</span>
          </h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Search our knowledge base or browse frequently asked questions
            about reports, verification, maps, and your account.
          </p>
        </motion.section>

        {/* Search */}
        <div className="relative">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions — e.g. 'confidence score', 'photo verification'..."
            className="neo-input pl-9"
          />
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`neo-border px-3 py-1.5 text-xs font-bold uppercase tracking-wide cursor-pointer transition-colors ${
                category === c
                  ? "bg-foreground text-background"
                  : "bg-card hover:bg-muted"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Quick topics */}
        <section className="space-y-3">
          <h3 className="font-bold text-sm uppercase tracking-wide flex items-center gap-2">
            <BookOpen className="size-4" /> Quick Topics
          </h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {TOPICS.map((t, i) => (
              <motion.button
                key={t.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                onClick={() => navigate(t.route)}
                className="neo-card bg-card p-4 flex items-start gap-3 text-left hover:neo-shadow-lg transition-all cursor-pointer group"
              >
                <div className={`neo-border ${t.color} p-2 shrink-0`}>
                  <span className="text-foreground">{t.icon}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-xs uppercase tracking-wide mb-1">
                    {t.title}
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {t.desc}
                  </p>
                  <span className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-bold uppercase text-neo-blue group-hover:gap-1.5 transition-all">
                    {t.action} <ChevronRight className="size-3" />
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        </section>

        {/* FAQ accordion */}
        <section className="space-y-3">
          <h3 className="font-bold text-sm uppercase tracking-wide flex items-center gap-2">
            <MessageCircle className="size-4" /> Frequently Asked Questions
          </h3>

          {filtered.length === 0 ? (
            <div className="neo-card bg-card p-8 text-center space-y-3">
              <Search className="size-8 mx-auto text-muted-foreground" />
              <p className="font-bold text-sm uppercase">No matching questions</p>
              <p className="text-xs text-muted-foreground">
                Try a different search term, or ask VayuNetra AI directly — it
                knows the platform inside out.
              </p>
              <Button
                size="sm"
                className="neo-btn bg-neo-yellow text-foreground"
                onClick={() => navigate("/chat")}
              >
                <Bot className="mr-2 size-4" />
                Ask the AI instead
              </Button>
            </div>
          ) : (
            <div className="neo-card bg-card p-2 sm:p-4">
              <Accordion type="single" collapsible className="w-full">
                {filtered.map((f, i) => (
                  <AccordionItem key={i} value={`faq-${i}`} className="border-b border-border last:border-0">
                    <AccordionTrigger className="text-left text-sm font-bold hover:no-underline px-2 py-3">
                      <span className="flex items-center gap-2">
                        <span className="neo-border bg-neo-yellow/20 text-[10px] px-1.5 py-0.5 uppercase shrink-0 hidden sm:inline-block">
                          {f.category}
                        </span>
                        {f.question}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="px-2 pb-3">
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        {f.answer}
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          )}
        </section>

        {/* Contact section (dummy) */}
        <section className="space-y-3">
          <h3 className="font-bold text-sm uppercase tracking-wide flex items-center gap-2">
            <Mail className="size-4" /> Still Stuck? Contact Us
          </h3>
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="neo-card bg-card p-4 space-y-2">
              <div className="neo-border bg-neo-green p-2 inline-block">
                <Mail className="size-4 text-foreground" />
              </div>
              <p className="font-bold text-xs uppercase">Email Support</p>
              <p className="text-xs text-muted-foreground">support@vayunetra.in</p>
              <p className="text-[10px] text-muted-foreground">Replies within 24 hours</p>
            </div>
            <div className="neo-card bg-card p-4 space-y-2">
              <div className="neo-border bg-neo-yellow p-2 inline-block">
                <Clock className="size-4 text-foreground" />
              </div>
              <p className="font-bold text-xs uppercase">Response Time</p>
              <p className="text-xs text-muted-foreground">Mon–Sat, 9 AM – 7 PM IST</p>
              <p className="text-[10px] text-muted-foreground">Critical alerts: 24/7</p>
            </div>
            <div className="neo-card bg-card p-4 space-y-2">
              <div className="neo-border bg-neo-blue p-2 inline-block">
                <Shield className="size-4 text-foreground" />
              </div>
              <p className="font-bold text-xs uppercase">Report Abuse</p>
              <p className="text-xs text-muted-foreground">moderation@vayunetra.in</p>
              <p className="text-[10px] text-muted-foreground">For false or harmful reports</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <div className="color-band" />
      <footer className="bg-card py-6">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="neo-border bg-neo-yellow p-1.5">
              <Eye className="size-3.5 text-foreground" />
            </div>
            <span className="font-black uppercase text-xs">VayuNetra</span>
          </div>
          <p className="text-[10px] text-muted-foreground">
            © 2026 VayuNetra — Environmental monitoring powered by Google AI.
          </p>
        </div>
      </footer>
    </div>
  );
}
