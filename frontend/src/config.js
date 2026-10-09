// ========================================
// GHARBAZAAR API CONFIGURATION
// ========================================

export const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV
    ? "http://localhost:5000/api"
    : "https://gharbazaar-hb8d.onrender.com/api");

export default {
  API_BASE_URL,
};
