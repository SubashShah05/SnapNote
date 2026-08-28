import { useEffect, useState } from "react";
import { motion } from "framer-motion";

/**
 * Animated stat card with count-up number animation.
 * Respects prefers-reduced-motion.
 */
export default function StatsCard({ icon: Icon, label, value, color = "blue", delay = 0, sub }) {
  const [displayed, setDisplayed] = useState(0);
  const prefersReduced = typeof window !== "undefined"
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

  useEffect(() => {
    if (prefersReduced || typeof value !== "number") {
      setDisplayed(value);
      return;
    }
    const duration = 600;
    const steps    = 30;
    const step     = value / steps;
    let current    = 0;
    let count      = 0;
    const timer = setInterval(() => {
      count++;
      current = Math.min(Math.round(step * count), value);
      setDisplayed(current);
      if (count >= steps) clearInterval(timer);
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value, prefersReduced]);

  const COLOR_MAP = {
    blue:   { bg: "bg-blue-500/10",   border: "border-blue-500/20",   text: "text-blue-400",   icon: "text-blue-400"   },
    purple: { bg: "bg-purple-500/10", border: "border-purple-500/20", text: "text-purple-400", icon: "text-purple-400" },
    green:  { bg: "bg-emerald-500/10",border: "border-emerald-500/20",text: "text-emerald-400",icon: "text-emerald-400"},
    amber:  { bg: "bg-amber-500/10",  border: "border-amber-500/20",  text: "text-amber-400",  icon: "text-amber-400"  },
    red:    { bg: "bg-red-500/10",    border: "border-red-500/20",    text: "text-red-400",    icon: "text-red-400"    },
    cyan:   { bg: "bg-cyan-500/10",   border: "border-cyan-500/20",   text: "text-cyan-400",   icon: "text-cyan-400"   },
  };

  const c = COLOR_MAP[color] || COLOR_MAP.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      className={`relative bg-snap-card border ${c.border} rounded-2xl p-5 flex flex-col gap-3 overflow-hidden`}
    >
      {/* Subtle glow background */}
      <div className={`absolute inset-0 ${c.bg} opacity-50 pointer-events-none rounded-2xl`} />

      <div className="relative flex items-center justify-between">
        <div className={`p-2 rounded-xl ${c.bg} border ${c.border}`}>
          <Icon className={`w-4 h-4 ${c.icon}`} aria-hidden />
        </div>
      </div>

      <div className="relative">
        <div className={`text-2xl font-bold ${c.text} tabular-nums`} aria-live="polite">
          {typeof value === "number" ? displayed.toLocaleString() : value}
        </div>
        <div className="text-xs text-gray-500 mt-0.5">{label}</div>
        {sub && <div className="text-xs text-gray-600 mt-0.5">{sub}</div>}
      </div>
    </motion.div>
  );
}
