import { useState, useCallback } from "react";

const STORAGE_KEY = "snap_search_history";
const MAX_HISTORY = 10;

/**
 * Manages recent search history in localStorage.
 * Only stores query strings — never note content.
 */
export function useSearchHistory() {
  const load = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  const [history, setHistory] = useState(load);

  const save = (items) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Quota exceeded — silently ignore
    }
    setHistory(items);
  };

  const addToHistory = useCallback((query) => {
    const q = query.trim();
    if (!q || q.length < 2) return;
    setHistory(prev => {
      const filtered = prev.filter(item => item !== q);
      const next = [q, ...filtered].slice(0, MAX_HISTORY);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const removeFromHistory = useCallback((query) => {
    setHistory(prev => {
      const next = prev.filter(item => item !== query);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    setHistory([]);
  }, []);

  return { history, addToHistory, removeFromHistory, clearHistory };
}
