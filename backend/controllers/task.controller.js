import Task from "../models/task.model.js";
import Activity from "../models/activity.model.js";
import mongoose from "mongoose";

// Validate priority value
const VALID_PRIORITIES = ["low", "medium", "high"];

// ============================================================
// GET /tasks
// ?filter=all|active|completed|overdue
// &page=1&limit=20
// ============================================================
export const getTasks = async (req, res) => {
    try {
        const { filter = "all", page = "1", limit = "20" } = req.query;
        const userId = req.user._id;

        const pageNum  = Math.max(1, parseInt(page, 10)  || 1);
        const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
        const skip     = (pageNum - 1) * limitNum;

        let filterQuery = { user: userId };
        const now = new Date();

        if (filter === "active") {
            filterQuery.completed = false;
        } else if (filter === "completed") {
            filterQuery.completed = true;
        } else if (filter === "overdue") {
            filterQuery.completed = false;
            filterQuery.dueDate   = { $lt: now, $ne: null };
        } else if (filter === "high") {
            filterQuery.priority  = "high";
            filterQuery.completed = false;
        }

        const [tasks, total] = await Promise.all([
            Task.find(filterQuery)
                .sort({ completed: 1, priority: -1, dueDate: 1, createdAt: -1 })
                .skip(skip)
                .limit(limitNum),
            Task.countDocuments(filterQuery)
        ]);

        res.status(200).json({
            tasks,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum),
                hasMore: pageNum * limitNum < total
            }
        });
    } catch (error) {
        console.error("Get Tasks Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// ============================================================
// POST /tasks
// ============================================================
export const createTask = async (req, res) => {
    try {
        const { title, priority = "medium", dueDate = null } = req.body;

        if (!title || title.trim().length === 0) {
            return res.status(400).json({ message: "Task title is required" });
        }
        if (title.trim().length > 200) {
            return res.status(400).json({ message: "Task title cannot exceed 200 characters" });
        }
        if (priority && !VALID_PRIORITIES.includes(priority)) {
            return res.status(400).json({ message: "Priority must be low, medium, or high" });
        }

        let parsedDueDate = null;
        if (dueDate) {
            parsedDueDate = new Date(dueDate);
            if (isNaN(parsedDueDate.getTime())) {
                return res.status(400).json({ message: "Invalid due date" });
            }
        }

        const task = new Task({
            user:     req.user._id,
            title:    title.trim(),
            priority,
            dueDate:  parsedDueDate
        });

        await task.save();

        Activity.create({
            user: req.user._id,
            type: "TASK_CREATED",
            entityId: task._id,
            entityType: "TASK",
            metadata: { title: task.title }
        }).catch(err => console.error("Activity log error:", err));

        res.status(201).json(task);
    } catch (error) {
        console.error("Create Task Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// ============================================================
// PUT /tasks/:id
// ============================================================
export const updateTask = async (req, res) => {
    try {
        const { title, priority, dueDate } = req.body;

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Invalid task ID" });
        }

        const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
        if (!task) return res.status(404).json({ message: "Task not found or unauthorized" });

        if (title !== undefined) {
            if (title.trim().length === 0) return res.status(400).json({ message: "Title cannot be empty" });
            if (title.trim().length > 200) return res.status(400).json({ message: "Title cannot exceed 200 characters" });
            task.title = title.trim();
        }

        if (priority !== undefined) {
            if (!VALID_PRIORITIES.includes(priority)) {
                return res.status(400).json({ message: "Priority must be low, medium, or high" });
            }
            task.priority = priority;
        }

        if (dueDate !== undefined) {
            if (dueDate === null || dueDate === "") {
                task.dueDate = null;
            } else {
                const d = new Date(dueDate);
                if (isNaN(d.getTime())) return res.status(400).json({ message: "Invalid due date" });
                task.dueDate = d;
            }
        }

        await task.save();
        res.status(200).json(task);
    } catch (error) {
        console.error("Update Task Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// ============================================================
// PATCH /tasks/:id/toggle
// ============================================================
export const toggleTask = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Invalid task ID" });
        }

        const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
        if (!task) return res.status(404).json({ message: "Task not found or unauthorized" });

        task.completed = !task.completed;
        await task.save();

        Activity.create({
            user: req.user._id,
            type: task.completed ? "TASK_COMPLETED" : "TASK_UNCOMPLETED",
            entityId: task._id,
            entityType: "TASK",
            metadata: { title: task.title }
        }).catch(err => console.error("Activity log error:", err));

        res.status(200).json(task);
    } catch (error) {
        console.error("Toggle Task Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// ============================================================
// DELETE /tasks/:id
// ============================================================
export const deleteTask = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Invalid task ID" });
        }

        const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        if (!task) return res.status(404).json({ message: "Task not found or unauthorized" });

        Activity.create({
            user: req.user._id,
            type: "TASK_DELETED",
            entityId: task._id,
            entityType: "TASK",
            metadata: { title: task.title }
        }).catch(err => console.error("Activity log error:", err));

        res.status(200).json({ message: "Task deleted", id: req.params.id });
    } catch (error) {
        console.error("Delete Task Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
