import BACKEND_URL from "./url";

export const inviteCollaborator = async (noteId, email, role) => {
  const { data } = await BACKEND_URL.post("/share/invite", { noteId, email, role });
  return data;
};

export const respondToInvite = async (shareId, accept) => {
  const { data } = await BACKEND_URL.post("/share/respond", { shareId, accept });
  return data;
};

export const getNoteCollaborators = async (noteId) => {
  const { data } = await BACKEND_URL.get(`/share/note/${noteId}`);
  return data;
};

export const changeRole = async (shareId, role) => {
  const { data } = await BACKEND_URL.put("/share/role", { shareId, role });
  return data;
};

export const revokeAccess = async (shareId) => {
  const { data } = await BACKEND_URL.delete(`/share/revoke/${shareId}`);
  return data;
};

export const getSharedNotes = async () => {
  const { data } = await BACKEND_URL.get("/share/shared-with-me");
  return data;
};

export const getNotifications = async () => {
  const { data } = await BACKEND_URL.get("/share/notifications");
  return data;
};

export const markNotificationsRead = async () => {
  const { data } = await BACKEND_URL.put("/share/notifications/read");
  return data;
};
