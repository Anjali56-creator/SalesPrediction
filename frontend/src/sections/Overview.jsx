/*
 * Overview.jsx  --  01 · Project overview
 * What the project is, why it matters, and the four-step pipeline it follows.
 */

import { getOverview } from "../api";
import { SectionHead, useApi } from "../components/Common";

// The pipeline, in the order the code runs it (see src/model.py).
const STEPS = [
  {
    title: "Collect & clean",
    text: "Load the public Sample Sales Data CSV, drop duplicates and the two columns that would leak the answer.",
  },
  {
    title: "Engineer features",
    text: "Turn the order date into year, month, quarter and weekday; one-hot encode product line, country and territory.",
  },
  {
    title: "Train three models",
    text: "Fit Linear Regression, a Decision Tree and a Random Forest on the same 80 % training split.",
  },
  {
    title: "Compare & predict",
    text: "Score every model on the same 20 % test split with MAE, MSE, RMSE and R², then serve the best one through an API.",
  },
];

export default function Overview() {
  const { data } = useApi(getOverview);

  return (
    <section id="overview" className="section">
      <div className="wrap">
        <SectionHead number="01" label="Overview">
          One dataset, three algorithms, a fair comparison.
        </SectionHead>

        <div className="two-col">
          <div className="prose">
            <p>
              Sales forecasting is a classic regression problem: given the details of an
              order, how much revenue will it bring in? Different machine-learning
              algorithms make very different assumptions about the data, so the only
              honest way to pick one is to train them under identical conditions and
              measure them on orders they have never seen.
            </p>
            <p>
              That is what this project does. A linear model, a single decision tree and
              an ensemble of 200 trees are trained on the same rows, with the same
              features, and evaluated with the same four metrics. The website is built on
              top of that experiment — every number on it is computed by the backend from
              the trained models, not typed in by hand.
            </p>
            {data && (
              <p className="callout">
                Best model on this dataset: <strong>{data.bestModel}</strong>, trained on{" "}
                {data.rows.toLocaleString("en-IN")} orders from {data.dateFrom} to{" "}
                {data.dateTo}.
              </p>
            )}
          </div>

          <ol className="steps">
            {STEPS.map((step, index) => (
              <li key={step.title}>
                <span className="step-num">{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <strong>{step.title}</strong>
                  <p>{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
