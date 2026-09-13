/*
 * App.jsx
 * -------
 * The main shell of the website: the sidebar navigation on the left, and
 * whichever page the user has selected on the right.
 *
 * We keep the current page in a simple piece of state called `page`. This is
 * easier to explain than a routing library, and works perfectly for five pages.
 */

import { useEffect, useState } from "react";

import { API_BASE } from "./api";
import Analytics from "./pages/Analytics";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import ModelComparison from "./pages/ModelComparison";
import Predict from "./pages/Predict";
import "./styles.css";

// The five sections of the website, in the order they appear in the sidebar.
const PAGES = [
  { id: "home", step: "01", label: "Home" },
  { id: "dashboard", step: "02", label: "Dashboard" },
  { id: "analytics", step: "03", label: "Sales Analytics" },
  { id: "comparison", step: "04", label: "Model Comparison" },
  { id: "predict", step: "05", label: "Sales Prediction" },
];

export default function App() {
  const [page, setPage] = useState("home");
  const [backendUp, setBackendUp] = useState(null);

  // Check once, on load, whether the Python backend is running. This is what
  // powers the little green/red dot at the bottom of the sidebar.
  useEffect(() => {
    fetch(`${API_BASE}/api/health`)
      .then((response) => setBackendUp(response.ok))
      .catch(() => setBackendUp(false));
  }, []);

  function goTo(nextPage) {
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">SP</div>
          <div className="brand-text">
            <strong>Sales Prediction</strong>
            <span>ML Mini Project</span>
          </div>
        </div>

        <nav className="nav">
          <p className="nav-label">Sections</p>
          {PAGES.map((item) => (
            <button
              key={item.id}
              className={page === item.id ? "active" : ""}
              onClick={() => goTo(item.id)}
            >
              <span className="step">{item.step}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-foot">
          <span className={backendUp === false ? "dot down" : "dot"} />
          {backendUp === null && "checking backend…"}
          {backendUp === true && "backend connected"}
          {backendUp === false && "backend offline"}
          <br />
          <br />
          Linear Regression
          <br />
          Decision Tree
          <br />
          Random Forest
        </div>
      </aside>

      <main className="content">
        {page === "home" && <Home onExplore={goTo} />}
        {page === "dashboard" && <Dashboard />}
        {page === "analytics" && <Analytics />}
        {page === "comparison" && <ModelComparison />}
        {page === "predict" && <Predict />}
      </main>
    </div>
  );
}
