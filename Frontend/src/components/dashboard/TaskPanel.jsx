import { useState, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Trash2, CheckCircle2, Circle,
  AlertCircle, ChevronDown, Calendar, Flag
} from "lucide-react";
import { TaskContext } from "../../context/TaskContext";

const PRIORITY_CONFIG = {
  high:   { label: "High",   icon: "🔴", class: "text-red-400   border-red-400/30   bg-red-400/10"   },
  medium: { label: "Medium", icon: "🟡", class: "text-amber-400 border-amber-400/30 bg-amber-400/10" },
  low:    { label: "Low",    icon: "🟢", class: "text-green-400 border-green-400/30 bg-green-400/10" },
};

const FILTERS = [
  { id: "all",       label: "All"       },
  { id: "active",    label: "Active"    },
  { id: "completed", label: "Done"      },
  { id: "overdue",   label: "Overdue"   },
  { id: "high",      label: "⚡ High"   },
];

function formatDue(dateStr) {
  if (!dateStr) return null;
  const d    = new Date(dateStr);
  const now  = new Date();
  const diff = Math.floor((d - now) / 86400000);
  if (diff < 0)  return { text: "Overdue", cls: "text-red-400" };
  if (diff === 0) return { text: "Due today", cls: "text-amber-400" };
  if (diff === 1) return { text: "Due tomorrow", cls: "text-yellow-400" };
  return {
    text: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    cls: "text-gray-500"
  };
}

