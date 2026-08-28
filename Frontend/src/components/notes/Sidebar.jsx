import { PenLine, Star, Inbox, Archive, Trash2, Folder as FolderIcon, Plus, X, Check, Pencil, ChevronRight, ChevronDown, LayoutDashboard, CheckSquare } from 'lucide-react';
import { useContext, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NoteContext } from '../../context/NoteContext';

const VIEWS = [
  { id: 'overview',  label: 'Overview',   icon: LayoutDashboard },
  { id: 'active',    label: 'All Notes',  icon: PenLine  },
  { id: 'favorites', label: 'Favorites',  icon: Star     },
  { id: 'pinned',    label: 'Pinned',     icon: Inbox    },
  { id: 'archived',  label: 'Archive',    icon: Archive  },
  { id: 'trash',     label: 'Trash',      icon: Trash2   },
];

const FOLDER_COLORS = ['#4f6ef7','#a78bfa','#34d399','#f59e0b','#f97316','#ec4899','#06b6d4','#10b981'];

function FolderRow({ folder, isActive, onClick }) {
  const { updateFolder, deleteFolder } = useContext(NoteContext);
  const [editing, setEditing] = useState(false);
  const [name, setName]       = useState(folder.name);
  const [err, setErr]         = useState('');
  const inputRef = useRef(null);

  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  const save = async () => {
    if (!name.trim()) { setErr('Name required'); return; }
    try {
      await updateFolder(folder._id, { name: name.trim() });
      setEditing(false); setErr('');
    } catch (e) {
      setErr(e.response?.data?.message || 'Error');
    }
  };

  const handleDelete = async () => {
    if (confirm(`Delete folder "${folder.name}"? Notes will become uncategorized.`)) {
      await deleteFolder(folder._id);
    }
  };

  if (editing) {
    return (
      <div className="px-3 py-1.5">
        <input
          ref={inputRef}
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') { setEditing(false); setName(folder.name); }}}
          className="w-full bg-snap-surface border border-snap-accent rounded px-2 py-1 text-xs text-white outline-none"
        />
        {err && <p className="text-red-400 text-xs mt-1">{err}</p>}
        <div className="flex gap-1 mt-1">
          <button onClick={save}   className="text-xs text-green-400 hover:text-green-300 flex items-center gap-1"><Check className="w-3 h-3"/>Save</button>
          <button onClick={() => { setEditing(false); setName(folder.name); }} className="text-xs text-gray-500 hover:text-gray-300">Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`group w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors text-left ${isActive ? 'bg-snap-accent/15 text-white' : 'text-white-muted hover:text-white hover:bg-white/5'}`}
    >
      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: folder.color }} />
      <span className="flex-1 truncate">{folder.name}</span>
      <div className="hidden group-hover:flex items-center gap-1">
        <button
          onClick={e => { e.stopPropagation(); setEditing(true); }}
          className="p-0.5 hover:text-white text-gray-500 rounded"
          aria-label={`Rename folder ${folder.name}`}
        ><Pencil className="w-3 h-3"/></button>
        <button
          onClick={e => { e.stopPropagation(); handleDelete(); }}
          className="p-0.5 hover:text-red-400 text-gray-500 rounded"
          aria-label={`Delete folder ${folder.name}`}
        ><X className="w-3 h-3"/></button>
      </div>
    </button>
  );
}

