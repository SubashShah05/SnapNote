import { useState, useRef, useEffect, useContext, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, X, Clock, ChevronDown, Filter,
  SlidersHorizontal, Tag, Folder as FolderIcon, Calendar
} from "lucide-react";
import { NoteContext } from "../../context/NoteContext";
import { useDebounce } from "../../hooks/useDebounce";
import { useSearchHistory } from "../../hooks/useSearchHistory";

const SORT_OPTIONS = [
  { value: "updated_desc", label: "Recently updated" },
  { value: "updated_asc",  label: "Oldest updated" },
  { value: "created_desc", label: "Recently created" },
  { value: "created_asc",  label: "Oldest created" },
  { value: "title_asc",    label: "A → Z" },
  { value: "title_desc",   label: "Z → A" },
];

const DATE_PRESETS = [
  { label: "Any time",     value: "" },
  { label: "Today",        days: 0 },
  { label: "Yesterday",    days: 1 },
  { label: "Last 7 days",  days: 7 },
  { label: "Last 30 days", days: 30 },
];

function getDateRange(preset) {
  if (!preset || preset.days === undefined) return { from: "", to: "" };
  const to  = new Date();
  const from = new Date();
  if (preset.days === 0) {
    from.setHours(0, 0, 0, 0);
  } else if (preset.days === 1) {
    from.setDate(from.getDate() - 1);
    from.setHours(0, 0, 0, 0);
    to.setDate(to.getDate() - 1);
    to.setHours(23, 59, 59, 999);
  } else {
    from.setDate(from.getDate() - preset.days);
  }
  return { from: from.toISOString(), to: to.toISOString() };
}

function Dropdown({ label, icon: Icon, children, className = "" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-snap-card border border-snap-border text-xs text-gray-300 hover:text-white hover:border-gray-500 transition whitespace-nowrap"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {Icon && <Icon className="w-3.5 h-3.5 opacity-70" />}
        {label}
        <ChevronDown className={`w-3 h-3 opacity-50 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.12 }}
            className="absolute top-full left-0 mt-1 z-50 bg-snap-surface border border-snap-border rounded-xl shadow-2xl overflow-hidden min-w-[160px]"
            role="listbox"
          >
            {children({ close: () => setOpen(false) })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DropdownItem({ children, onClick, active }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left px-3 py-2 text-xs transition hover:bg-white/5 ${active ? "text-snap-accent font-medium" : "text-gray-300 hover:text-white"}`}
      role="option"
      aria-selected={active}
    >
      {children}
    </button>
  );
}

