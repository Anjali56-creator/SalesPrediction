/*
 * Insights.jsx  --  03 · Sales insights
 *
 * Exploratory analysis of the dataset. Charts are only drawn for columns that
 * genuinely exist in the data: ORDERDATE, PRODUCTLINE, COUNTRY, SALES,
 * QUANTITYORDERED and MSRP. All numbers come from GET /api/kpis and
 * GET /api/analytics.
 */

import {
  Area,
  AreaChart,
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

import { formatCompact, formatRupees, getAnalytics, getKpis } from "../api";
import { ErrorBox, Figure, Loading, SectionHead, useApi } from "../components/Common";
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

/* ---- tooltips styled to match the site ---------------------------------- */

function MoneyTip({ active, payload, label }) {
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

export default function Insights() {
  const kpis = useApi(getKpis);
  const analytics = useApi(getAnalytics);

  const loading = kpis.loading || analytics.loading;
  const error = kpis.error || analytics.error;
  const k = kpis.data;
  const a = analytics.data;

  return (
    <section id="insights" className="section">
      <div className="wrap">
        <SectionHead number="03" label="Sales insights">
          What the data looks like before any model touches it.
        </SectionHead>

        {loading && <Loading what="sales analytics" />}
        {error && <ErrorBox message={error} />}

        {k && a && (
          <>
            <dl className="stat-row">
              <div>
                <dt>Total revenue</dt>
                <dd>{formatCompact(k.totalSales)}</dd>
              </div>
              <div>
                <dt>Orders</dt>
                <dd>{k.totalOrders.toLocaleString("en-IN")}</dd>
              </div>
              <div>
                <dt>Average order</dt>
                <dd>{formatRupees(k.averageSales)}</dd>
              </div>
              <div>
                <dt>Product lines</dt>
                <dd>{k.productLines}</dd>
              </div>
              <div>
                <dt>Countries</dt>
                <dd>{k.countries}</dd>
              </div>
            </dl>

            <Figure
              wide
              title="Monthly revenue"
              caption="Notice the spike every November — the festive season. This is exactly why the engineered ORDER_MONTH feature helps the models."
            >
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={a.salesOverTime} margin={{ top: 6, right: 36, left: 4, bottom: 4 }}>
                  <defs>
                    <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={SERIES_MAIN} stopOpacity={0.26} />
                      <stop offset="100%" stopColor={SERIES_MAIN} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke={GRID} vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={{ stroke: AXIS }} interval={3} />
                  <YAxis tickLine={false} axisLine={false} tickFormatter={formatCompact} width={62} />
                  <Tooltip content={<MoneyTip />} />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke={SERIES_MAIN}
                    strokeWidth={2}
                    fill="url(#trendFill)"
                    dot={{ r: 2.5, fill: SERIES_MAIN, strokeWidth: 0 }}
                    activeDot={{ r: 5 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Figure>

            <div className="figure-grid">
              <Figure title="Revenue by product line" caption="Classic and vintage cars dominate.">
                <ResponsiveContainer width="100%" height={290}>
                  <BarChart data={a.salesByCategory} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
                    <CartesianGrid stroke={GRID} horizontal={false} />
                    <XAxis type="number" tickFormatter={formatCompact} tickLine={false} axisLine={{ stroke: AXIS }} />
                    <YAxis type="category" dataKey="name" width={112} interval={0} tickLine={false} axisLine={false} />
                    <Tooltip content={<MoneyTip />} cursor={{ fill: CURSOR }} />
                    <Bar dataKey="sales" radius={[0, 3, 3, 0]}>
                      {a.salesByCategory.map((entry, index) => (
                        <Cell key={entry.name} fill={CATEGORY_SHADES[index % CATEGORY_SHADES.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Figure>

              <Figure title="Revenue by country" caption="Top ten countries by total revenue.">
                <ResponsiveContainer width="100%" height={290}>
                  <BarChart data={a.salesByRegion} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
                    <CartesianGrid stroke={GRID} horizontal={false} />
                    <XAxis type="number" tickFormatter={formatCompact} tickLine={false} axisLine={{ stroke: AXIS }} />
                    <YAxis type="category" dataKey="name" width={92} interval={0} tickLine={false} axisLine={false} />
                    <Tooltip content={<MoneyTip />} cursor={{ fill: CURSOR }} />
                    <Bar dataKey="sales" radius={[0, 3, 3, 0]}>
                      {a.salesByRegion.map((entry, index) => (
                        <Cell key={entry.name} fill={REGION_SHADES[index % REGION_SHADES.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Figure>

              <Figure
                title="Order-size distribution"
                caption="Right-skewed: many small and medium orders, a long tail of very large ones."
              >
                <ResponsiveContainer width="100%" height={270}>
                  <BarChart data={a.salesDistribution} margin={{ top: 4, right: 12, left: 0, bottom: 4 }}>
                    <CartesianGrid stroke={GRID} vertical={false} />
                    <XAxis dataKey="range" tickLine={false} axisLine={{ stroke: AXIS }} />
                    <YAxis tickLine={false} axisLine={false} width={42} />
                    <Tooltip content={<CountTip />} cursor={{ fill: CURSOR }} />
                    <Bar dataKey="orders" fill={SERIES_MAIN} radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Figure>

              <Figure title="Quantity vs revenue" caption="400 sampled orders. More units, more revenue — but with a wide spread.">
                <ResponsiveContainer width="100%" height={270}>
                  <ScatterChart margin={{ top: 4, right: 16, left: 0, bottom: 12 }}>
                    <CartesianGrid stroke={GRID} />
                    <XAxis
                      type="number"
                      dataKey="quantity"
                      tickLine={false}
                      axisLine={{ stroke: AXIS }}
                      label={{ value: "Quantity ordered", position: "insideBottom", offset: -6, fill: TICK, fontSize: 11 }}
                    />
                    <YAxis type="number" dataKey="sales" tickFormatter={formatCompact} tickLine={false} axisLine={false} width={58} />
                    <Tooltip content={<ScatterTip xLabel="Quantity" xKey="quantity" />} cursor={{ strokeDasharray: "3 3" }} />
                    <Scatter data={a.quantityVsSales} fill={SERIES_MAIN} fillOpacity={0.45} />
                  </ScatterChart>
                </ResponsiveContainer>
              </Figure>

              <Figure
                title="List price vs revenue"
                caption="Together with quantity, price is the strongest driver of revenue — which is what the feature importance later confirms."
              >
                <ResponsiveContainer width="100%" height={270}>
                  <ScatterChart margin={{ top: 4, right: 16, left: 0, bottom: 12 }}>
                    <CartesianGrid stroke={GRID} />
                    <XAxis
                      type="number"
                      dataKey="msrp"
                      tickLine={false}
                      axisLine={{ stroke: AXIS }}
                      label={{ value: "MSRP (list price)", position: "insideBottom", offset: -6, fill: TICK, fontSize: 11 }}
                    />
                    <YAxis type="number" dataKey="sales" tickFormatter={formatCompact} tickLine={false} axisLine={false} width={58} />
                    <Tooltip content={<ScatterTip xLabel="MSRP" xKey="msrp" />} cursor={{ strokeDasharray: "3 3" }} />
                    <Scatter data={a.priceVsSales} fill={SERIES_SECONDARY} fillOpacity={0.45} />
                  </ScatterChart>
                </ResponsiveContainer>
              </Figure>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
