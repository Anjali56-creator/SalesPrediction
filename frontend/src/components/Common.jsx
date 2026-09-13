/*
 * Common.jsx
 * ----------
 * Small pieces that several pages reuse: the loading spinner, the error
 * message, a page heading and a card wrapper.
 */

import { useEffect, useState } from "react";

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

export function PageHead({ step, title, children }) {
  return (
    <div className="page-head">
      <p className="eyebrow">{step}</p>
      <h1>{title}</h1>
      <p>{children}</p>
    </div>
  );
}

export function Card({ title, note, children, style }) {
  return (
    <div className="card" style={style}>
      {title && <h3 className="card-title">{title}</h3>}
      {note && <p className="card-note">{note}</p>}
      {children}
    </div>
  );
}

/*
 * useApi: a small custom hook.
 *
 * Every page needs the same three things - the data, a "still loading" flag,
 * and an error message. Writing it once here keeps the pages short.
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

    // If the user switches page before the answer arrives, ignore the answer.
    return () => {
      cancelled = true;
    };
  }, []);

  return { data, loading, error };
}
