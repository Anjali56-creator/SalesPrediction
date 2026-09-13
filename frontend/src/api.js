/*
 * api.js
 * ------
 * Every call the website makes to the Python backend lives here, in one place.
 * That makes it easy to explain: the React pages never contain data themselves,
 * they always ask the backend for it.
 */

// The address the FastAPI backend is running on.
//
// In production (Vercel) this comes from the environment variable VITE_API_URL,
// which is set to the Render backend URL. When that variable is not set (i.e.
// running `npm run dev` on a laptop) we fall back to the local backend.
// Vite only exposes variables that start with "VITE_" to the browser.
export const API_BASE = (
  import.meta.env.VITE_API_URL || "http://localhost:8000"
).replace(/\/+$/, "");

/* A small helper that fetches a URL and throws a readable error if it fails. */
async function getJSON(path) {
  const response = await fetch(`${API_BASE}${path}`);
  if (!response.ok) {
    throw new Error(`Backend returned ${response.status} for ${path}`);
  }
  return response.json();
}

export const getOverview = () => getJSON("/api/overview");
export const getKpis = () => getJSON("/api/kpis");
export const getAnalytics = () => getJSON("/api/analytics");
export const getModels = () => getJSON("/api/models");
export const getFormOptions = () => getJSON("/api/form-options");

/* Sends the prediction form to the backend and returns the predicted sales. */
export async function postPrediction(formValues) {
  const response = await fetch(`${API_BASE}/api/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formValues),
  });

  if (!response.ok) {
    // FastAPI sends error messages in a field called "detail".
    const problem = await response.json().catch(() => ({}));
    throw new Error(problem.detail || "Prediction failed. Please try again.");
  }
  return response.json();
}

/* ---------- formatting helpers used by the pages ---------- */

export function formatRupees(value) {
  return "₹" + Math.round(value).toLocaleString("en-IN");
}

export function formatCompact(value) {
  if (value >= 10000000) return "₹" + (value / 10000000).toFixed(2) + " Cr";
  if (value >= 100000) return "₹" + (value / 100000).toFixed(2) + " L";
  if (value >= 1000) return "₹" + (value / 1000).toFixed(1) + "k";
  return "₹" + Math.round(value);
}
