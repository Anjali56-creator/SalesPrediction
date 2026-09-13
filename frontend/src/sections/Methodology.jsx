/*
 * Methodology.jsx  --  02 · Dataset & methodology
 * Describes the data, the features, the three models and the metrics.
 */

import { getOverview } from "../api";
import { ErrorBox, Loading, SectionHead, useApi } from "../components/Common";

const MODELS = [
  {
    name: "Linear Regression",
    idea: "Fits one straight-line equation through the data.",
    detail:
      "Fast and easy to interpret, but it can only capture relationships that are roughly linear.",
  },
  {
    name: "Decision Tree",
    idea: "Splits the data with a series of yes/no questions.",
    detail:
      "Handles non-linear patterns, but a single tree memorises the training data and gives step-like predictions.",
  },
  {
    name: "Random Forest",
    idea: "Averages 200 different decision trees.",
    detail:
      "Each tree sees a random sample of rows and features; averaging them smooths out the mistakes of any single tree.",
  },
];

const METRICS = [
  ["MAE", "Mean absolute error — the average size of a mistake, in rupees."],
  ["MSE", "Mean squared error — squares each mistake, so big misses are punished more."],
  ["RMSE", "Root of MSE — back in rupees, but still sensitive to large errors."],
  ["R²", "Share of the variation in sales the model explains; 1.0 would be perfect."],
];

export default function Methodology() {
  const { data, loading, error } = useApi(getOverview);

  return (
    <section id="methodology" className="section alt">
      <div className="wrap">
        <SectionHead number="02" label="Dataset & methodology">
          Real orders, honest features, a held-out test set.
        </SectionHead>

        {loading && <Loading what="dataset details" />}
        {error && <ErrorBox message={error} />}

        {data && (
          <>
            {/* Headline facts about the data, as a simple stat row */}
            <dl className="stat-row">
              <div>
                <dt>Orders</dt>
                <dd>{data.rows.toLocaleString("en-IN")}</dd>
              </div>
              <div>
                <dt>Period</dt>
                <dd className="small">
                  {data.dateFrom} — {data.dateTo}
                </dd>
              </div>
              <div>
                <dt>Model inputs</dt>
                <dd>
                  {data.featureCount}
                  <span className="unit">columns after encoding</span>
                </dd>
              </div>
              <div>
                <dt>Target</dt>
                <dd className="small mono">SALES</dd>
              </div>
            </dl>

            <div className="two-col top-gap">
              <div className="prose">
                <h3>The data</h3>
                <p>
                  The <em>Sample Sales Data</em> set is a public table of order lines for
                  a model-vehicle retailer: what was ordered, how many, at what list
                  price, by whom and when. The target column is <code>SALES</code>, the
                  revenue of the line.
                </p>
                <p>
                  Nine input features are used:{" "}
                  {[...data.numericFeatures, ...data.categoricalFeatures].map((f, i) => (
                    <span key={f}>
                      {i > 0 && ", "}
                      <code>{f}</code>
                    </span>
                  ))}
                  . The four date features are engineered from the order date so the
                  models can learn seasonality.
                </p>
                <p className="callout warn">
                  <strong>Two columns were deliberately removed.</strong>{" "}
                  <code>DEALSIZE</code> is just the sales amount put into buckets, so it
                  would leak the answer. <code>PRICEEACH</code> is capped at 100 in the
                  source file and would reduce the task to a multiplication. Leaving them
                  in would give impressive but meaningless scores.
                </p>
                <h3>Train / test split</h3>
                <p>
                  The rows are shuffled once with a fixed seed and split 80 / 20. All
                  three models learn from the same 80 % and are scored on the same 20 %
                  they never saw, so their results are directly comparable.
                </p>
              </div>

              <div>
                <h3>The three models</h3>
                <ul className="model-list">
                  {MODELS.map((model) => (
                    <li key={model.name}>
                      <strong>{model.name}</strong>
                      <span className="idea">{model.idea}</span>
                      <p>{model.detail}</p>
                    </li>
                  ))}
                </ul>

                <h3>How they are judged</h3>
                <dl className="metric-list">
                  {METRICS.map(([name, meaning]) => (
                    <div key={name}>
                      <dt>{name}</dt>
                      <dd>{meaning}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
