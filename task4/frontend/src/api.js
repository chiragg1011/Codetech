const API_URL = "http://localhost:5000/api";

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {})
  };
};

export const api = {
  // Authentication
  register: async (username, email, password) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Registration failed");
    return data;
  },

  login: async (email, password) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login failed");
    return data;
  },

  getProfile: async () => {
    const res = await fetch(`${API_URL}/auth/me`, {
      method: "GET",
      headers: getHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to load session profile");
    return data;
  },

  // Activities & Stats
  getStats: async () => {
    const res = await fetch(`${API_URL}/activity/stats`, {
      method: "GET",
      headers: getHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to fetch stats");
    return data;
  },

  getWeeklyReport: async () => {
    const res = await fetch(`${API_URL}/activity/report/weekly`, {
      method: "GET",
      headers: getHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to fetch weekly report");
    return data;
  },

  getActivities: async () => {
    const res = await fetch(`${API_URL}/activity`, {
      method: "GET",
      headers: getHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to fetch activities");
    return data;
  },

  // Settings
  updateSettings: async (settingsData) => {
    const res = await fetch(`${API_URL}/settings`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(settingsData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to save settings");
    return data;
  }
};