function TaskItem({ task }) {
  const { toggleTask, deleteTask, updateTask } = useContext(TaskContext);
  const [editing, setEditing]   = useState(false);
  const [title, setTitle]       = useState(task.title);
  const [priority, setPriority] = useState(task.priority);
  const [dueDate, setDueDate]   = useState(
    task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : ""
  );

  const due = formatDue(task.dueDate);
  const pc  = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;

  const saveEdit = async () => {
    if (!title.trim()) return;
    await updateTask(task._id, {
      title: title.trim(),
      priority,
      dueDate: dueDate || null
    });
    setEditing(false);
  };

  if (editing) {
    return (
      <motion.div
        layout
        className="bg-snap-card border border-snap-accent/40 rounded-xl p-3 space-y-2"
      >
        <input
          autoFocus
          value={title}
          onChange={e => setTitle(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") setEditing(false); }}
          className="w-full bg-snap-bg border border-snap-border rounded-lg px-3 py-1.5 text-sm text-white outline-none placeholder-gray-600"
          aria-label="Edit task title"
        />
        <div className="flex gap-2">
          <select
            value={priority}
            onChange={e => setPriority(e.target.value)}
            className="flex-1 bg-snap-bg border border-snap-border rounded-lg px-2 py-1.5 text-xs text-gray-300 outline-none"
            aria-label="Task priority"
          >
            <option value="low">🟢 Low</option>
            <option value="medium">🟡 Medium</option>
            <option value="high">🔴 High</option>
          </select>
          <input
            type="date"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
            className="flex-1 bg-snap-bg border border-snap-border rounded-lg px-2 py-1.5 text-xs text-gray-300 outline-none"
            aria-label="Due date"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={saveEdit}
            className="flex-1 bg-snap-accent hover:bg-snap-accent-hover text-white text-xs py-1.5 rounded-lg transition"
          >
            Save
          </button>
          <button
            onClick={() => setEditing(false)}
            className="flex-1 border border-snap-border text-white-muted hover:text-white text-xs py-1.5 rounded-lg transition"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`flex items-start gap-2.5 p-3 rounded-xl border transition group ${
        task.completed
          ? "bg-snap-bg border-snap-border opacity-60"
          : "bg-snap-card border-snap-border hover:border-snap-subtle"
      }`}
    >
      {/* Toggle */}
      <button
        onClick={() => toggleTask(task._id)}
        className={`flex-shrink-0 mt-0.5 transition ${task.completed ? "text-emerald-400" : "text-gray-600 hover:text-emerald-400"}`}
        aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
      >
        {task.completed
          ? <CheckCircle2 className="w-4 h-4" />
          : <Circle className="w-4 h-4" />
        }
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0" onClick={() => !task.completed && setEditing(true)}>
        <p className={`text-sm ${task.completed ? "line-through text-gray-600" : "text-white cursor-pointer"}`}>
          {task.title}
        </p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {/* Priority badge — icon + text, not just color */}
          <span className={`inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded border font-medium ${pc.class}`}>
            <span aria-hidden>{pc.icon}</span>
            <span>{pc.label}</span>
          </span>
          {/* Due date */}
          {due && (
            <span className={`flex items-center gap-1 text-xs ${due.cls}`}>
              <Calendar className="w-3 h-3" aria-hidden />
              {due.text}
            </span>
          )}
          {/* Overdue alert */}
          {!task.completed && task.dueDate && new Date(task.dueDate) < new Date() && (
            <span className="sr-only">This task is overdue</span>
          )}
        </div>
      </div>

      {/* Delete */}
      <button
        onClick={() => deleteTask(task._id)}
        className="flex-shrink-0 text-gray-700 hover:text-red-400 transition opacity-0 group-hover:opacity-100"
        aria-label={`Delete task: ${task.title}`}
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}

export default function TaskPanel() {
  const { tasks, allTasks, loading, error, filter, setFilter, stats, createTask, refreshTasks } = useContext(TaskContext);
  const [newTitle, setNewTitle]     = useState("");
  const [newPriority, setNewPriority] = useState("medium");
  const [newDue, setNewDue]         = useState("");
  const [creating, setCreating]     = useState(false);
  const [showInput, setShowInput]   = useState(false);
  const [createError, setCreateError] = useState("");

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) { setCreateError("Title required"); return; }
    setCreating(true);
    setCreateError("");
    try {
      await createTask({ title: newTitle.trim(), priority: newPriority, dueDate: newDue || null });
      setNewTitle("");
      setNewPriority("medium");
      setNewDue("");
      setShowInput(false);
    } catch (err) {
      setCreateError(err.response?.data?.message || "Failed to create task");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-hide" role="tablist" aria-label="Task filter">
        {FILTERS.map(f => (
          <button
            key={f.id}
            type="button"
            role="tab"
            aria-selected={filter === f.id}
            onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition flex-shrink-0 ${
              filter === f.id
                ? "bg-snap-accent text-white"
                : "bg-snap-card border border-snap-border text-white-muted hover:text-white"
            }`}
          >
            {f.label}
            {f.id === "overdue" && stats.overdue > 0 && (
              <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-1">{stats.overdue}</span>
            )}
          </button>
        ))}
      </div>

      {/* Task stats summary */}
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <span>{stats.total} total</span>
        <span className="text-emerald-400">{stats.completed} done</span>
        <span>{stats.active} active</span>
        {stats.overdue > 0 && <span className="text-red-400">{stats.overdue} overdue</span>}
      </div>

      {/* Create Task */}
      <AnimatePresence>
        {showInput ? (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleCreate}
            className="space-y-2 overflow-hidden"
          >
            <input
              autoFocus
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder="Task title..."
              className="w-full bg-snap-card border border-snap-accent/50 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 outline-none"
              aria-label="New task title"
            />
            <div className="flex gap-2">
              <select
                value={newPriority}
                onChange={e => setNewPriority(e.target.value)}
                className="flex-1 bg-snap-bg border border-snap-border rounded-lg px-2 py-1.5 text-xs text-gray-300 outline-none"
                aria-label="Priority"
              >
                <option value="low">🟢 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🔴 High</option>
              </select>
              <input
                type="date"
                value={newDue}
                onChange={e => setNewDue(e.target.value)}
                className="flex-1 bg-snap-bg border border-snap-border rounded-lg px-2 py-1.5 text-xs text-gray-300 outline-none"
                aria-label="Due date"
              />
            </div>
            {createError && <p className="text-red-400 text-xs">{createError}</p>}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={creating}
                className="flex-1 bg-snap-accent hover:bg-snap-accent-hover text-white text-xs py-1.5 rounded-lg transition disabled:opacity-60"
              >
                {creating ? "Creating..." : "Create task"}
              </button>
              <button
                type="button"
                onClick={() => { setShowInput(false); setCreateError(""); }}
                className="flex-1 border border-snap-border text-white-muted hover:text-white text-xs py-1.5 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </motion.form>
        ) : (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            type="button"
            onClick={() => setShowInput(true)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-snap-border text-gray-500 hover:text-white hover:border-snap-subtle text-sm transition"
          >
            <Plus className="w-4 h-4" />
            Add task
          </motion.button>
        )}
      </AnimatePresence>

      {/* Task list */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-snap-card border border-snap-border animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-4">
          <p className="text-sm text-red-400">{error}</p>
          <button onClick={refreshTasks} className="text-xs text-snap-accent mt-2">Retry</button>
        </div>
      ) : tasks.length === 0 ? (
        <p className="text-sm text-gray-600 text-center py-4">
          {filter === "all" ? "No tasks yet. Add your first task above!" : "No tasks in this category."}
        </p>
      ) : (
        <motion.div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {tasks.map(task => (
              <TaskItem key={task._id} task={task} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
