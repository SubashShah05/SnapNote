import { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import {
  PenLine, Star, CheckSquare, FileText,
  TrendingUp, RefreshCw, AlertCircle
} from "lucide-react";
import { AuthContext } from "../../context/AuthContext";
import { NoteContext } from "../../context/NoteContext";
import { TaskContext } from "../../context/TaskContext";
import { getDashboardOverview } from "../../api/analytics.api";
import StatsCard from "./StatsCard";
import RecentNotes from "./RecentNotes";
import TaskPanel from "./TaskPanel";
import ProductivityChart from "./ProductivityChart";
import ActivityTimeline from "./ActivityTimeline";
import StreakWidget from "./StreakWidget";
import CalendarView from "./CalendarView";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function OverviewDashboard({ onEditNote }) {
  const { user } = useContext(AuthContext);
  const { notes } = useContext(NoteContext); // using context notes for recent instead of stats
  const { stats: taskStats } = useContext(TaskContext);

  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadOverview = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getDashboardOverview();
      if (result.success) {
        setOverview(result.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load statistics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOverview();
  }, []);

  const greeting = getGreeting();
  const firstName = user?.name?.split(" ")[0] || "there";

  const statCards = overview ? [
    { icon: PenLine, label: "Total Notes", value: overview.notes.total, color: "blue", delay: 0 },
    { icon: CheckSquare, label: "Tasks Done", value: overview.tasks.total > 0 ? `${overview.tasks.completed}/${overview.tasks.total}` : "0", color: "green", delay: 0.05 },
    { icon: TrendingUp, label: "Notes This Week", value: overview.notes.createdWeek, color: "purple", delay: 0.1 },
    { icon: FileText, label: "Tasks Today", value: overview.tasks.completedToday, color: "cyan", delay: 0.15 },
  ] : [];

  return (
    <div className="h-full overflow-y-auto p-4 lg:p-6 space-y-6 pb-24">

      {/* ── Greeting ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-white">
            {greeting}, {firstName} 👋
          </h1>
          <p className="text-sm text-white-muted mt-1">Here's your productivity overview.</p>
        </div>
      </motion.div>

      {/* ── Stats Grid ── */}
      {error ? (
        <div className="flex flex-col items-center py-6 gap-3">
          <AlertCircle className="w-8 h-8 text-red-400" />
          <p className="text-sm text-red-400">{error}</p>
          <button onClick={loadOverview} className="flex items-center gap-2 text-sm text-snap-accent hover:text-snap-accent-hover transition">
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-snap-card border border-snap-border animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {statCards.map(card => (
            <StatsCard key={card.label} {...card} />
          ))}
        </div>
      )}

      {/* ── Main Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Streaks & Chart */}
        <div className="space-y-6">
           <StreakWidget 
              currentStreak={overview?.activity?.currentStreak || 0} 
              longestStreak={overview?.activity?.longestStreak || 0} 
           />
           <ProductivityChart days={7} />
           <ActivityTimeline />
        </div>

        {/* Middle Column: Tasks & Calendar */}
        <div className="space-y-6">
           <section aria-labelledby="tasks-heading">
             <div className="flex items-center justify-between mb-3">
               <h2 id="tasks-heading" className="text-sm font-semibold text-white flex items-center gap-2">
                 <CheckSquare className="w-4 h-4 text-snap-accent" />
                 Tasks
                 {taskStats.active > 0 && (
                   <span className="bg-snap-accent/20 text-snap-accent text-xs px-1.5 py-0.5 rounded-full">
                     {taskStats.active} active
                   </span>
                 )}
               </h2>
             </div>
             <div className="bg-snap-card border border-snap-border rounded-2xl p-4">
               <TaskPanel />
             </div>
           </section>
           
           <section>
             <h2 className="text-sm font-semibold text-white mb-3">Productivity Calendar</h2>
             <CalendarView />
           </section>
        </div>

        {/* Right Column: Notes */}
        <div className="space-y-6">
           <section aria-labelledby="recent-notes-heading">
             <div className="flex items-center justify-between mb-3">
               <h2 id="recent-notes-heading" className="text-sm font-semibold text-white flex items-center gap-2">
                 <PenLine className="w-4 h-4 text-snap-accent" />
                 Recent Notes
               </h2>
             </div>
             <RecentNotes
               notes={notes.slice(0, 5)}
               onEdit={onEditNote}
               loading={false}
             />
           </section>
        </div>

      </div>
    </div>
  );
}
