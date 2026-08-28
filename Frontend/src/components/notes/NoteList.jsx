import { useContext, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NoteContext } from '../../context/NoteContext';
import NoteCard from './NoteCard';
import NoteSkeleton from './NoteSkeleton';
import EmptyState from './EmptyState';
import SearchEmptyState from '../search/SearchEmptyState';

function getEmptyType(view) {
  if (view === 'favorites') return 'favorites';
  if (view === 'pinned')    return 'pinned';
  if (view === 'archived')  return 'archived';
  if (view === 'trash')     return 'trash';
  if (view.startsWith('folder:')) return 'folder';
  return 'active';
}

function getViewLabel(view, folders) {
  if (view === 'active')    return 'All Notes';
  if (view === 'favorites') return 'Favorites';
  if (view === 'pinned')    return 'Pinned';
  if (view === 'archived')  return 'Archive';
  if (view === 'trash')     return 'Trash';
  if (view.startsWith('folder:')) {
    const id = view.split(':')[1];
    const f = folders.find(f => f._id === id);
    return f ? `📁 ${f.name}` : 'Folder';
  }
  if (view.startsWith('tag:')) return `#${view.split(':')[1]}`;
  return 'Notes';
}

export default function NoteList({ onEditNote, onNewNote }) {
  const {
    notes, loading, error,
    currentView, folders,
    searchQuery, totalNotes, hasMore,
    loadMore, clearSearch,
    refreshNotes,
    setCurrentView,
  } = useContext(NoteContext);

  const isTrash   = currentView === 'trash';
  const isArchive = currentView === 'archived';

  // Infinite scroll — observe a sentinel element at the bottom
  const sentinelRef = useRef(null);
  const observerRef = useRef(null);

  const setupSentinel = useCallback((node) => {
    if (observerRef.current) observerRef.current.disconnect();
    sentinelRef.current = node;
    if (!node) return;
    observerRef.current = new IntersectionObserver(
      entries => { if (entries[0].isIntersecting && hasMore && !loading) loadMore(); },
      { threshold: 0.1 }
    );
    observerRef.current.observe(node);
  }, [hasMore, loading, loadMore]);

  if (loading && notes.length === 0) return <NoteSkeleton count={6} />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
          <span className="text-2xl">⚠️</span>
        </div>
        <h3 className="text-base font-semibold text-white mb-2">Unable to load notes</h3>
        <p className="text-sm text-gray-500 mb-4">{error}</p>
        <button
          onClick={refreshNotes}
          className="bg-snap-accent hover:bg-snap-accent-hover text-white text-sm px-4 py-2 rounded-xl transition"
        >
          Try again
        </button>
      </div>
    );
  }

  const viewLabel = getViewLabel(currentView, folders);
  const isSearching = !!searchQuery.trim();

  return (
    <div className="flex flex-col h-full">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div>
          <h1 className="text-lg font-bold text-white">{viewLabel}</h1>
          {isSearching ? (
            <p className="text-xs text-gray-500 mt-0.5">
              {totalNotes} result{totalNotes !== 1 ? 's' : ''} for "{searchQuery}"
            </p>
          ) : (
            totalNotes > 0 && (
              <p className="text-xs text-gray-500 mt-0.5">{totalNotes} note{totalNotes !== 1 ? 's' : ''}</p>
            )
          )}
        </div>
        {!isTrash && !isArchive && (
          <button
            onClick={onNewNote}
            className="text-sm text-snap-accent hover:text-snap-accent-hover font-medium transition"
          >
            + New
          </button>
        )}
      </div>

      {/* Content */}
      {notes.length === 0 ? (
        isSearching ? (
          <SearchEmptyState
            onClearFilters={() => { clearSearch(); setCurrentView('active'); }}
            onNewNote={onNewNote}
          />
        ) : (
          <EmptyState
            type={getEmptyType(currentView)}
            onNewNote={onNewNote}
          />
        )
      ) : (
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mt-2"
          >
            <AnimatePresence mode="popLayout">
              {notes.map(note => (
                <NoteCard
                  key={note._id}
                  note={note}
                  onEdit={onEditNote}
                  isTrash={isTrash}
                  isArchive={isArchive}
                  searchTerm={searchQuery}
                />
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Load more sentinel */}
          {hasMore && (
            <div ref={setupSentinel} className="flex justify-center py-6">
              {loading ? (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="w-4 h-4 border-2 border-snap-accent border-t-transparent rounded-full animate-spin" />
                  Loading more...
                </div>
              ) : (
                <button
                  onClick={loadMore}
                  className="text-sm text-snap-accent hover:text-snap-accent-hover transition"
                >
                  Load more
                </button>
              )}
            </div>
          )}

          {/* End of list indicator */}
          {!hasMore && notes.length >= 20 && (
            <p className="text-center text-xs text-gray-700 py-4">
              All {totalNotes} notes loaded
            </p>
          )}
        </div>
      )}
    </div>
  );
}