export default function Sidebar({ onNewNote, isOpen, onClose }) {
  const { currentView, setCurrentView, folders, createFolder, notes } = useContext(NoteContext);
  const [showNewFolder, setShowNewFolder]   = useState(false);
  const [newFolderName, setNewFolderName]   = useState('');
  const [newFolderColor, setNewFolderColor] = useState(FOLDER_COLORS[0]);
  const [folderErr, setFolderErr]           = useState('');
  const [foldersOpen, setFoldersOpen]       = useState(true);

  const handleNewFolder = async () => {
    if (!newFolderName.trim()) { setFolderErr('Name required'); return; }
    try {
      await createFolder(newFolderName.trim(), newFolderColor);
      setNewFolderName(''); setFolderErr(''); setShowNewFolder(false);
    } catch (e) {
      setFolderErr(e.response?.data?.message || 'Error creating folder');
    }
  };

  const handleViewChange = (view) => {
    setCurrentView(view);
    if (onClose) onClose();
  };

  const trashCount = notes.filter ? undefined : 0;

  const sidebarContent = (
    <div className="flex flex-col h-full bg-snap-surface border-r border-snap-border">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-snap-border">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-snap-accent rounded-lg">
            <PenLine className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white">SnapNote</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1 text-white-muted hover:text-white rounded-lg hover:bg-white/5 lg:hidden">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* New Note Button */}
      <div className="px-3 py-3">
        <button
          onClick={() => { onNewNote(); if (onClose) onClose(); }}
          className="w-full flex items-center justify-center gap-2 bg-snap-accent hover:bg-snap-accent-hover text-white text-sm font-medium py-2.5 rounded-xl transition-colors"
          id="new-note-btn"
        >
          <Plus className="w-4 h-4" />
          New Note
        </button>
      </div>

      {/* Views */}
      <nav className="px-2 space-y-0.5" aria-label="Note views">
        {VIEWS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => handleViewChange(id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${
              currentView === id
                ? 'bg-snap-accent/15 text-snap-accent'
                : 'text-white-muted hover:text-white hover:bg-white/5'
            }`}
            aria-current={currentView === id ? 'page' : undefined}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </button>
        ))}
      </nav>

      {/* Divider */}
      <div className="mx-3 my-3 border-t border-snap-border" />

      {/* Folders */}
      <div className="flex-1 overflow-y-auto px-2">
        <div
          className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-widest hover:text-gray-300 transition cursor-pointer"
          onClick={() => setFoldersOpen(!foldersOpen)}
          role="button"
          tabIndex={0}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setFoldersOpen(!foldersOpen); }}}
          aria-expanded={foldersOpen}
          aria-label="Toggle folders"
        >
          <span>Folders</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={e => { e.stopPropagation(); setShowNewFolder(true); }}
              className="p-0.5 hover:text-white rounded"
              aria-label="Create new folder"
            ><Plus className="w-3.5 h-3.5"/></button>
            {foldersOpen ? <ChevronDown className="w-3.5 h-3.5"/> : <ChevronRight className="w-3.5 h-3.5"/>}
          </div>
        </div>

        <AnimatePresence initial={false}>
          {foldersOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              {/* New folder input */}
              {showNewFolder && (
                <div className="px-3 pb-2 pt-1">
                  <input
                    autoFocus
                    value={newFolderName}
                    onChange={e => setNewFolderName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleNewFolder(); if (e.key === 'Escape') { setShowNewFolder(false); setNewFolderName(''); }}}
                    placeholder="Folder name..."
                    className="w-full bg-snap-bg border border-snap-accent rounded px-2 py-1.5 text-xs text-white outline-none placeholder-gray-600"
                  />
                  <div className="flex gap-1 mt-1.5 flex-wrap">
                    {FOLDER_COLORS.map(c => (
                      <button
                        key={c}
                        onClick={() => setNewFolderColor(c)}
                        className={`w-4 h-4 rounded-full border-2 transition ${newFolderColor === c ? 'border-white scale-110' : 'border-transparent'}`}
                        style={{ background: c }}
                        aria-label={`Folder color ${c}`}
                      />
                    ))}
                  </div>
                  {folderErr && <p className="text-red-400 text-xs mt-1">{folderErr}</p>}
                  <div className="flex gap-2 mt-1.5">
                    <button onClick={handleNewFolder} className="text-xs text-green-400 hover:text-green-300">Create</button>
                    <button onClick={() => { setShowNewFolder(false); setNewFolderName(''); setFolderErr(''); }} className="text-xs text-gray-500 hover:text-gray-300">Cancel</button>
                  </div>
                </div>
              )}

              {/* Folder list */}
              {folders.length === 0 && !showNewFolder && (
                <p className="px-3 py-2 text-xs text-gray-600">No folders yet</p>
              )}
              {folders.map(folder => (
                <FolderRow
                  key={folder._id}
                  folder={folder}
                  isActive={currentView === `folder:${folder._id}`}
                  onClick={() => handleViewChange(`folder:${folder._id}`)}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-56 xl:w-64 flex-shrink-0 h-full">
        {sidebarContent}
      </aside>

      {/* Mobile overlay sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              onClick={onClose}
            />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="fixed left-0 top-0 bottom-0 w-64 z-50 lg:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
