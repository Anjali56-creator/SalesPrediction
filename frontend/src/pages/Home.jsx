/*
 * Home.jsx  --  Section 1: Home / Overview
 * Explains the project and sends the user to the dashboard.
 */

import { getOverview } from "../api";
import { Card, ErrorBox, Loading, useApi } from "../components/Common";

export default function Home({ onExplore }) {
  const { data, loading, error } = useApi(getOverview);

  return (
    <>
      <div className="hero">
        <p className="eyebrow">College Mini Project · Machine Learning</p>
        <h1>Comparative Analysis of Sales Prediction</h1>
        <p className="subtitle">
          Machine Learning Based Sales Prediction &amp; Model Comparison
        </p>
        <p className="blurb">
          Three regression algorithms are trained on the same real sales dataset and
          judged on the same held-out test data. The dashboard shows which one predicts
          sales most accurately, and lets you run your own order through any of them.
        </p>
        <div className="btn-row">
          <button className="btn" onClick={() => onExplore("dashboard")}>
            Explore Dashboard →
          </button>
          <button className="btn ghost" onClick={() => onExplore("predict")}>
            Try a prediction
          </button>
        </div>
      </div>

      {loading && <Loading what="project details" />}
      {error && <ErrorBox message={error} />}

      {data && (
        <>
          <div className="info-grid">
            <Card title="Objective" note="What the project sets out to do">
              <ul>
                <li>Clean and prepare a real public sales dataset</li>
                <li>Train three regression models on identical data</li>
                <li>Evaluate all three using MAE, MSE, RMSE and R²</li>
                <li>Compare them and identify the best performer</li>
                <li>Explain <em>why</em> the winning model won</li>
              </ul>
            </Card>

            <Card title="Machine learning models" note="All three are compared">
              <ul>
                <li>
                  <strong>Linear Regression</strong> — fits one straight-line equation
                </li>
                <li>
                  <strong>Decision Tree</strong> — splits data with yes/no questions
                </li>
                <li>
                  <strong>Random Forest</strong> — averages 200 decision trees
                </li>
              </ul>
              <p className="note">
                Best on this dataset: <strong>{data.bestModel}</strong>
              </p>
            </Card>

            <Card title="Technologies used" note="Frontend, backend and ML">
              <div className="chips">
                <span className="chip">React</span>
                <span className="chip">Vite</span>
                <span className="chip">Recharts</span>
                <span className="chip">FastAPI</span>
                <span className="chip">pandas</span>
                <span className="chip">NumPy</span>
                <span className="chip">scikit-learn</span>
                <span className="chip">Matplotlib</span>
                <span className="chip">Seaborn</span>
              </div>
            </Card>
          </div>

          <div className="section-gap">
            <Card
              title="The dataset"
              note="Sample Sales Data — a public dataset of order lines"
            >
              <div className="kpi-grid" style={{ marginBottom: 0 }}>
                <div className="kpi">
                  <p className="label">Orders</p>
                  <p className="value">{data.rows.toLocaleString("en-IN")}</p>
                </div>
                <div className="kpi">
                  <p className="label">Date range</p>
                  <p className="value small">{data.dateFrom}</p>
                  <p className="sub">to {data.dateTo}</p>
                </div>
                <div className="kpi">
                  <p className="label">Features used</p>
                  <p className="value">{data.featureCount}</p>
                  <p className="sub">after one-hot encoding</p>
                </div>
                <div className="kpi">
                  <p className="label">Target</p>
                  <p className="value small">SALES</p>
                  <p className="sub">revenue of the order</p>
                </div>
              </div>

              <p className="note">
                <strong>Input features:</strong>{" "}
                {[...data.numericFeatures, ...data.categoricalFeatures].join(", ")}.
              </p>
              <p className="note">
                Two columns were deliberately removed: <code>DEALSIZE</code>, which is
                just the sales amount put into buckets (data leakage), and{" "}
                <code>PRICEEACH</code>, which is capped at 100 and would reduce the task
                to a multiplication.
              </p>
            </Card>
          </div>
        </>
      )}
    </>
  );
}