export default function AdvancedSearchBar({ searchRef }) {
  const {
    currentView, setCurrentView,
    folders,
    searchQuery, sortOption,
    dateFrom, dateTo,
    triggerSearch, clearSearch,
  } = useContext(NoteContext);

  const { history, addToHistory, removeFromHistory, clearHistory } = useSearchHistory();

  const [localQuery, setLocalQuery]       = useState(searchQuery);
  const [inputFocused, setInputFocused]   = useState(false);
  const [showFilters, setShowFilters]     = useState(false);
  const [selectedDate, setSelectedDate]   = useState("Any time");

  const debouncedQuery = useDebounce(localQuery, 350);
  const containerRef   = useRef(null);

  // Sync debounced query → server search
  useEffect(() => {
    triggerSearch({ query: debouncedQuery });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);

  // Click outside to hide history panel
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setInputFocused(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleClear = () => {
    setLocalQuery("");
    setSelectedDate("Any time");
    clearSearch();
    searchRef?.current?.focus();
  };

  const handleHistoryClick = (q) => {
    setLocalQuery(q);
    setInputFocused(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && localQuery.trim()) {
      addToHistory(localQuery.trim());
      setInputFocused(false);
    }
    if (e.key === "Escape") {
      setInputFocused(false);
      setLocalQuery("");
      clearSearch();
    }
  };

  const handleSortChange = (value) => {
    triggerSearch({ sort: value });
  };

  const handleDatePreset = (preset) => {
    const label = preset.label || "Any time";
    setSelectedDate(label);
    if (!preset.days && preset.days !== 0) {
      triggerSearch({ dFrom: "", dTo: "" });
    } else {
      const { from, to } = getDateRange(preset);
      triggerSearch({ dFrom: from, dTo: to });
    }
  };

  const handleFolderFilter = (folderId, close) => {
    setCurrentView(folderId ? `folder:${folderId}` : "active");
    close();
  };

  const handleTagFilter = (tag, close) => {
    setCurrentView(tag ? `tag:${tag}` : "active");
    close();
  };

  // Derive all unique tags from folders' notes (sourced from NoteContext notes)
  // We pass allTags separately — computed in DashboardPage from the notes array
  const currentSort  = SORT_OPTIONS.find(o => o.value === sortOption)?.label ?? "Recently updated";
  const activeFolder = currentView.startsWith("folder:") ? currentView.split(":")[1] : null;
  const activeTag    = currentView.startsWith("tag:")    ? currentView.split(":")[1] : null;

  // Status view pills
  const STATUS_VIEWS = [
    { id: "active",    label: "All" },
    { id: "favorites", label: "Favorites" },
    { id: "pinned",    label: "Pinned" },
    { id: "archived",  label: "Archive" },
    { id: "trash",     label: "Trash" },
  ];

  const showHistoryPanel = inputFocused && !localQuery.trim() && history.length > 0;

  return (
    <div ref={containerRef} className="w-full space-y-2">
      {/* ── Search Input Row ── */}
      <div className="relative flex items-center gap-2">
        {/* Input wrapper */}
        <div className="relative flex-1">
          <label htmlFor="main-search" className="sr-only">Search notes</label>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" aria-hidden />
          <input
            id="main-search"
            ref={searchRef}
            type="text"
            placeholder="Search notes... (⌘K)"
            value={localQuery}
            onChange={e => setLocalQuery(e.target.value)}
            onFocus={() => setInputFocused(true)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            className="w-full bg-snap-card border border-snap-border focus:border-snap-accent pl-9 pr-9 py-2 rounded-xl text-sm text-white placeholder-gray-600 outline-none transition"
            aria-label="Search notes"
            aria-autocomplete="list"
          />
          {localQuery && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Recent searches panel */}
          <AnimatePresence>
            {showHistoryPanel && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.12 }}
                className="absolute top-full left-0 right-0 mt-1 z-50 bg-snap-surface border border-snap-border rounded-xl shadow-2xl overflow-hidden"
                role="listbox"
                aria-label="Recent searches"
              >
                <div className="flex items-center justify-between px-3 py-2 border-b border-snap-border">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Recent</span>
                  <button
                    type="button"
                    onClick={clearHistory}
                    className="text-xs text-gray-600 hover:text-gray-300 transition"
                  >
                    Clear all
                  </button>
                </div>
                {history.map((item) => (
                  <div key={item} className="flex items-center gap-2 px-3 py-2 hover:bg-white/5 group">
                    <Clock className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" />
                    <button
                      type="button"
                      className="flex-1 text-left text-sm text-gray-300 hover:text-white transition"
                      onClick={() => handleHistoryClick(item)}
                    >
                      {item}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeFromHistory(item)}
                      className="text-gray-700 hover:text-white-muted transition opacity-0 group-hover:opacity-100"
                      aria-label={`Remove "${item}" from history`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Filter toggle (mobile) */}
        <button
          type="button"
          onClick={() => setShowFilters(f => !f)}
          className={`p-2 rounded-lg border transition lg:hidden ${showFilters ? "border-snap-accent text-snap-accent bg-snap-accent/10" : "border-snap-border text-gray-500 hover:text-white bg-snap-card"}`}
          aria-label="Toggle filters"
          aria-expanded={showFilters}
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* ── Filter Row (Desktop always visible, Mobile toggled) ── */}
      <AnimatePresence initial={false}>
        {(showFilters || true) && (
          <motion.div
            className="hidden lg:flex flex-wrap items-center gap-2"
          >
            {/* Status Pills */}
            <div className="flex items-center gap-1 bg-snap-card border border-snap-border rounded-lg p-0.5" role="tablist" aria-label="Note status filter">
              {STATUS_VIEWS.map(v => (
                <button
                  key={v.id}
                  type="button"
                  role="tab"
                  aria-selected={currentView === v.id}
                  onClick={() => { setCurrentView(v.id); }}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                    currentView === v.id
                      ? "bg-snap-accent text-white shadow"
                      : "text-white-muted hover:text-white"
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>

            {/* Folder Dropdown */}
            <Dropdown
              label={activeFolder ? (folders.find(f => f._id === activeFolder)?.name ?? "Folder") : "All folders"}
              icon={FolderIcon}
            >
              {({ close }) => (
                <>
                  <DropdownItem active={!activeFolder} onClick={() => handleFolderFilter(null, close)}>
                    All folders
                  </DropdownItem>
                  {folders.map(f => (
                    <DropdownItem
                      key={f._id}
                      active={activeFolder === f._id}
                      onClick={() => handleFolderFilter(f._id, close)}
                    >
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full inline-block flex-shrink-0" style={{ background: f.color }} />
                        {f.name}
                      </span>
                    </DropdownItem>
                  ))}
                </>
              )}
            </Dropdown>

            {/* Date Dropdown */}
            <Dropdown label={selectedDate} icon={Calendar}>
              {({ close }) => (
                <>
                  {DATE_PRESETS.map(p => (
                    <DropdownItem
                      key={p.label}
                      active={selectedDate === p.label}
                      onClick={() => { handleDatePreset(p); close(); }}
                    >
                      {p.label}
                    </DropdownItem>
                  ))}
                </>
              )}
            </Dropdown>

            {/* Sort Dropdown */}
            <Dropdown label={currentSort} icon={SlidersHorizontal} className="ml-auto">
              {({ close }) => (
                <>
                  {SORT_OPTIONS.map(o => (
                    <DropdownItem
                      key={o.value}
                      active={sortOption === o.value}
                      onClick={() => { handleSortChange(o.value); close(); }}
                    >
                      {o.label}
                    </DropdownItem>
                  ))}
                </>
              )}
            </Dropdown>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Mobile Filter Drawer ── */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden overflow-hidden"
          >
            <div className="pt-2 space-y-3">
              {/* Status Pills */}
              <div>
                <p className="text-xs text-gray-500 mb-1.5 font-medium uppercase tracking-widest">Status</p>
                <div className="flex flex-wrap gap-1.5">
                  {STATUS_VIEWS.map(v => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setCurrentView(v.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                        currentView === v.id
                          ? "bg-snap-accent text-white"
                          : "bg-snap-card border border-snap-border text-white-muted hover:text-white"
                      }`}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Folder */}
              {folders.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-1.5 font-medium uppercase tracking-widest">Folder</p>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => setCurrentView("active")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${!activeFolder ? "bg-snap-accent text-white" : "bg-snap-card border border-snap-border text-white-muted hover:text-white"}`}
                    >
                      All
                    </button>
                    {folders.map(f => (
                      <button
                        key={f._id}
                        type="button"
                        onClick={() => setCurrentView(`folder:${f._id}`)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                          activeFolder === f._id
                            ? "bg-snap-accent text-white"
                            : "bg-snap-card border border-snap-border text-white-muted hover:text-white"
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full" style={{ background: f.color }} />
                        {f.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Date and Sort */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1.5 font-medium uppercase tracking-widest">Date</p>
                  <select
                    value={selectedDate}
                    onChange={e => {
                      const preset = DATE_PRESETS.find(p => p.label === e.target.value);
                      if (preset) handleDatePreset(preset);
                    }}
                    className="w-full bg-snap-card border border-snap-border rounded-lg px-2 py-1.5 text-xs text-gray-300 outline-none"
                    aria-label="Date filter"
                  >
                    {DATE_PRESETS.map(p => (
                      <option key={p.label} value={p.label}>{p.label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1.5 font-medium uppercase tracking-widest">Sort</p>
                  <select
                    value={sortOption}
                    onChange={e => handleSortChange(e.target.value)}
                    className="w-full bg-snap-card border border-snap-border rounded-lg px-2 py-1.5 text-xs text-gray-300 outline-none"
                    aria-label="Sort notes"
                  >
                    {SORT_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
