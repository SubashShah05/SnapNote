import { useState, useEffect, useRef, useContext, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, LogOut, User, Keyboard, Activity, Settings } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import Sidebar                  from '../components/notes/Sidebar';
import NoteList                 from '../components/notes/NoteList';
import NoteEditor               from '../components/notes/NoteEditor';
import KeyboardShortcutsDialog  from '../components/notes/KeyboardShortcutsDialog';
import AdvancedSearchBar        from '../components/search/AdvancedSearchBar';
import { Suspense, lazy } from 'react';

const OverviewDashboard = lazy(() => import('../components/dashboard/OverviewDashboard'));
import { NoteContext }          from '../context/NoteContext';
import { AuthContext }          from '../context/AuthContext';
import { useSearchHistory }     from '../hooks/useSearchHistory';

export default function DashboardPage() {
  const {
    currentView, setCurrentView,
    searchQuery, triggerSearch, clearSearch,
    sortOption,
    refreshNotes,
  } = useContext(NoteContext);

  const { user, logout } = useContext(AuthContext);
  const navigate         = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToHistory } = useSearchHistory();

  const [sidebarOpen, setSidebarOpen]     = useState(false);
  const [editingNote, setEditingNote]     = useState(null);
  const [isEditorOpen, setIsEditorOpen]   = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const searchRef = useRef(null);

  // ── Sync URL → state on mount (preserve search state across refreshes)
  useEffect(() => {
    const urlSearch = searchParams.get('search');
    const urlSort   = searchParams.get('sort');
    const urlView   = searchParams.get('view');

    if (urlView)   setCurrentView(urlView);
    if (urlSearch || urlSort) {
      triggerSearch({
        query: urlSearch || '',
        sort:  urlSort   || 'updated_desc',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Sync state → URL (shallow, doesn't cause re-fetch)
  useEffect(() => {
    const params = {};
    if (currentView && currentView !== 'overview') params.view = currentView;
    if (searchQuery.trim()) params.search = searchQuery;
    if (sortOption !== 'updated_desc') params.sort = sortOption;
    setSearchParams(params, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentView, searchQuery, sortOption]);

  // ── Editor handlers
  const handleNewNote = useCallback(() => {
    setEditingNote(null);
    setIsEditorOpen(true);
  }, []);

  const handleEditNote = useCallback((note) => {
    setEditingNote(note);
    setIsEditorOpen(true);
  }, []);

  const handleBack = useCallback(() => {
    setIsEditorOpen(false);
    setEditingNote(null);
  }, []);

  const handleSaved = useCallback((note) => {
    setEditingNote(note);
  }, []);

  // ── Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      const tag     = e.target.tagName.toLowerCase();
      const isInput = ['input', 'textarea', 'select'].includes(tag) || e.target.isContentEditable;

      if (e.key === '?' && !isInput) { setShortcutsOpen(s => !s); return; }
      if (e.key === 'Escape') {
        if (shortcutsOpen)  { setShortcutsOpen(false); return; }
        if (isEditorOpen)   { handleBack(); return; }
        return;
      }
      if (isInput) return;
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') { e.preventDefault(); handleNewNote(); return; }
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); searchRef.current?.focus(); return; }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isEditorOpen, shortcutsOpen, handleNewNote, handleBack]);

  const handleLogout = () => { logout(); navigate('/'); };

  // Determine if the search bar should be shown (not in overview, not in editor)
  const isOverview  = currentView === 'overview';
  const showSearch  = !isOverview && !isEditorOpen;

  return (
    <div className="flex h-screen bg-snap-bg text-white overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        onNewNote={handleNewNote}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center gap-3 px-4 py-3 border-b border-snap-border bg-snap-surface/50 flex-shrink-0">
          {/* Mobile sidebar toggle */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 text-white-muted hover:text-white hover:bg-white/5 rounded-lg transition"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search (only in note views) */}
          {showSearch ? (
            <div className="flex-1 min-w-0">
              <AdvancedSearchBar searchRef={searchRef} />
            </div>
          ) : (
            <div className="flex-1">
              <h2 className="text-sm font-semibold text-gray-300">
                {isOverview ? 'Productivity Overview' : 'SnapNote'}
              </h2>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setShortcutsOpen(true)}
              className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition hidden sm:block"
              aria-label="Keyboard shortcuts"
              title="Keyboard shortcuts (?)"
            >
              <Keyboard className="w-4 h-4" />
            </button>

            {/* User info */}
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 transition cursor-default">
              <div className="w-7 h-7 rounded-full bg-snap-accent flex items-center justify-center flex-shrink-0">
                <User className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-sm text-gray-300 hidden md:block max-w-[120px] truncate">{user?.name}</span>
            </div>

            {user?.role === 'admin' && (
              <button
                onClick={() => navigate('/admin')}
                className="p-2 text-gray-500 hover:text-snap-accent hover:bg-snap-accent/10 rounded-lg transition hidden sm:block"
                aria-label="Admin Dashboard"
                title="Admin Dashboard"
              >
                <Activity className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => navigate('/settings')}
              className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition"
              aria-label="Account Settings"
              title="Account Settings"
            >
              <Settings className="w-4 h-4" />
            </button>

            <button
              onClick={handleLogout}
              className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition"
              aria-label="Log out"
              title="Log out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Content area */}
        <div className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            {isEditorOpen ? (
              <motion.div
                key="editor"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 overflow-hidden"
              >
                <NoteEditor
                  note={editingNote}
                  onBack={handleBack}
                  onSaved={handleSaved}
                />
              </motion.div>
            ) : isOverview ? (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="absolute inset-0 overflow-hidden"
              >
                <Suspense fallback={<div className="h-full flex items-center justify-center text-gray-500">Loading dashboard...</div>}>
                  <OverviewDashboard onEditNote={handleEditNote} />
                </Suspense>
              </motion.div>
            ) : (
              <motion.div
                key="list"
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 24 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 overflow-hidden"
              >
                <NoteList
                  onEditNote={handleEditNote}
                  onNewNote={handleNewNote}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Keyboard Shortcuts Dialog */}
      <KeyboardShortcutsDialog
        isOpen={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />
    </div>
  );
}
