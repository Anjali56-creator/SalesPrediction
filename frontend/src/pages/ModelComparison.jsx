/*
 * ModelComparison.jsx  --  Section 4: Model Comparison
 *
 * The table and charts are built from the metrics the backend calculated.
 * The "Best Model" banner reads whichever model actually scored highest -
 * it is not written into the page by hand.
 */

import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatCompact, formatRupees, getModels } from "../api";
import { Card, ErrorBox, Loading, PageHead, useApi } from "../components/Common";

function MetricTip({ active, payload, label, decimals = 2 }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="tooltip">
      <span className="t-label">{label}</span>
      <span className="t-value">{payload[0].value.toFixed(decimals)}</span>
    </div>
  );
}

function PointTip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const point = payload[0].payload;
  return (
    <div className="tooltip">
      <span className="t-label">Actual {formatRupees(point.actual)}</span>
      <span className="t-value">Predicted {formatRupees(point.predicted)}</span>
    </div>
  );
}

export default function ModelComparison() {
  const { data, loading, error } = useApi(getModels);
  const [selected, setSelected] = useState("Random Forest");

  if (loading) return <Loading what="model results" />;
  if (error) return <ErrorBox message={error} />;

  const best = data.models.find((m) => m.Model === data.bestModel);
  const points = data.actualVsPredicted[selected] || [];

  // Used to draw the diagonal "perfect prediction" reference line.
  const maxValue = Math.max(...points.map((p) => Math.max(p.actual, p.predicted)));
  return (
    <>
      <PageHead step="Section 04 · Model Comparison" title="Model Comparison">
        All three models were trained on the same {(2823 - data.testSize).toLocaleString("en-IN")} training
        rows and judged on the same {data.testSize} test rows they had never seen.
      </PageHead>

      <div className="tablewrap">
        <table>
          <thead>
            <tr>
              <th>Model</th>
              <th>MAE</th>
              <th>MSE</th>
              <th>RMSE</th>
              <th>R²</th>
            </tr>
          </thead>
          <tbody>
            {data.models.map((row) => (
              <tr key={row.Model} className={row.Model === data.bestModel ? "win" : ""}>
                <td>
                  {row.Model}
                  {row.Model === data.bestModel && <span className="badge">Best</span>}
                </td>
                <td>{row.MAE.toFixed(2)}</td>
                <td>{row.MSE.toLocaleString("en-IN")}</td>
                <td>{row.RMSE.toFixed(2)}</td>
                <td>{row.R2.toFixed(4)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="note">
        Lower is better for MAE, MSE and RMSE. Higher is better for R².{" "}
        <strong>
          Best Model: {data.bestModel} (R² = {best.R2.toFixed(4)}, RMSE ={" "}
          {best.RMSE.toFixed(2)})
        </strong>{" "}
        — it wins on all four metrics, so the conclusion does not depend on which
        metric you pick.
      </p>

      <div className="chart-grid section-gap">
        <Card title="R² score" note="Higher is better — how much variation is explained">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.models} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
              <CartesianGrid stroke="#e7ecf1" vertical={false} />
              <XAxis
                dataKey="Model"
                tickLine={false}
                axisLine={{ stroke: "#dde3ea" }}
                tick={{ fontSize: 10 }}
              />
              <YAxis domain={[0, 0.8]} tickLine={false} axisLine={false} width={44} />
              <Tooltip content={<MetricTip decimals={4} />} cursor={{ fill: "#f1f4f7" }} />
              <Bar dataKey="R2" radius={[3, 3, 0, 0]}>
                {data.models.map((row) => (
                  <Cell
                    key={row.Model}
                    fill={row.Model === data.bestModel ? "#176a58" : "#9aa7b4"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="MAE and RMSE" note="Lower is better — the size of the error">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.models} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
              <CartesianGrid stroke="#e7ecf1" vertical={false} />
              <XAxis
                dataKey="Model"
                tickLine={false}
                axisLine={{ stroke: "#dde3ea" }}
                tick={{ fontSize: 10 }}
              />
              <YAxis tickLine={false} axisLine={false} width={52} />
              <Tooltip cursor={{ fill: "#f1f4f7" }} />
              <Bar dataKey="MAE" fill="#63bda8" radius={[3, 3, 0, 0]} />
              <Bar dataKey="RMSE" fill="#0f4d3f" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <p className="note">
            Darker bars are RMSE. RMSE is always higher than MAE because it punishes
            large errors more heavily.
          </p>
        </Card>
      </div>

      <div className="section-gap">
        <Card
          title="Actual vs Predicted sales"
          note={`Each dot is one test order. Points on the diagonal are perfect predictions.`}
        >
          <div className="field" style={{ maxWidth: 240, marginBottom: 16 }}>
            <label htmlFor="avp-model">Show model</label>
            <select
              id="avp-model"
              value={selected}
              onChange={(event) => setSelected(event.target.value)}
            >
              {data.models.map((row) => (
                <option key={row.Model} value={row.Model}>
                  {row.Model}
                </option>
              ))}
            </select>
          </div>

          <ResponsiveContainer width="100%" height={360}>
            <ScatterChart margin={{ top: 8, right: 20, left: 8, bottom: 16 }}>
              <CartesianGrid stroke="#e7ecf1" />
              <XAxis
                type="number"
                dataKey="actual"
                tickFormatter={formatCompact}
                tickLine={false}
                axisLine={{ stroke: "#dde3ea" }}
                label={{
                  value: "Actual sales",
                  position: "insideBottom",
                  offset: -8,
                  fill: "#6b7785",
                  fontSize: 11,
                }}
              />
              <YAxis
                type="number"
                dataKey="predicted"
                tickFormatter={formatCompact}
                tickLine={false}
                axisLine={false}
                width={62}
                label={{
                  value: "Predicted sales",
                  angle: -90,
                  position: "insideLeft",
                  fill: "#6b7785",
                  fontSize: 11,
                }}
              />
              <Tooltip content={<PointTip />} cursor={{ strokeDasharray: "3 3" }} />
              {/* The red dashed diagonal: a perfect prediction would sit on it. */}
              <ReferenceLine
                segment={[
                  { x: 0, y: 0 },
                  { x: maxValue, y: maxValue },
                ]}
                stroke="#a8372a"
                strokeWidth={1.5}
                strokeDasharray="6 4"
                ifOverflow="extendDomain"
              />
              <Scatter data={points} fill="#176a58" fillOpacity={0.4} />
            </ScatterChart>
          </ResponsiveContainer>

          <p className="note">
            Switch to <strong>Decision Tree</strong> and look closely: the dots form
            horizontal bands. A single tree gives the <em>same constant prediction</em> to
            every order that lands in the same leaf, so its output is a staircase rather
            than a smooth line. That is the weakness Random Forest fixes by averaging 200
            trees.
          </p>
        </Card>
      </div>

      <div className="section-gap">
        <Card
          title="What drives the prediction"
          note="Random Forest feature importance — the scores add up to 1"
        >
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={data.featureImportance}
              layout="vertical"
              margin={{ top: 4, right: 20, left: 8, bottom: 4 }}
            >
              <CartesianGrid stroke="#e7ecf1" horizontal={false} />
              <XAxis type="number" tickLine={false} axisLine={{ stroke: "#dde3ea" }} />
              <YAxis
                type="category"
                dataKey="feature"
                width={148}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10 }}
              />
              <Tooltip content={<MetricTip decimals={3} />} cursor={{ fill: "#f1f4f7" }} />
              <Bar dataKey="importance" fill="#176a58" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <p className="note">
            MSRP and quantity together do about 84% of the work — which matches business
            common sense, since revenue is mostly price × quantity.
          </p>
        </Card>
      </div>
    </>
  );
}
