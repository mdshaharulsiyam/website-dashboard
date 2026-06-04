import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";
// const BASE_URL = import.meta.env.VITE_API_URL ?? "http://13.229.171.117:5000";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT from localStorage on every request
apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("lb_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401 → clear token and redirect to login
apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("lb_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const imageUrl = (path: string) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;

  const normalized = path.replace(/\\/g, "/").replace(/^\/+/, "");
  if (normalized.startsWith("uploads/")) return `${BASE_URL}/${normalized}`;

  return `${BASE_URL}/uploads/${normalized}`;
};
