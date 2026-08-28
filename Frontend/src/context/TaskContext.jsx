import { createContext, useState, useContext, useCallback, useEffect } from "react";
import BACKEND_URL from "../api/url";
import { AuthContext } from "./AuthContext";

export const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks]     = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [filter, setFilter]   = useState("all");

  const { user } = useContext(AuthContext);

  const fetchTasks = useCallback(async (f = filter) => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await BACKEND_URL.get(`/tasks?filter=${f}&limit=50`);
      setTasks(data.tasks ?? data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, [user, filter]);

  useEffect(() => {
    if (user) fetchTasks(filter);
    else setTasks([]);
  }, [user]);

  useEffect(() => {
    if (user) fetchTasks(filter);
  }, [filter]);

  const createTask = async ({ title, priority = "medium", dueDate = null }) => {
    const { data } = await BACKEND_URL.post("/tasks", { title, priority, dueDate });
    setTasks(prev => [data, ...prev]);
    return data;
  };

  const updateTask = async (id, updates) => {
    const { data } = await BACKEND_URL.put(`/tasks/${id}`, updates);
    setTasks(prev => prev.map(t => t._id === id ? data : t));
    return data;
  };

  const toggleTask = async (id) => {
    // Optimistic
    setTasks(prev => prev.map(t => t._id === id ? { ...t, completed: !t.completed } : t));
    try {
      const { data } = await BACKEND_URL.patch(`/tasks/${id}/toggle`);
      setTasks(prev => prev.map(t => t._id === id ? data : t));
    } catch {
      // Revert
      setTasks(prev => prev.map(t => t._id === id ? { ...t, completed: !t.completed } : t));
    }
  };

  const deleteTask = async (id) => {
    setTasks(prev => prev.filter(t => t._id !== id)); // optimistic
    try {
      await BACKEND_URL.delete(`/tasks/${id}`);
    } catch {
      fetchTasks(filter); // revert by re-fetching
    }
  };

  // Client-side filter (fast, applied over fetched set)
  const filteredTasks = tasks.filter(t => {
    if (filter === "active")    return !t.completed;
    if (filter === "completed") return t.completed;
    if (filter === "overdue")   return !t.completed && t.dueDate && new Date(t.dueDate) < new Date();
    if (filter === "high")      return !t.completed && t.priority === "high";
    return true;
  });

  const stats = {
    total:     tasks.length,
    completed: tasks.filter(t => t.completed).length,
    active:    tasks.filter(t => !t.completed).length,
    overdue:   tasks.filter(t => !t.completed && t.dueDate && new Date(t.dueDate) < new Date()).length,
  };

  return (
    <TaskContext.Provider value={{
      tasks: filteredTasks,
      allTasks: tasks,
      loading, error,
      filter, setFilter,
      stats,
      createTask, updateTask, toggleTask, deleteTask,
      refreshTasks: () => fetchTasks(filter),
    }}>
      {children}
    </TaskContext.Provider>
  );
};
