import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Bot,
  Map,
  Satellite,
  Shield,
  Activity,
  ArrowRight,
  Leaf,
  Wind,
  Eye,
  Zap,
  ChevronRight,
  AlertTriangle,
  Clock,
  Globe,
} from "lucide-react";
import { useNavigate } from "react-router";
import TechTicker from "@/components/TechTicker";

const FEATURES = [
  {
    icon: <Bot className="size-6" />,
    title: "AI Chat Assistant",
    description:
      "Ask anything about air quality, pollution sources, and health advisories. Powered by Google Gemini.",
    color: "bg-neo-yellow",
    textColor: "text-primary-foreground",
  },
  {
    icon: <AlertTriangle className="size-6" />,
    title: "Report & Verify",
    description:
      "Snap and report pollution events. Gemini AI verifies your report instantly, with admin review within 2 hours.",
    color: "bg-neo-green",
    textColor: "text-primary-foreground",
  },
  {
    icon: <Map className="size-6" />,
    title: "Hotspot Map",
    description:
      "Real-time pollution visualization across the Indore-Pithampur corridor with 72-hour forecasting.",
    color: "bg-neo-blue",
    textColor: "text-primary-foreground",
  },
  {
    icon: <Satellite className="size-6" />,
    title: "Satellite View",
    description:
      "Google Maps integration with satellite imagery layer for ground-level pollution monitoring.",
    color: "bg-neo-orange",
    textColor: "text-primary-foreground",
  },
  {
    icon: <Shield className="size-6" />,
    title: "Smart Alerts",
    description:
      "Location-based warnings and critical alerts when air quality drops to dangerous levels.",
    color: "bg-neo-red",
    textColor: "text-white",
  },
  {
    icon: <Activity className="size-6" />,
    title: "Real-Time AQI",
    description:
      "Live air quality index readings with pollutant breakdown: PM2.5, PM10, SO₂, NO₂, CO, O₃.",
    color: "bg-neo-purple",
    textColor: "text-white",
  },
];

const STATS = [
  { value: "2.5M+", label: "People Protected" },
  { value: "150+", label: "Monitoring Points" },
  { value: "24/7", label: "Real-Time Data" },
  { value: "98%", label: "AI Accuracy" },
];

