import { FileSearch, X, PenLine } from "lucide-react";
import { motion } from "framer-motion";

export default function SearchEmptyState({ onClearFilters, onNewNote }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-snap-card border border-snap-border flex items-center justify-center mb-4">
        <FileSearch className="w-7 h-7 text-gray-500" />
      </div>
      <h3 className="text-base font-semibold text-white mb-2">No notes found</h3>
      <p className="text-sm text-gray-500 max-w-xs mb-6">
        Try another search term or change your filters.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        {onClearFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-snap-border text-gray-300 hover:text-white hover:border-gray-500 text-sm transition"
          >
            <X className="w-4 h-4" />
            Clear filters
          </button>
        )}
        {onNewNote && (
          <button
            onClick={onNewNote}
            className="flex items-center gap-2 bg-snap-accent hover:bg-snap-accent-hover text-white text-sm font-medium px-4 py-2 rounded-xl transition"
          >
            <PenLine className="w-4 h-4" />
            Create note
          </button>
        )}
      </div>
    </motion.div>
  );
}
