import BACKEND_URL from "./url";

export const createReminder = async (data) => {
  const res = await BACKEND_URL.post("/reminders", data);
  return res.data;
};

export const getReminders = async () => {
  const res = await BACKEND_URL.get("/reminders");
  return res.data;
};

export const dismissReminder = async (id) => {
  const res = await BACKEND_URL.put(`/reminders/${id}/dismiss`);
  return res.data;
};

export const deleteReminder = async (id) => {
  const res = await BACKEND_URL.delete(`/reminders/${id}`);
  return res.data;
};
