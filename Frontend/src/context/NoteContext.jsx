import { createContext, useEffect, useState, useContext, useCallback, useRef } from "react";
import BACKEND_URL from "../api/url";
import { AuthContext } from "./AuthContext";

export const NoteContext = createContext();

export const NoteProvider = ({ children }) => {
  const [notes, setNotes]           = useState([]);
  const [folders, setFolders]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [currentView, setCurrentView] = useState("overview"); // Phase 4: overview is default

  // ── Search / filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption]   = useState("updated_desc");
  const [dateFrom, setDateFrom]       = useState("");
  const [dateTo, setDateTo]           = useState("");

  // ── Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages]   = useState(1);
  const [totalNotes, setTotalNotes]   = useState(0);
  const [hasMore, setHasMore]         = useState(false);

  const { user } = useContext(AuthContext);

  // Ref to track if this is an append (load-more) vs a fresh load
  const appendRef = useRef(false);

  // ─────────────────────────────── NOTES ───────────────────────────────

  const getNotes = useCallback(async (options = {}) => {
    if (!user) return;
    const {
      view    = currentView,
      search  = searchQuery,
      sort    = sortOption,
      page    = 1,
      append  = false,
      dFrom   = dateFrom,
      dTo     = dateTo,
    } = options;

    if (!append) {
      setLoading(true);
    }
    setError(null);

    try {
      const params = new URLSearchParams({
        view,
        sort,
        page,
        limit: 20,
      });
      if (search.trim())  params.append("search",   search.trim());
      if (dFrom)          params.append("dateFrom",  dFrom);
      if (dTo)            params.append("dateTo",    dTo);

      const { data } = await BACKEND_URL.get(`/noteapp/get-notes?${params.toString()}`);

      // Backend now returns { notes, pagination }
      const incoming = data.notes ?? data; // fallback if old format

      if (append) {
        setNotes(prev => [...prev, ...incoming]);
      } else {
        setNotes(incoming);
      }

      if (data.pagination) {
        setCurrentPage(data.pagination.page);
        setTotalPages(data.pagination.totalPages);
        setTotalNotes(data.pagination.total);
        setHasMore(data.pagination.hasMore);
      }
    } catch (err) {
      console.error("Error fetching notes:", err);
      setError(err.response?.data?.message || "Failed to fetch notes");
    } finally {
      setLoading(false);
    }
  }, [user, currentView, searchQuery, sortOption, dateFrom, dateTo]);

  const loadMore = useCallback(() => {
    if (!hasMore || loading) return;
    getNotes({
      page:   currentPage + 1,
      append: true,
      view:   currentView,
      search: searchQuery,
      sort:   sortOption,
      dFrom:  dateFrom,
      dTo:    dateTo,
    });
  }, [hasMore, loading, currentPage, currentView, searchQuery, sortOption, dateFrom, dateTo, getNotes]);

  const getFolders = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await BACKEND_URL.get("/folders");
      setFolders(data);
    } catch (err) {
      console.error("Error fetching folders:", err);
    }
  }, [user]);

  // Initial load
  useEffect(() => {
    if (user) {
      getNotes({ view: currentView, page: 1 });
      getFolders();
    } else {
      setNotes([]);
      setFolders([]);
      setLoading(false);
    }
  }, [user]);

  // Re-fetch when view changes (reset to page 1)
  useEffect(() => {
    if (user && currentView !== "overview" && currentView !== "tasks") {
      getNotes({ view: currentView, search: searchQuery, sort: sortOption, page: 1 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentView]);

  // Re-fetch when search/sort/date changes (debounced query applied externally)
  const triggerSearch = useCallback((params = {}) => {
    const {
      query  = searchQuery,
      sort   = sortOption,
      dFrom  = dateFrom,
      dTo    = dateTo,
    } = params;

    if (params.query  !== undefined) setSearchQuery(params.query);
    if (params.sort   !== undefined) setSortOption(params.sort);
    if (params.dFrom  !== undefined) setDateFrom(params.dFrom);
    if (params.dTo    !== undefined) setDateTo(params.dTo);

    setCurrentPage(1);
    getNotes({
      view:   currentView,
      search: query,
      sort,
      page:   1,
      dFrom,
      dTo,
    });
  }, [currentView, searchQuery, sortOption, dateFrom, dateTo, getNotes]);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    setDateFrom("");
    setDateTo("");
    setCurrentPage(1);
    getNotes({ view: currentView, search: "", sort: sortOption, page: 1, dFrom: "", dTo: "" });
  }, [currentView, sortOption, getNotes]);

  // ── Note CRUD (unchanged from Phase 3, just adapted for new response shape)

  const createNote = async (noteData) => {
    const { data } = await BACKEND_URL.post("/noteapp/create-note", noteData);
    setNotes(prev => [data, ...prev]);
    setTotalNotes(prev => prev + 1);
    return data;
  };

  const getNoteById = async (id) => {
    const { data } = await BACKEND_URL.get(`/noteapp/${id}`);
    return data;
  };

  const updateNote = async (id, updatedData) => {
    const { data } = await BACKEND_URL.put(`/noteapp/update-note/${id}`, updatedData);
    setNotes(prev => prev.map(n => n._id === id ? data : n));
    return data;
  };

  // Soft delete
  const deleteNote = async (id) => {
    await BACKEND_URL.delete(`/noteapp/delete-note/${id}`);
    setNotes(prev => prev.filter(n => n._id !== id));
    setTotalNotes(prev => Math.max(0, prev - 1));
  };

  const restoreNote = async (id) => {
    const { data } = await BACKEND_URL.patch(`/noteapp/${id}/restore`);
    setNotes(prev => prev.filter(n => n._id !== id));
    return data;
  };

  const permanentDeleteNote = async (id) => {
    await BACKEND_URL.delete(`/noteapp/${id}/permanent`);
    setNotes(prev => prev.filter(n => n._id !== id));
    setTotalNotes(prev => Math.max(0, prev - 1));
  };

  const duplicateNote = async (id) => {
    const { data } = await BACKEND_URL.post(`/noteapp/${id}/duplicate`);
    setNotes(prev => [data, ...prev]);
    return data;
  };

  // ── Optimistic Toggle Helpers
  const optimisticToggle = async (id, field, apiPath) => {
    setNotes(prev => prev.map(n => n._id === id ? { ...n, [field]: !n[field] } : n));
    try {
      const { data } = await BACKEND_URL.patch(`/noteapp/${id}/${apiPath}`);
      setNotes(prev => prev.map(n => n._id === id ? { ...n, [field]: data[field] } : n));
      return data;
    } catch (err) {
      setNotes(prev => prev.map(n => n._id === id ? { ...n, [field]: !n[field] } : n));
      throw err;
    }
  };

  const toggleFavorite = (id) => optimisticToggle(id, "isFavorite", "favorite");
  const togglePin      = (id) => optimisticToggle(id, "isPinned",   "pin");
  const toggleArchive  = async (id) => {
    await optimisticToggle(id, "isArchived", "archive");
    if (currentView === "active") {
      setNotes(prev => prev.filter(n => n._id !== id));
    }
  };

  // ─────────────────────────────── FOLDERS ───────────────────────────────

  const createFolder = async (name, color) => {
    const { data } = await BACKEND_URL.post("/folders", { name, color });
    setFolders(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
    return data;
  };

  const updateFolder = async (id, updates) => {
    const { data } = await BACKEND_URL.put(`/folders/${id}`, updates);
    setFolders(prev => prev.map(f => f._id === id ? data : f));
    return data;
  };

  const deleteFolder = async (id) => {
    await BACKEND_URL.delete(`/folders/${id}`);
    setFolders(prev => prev.filter(f => f._id !== id));
    if (currentView === `folder:${id}`) setCurrentView("active");
    setNotes(prev => prev.map(n =>
      n.folder?._id === id ? { ...n, folder: null } : n
    ));
  };

  return (
    <NoteContext.Provider value={{
      notes, loading, error,
      folders,
      currentView, setCurrentView,
      // Search/filter state
      searchQuery, setSearchQuery,
      sortOption,  setSortOption,
      dateFrom,    setDateFrom,
      dateTo,      setDateTo,
      // Pagination
      currentPage, totalPages, totalNotes, hasMore,
      loadMore,
      triggerSearch, clearSearch,
      // Note CRUD
      createNote, getNoteById, updateNote, deleteNote,
      restoreNote, permanentDeleteNote, duplicateNote,
      toggleFavorite, togglePin, toggleArchive,
      // Folders
      createFolder, updateFolder, deleteFolder,
      // Refresh helpers
      refreshNotes:   () => getNotes({ view: currentView, search: searchQuery, sort: sortOption, page: 1 }),
      refreshFolders: getFolders,
    }}>
      {children}
    </NoteContext.Provider>
  );
};