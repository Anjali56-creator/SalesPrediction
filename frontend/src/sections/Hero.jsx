/*
 * Hero.jsx  --  the opening of the page
 * The headline result (best model, R², RMSE) is read from the backend so the
 * hero always agrees with the comparison section further down.
 */

import { getKpis } from "../api";
import { useApi } from "../components/Common";

export default function Hero() {
  const { data } = useApi(getKpis);

  return (
    <section className="hero">
      <div className="wrap hero-inner">
        <div className="hero-copy">
          <p className="eyebrow light">Machine Learning · Regression · Model Comparison</p>
          <h1>Comparative Analysis of Sales Prediction</h1>
          <p className="lede">
            Three regression algorithms were trained on the same real-world sales
            dataset and judged on the same unseen orders. This site walks through the
            data, the method, the results — and lets you run a live prediction against
            the trained models.
          </p>
          <div className="btn-row">
            <a href="#comparison" className="btn invert">
              See the results
            </a>
            <a href="#predict" className="btn ghost">
              Run a prediction
            </a>
          </div>
        </div>

        {/* Headline finding. Shows placeholders until the backend answers. */}
        <aside className="hero-result" aria-label="Headline result">
          <p className="label">Best performing model</p>
          <p className="model">{data ? data.bestModel : "—"}</p>
          <dl>
            <div>
              <dt>R² score</dt>
              <dd>{data ? data.bestR2.toFixed(4) : "—"}</dd>
            </div>
            <div>
              <dt>RMSE</dt>
              <dd>{data ? "₹" + Math.round(data.bestRMSE).toLocaleString("en-IN") : "—"}</dd>
            </div>
            <div>
              <dt>Orders analysed</dt>
              <dd>{data ? data.totalOrders.toLocaleString("en-IN") : "—"}</dd>
            </div>
          </dl>
          <p className="fine">Computed on a 20 % held-out test set.</p>
        </aside>
      </div>
    </section>
  );
}
