/*
 * Analytics.jsx  --  Section 3: Sales Analytics
 *
 * Charts are only drawn for columns that genuinely exist in the dataset:
 * ORDERDATE, PRODUCTLINE, COUNTRY, SALES, QUANTITYORDERED and MSRP.
 */

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatCompact, formatRupees, getAnalytics } from "../api";
import { Card, ErrorBox, Loading, PageHead, useApi } from "../components/Common";
import {
  AXIS,
  CATEGORY_SHADES,
  CURSOR,
  GRID,
  REGION_SHADES,
  SERIES_MAIN,
  SERIES_SECONDARY,
  TICK,
} from "../theme";

// Colours come from theme.js so every chart on the site uses the same palette.

function BarTip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="tooltip">
      <span className="t-label">{label}</span>
      <span className="t-value">{formatRupees(payload[0].value)}</span>
    </div>
  );
}

function CountTip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="tooltip">
      <span className="t-label">₹{label}</span>
      <span className="t-value">{payload[0].value} orders</span>
    </div>
  );
}

function ScatterTip({ active, payload, xLabel, xKey }) {
  if (!active || !payload || !payload.length) return null;
  const point = payload[0].payload;
  return (
    <div className="tooltip">
      <span className="t-label">
        {xLabel}: {point[xKey]}
      </span>
      <span className="t-value">{formatRupees(point.sales)}</span>
    </div>
  );
}

export default function Analytics() {
  const { data, loading, error } = useApi(getAnalytics);

  if (loading) return <Loading what="sales analytics" />;
  if (error) return <ErrorBox message={error} />;

  return (
    <>
      <PageHead step="Section 03 · Sales Analytics" title="Sales Analytics">
        Exploratory analysis of the dataset. Each chart uses a column that actually
        exists in the data — there is no advertising or discount column, so no chart
        pretends there is.
      </PageHead>

      <div className="chart-grid">
        <Card title="Sales by category" note="Total revenue per product line">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={data.salesByCategory}
              layout="vertical"
              margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
            >
              <CartesianGrid stroke={GRID} horizontal={false} />
              <XAxis
                type="number"
                tickFormatter={formatCompact}
                tickLine={false}
                axisLine={{ stroke: AXIS }}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={112}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<BarTip />} cursor={{ fill: CURSOR }} />
              <Bar dataKey="sales" radius={[0, 3, 3, 0]}>
                {data.salesByCategory.map((entry, index) => (
                  <Cell key={entry.name} fill={CATEGORY_SHADES[index % CATEGORY_SHADES.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Sales by region" note="Top 10 countries by total revenue">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={data.salesByRegion}
              layout="vertical"
              margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
            >
              <CartesianGrid stroke={GRID} horizontal={false} />
              <XAxis
                type="number"
                tickFormatter={formatCompact}
                tickLine={false}
                axisLine={{ stroke: AXIS }}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={92}
                interval={0}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<BarTip />} cursor={{ fill: CURSOR }} />
              <Bar dataKey="sales" radius={[0, 3, 3, 0]}>
                {data.salesByRegion.map((entry, index) => (
                  <Cell key={entry.name} fill={REGION_SHADES[index % REGION_SHADES.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card
          title="Sales distribution"
          note="How many orders fall into each revenue band"
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={data.salesDistribution}
              margin={{ top: 4, right: 12, left: 0, bottom: 4 }}
            >
              <CartesianGrid stroke={GRID} vertical={false} />
              <XAxis dataKey="range" tickLine={false} axisLine={{ stroke: AXIS }} />
              <YAxis tickLine={false} axisLine={false} width={42} />
              <Tooltip content={<CountTip />} cursor={{ fill: CURSOR }} />
              <Bar dataKey="orders" fill={SERIES_MAIN} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <p className="note">
            The shape is <strong>right-skewed</strong>: many small and medium orders,
            with a long tail of a few very large ones.
          </p>
        </Card>

        <Card title="Quantity vs Sales" note="400 sampled orders">
          <ResponsiveContainer width="100%" height={280}>
            <ScatterChart margin={{ top: 4, right: 16, left: 0, bottom: 12 }}>
              <CartesianGrid stroke={GRID} />
              <XAxis
                type="number"
                dataKey="quantity"
                name="Quantity"
                tickLine={false}
                axisLine={{ stroke: AXIS }}
                label={{
                  value: "Quantity ordered",
                  position: "insideBottom",
                  offset: -6,
                  fill: TICK,
                  fontSize: 11,
                }}
              />
              <YAxis
                type="number"
                dataKey="sales"
                tickFormatter={formatCompact}
                tickLine={false}
                axisLine={false}
                width={58}
              />
              <Tooltip
                content={<ScatterTip xLabel="Quantity" xKey="quantity" />}
                cursor={{ strokeDasharray: "3 3" }}
              />
              <Scatter data={data.quantityVsSales} fill={SERIES_MAIN} fillOpacity={0.45} />
            </ScatterChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Price vs Sales" note="MSRP against revenue, 400 sampled orders">
          <ResponsiveContainer width="100%" height={280}>
            <ScatterChart margin={{ top: 4, right: 16, left: 0, bottom: 12 }}>
              <CartesianGrid stroke={GRID} />
              <XAxis
                type="number"
                dataKey="msrp"
                name="MSRP"
                tickLine={false}
                axisLine={{ stroke: AXIS }}
                label={{
                  value: "MSRP (list price)",
                  position: "insideBottom",
                  offset: -6,
                  fill: TICK,
                  fontSize: 11,
                }}
              />
              <YAxis
                type="number"
                dataKey="sales"
                tickFormatter={formatCompact}
                tickLine={false}
                axisLine={false}
                width={58}
              />
              <Tooltip
                content={<ScatterTip xLabel="MSRP" xKey="msrp" />}
                cursor={{ strokeDasharray: "3 3" }}
              />
              <Scatter data={data.priceVsSales} fill={SERIES_SECONDARY} fillOpacity={0.45} />
            </ScatterChart>
          </ResponsiveContainer>
          <p className="note">
            These two charts explain the feature importance: quantity and price are the
            two strongest drivers of revenue.
          </p>
        </Card>
      </div>
    </>
  );
}
