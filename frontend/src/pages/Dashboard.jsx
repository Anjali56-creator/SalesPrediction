/*
 * Dashboard.jsx  --  Section 2: Dashboard
 * KPI cards calculated from the real dataset by the backend.
 */

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatCompact, formatRupees, getAnalytics, getKpis } from "../api";
import { Card, ErrorBox, Loading, PageHead, useApi } from "../components/Common";

/* A tooltip styled to match the rest of the site. */
function ChartTip({ active, payload, label, prefix = "" }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="tooltip">
      <span className="t-label">{label}</span>
      <span className="t-value">
        {prefix}
        {typeof payload[0].value === "number"
          ? formatRupees(payload[0].value)
          : payload[0].value}
      </span>
    </div>
  );
}

export default function Dashboard() {
  const kpis = useApi(getKpis);
  const analytics = useApi(getAnalytics);

  if (kpis.loading || analytics.loading) return <Loading what="dashboard figures" />;
  if (kpis.error) return <ErrorBox message={kpis.error} />;
  if (analytics.error) return <ErrorBox message={analytics.error} />;

  const k = kpis.data;

  return (
    <>
      <PageHead step="Section 02 · Dashboard" title="Dashboard">
        Headline figures for the whole dataset, plus the performance of the best model.
        Every number here is calculated by the backend from the actual data.
      </PageHead>

      <div className="kpi-grid">
        <div className="kpi">
          <p className="label">Total Sales</p>
          <p className="value">{formatCompact(k.totalSales)}</p>
          <p className="sub">{formatRupees(k.totalSales)}</p>
        </div>

        <div className="kpi">
          <p className="label">Total Orders</p>
          <p className="value">{k.totalOrders.toLocaleString("en-IN")}</p>
          <p className="sub">
            {k.dateFrom} – {k.dateTo}
          </p>
        </div>

        <div className="kpi">
          <p className="label">Average Sale</p>
          <p className="value">{formatRupees(k.averageSales)}</p>
          <p className="sub">per order</p>
        </div>

        <div className="kpi highlight">
          <p className="label">Best Model</p>
          <p className="value small">{k.bestModel}</p>
          <p className="sub">highest R² of the three</p>
        </div>

        <div className="kpi highlight">
          <p className="label">Best R² Score</p>
          <p className="value">{k.bestR2.toFixed(4)}</p>
          <p className="sub">explains {(k.bestR2 * 100).toFixed(1)}% of variation</p>
        </div>
      </div>

      <div className="chart-grid full">
        <Card
          title="Sales over time"
          note={`Monthly totals across ${k.totalOrders.toLocaleString("en-IN")} orders`}
        >
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart
              data={analytics.data.salesOverTime}
              margin={{ top: 6, right: 34, left: 4, bottom: 4 }}
            >
              <defs>
                <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#176a58" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="#176a58" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#e7ecf1" vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={{ stroke: "#dde3ea" }} interval={3} />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => formatCompact(value)}
                width={62}
              />
              <Tooltip content={<ChartTip />} />
              <Area
                type="monotone"
                dataKey="sales"
                stroke="#176a58"
                strokeWidth={2}
                fill="url(#trendFill)"
                dot={{ r: 2.5, fill: "#176a58", strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
          <p className="note">
            Notice the sharp spike each November — the festive season. This is exactly
            why the engineered <code>ORDER_MONTH</code> feature helps the models.
          </p>
        </Card>
      </div>

      <div className="chart-grid section-gap">
        <Card title="Dataset coverage" note="What the models were trained on">
          <div className="kpi-grid" style={{ marginBottom: 0 }}>
            <div className="kpi">
              <p className="label">Product lines</p>
              <p className="value">{k.productLines}</p>
            </div>
            <div className="kpi">
              <p className="label">Countries</p>
              <p className="value">{k.countries}</p>
            </div>
          </div>
        </Card>

        <Card title="Best model accuracy" note="On the 20% held-out test set">
          <div className="kpi-grid" style={{ marginBottom: 0 }}>
            <div className="kpi">
              <p className="label">RMSE</p>
              <p className="value">{formatRupees(k.bestRMSE)}</p>
              <p className="sub">typical error size</p>
            </div>
            <div className="kpi">
              <p className="label">vs average order</p>
              <p className="value">
                {((k.bestRMSE / k.averageSales) * 100).toFixed(0)}%
              </p>
              <p className="sub">error relative to mean sale</p>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
