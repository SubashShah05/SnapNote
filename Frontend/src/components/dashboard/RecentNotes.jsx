import { motion } from "framer-motion";
import { Star, Pin, Clock, Folder as FolderIcon } from "lucide-react";

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function stripMarkdown(text = "") {
  return text
    .replace(/[#*_`~>[\]()!-]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 100);
}

export default function RecentNotes({ notes = [], onEdit, loading }) {
  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-16 rounded-xl bg-snap-card border border-snap-border animate-pulse" />
        ))}
      </div>
    );
  }

  if (!notes.length) {
    return (
      <p className="text-sm text-gray-600 py-4 text-center">
        No notes yet. Create your first note!
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {notes.map((note, i) => {
        const preview = stripMarkdown(note.content);
        return (
          <motion.button
            key={note._id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            whileHover={{ x: 3 }}
            onClick={() => onEdit(note)}
            className="w-full text-left flex items-start gap-3 p-3 rounded-xl bg-snap-card border border-snap-border hover:border-snap-subtle transition group"
            aria-label={`Open note: ${note.title}`}
          >
            {/* Status icons */}
            <div className="flex flex-col items-center gap-1 pt-0.5 flex-shrink-0">
              {note.isPinned   && <Pin  className="w-3 h-3 text-snap-accent" aria-label="Pinned" />}
              {note.isFavorite && <Star className="w-3 h-3 text-yellow-400"  aria-label="Favorited" />}
              {!note.isPinned && !note.isFavorite && (
                <div className="w-1.5 h-1.5 rounded-full bg-snap-border mt-1" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-white truncate group-hover:text-snap-accent transition">
                  {note.title}
                </span>
                <span className="text-xs text-gray-600 flex-shrink-0 flex items-center gap-1">
                  <Clock className="w-3 h-3" aria-hidden />
                  {timeAgo(note.updatedAt)}
                </span>
              </div>
              {preview && (
                <p className="text-xs text-gray-500 truncate mt-0.5">{preview}</p>
              )}
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {note.folder?.name && (
                  <span className="flex items-center gap-1 text-xs text-gray-600">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: note.folder.color }} />
                    {note.folder.name}
                  </span>
                )}
                {note.tags?.slice(0, 2).map(tag => (
                  <span key={tag} className="text-xs text-gray-700">#{tag}</span>
                ))}
              </div>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
