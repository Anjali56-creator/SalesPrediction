/*
 * App.jsx
 * -------
 * The whole website is one scrolling page, laid out like a project case study:
 *
 *   header (sticky navigation)
 *   hero
 *   01 overview
 *   02 dataset & methodology
 *   03 sales insights
 *   04 model comparison
 *   05 predict sales
 *   footer
 *
 * The navigation links are ordinary anchor links (#insights etc.). A small
 * IntersectionObserver watches which section is on screen so the matching
 * link can be underlined.
 */

import { useEffect, useState } from "react";

import { API_BASE } from "./api";
import Comparison from "./sections/Comparison";
import Hero from "./sections/Hero";
import Insights from "./sections/Insights";
import Methodology from "./sections/Methodology";
import Overview from "./sections/Overview";
import Predict from "./sections/Predict";
import "./styles.css";

// The sections of the page, in order. Each id matches a <section id="...">.
const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "methodology", label: "Dataset & Method" },
  { id: "insights", label: "Insights" },
  { id: "comparison", label: "Model Comparison" },
  { id: "predict", label: "Predict" },
];

export default function App() {
  const [active, setActive] = useState("");
  const [backendUp, setBackendUp] = useState(null);

  // Check once, on load, whether the Python backend is reachable. This powers
  // the small status pill in the header.
  useEffect(() => {
    fetch(`${API_BASE}/api/health`)
      .then((response) => setBackendUp(response.ok))
      .catch(() => setBackendUp(false));
  }, []);

  // Underline the nav link of whichever section is currently in view.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    SECTIONS.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <header className="site-header">
        <div className="wrap header-inner">
          <a href="#top" className="brand">
            <span className="brand-mark" />
            <span className="brand-name">Sales Prediction</span>
            <span className="brand-tag">ML Case Study</span>
          </a>

          <nav className="site-nav" aria-label="Sections">
            {SECTIONS.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className={active === section.id ? "active" : ""}
              >
                {section.label}
              </a>
            ))}
          </nav>

          <div className="header-side">
            <span className={"status" + (backendUp === false ? " down" : "")}>
              <span className="dot" />
              {backendUp === null && "connecting"}
              {backendUp === true && "API live"}
              {backendUp === false && "API offline"}
            </span>
            <a href="#predict" className="btn small">
              Try it
            </a>
          </div>
        </div>
      </header>

      <main id="top">
        <Hero />
        <Overview />
        <Methodology />
        <Insights />
        <Comparison />
        <Predict />
      </main>

      <footer className="site-footer">
        <div className="wrap footer-inner">
          <div>
            <p className="footer-title">Comparative Analysis of Sales Prediction</p>
            <p className="footer-sub">
              B.Tech CSE mini project · Linear Regression vs Decision Tree vs Random Forest
            </p>
          </div>
          <div className="footer-links">
            <a href={`${API_BASE}/docs`} target="_blank" rel="noreferrer">
              API documentation
            </a>
            <a
              href="https://github.com/Anjali56-creator/SalesPrediction"
              target="_blank"
              rel="noreferrer"
            >
              Source code
            </a>
            <a href="#top">Back to top</a>
          </div>
        </div>
      </footer>
    </>
  );
}
