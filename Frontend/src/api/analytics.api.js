import BACKEND_URL from "./url";

export const getDashboardOverview = async () => {
  const { data } = await BACKEND_URL.get("/analytics/overview");
  return data;
};

export const getActivityTimeline = async (page = 1, limit = 20) => {
  const { data } = await BACKEND_URL.get(`/analytics/activity?page=${page}&limit=${limit}`);
  return data;
};

export const getProductivityChart = async (days = 7) => {
  const { data } = await BACKEND_URL.get(`/analytics/productivity?days=${days}`);
  return data;
};

export const getCalendarData = async (year, month) => {
  const { data } = await BACKEND_URL.get(`/analytics/calendar?year=${year}&month=${month}`);
  return data;
};
