import { Clock, FileText, Hash, Folder as FolderIcon, Calendar } from 'lucide-react';
import { useMemo } from 'react';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function timeAgo(dateStr) {
  if (!dateStr) return '—';
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(dateStr);
}

function computeStats(text) {
  if (!text) return { words: 0, chars: 0, readTime: 0 };
  // Strip markdown syntax for word count
  const stripped = text.replace(/[#*_`~\[\]()>!|-]/g, ' ').replace(/\s+/g, ' ').trim();
  const words = stripped ? stripped.split(' ').filter(Boolean).length : 0;
  const chars = text.length;
  const readTime = Math.max(1, Math.ceil(words / 200));
  return { words, chars, readTime };
}

export default function NoteMetadata({ note, content }) {
  const stats = useMemo(() => computeStats(content || note?.content || ''), [content, note]);

  return (
    <div className="border-t border-snap-border bg-snap-surface/50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-gray-500">
          {/* Stats */}
          <div className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" />
            <span>{stats.words} words · {stats.chars.toLocaleString()} characters · {stats.readTime} min read</span>
          </div>

          {/* Created */}
          {note?.createdAt && (
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>Created {formatDate(note.createdAt)}</span>
            </div>
          )}

          {/* Updated */}
          {note?.updatedAt && (
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Updated {timeAgo(note.updatedAt)}</span>
            </div>
          )}

          {/* Folder */}
          {note?.folder?.name && (
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: note.folder.color }} />
              <span>{note.folder.name}</span>
            </div>
          )}

          {/* Tags */}
          {note?.tags?.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap">
              <Hash className="w-3.5 h-3.5" />
              {note.tags.map(tag => (
                <span key={tag} className="text-snap-accent">#{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
