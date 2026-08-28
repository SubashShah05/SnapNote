import BACKEND_URL from './url.js';

export const summarizeNote = async (text, length = 'medium') => {
  const response = await BACKEND_URL.post('/ai/summarize', { text, length });
  return response.data;
};

export const extractKeyPoints = async (text) => {
  const response = await BACKEND_URL.post('/ai/key-points', { text });
  return response.data;
};

export const generateTitle = async (text) => {
  const response = await BACKEND_URL.post('/ai/title', { text });
  return response.data;
};

export const generateTags = async (text) => {
  const response = await BACKEND_URL.post('/ai/tags', { text });
  return response.data;
};

export const rewriteText = async (text, style = 'professional') => {
  const response = await BACKEND_URL.post('/ai/rewrite', { text, style });
  return response.data;
};

export const improveGrammar = async (text) => {
  const response = await BACKEND_URL.post('/ai/grammar', { text });
  return response.data;
};

export const shortenText = async (text) => {
  const response = await BACKEND_URL.post('/ai/shorten', { text });
  return response.data;
};

export const expandText = async (text) => {
  const response = await BACKEND_URL.post('/ai/expand', { text });
  return response.data;
};

export const extractTasks = async (text) => {
  const response = await BACKEND_URL.post('/ai/tasks', { text });
  return response.data;
};

export const assistantQuery = async (prompt, noteId = null) => {
  const response = await BACKEND_URL.post('/ai/assistant', { prompt, noteId });
  return response.data;
};
