import { useEffect, useState } from "react";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie
} from "recharts";

const CHART_THEME = {
  grid:    "rgba(148,163,184,0.06)",
  axis:    "#475569",
  tick:    { fill: "#64748b", fontSize: 11 },
  tooltip: { background: "#111827", border: "1px solid rgba(148,163,184,0.1)", color: "#f1f5f9" },
};

const CustomTooltip = ({ active, payload, label, unit = "" }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#111827",
      border: "1px solid rgba(148,163,184,0.1)",
      borderRadius: 10, padding: "10px 14px",
      boxShadow: "0 8px 24px rgba(0,0,0,0.4)"
    }}>
      <p style={{ color: "#64748b", fontSize: 11, marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || "#22d3ee", fontWeight: 600, fontSize: 13 }}>
          {p.name}: {Number(p.value).toFixed(0)} {unit}
        </p>
      ))}
    </div>
  );
};

const StatCard = ({ label, value, sub, accent }) => (
  <div className="stat-card">
    <span className="stat-label">{label}</span>
    <strong className="stat-value" style={{ color: accent || "var(--text-primary)" }}>
      {value}
    </strong>
    {sub && <span className="stat-sub">{sub}</span>}
  </div>
);

const Analytics = () => {
  const [hourly, setHourly]   = useState([]);
  const [weekly, setWeekly]   = useState([]);
  const [dist,   setDist]     = useState([]);
  const [stats,  setStats]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [h, w, d, s] = await Promise.all([
          fetch("http://127.0.0.1:8000/analytics/hourly").then(r => r.json()),
          fetch("http://127.0.0.1:8000/analytics/weekly").then(r => r.json()),
          fetch("http://127.0.0.1:8000/analytics/distribution").then(r => r.json()),
          fetch("http://127.0.0.1:8000/analytics/stats").then(r => r.json()),
        ]);
        setHourly(h); setWeekly(w); setDist(d); setStats(s);
      } catch (e) {
        console.error("Analytics fetch failed:", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return (
    <div className="page-loading">
      <div className="spinner" />
    </div>
  );

  return (
    <div className="home-wrapper">
      <div className="app-container">

        <div className="page-header">
          <h1 className="page-title">Traffic Analytics</h1>
          <p className="page-subtitle">
            Historical pattern analysis · {stats?.date_start} → {stats?.date_end}
          </p>
        </div>

        {/* Top stat row */}
        {stats && (
          <div className="stats-row">
            <StatCard label="Total Records"    value={stats.total_records.toLocaleString()} sub="data points" />
            <StatCard label="Avg Volume"       value={stats.mean_volume.toFixed(0)}          sub="vehicles/hr" />
            <StatCard label="Peak Volume"      value={stats.max_volume.toFixed(0)}           sub="historical max" accent="#f43f5e" />
            <StatCard label="Peak Hour"        value={`${String(stats.peak_hour).padStart(2,"0")}:00`} sub="busiest hour" accent="#ff9f0a" />
            <StatCard label="Quietest Hour"    value={`${String(stats.quiet_hour).padStart(2,"0")}:00`} sub="lightest traffic" accent="#10b981" />
          </div>
        )}

        {/* Charts row */}
        <div className="charts-grid">

          {/* Hourly Pattern */}
          <div className="chart-card wide">
            <div className="chart-header">
              <h3>Hourly Traffic Pattern</h3>
              <span className="chart-badge">24h Average</span>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={hourly} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#22d3ee" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} />
                <XAxis dataKey="hour_label" stroke={CHART_THEME.axis} tick={CHART_THEME.tick} interval={2} />
                <YAxis stroke={CHART_THEME.axis} tick={CHART_THEME.tick} />
                <Tooltip content={<CustomTooltip unit="v/hr" />} />
                <Area
                  type="monotone" dataKey="mean" name="Avg Volume"
                  stroke="#22d3ee" strokeWidth={2}
                  fill="url(#areaGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Weekly Pattern */}
          <div className="chart-card">
            <div className="chart-header">
              <h3>Day of Week Pattern</h3>
              <span className="chart-badge">Avg Volume</span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weekly} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} />
                <XAxis dataKey="day" stroke={CHART_THEME.axis} tick={CHART_THEME.tick} />
                <YAxis stroke={CHART_THEME.axis} tick={CHART_THEME.tick} />
                <Tooltip content={<CustomTooltip unit="v/hr" />} />
                <Bar dataKey="mean" name="Avg Volume" radius={[5, 5, 0, 0]}>
                  {weekly.map((_, i) => (
                    <Cell
                      key={i}
                      fill={i === 4 || i === 5 ? "#7c3aed" : "#0ea5e9"}
                      opacity={0.85}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Distribution Donut */}
          <div className="chart-card">
            <div className="chart-header">
              <h3>Congestion Distribution</h3>
              <span className="chart-badge">All-time</span>
            </div>
            <div className="donut-wrapper">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={dist} cx="50%" cy="50%"
                    innerRadius={55} outerRadius={80}
                    dataKey="count" paddingAngle={3}
                  >
                    {dist.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val, name) => [val.toLocaleString(), name]}
                    contentStyle={{
                      background: "#111827",
                      border: "1px solid rgba(148,163,184,0.1)",
                      borderRadius: 10
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="donut-legend">
                {dist.map((d) => (
                  <div key={d.level} className="donut-legend-item">
                    <span style={{
                      width: 8, height: 8, borderRadius: "50%",
                      background: d.color, display: "inline-block"
                    }} />
                    <span style={{ color: "var(--text-secondary)", fontSize: 12 }}>
                      {d.level}
                    </span>
                    <span style={{
                      color: d.color, fontWeight: 600, fontSize: 12,
                      fontFamily: "'JetBrains Mono', monospace"
                    }}>
                      {d.pct}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Analytics;
