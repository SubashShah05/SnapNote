import { PenLine, Star, Pin, Archive, Trash2, FileSearch, Inbox } from 'lucide-react';
import { useContext } from 'react';
import { NoteContext } from '../../context/NoteContext';

const VIEW_CONFIGS = {
  active:    { icon: PenLine,      title: 'No notes yet',         sub: 'Create your first note to get started.',    cta: true  },
  favorites: { icon: Star,         title: 'No favorites',         sub: 'Notes you star will appear here.',          cta: false },
  pinned:    { icon: Pin,          title: 'No pinned notes',      sub: 'Pin important notes to find them faster.',   cta: false },
  archived:  { icon: Archive,      title: 'Archive is empty',     sub: 'Archived notes will appear here.',           cta: false },
  trash:     { icon: Trash2,       title: 'Trash is empty',       sub: "You're all clear.",                          cta: false },
  search:    { icon: FileSearch,   title: 'No results found',     sub: 'Try different keywords.',                    cta: false },
  folder:    { icon: Inbox,        title: 'Folder is empty',      sub: 'Create a note and move it here.',            cta: true  },
};

export default function EmptyState({ type = 'active', onNewNote }) {
  const config = VIEW_CONFIGS[type] || VIEW_CONFIGS.active;
  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-snap-card border border-snap-border flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-gray-500" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{config.title}</h3>
      <p className="text-sm text-gray-500 max-w-xs mb-6">{config.sub}</p>
      {config.cta && onNewNote && (
        <button
          onClick={onNewNote}
          className="flex items-center gap-2 bg-snap-accent hover:bg-snap-accent-hover text-white text-sm font-medium px-5 py-2.5 rounded-xl transition"
        >
          Create a note
        </button>
      )}
    </div>
  );
}
