import api from "./axios";

export const createShortUrl = async (data) => {
  const res = await api.post("/url/shorten", data);
  return res.data.data;
};

export const getUserUrls = async () => {
  const res = await api.get("/url/history");
  return res.data.data;
};

export const deleteUrl = async (id) => {
  const res = await api.delete(`/url/${id}`);
  return res.data;
};

export const updateUrl = async (id, data) => {
  const res = await api.put(`/url/${id}`, data);
  return res.data.data;
};

export const getUrlAnalytics = async (id) => {
  const res = await api.get(`/analytics/${id}`);
  return res.data.data;
};