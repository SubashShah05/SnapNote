import { motion } from "framer-motion";

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d === 1) return "yesterday";
  if (d < 7)  return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

const ACTIVITY_CONFIG = {
  NOTE_CREATED:    { emoji: "📝", label: "Created note",      color: "text-blue-400"   },
  NOTE_UPDATED:    { emoji: "✏️",  label: "Updated note",      color: "text-white-muted"   },
  NOTE_DELETED:    { emoji: "🗑️",  label: "Moved to trash",    color: "text-red-400"    },
  NOTE_RESTORED:   { emoji: "♻️",  label: "Restored note",     color: "text-green-400"  },
  NOTE_FAVORITED:  { emoji: "⭐",  label: "Favorited",         color: "text-yellow-400" },
  NOTE_UNFAVORITED:{ emoji: "☆",   label: "Unfavorited",       color: "text-gray-500"   },
  NOTE_ARCHIVED:   { emoji: "📦",  label: "Archived note",     color: "text-amber-400"  },
  NOTE_UNARCHIVED: { emoji: "📬",  label: "Unarchived note",   color: "text-amber-400"  },
  NOTE_PINNED:     { emoji: "📌",  label: "Pinned note",       color: "text-snap-accent"},
  NOTE_UNPINNED:   { emoji: "📍",  label: "Unpinned note",     color: "text-gray-500"   },
  FOLDER_CREATED:  { emoji: "📁",  label: "Created folder",    color: "text-purple-400" },
  FOLDER_DELETED:  { emoji: "🗂️",  label: "Deleted folder",    color: "text-red-400"    },
  TASK_CREATED:    { emoji: "✅",  label: "Created task",      color: "text-emerald-400"},
  TASK_COMPLETED:  { emoji: "☑️",  label: "Completed task",    color: "text-emerald-400"},
  TASK_UNCOMPLETED:{ emoji: "☐",   label: "Reopened task",     color: "text-white-muted"   },
  TASK_DELETED:    { emoji: "🗑️",  label: "Deleted task",      color: "text-red-400"    },
};

function groupByDay(items) {
  const groups = { Today: [], Yesterday: [], Older: [] };
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yestStart  = new Date(todayStart); yestStart.setDate(yestStart.getDate() - 1);

  for (const item of items) {
    const d = new Date(item.createdAt);
    if (d >= todayStart)      groups.Today.push(item);
    else if (d >= yestStart)  groups.Yesterday.push(item);
    else                      groups.Older.push(item);
  }
  return groups;
}

export default function RecentActivity({ activities = [], loading }) {
  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-10 rounded-lg bg-snap-card border border-snap-border animate-pulse" />
        ))}
      </div>
    );
  }

  if (!activities.length) {
    return (
      <p className="text-sm text-gray-600 py-4 text-center">
        No recent activity yet.
      </p>
    );
  }

  const groups = groupByDay(activities);

  return (
    <div className="space-y-4">
      {Object.entries(groups).map(([group, items]) => {
        if (!items.length) return null;
        return (
          <div key={group}>
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-widest mb-2">{group}</p>
            <div className="space-y-1">
              {items.map((item, i) => {
                const cfg = ACTIVITY_CONFIG[item.type] || { emoji: "•", label: item.type, color: "text-white-muted" };
                return (
                  <motion.div
                    key={item._id || i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-2.5 py-1.5 px-2 rounded-lg hover:bg-white/3 transition"
                  >
                    <span className="text-sm" aria-hidden>{cfg.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <span className={`text-xs font-medium ${cfg.color}`}>{cfg.label} </span>
                      {item.metadata?.title && (
                        <span className="text-xs text-white-muted truncate">
                          "{item.metadata.title}"
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-700 flex-shrink-0">{timeAgo(item.createdAt)}</span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
