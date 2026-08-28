import cron from "node-cron";
import Reminder from "../models/reminder.model.js";
import Notification from "../models/notification.model.js";

export const startCronJobs = () => {
    // Run every minute
    cron.schedule("* * * * *", async () => {
        try {
            const now = new Date();
            // Find pending reminders whose remindAt is in the past
            const pendingReminders = await Reminder.find({
                status: "pending",
                remindAt: { $lte: now }
            }).populate("task").populate("note");

            if (pendingReminders.length > 0) {
                console.log(`[Cron] Processing ${pendingReminders.length} due reminders...`);
                
                for (const reminder of pendingReminders) {
                    // Create notification
                    await Notification.create({
                        user: reminder.user,
                        type: "SYSTEM", // Using SYSTEM or TASK
                        title: "Reminder",
                        message: reminder.title,
                        isRead: false
                    });

                    // Mark as fired
                    reminder.status = "fired";
                    await reminder.save();
                }
            }
        } catch (error) {
            console.error("[Cron] Error processing reminders:", error);
        }
    });

    console.log("[Cron] Scheduled jobs initialized.");
};