const STEPS = [
  {
    step: "01",
    title: "Report",
    desc: "Snap a photo of pollution or describe what you see. Our AI classifies the source automatically.",
    icon: <Zap className="size-8" />,
    color: "bg-neo-yellow",
  },
  {
    step: "02",
    title: "Analyze",
    desc: "Gemini AI processes satellite data, sensor readings, and community reports in real-time.",
    icon: <Activity className="size-8" />,
    color: "bg-neo-green",
  },
  {
    step: "03",
    title: "Act",
    desc: "Get actionable insights, alerts, and recommendations for the Indore-Pithampur corridor.",
    icon: <Shield className="size-8" />,
    color: "bg-neo-blue",
  },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Navigation */}
      <nav className="neo-border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="neo-border bg-neo-yellow p-2">
              <Eye className="size-5 text-primary-foreground" />
            </div>
            <span className="font-black text-lg tracking-tight uppercase">
              VayuNetra
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              className="neo-btn hidden sm:flex"
              onClick={() => navigate("/auth")}
            >
              Sign In
            </Button>
            <Button
              className="neo-btn bg-primary text-primary-foreground"
              onClick={() => navigate("/auth")}
            >
              Get Started
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-12">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="neo-tag bg-neo-green text-foreground inline-block px-3 py-1">
                🌍 Environmental AI Platform
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase leading-[0.92] tracking-tight">
                Your Eyes
                <br />
                on the
                <br />
                <span className="bg-neo-yellow neo-border inline-block px-3 py-1 mt-1 text-foreground">
                  Air.
                </span>
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground max-w-lg leading-relaxed">
                AI-powered air quality monitoring for the Indore-Pithampur
                corridor. Report pollution, get instant AI verification, track
                hotspots, and receive real-time alerts — all in one platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  size="lg"
                  className="neo-btn bg-primary text-primary-foreground px-6 py-6 text-base"
                  onClick={() => navigate("/auth")}
                >
                  <Bot className="mr-2 size-5" />
                  Start Monitoring
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="neo-btn px-6 py-6 text-base"
                  onClick={() => navigate("/auth")}
                >
                  <Map className="mr-2 size-5" />
                  View Hotspots
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              {/* AQI Dashboard Preview Card */}
              <div className="neo-card bg-card p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="neo-border bg-neo-yellow p-2">
                      <Activity className="size-5 text-foreground" />
                    </div>
                    <div>
                      <p className="font-bold text-sm uppercase">
                        Live AQI — Indore
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Updated 2 min ago
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="size-2 bg-neo-green neo-border rounded-full pulse-live" />
                    <span className="text-[10px] font-bold">LIVE</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="neo-border bg-neo-orange/10 p-3 text-center">
                    <p className="text-2xl font-black">142</p>
                    <p className="text-[10px] text-muted-foreground uppercase">
                      AQI
                    </p>
                  </div>
                  <div className="neo-border bg-neo-red/10 p-3 text-center">
                    <p className="text-2xl font-black">55</p>
                    <p className="text-[10px] text-muted-foreground uppercase">
                      PM2.5
                    </p>
                  </div>
                  <div className="neo-border bg-neo-yellow/10 p-3 text-center">
                    <p className="text-2xl font-black">128</p>
                    <p className="text-[10px] text-muted-foreground uppercase">
                      PM10
                    </p>
                  </div>
                </div>

                <div className="neo-border bg-neo-orange/10 p-2 flex items-center gap-2">
                  <AlertTriangle className="size-4 text-neo-orange" />
                  <span className="text-xs font-medium">
                    Unhealthy for sensitive groups — limit outdoor activity
                  </span>
                </div>

                <div className="flex gap-2">
                  <div className="neo-border bg-neo-green/10 px-2 py-1 text-[10px] font-bold">
                    🟢 0-50 Safe
                  </div>
                  <div className="neo-border bg-neo-yellow/10 px-2 py-1 text-[10px] font-bold">
                    🟡 51-100 Moderate
                  </div>
                  <div className="neo-border bg-neo-orange/10 px-2 py-1 text-[10px] font-bold">
                    🟠 101-150 Unhealthy
                  </div>
                  <div className="neo-border bg-neo-red/10 px-2 py-1 text-[10px] font-bold hidden sm:block">
                    🔴 151+ Very Unhealthy
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <motion.div
                animate={{ y: [-4, 4, -4] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-4 -right-4 neo-border bg-neo-green p-3 hidden lg:block"
              >
                <Wind className="size-5 text-foreground" />
              </motion.div>
              <motion.div
                animate={{ y: [4, -4, 4] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -bottom-4 -left-4 neo-border bg-neo-blue text-white p-3 hidden lg:block"
              >
                <Globe className="size-5" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="neo-border-y border-border bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <p className="text-2xl sm:text-3xl font-black">{stat.value}</p>
                <p className="text-[10px] uppercase tracking-wider opacity-70 mt-1">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >                  <div className="neo-tag bg-neo-yellow text-foreground inline-block px-3 py-1 mb-4">
                    Features
                  </div>
              <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight">
                Complete Air Quality
                <br />
                <span className="bg-neo-green neo-border inline-block px-3 py-1 mt-1 text-foreground">
                  Monitoring Suite
                </span>
              </h2>
            </motion.div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="neo-card bg-card p-6 space-y-4 group hover:neo-shadow-lg transition-all"
              >
                <div
                  className={`neo-border ${feature.color} p-3 inline-block`}
                >
                  <span className="text-foreground">{feature.icon}</span>
                </div>
                <h3 className="font-bold text-sm uppercase tracking-wide">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
                <div className="flex items-center gap-1 text-xs font-medium text-neo-yellow group-hover:gap-2 transition-all">
                  Learn more <ChevronRight className="size-3" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="neo-border-y border-border bg-card py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <div className="neo-tag bg-neo-blue text-foreground inline-block px-3 py-1 mb-4">
              How It Works
            </div>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight">
              Three Steps to
              <br />
              <span className="bg-neo-yellow neo-border inline-block px-3 py-1 mt-1 text-foreground">
                Cleaner Air
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {STEPS.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="neo-card bg-background p-6 relative"
              >
                <div className="absolute -top-4 -left-2 neo-border bg-foreground text-background px-3 py-1 font-black text-sm">
                  {item.step}
                </div>
                <div
                  className={`${item.color} neo-border p-4 inline-block mb-4 mt-2`}
                >
                  <span className="text-foreground">{item.icon}</span>
                </div>
                <h3 className="font-bold text-lg uppercase mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack Marquee */}
      <TechTicker />

      {/* CTA Section */}
      <section className="py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="neo-card bg-neo-yellow p-8 sm:p-12"
          >
            <div className="neo-border bg-primary text-primary-foreground p-4 inline-block mb-6">
              <Leaf className="size-8" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight mb-4 text-foreground">
              Start Monitoring
              <br />
              Air Quality Now
            </h2>
            <p className="text-foreground/70 max-w-md mx-auto mb-8">
              Join thousands of citizens and researchers using AI to understand
              and combat air pollution in the Indore-Pithampur corridor.
            </p>
            <Button
              size="lg"
              className="neo-btn bg-primary text-primary-foreground px-8 py-6 text-base border-foreground"
              onClick={() => navigate("/auth")}
            >
              <Eye className="mr-2 size-5" />
              Launch VayuNetra
              <ArrowRight className="ml-2 size-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="neo-border-t border-border bg-card py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="neo-border bg-neo-yellow p-2">
              <Eye className="size-4 text-foreground" />
            </div>
            <span className="font-black uppercase text-sm">VayuNetra</span>
            </div>
            <p className="text-xs text-muted-foreground">
              © 2026 VayuNetra. Environmental monitoring powered by Google AI.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
