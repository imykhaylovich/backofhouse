import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8000",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("boh.token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    const url = err.config?.url ?? "";
    // Expired/invalid session on a protected route → back to sign-in.
    if (status === 401 && localStorage.getItem("boh.token") && !url.startsWith("/auth")) {
      localStorage.removeItem("boh.token");
      window.location.assign("/login");
    }
    return Promise.reject(err);
  }
);

const data = (promise) => promise.then((r) => r.data);

export const AuthAPI = {
  // Backend expects the two Pydantic bodies nested: { org_data, user_data }.
  register: (org_data, user_data) => data(api.post("/auth/register", { org_data, user_data })),
  login: (email, password) => data(api.post("/auth/login", { email, password })),
};

export const InventoryAPI = {
  list: () => data(api.get("/inventory/")),
  lowStock: () => data(api.get("/inventory/low-stock")),
  create: (item) => data(api.post("/inventory/", item)),
  update: (id, item) => data(api.put(`/inventory/${id}`, item)),
  remove: (id) => data(api.delete(`/inventory/${id}`)),
};

export const OrdersAPI = {
  list: () => data(api.get("/orders/")),
  create: (order) => data(api.post("/orders/", order)),
  update: (id, order) => data(api.put(`/orders/${id}`, order)),
  remove: (id) => data(api.delete(`/orders/${id}`)),
};

export const DonationsAPI = {
  list: () => data(api.get("/donations/")),
  create: (donation) => data(api.post("/donations/", donation)),
  remove: (id) => data(api.delete(`/donations/${id}`)),
};

export const DistributionsAPI = {
  list: () => data(api.get("/distributions/")),
  create: (distribution) => data(api.post("/distributions/", distribution)),
  remove: (id) => data(api.delete(`/distributions/${id}`)),
};

export const ReportsAPI = {
  list: () => data(api.get("/reports/")),
};

export const ClaudeAPI = {
  send: (content) => data(api.post("/claude/chat", { content })),
};

/** True when the route itself isn't deployed yet (Ivan's week 3 endpoints). */
export function isMissingEndpoint(err) {
  const s = err?.response?.status;
  return s === 404 || s === 405 || s === 501;
}

export function errText(err, fallback = "Something went wrong. Try again.") {
  if (!err) return fallback;
  if (!err.response) return "Can't reach the server — is the backend running on port 8000?";
  const detail = err.response.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map((d) => d?.msg ?? "Invalid input").join(" · ");
  return fallback;
}
