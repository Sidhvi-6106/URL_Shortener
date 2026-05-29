import axios from "axios";

const configuredBaseURL = import.meta.env.VITE_API_URL || "/api";

const isLocalhost = (value) => ["localhost", "127.0.0.1", "::1"].includes(value);

const getBaseURL = () => {
  if (!configuredBaseURL.startsWith("http")) {
    return configuredBaseURL;
  }

  try {
    const url = new URL(configuredBaseURL);

    if (
      typeof window !== "undefined" &&
      isLocalhost(url.hostname) &&
      !isLocalhost(window.location.hostname)
    ) {
      return `${window.location.origin}/api`;
    }
  } catch {
    return configuredBaseURL;
  }

  return configuredBaseURL;
};

const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      (error.request ? "Unable to reach the server. Please try again." : error.message);

    return Promise.reject({
      ...error,
      userMessage: message,
    });
  }
);

export default api;
