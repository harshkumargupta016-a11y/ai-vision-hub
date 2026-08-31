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
} from "lucide-react";
import { useNavigate } from "react-router";

const FEATURES = [
  {
    icon: <Bot className="size-6" />,
    title: "AI Chat Assistant",
    description:
      "Ask anything about air quality, pollution sources, and health advisories. Powered by Google Gemini.",
    color: "bg-neo-yellow",
  },
  {
    icon: <Map className="size-6" />,
    title: "Hotspot Map",
    description:
      "Real-time pollution visualization across the Indore-Pithampur corridor with satellite imagery.",
    color: "bg-neo-green",
  },
  {
    icon: <Satellite className="size-6" />,
    title: "Satellite View",
    description:
      "Google Maps integration with satellite layer for ground-level pollution monitoring.",
    color: "bg-neo-blue",
  },
  {
    icon: <Shield className="size-6" />,
    title: "Smart Reports",
    description:
      "Snap and report pollution events with AI-powered classification and auto-tagged GPS.",
    color: "bg-neo-orange",
  },
];

const STATS = [
  { value: "2.5M+", label: "People Protected" },
  { value: "150+", label: "Monitoring Points" },
  { value: "24/7", label: "Real-time Data" },
  { value: "98%", label: "AI Accuracy" },
];

const TECH_STACK = [
  "Gemini Vision",
  "Gemini Nano",
  "Vertex AI",
  "Google Earth Engine",
  "Google Maps Platform",
  "Firebase",
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
              <Leaf className="size-5" />
            </div>
            <span className="font-bold text-lg tracking-tight uppercase">
              AirSentinel
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-16">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="neo-tag bg-neo-yellow inline-block px-3 py-1">
                🌍 Environmental AI Platform
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase leading-[0.95] tracking-tight">
                Breathe
                <br />
                <span className="bg-neo-yellow neo-border inline-block px-3 py-1 mt-2">
                  Cleaner
                </span>
                <br />
                Air.
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground max-w-lg leading-relaxed">
                AI-powered air quality monitoring for the Indore-Pithampur
                corridor. Real-time pollution tracking, satellite imagery, and
                expert environmental analysis — all in one platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  size="lg"
                  className="neo-btn bg-primary text-primary-foreground px-6 py-6 text-base"
                  onClick={() => navigate("/auth")}
                >
                  <Bot className="mr-2 size-5" />
                  Start Chatting
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="neo-btn px-6 py-6 text-base"
                  onClick={() => navigate("/auth")}
                >
                  <Map className="mr-2 size-5" />
                  View Map
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              {/* AI Chat Preview Card */}
              <div className="neo-card bg-card p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="neo-border bg-neo-yellow p-2">
                    <Bot className="size-5" />
                  </div>
                  <div>
                    <p className="font-bold text-sm uppercase">AirSentinel AI</p>
                    <p className="text-xs text-muted-foreground">
                      Powered by Gemini
                    </p>
                  </div>
                  <span className="ml-auto size-2 bg-neo-green neo-border rounded-full" />
                </div>
                <div className="neo-border bg-muted p-3 text-sm">
                  What's the current air quality status in Pithampur industrial
                  zone?
                </div>
                <div className="neo-border bg-neo-yellow/10 p-3 text-sm space-y-2">
                  <p className="font-medium">Current AQI: 142 (Unhealthy)</p>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p>• PM2.5: 55 µg/m³ — Elevated</p>
                    <p>• PM10: 128 µg/m³ — High</p>
                    <p>• SO₂: 18 µg/m³ — Moderate</p>
                    <p>• Source: Industrial emissions + crop residue</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="neo-border bg-neo-green/10 px-3 py-1 text-xs font-medium">
                    🟢 Safe
                  </div>
                  <div className="neo-border bg-neo-yellow/10 px-3 py-1 text-xs font-medium">
                    🟡 Moderate
                  </div>
                  <div className="neo-border bg-neo-red/10 px-3 py-1 text-xs font-medium">
                    🔴 Unhealthy
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <motion.div
                animate={{ y: [-4, 4, -4] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-4 -right-4 neo-border bg-neo-green p-3 hidden lg:block"
              >
                <Wind className="size-5" />
              </motion.div>
              <motion.div
                animate={{ y: [4, -4, 4] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -bottom-4 -left-4 neo-border bg-neo-blue text-white p-3 hidden lg:block"
              >
                <Eye className="size-5" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="neo-border-y border-border bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
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
                <p className="text-xs uppercase tracking-wider opacity-70 mt-1">
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
            >
              <div className="neo-tag bg-neo-yellow inline-block px-3 py-1 mb-4">
                Features
              </div>
              <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight">
                Complete Air Quality
                <br />
                <span className="bg-neo-green neo-border inline-block px-3 py-1 mt-1">
                  Monitoring Suite
                </span>
              </h2>
            </motion.div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="neo-card bg-card p-6 space-y-4 group hover:neo-shadow-lg transition-all"
              >
                <div
                  className={`neo-border ${feature.color} p-3 inline-block`}
                >
                  {feature.icon}
                </div>
                <h3 className="font-bold text-sm uppercase tracking-wide">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
                <div className="flex items-center gap-1 text-xs font-medium text-primary group-hover:gap-2 transition-all">
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
            <div className="neo-tag bg-neo-blue text-white inline-block px-3 py-1 mb-4">
              How It Works
            </div>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight">
              Three Steps to
              <br />
              <span className="bg-neo-yellow neo-border inline-block px-3 py-1 mt-1">
                Cleaner Air
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                title: "Report",
                desc: "Snap a photo of pollution or use sensors. AI classifies the source automatically.",
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
            ].map((item, i) => (
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
                  {item.icon}
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
      <section className="py-12 overflow-hidden border-y border-border bg-muted">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...TECH_STACK, ...TECH_STACK].map((tech, i) => (
            <div key={i} className="mx-8 flex items-center gap-2">
              <span className="neo-border bg-card px-4 py-2 text-sm font-bold uppercase tracking-wide">
                {tech}
              </span>
            </div>
          ))}
        </div>
      </section>

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
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight mb-4">
              Start Monitoring
              <br />
              Air Quality Now
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-8">
              Join thousands of citizens and researchers using AI to understand
              and combat air pollution in the Indore-Pithampur corridor.
            </p>
            <Button
              size="lg"
              className="neo-btn bg-primary text-primary-foreground px-8 py-6 text-base"
              onClick={() => navigate("/auth")}
            >
              <Bot className="mr-2 size-5" />
              Launch AirSentinel AI
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
                <Leaf className="size-4" />
              </div>
              <span className="font-bold uppercase text-sm">AirSentinel</span>
            </div>
            <p className="text-xs text-muted-foreground">
              © 2026 AirSentinel. Environmental monitoring powered by Google
              AI.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
