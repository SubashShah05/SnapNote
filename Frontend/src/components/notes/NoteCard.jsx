import { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import {
  Star, Pin, MoreVertical, Edit, Copy, Archive, Trash2, RotateCcw,
  Trash, Tag, Folder as FolderIcon, X
} from 'lucide-react';
import { NoteContext } from '../../context/NoteContext';
import DeleteDialog from './DeleteDialog';
import SearchHighlight from '../search/SearchHighlight';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export default function NoteCard({ note, onEdit, isTrash = false, isArchive = false, searchTerm = '' }) {
  const { toggleFavorite, togglePin, toggleArchive, deleteNote, restoreNote, permanentDeleteNote, duplicateNote } = useContext(NoteContext);
  const [menuOpen, setMenuOpen]           = useState(false);
  const [deleteOpen, setDeleteOpen]       = useState(false);
  const [deleting, setDeleting]           = useState(false);
  const [toastMsg, setToastMsg]           = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2500);
  };

  const handleFavorite = async (e) => {
    e.stopPropagation();
    try { await toggleFavorite(note._id); }
    catch { showToast('Failed to update favorite'); }
  };

  const handlePin = async () => {
    setMenuOpen(false);
    try { await togglePin(note._id); }
    catch { showToast('Failed to update pin'); }
  };

  const handleArchive = async () => {
    setMenuOpen(false);
    try { await toggleArchive(note._id); }
    catch { showToast('Failed to archive'); }
  };

  const handleTrash = async () => {
    setMenuOpen(false);
    try { await deleteNote(note._id); }
    catch { showToast('Failed to move to trash'); }
  };

  const handleRestore = async () => {
    setMenuOpen(false);
    try { await restoreNote(note._id); showToast('Note restored'); }
    catch { showToast('Failed to restore'); }
  };

  const handleDuplicate = async () => {
    setMenuOpen(false);
    try { await duplicateNote(note._id); }
    catch { showToast('Failed to duplicate'); }
  };

  const handlePermanentDelete = async () => {
    setDeleting(true);
    try {
      await permanentDeleteNote(note._id);
      setDeleteOpen(false);
    } catch {
      showToast('Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  // Preview — strip markdown for clean display
  const preview = (note.content || '')
    .replace(/[#*_`~>\[\]()!-]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120);

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.25 }}
        whileHover={{ y: -2 }}
        className="group relative bg-snap-card border border-snap-border hover:border-snap-subtle rounded-2xl p-5 flex flex-col gap-3 cursor-pointer transition-colors"
        onClick={() => !menuOpen && onEdit(note)}
        role="article"
        aria-label={`Note: ${note.title}`}
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && onEdit(note)}
      >
        {/* Pin/Favorite badges */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            {note.isPinned && (
              <span className="flex items-center gap-1 text-xs bg-snap-accent/15 text-snap-accent px-2 py-0.5 rounded-full font-medium">
                <Pin className="w-3 h-3" />Pinned
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Favorite toggle (only active notes) */}
            {!isTrash && (
              <button
                onClick={handleFavorite}
                className={`p-1.5 rounded-lg transition ${note.isFavorite ? 'text-yellow-400' : 'text-gray-600 hover:text-yellow-400 opacity-0 group-hover:opacity-100'}`}
                aria-label={note.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Star className="w-4 h-4" fill={note.isFavorite ? 'currentColor' : 'none'} />
              </button>
            )}

            {/* Context menu */}
            <div className="relative">
              <button
                onClick={e => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
                className="p-1.5 rounded-lg text-gray-600 hover:text-white hover:bg-white/5 transition opacity-0 group-hover:opacity-100"
                aria-label="Note options"
                aria-expanded={menuOpen}
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={e => { e.stopPropagation(); setMenuOpen(false); }} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="absolute right-0 top-full mt-1 z-20 w-44 bg-snap-surface border border-snap-border rounded-xl shadow-xl py-1 overflow-hidden"
                  >
                    {isTrash ? (
                      <>
                        <MenuItem icon={RotateCcw} label="Restore" onClick={handleRestore} />
                        <MenuItem icon={Trash}      label="Delete permanently" onClick={() => { setMenuOpen(false); setDeleteOpen(true); }} danger />
                      </>
                    ) : (
                      <>
                        <MenuItem icon={Edit}    label="Edit"              onClick={() => { setMenuOpen(false); onEdit(note); }} />
                        <MenuItem icon={Copy}    label="Duplicate"         onClick={handleDuplicate} />
                        <MenuItem icon={Pin}     label={note.isPinned ? 'Unpin' : 'Pin'}       onClick={handlePin} />
                        {!isArchive && <MenuItem icon={Archive} label={note.isArchived ? 'Unarchive' : 'Archive'} onClick={handleArchive} />}
                        <div className="my-1 border-t border-snap-border" />
                        <MenuItem icon={Trash2}  label="Move to trash"    onClick={handleTrash} danger />
                      </>
                    )}
                  </motion.div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-white leading-snug line-clamp-2">
          <SearchHighlight text={note.title} query={searchTerm} />
        </h3>

        {/* Preview */}
        {preview && (
          <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 flex-1">
            <SearchHighlight text={preview} query={searchTerm} />
          </p>
        )}

        {/* Tags */}
        {note.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {note.tags.slice(0, 4).map(tag => (
              <span key={tag} className="text-xs bg-snap-surface px-2 py-0.5 rounded-full text-white-muted">
                #{tag}
              </span>
            ))}
            {note.tags.length > 4 && (
              <span className="text-xs text-gray-600">+{note.tags.length - 4}</span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-600 mt-auto pt-2 border-t border-snap-border/50">
          {note.folder?.name ? (
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: note.folder.color }} />
              <span>{note.folder.name}</span>
            </div>
          ) : <span />}
          <span>{timeAgo(note.updatedAt || note.createdAt)}</span>
        </div>

        {/* Toast */}
        {toastMsg && (
          <div className="absolute bottom-3 left-3 right-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs px-3 py-1.5 rounded-lg z-30">
            {toastMsg}
          </div>
        )}
      </motion.div>

      <DeleteDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handlePermanentDelete}
        isLoading={deleting}
      />
    </>
  );
}

function MenuItem({ icon: Icon, label, onClick, danger = false }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-3 py-2 text-xs text-left transition hover:bg-white/5 ${danger ? 'text-red-400 hover:text-red-300' : 'text-gray-300 hover:text-white'}`}
    >
      <Icon className="w-3.5 h-3.5 flex-shrink-0" />
      {label}
    </button>
  );
}
