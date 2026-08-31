import { motion } from "framer-motion";

const TECH_STACK = [
  "Gemini Vision",
  "Gemini Nano",
  "Vertex AI",
  "Google Earth Engine",
  "Google Maps Platform",
  "Firebase",
  "React",
  "Convex",
  "Tailwind CSS",
];

export default function TechTicker() {
  return (
    <section className="py-4 overflow-hidden border-y border-border bg-secondary">
      <div className="flex animate-marquee whitespace-nowrap">
        {[...TECH_STACK, ...TECH_STACK].map((tech, i) => (
          <div key={i} className="mx-6 flex items-center gap-2">
            <span className="neo-border bg-card px-4 py-1.5 text-xs font-bold uppercase tracking-wider">
              {tech}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
