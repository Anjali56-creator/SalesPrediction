/*
 * Comparison.jsx  --  04 · Model comparison
 *
 * The centrepiece of the project. The table and charts are built from the
 * metrics the backend calculated (GET /api/models). The "best model" is
 * whichever actually scored highest - it is not written into the page by hand.
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
import { ErrorBox, Figure, Loading, SectionHead, useApi } from "../components/Common";
import {
  AXIS,
  CURSOR,
  GRID,
  REFERENCE_LINE,
  SERIES_HIGHLIGHT,
  SERIES_MAIN,
  SERIES_MUTED,
  SERIES_SECONDARY,
  TICK,
} from "../theme";

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

export default function Comparison() {
  const { data, loading, error } = useApi(getModels);
  const [selected, setSelected] = useState("Random Forest");

  return (
    <section id="comparison" className="section alt">
      <div className="wrap">
        <SectionHead number="04" label="Model comparison">
          The same test set, four metrics, one clear winner.
        </SectionHead>

        {loading && <Loading what="model results" />}
        {error && <ErrorBox message={error} />}

        {data && <Results data={data} selected={selected} setSelected={setSelected} />}
      </div>
    </section>
  );
}

/* Split out so the maths below only runs once the data has arrived. */
function Results({ data, selected, setSelected }) {
  const best = data.models.find((m) => m.Model === data.bestModel);
  const points = data.actualVsPredicted[selected] || [];
  const trainRows = 2823 - data.testSize;

  // Used to draw the diagonal "perfect prediction" reference line.
  const maxValue = Math.max(...points.map((p) => Math.max(p.actual, p.predicted)));

  return (
    <>
      {/* Headline result, read from the backend - not typed in by hand. */}
      <div className="winner">
        <div className="winner-name">
          <p className="label">Best model</p>
          <p className="name">{data.bestModel}</p>
        </div>
        <dl>
          <div>
            <dt>R² score</dt>
            <dd>{best.R2.toFixed(4)}</dd>
          </div>
          <div>
            <dt>RMSE</dt>
            <dd>{best.RMSE.toFixed(2)}</dd>
          </div>
          <div>
            <dt>MAE</dt>
            <dd>{best.MAE.toFixed(2)}</dd>
          </div>
        </dl>
        <p className="winner-note">
          Trained on {trainRows.toLocaleString("en-IN")} orders, judged on {data.testSize}{" "}
          it had never seen. It wins on all four metrics, so the conclusion does not
          depend on which metric you prefer.
        </p>
      </div>

      <div className="tablewrap">
        <table>
          <thead>
            <tr>
              <th>Model</th>
              <th>MAE ↓</th>
              <th>MSE ↓</th>
              <th>RMSE ↓</th>
              <th>R² ↑</th>
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

      <div className="figure-grid top-gap">
        <Figure title="R² score by model" caption="Higher is better — how much of the variation in sales each model explains.">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.models} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
              <CartesianGrid stroke={GRID} vertical={false} />
              <XAxis dataKey="Model" tickLine={false} axisLine={{ stroke: AXIS }} tick={{ fontSize: 10 }} />
              <YAxis domain={[0, 0.8]} tickLine={false} axisLine={false} width={44} />
              <Tooltip content={<MetricTip decimals={4} />} cursor={{ fill: CURSOR }} />
              <Bar dataKey="R2" radius={[3, 3, 0, 0]}>
                {data.models.map((row) => (
                  <Cell key={row.Model} fill={row.Model === data.bestModel ? SERIES_HIGHLIGHT : SERIES_MUTED} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Figure>

        <Figure title="MAE and RMSE by model" caption="Lower is better. Blue is MAE, purple is RMSE; RMSE is always higher because it punishes large errors more.">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.models} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
              <CartesianGrid stroke={GRID} vertical={false} />
              <XAxis dataKey="Model" tickLine={false} axisLine={{ stroke: AXIS }} tick={{ fontSize: 10 }} />
              <YAxis tickLine={false} axisLine={false} width={52} />
              <Tooltip cursor={{ fill: CURSOR }} />
              <Bar dataKey="MAE" fill={SERIES_SECONDARY} radius={[3, 3, 0, 0]} />
              <Bar dataKey="RMSE" fill={SERIES_MAIN} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Figure>
      </div>

      <Figure
        wide
        title="Actual vs predicted sales"
        caption="Each dot is one test order; a perfect prediction sits on the dashed diagonal. Switch to Decision Tree and the dots form horizontal bands — a single tree gives the same constant prediction to every order in the same leaf. Averaging 200 trees is what smooths that out."
      >
        <div className="field inline">
          <label htmlFor="avp-model">Show model</label>
          <select id="avp-model" value={selected} onChange={(event) => setSelected(event.target.value)}>
            {data.models.map((row) => (
              <option key={row.Model} value={row.Model}>
                {row.Model}
              </option>
            ))}
          </select>
        </div>
        <ResponsiveContainer width="100%" height={360}>
          <ScatterChart margin={{ top: 8, right: 20, left: 8, bottom: 16 }}>
            <CartesianGrid stroke={GRID} />
            <XAxis
              type="number"
              dataKey="actual"
              tickFormatter={formatCompact}
              tickLine={false}
              axisLine={{ stroke: AXIS }}
              label={{ value: "Actual sales", position: "insideBottom", offset: -8, fill: TICK, fontSize: 11 }}
            />
            <YAxis
              type="number"
              dataKey="predicted"
              tickFormatter={formatCompact}
              tickLine={false}
              axisLine={false}
              width={62}
              label={{ value: "Predicted sales", angle: -90, position: "insideLeft", fill: TICK, fontSize: 11 }}
            />
            <Tooltip content={<PointTip />} cursor={{ strokeDasharray: "3 3" }} />
            <ReferenceLine
              segment={[
                { x: 0, y: 0 },
                { x: maxValue, y: maxValue },
              ]}
              stroke={REFERENCE_LINE}
              strokeWidth={1.5}
              strokeDasharray="6 4"
              ifOverflow="extendDomain"
            />
            <Scatter data={points} fill={SERIES_MAIN} fillOpacity={0.4} />
          </ScatterChart>
        </ResponsiveContainer>
      </Figure>

      <Figure
        wide
        title="What drives the prediction"
        caption="Random Forest feature importance (the scores add up to 1). MSRP and quantity do about 84 % of the work — which matches business common sense, since revenue is mostly price × quantity."
      >
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={data.featureImportance} layout="vertical" margin={{ top: 4, right: 20, left: 8, bottom: 4 }}>
            <CartesianGrid stroke={GRID} horizontal={false} />
            <XAxis type="number" tickLine={false} axisLine={{ stroke: AXIS }} />
            <YAxis type="category" dataKey="feature" width={148} interval={0} tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
            <Tooltip content={<MetricTip decimals={3} />} cursor={{ fill: CURSOR }} />
            <Bar dataKey="importance" fill={SERIES_MAIN} radius={[0, 3, 3, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Figure>
    </>
  );
}
