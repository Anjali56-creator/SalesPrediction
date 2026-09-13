/*
 * Common.jsx
 * ----------
 * Small pieces that several sections reuse: the section heading, the figure
 * wrapper for charts, the loading spinner, the error message and the useApi
 * hook that fetches data from the backend.
 */

import { useEffect, useState } from "react";

/* The heading block at the top of every section: number, label, headline. */
export function SectionHead({ number, label, children }) {
  return (
    <div className="section-head">
      <p className="eyebrow">
        <span className="num">{number}</span>
        {label}
      </p>
      <h2>{children}</h2>
    </div>
  );
}

/* A chart with a title and caption, like a figure in a report. */
export function Figure({ title, caption, children, wide }) {
  return (
    <figure className={wide ? "figure wide" : "figure"}>
      <figcaption>
        <strong>{title}</strong>
        {caption && <span>{caption}</span>}
      </figcaption>
      {children}
    </figure>
  );
}

/* Shown while we are waiting for the backend to answer. */
export function Loading({ what = "data" }) {
  return (
    <div className="state">
      <div className="spinner" />
      Loading {what}…
    </div>
  );
}

/* Shown if the backend is not running or returns an error. */
export function ErrorBox({ message }) {
  return (
    <div className="state error">
      <strong>Could not reach the backend</strong>
      {message}
      <p style={{ marginBottom: 0, marginTop: 10 }}>
        The backend server may still be starting up (free hosting sleeps when
        idle and takes about a minute to wake). Please wait a moment and{" "}
        <button type="button" className="link-button" onClick={() => window.location.reload()}>
          refresh the page
        </button>
        .
      </p>
    </div>
  );
}

/*
 * useApi: a small custom hook.
 *
 * Every section needs the same three things - the data, a "still loading"
 * flag, and an error message. Writing it once here keeps the sections short.
 */
export function useApi(fetchFunction) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    fetchFunction()
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((problem) => {
        if (!cancelled) setError(problem.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    // If the component unmounts before the answer arrives, ignore the answer.
    return () => {
      cancelled = true;
    };
  }, []);

  return { data, loading, error };
}
