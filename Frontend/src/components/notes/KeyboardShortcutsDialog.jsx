import { motion, AnimatePresence } from 'framer-motion';
import { X, Keyboard } from 'lucide-react';
import { useEffect } from 'react';

const shortcuts = [
  { keys: ['Ctrl/⌘', 'N'],  action: 'New note' },
  { keys: ['Ctrl/⌘', 'S'],  action: 'Save note' },
  { keys: ['Ctrl/⌘', 'K'],  action: 'Focus search' },
  { keys: ['Ctrl/⌘', 'B'],  action: 'Bold (in editor)' },
  { keys: ['Ctrl/⌘', 'I'],  action: 'Italic (in editor)' },
  { keys: ['Escape'],        action: 'Close / go back' },
  { keys: ['?'],             action: 'Show keyboard shortcuts' },
];

export default function KeyboardShortcutsDialog({ isOpen, onClose }) {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Keyboard shortcuts"
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ duration: 0.2 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm px-4"
          >
            <div className="bg-snap-card border border-snap-border rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Keyboard className="w-4 h-4 text-snap-accent" />
                  <h2 className="text-base font-semibold text-white">Keyboard Shortcuts</h2>
                </div>
                <button onClick={onClose} className="text-white-muted hover:text-white p-1 rounded-lg hover:bg-white/5">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2">
                {shortcuts.map(({ keys, action }) => (
                  <div key={action} className="flex items-center justify-between py-1.5">
                    <span className="text-sm text-white-muted">{action}</span>
                    <div className="flex items-center gap-1">
                      {keys.map((k, i) => (
                        <span key={i} className="px-2 py-0.5 bg-snap-surface border border-snap-border rounded text-xs text-gray-300 font-mono">
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
