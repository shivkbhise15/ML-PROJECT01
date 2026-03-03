import { useEffect, useState } from "react";

const InfoRow = ({ label, value, accent }) => (
  <div className="info-row">
    <span className="info-label">{label}</span>
    <span className="info-value" style={{ color: accent || "var(--text-primary)" }}>
      {value}
    </span>
  </div>
);

const Reports = () => {
  const [stats, setStats]   = useState(null);
  const [dist,  setDist]    = useState([]);

  useEffect(() => {
    Promise.all([
      fetch("http://127.0.0.1:8000/analytics/stats").then(r => r.json()),
      fetch("http://127.0.0.1:8000/analytics/distribution").then(r => r.json()),
    ]).then(([s, d]) => { setStats(s); setDist(d); });
  }, []);

  const modelFeatures = [
    "hour_sin / hour_cos (cyclical encoding)",
    "day_of_week",
    "is_peak_hour",
    "is_holiday",
    "temp, rain_1h, snow_1h, clouds_all",
    "lag_1, lag_2, lag_24, lag_168",
    "rolling_mean_3h, rolling_mean_6h",
  ];

  return (
    <div className="home-wrapper">
      <div className="app-container">

        <div className="page-header">
          <h1 className="page-title">Project Reports</h1>
          <p className="page-subtitle">
            Model architecture · Dataset overview · System summary
          </p>
        </div>

        <div className="reports-grid">

          {/* Model Card */}
          <div className="report-card">
            <div className="report-card-header">
              <span className="report-icon">🤖</span>
              <h3>ML Model</h3>
              <span className="report-badge cyan">Active</span>
            </div>
            <InfoRow label="Algorithm"      value="Gradient Boosted Regressor" />
            <InfoRow label="Target"         value="traffic_volume (vehicles/hr)" />
            <InfoRow label="Total Features" value={`${modelFeatures.length} engineered`} />
            <InfoRow label="Thresholds"     value="Low <1500 · Med <3000 · High ≥3000" />
            <InfoRow label="Lag Strategy"   value="Hourly avg from historical dataset" />
            <div className="feature-list">
              <p className="feature-list-label">Feature Set</p>
              {modelFeatures.map((f, i) => (
                <div key={i} className="feature-chip">{f}</div>
              ))}
            </div>
          </div>

          {/* Dataset Card */}
          <div className="report-card">
            <div className="report-card-header">
              <span className="report-icon">📊</span>
              <h3>Dataset</h3>
              <span className="report-badge purple">Metro Interstate</span>
            </div>
            {stats && (
              <>
                <InfoRow label="Total Records"  value={stats.total_records.toLocaleString()} />
                <InfoRow label="Date Range"     value={`${stats.date_start} → ${stats.date_end}`} />
                <InfoRow label="Mean Volume"    value={`${stats.mean_volume} v/hr`} />
                <InfoRow label="Max Volume"     value={`${stats.max_volume} v/hr`}  accent="#f43f5e" />
                <InfoRow label="Min Volume"     value={`${stats.min_volume} v/hr`}  accent="#10b981" />
                <InfoRow label="Peak Hour"      value={`${String(stats.peak_hour).padStart(2,"0")}:00 — ${String(stats.peak_hour+1).padStart(2,"0")}:00`} accent="#ff9f0a" />
              </>
            )}
          </div>

          {/* System Card */}
          <div className="report-card">
            <div className="report-card-header">
              <span className="report-icon">⚙️</span>
              <h3>System Stack</h3>
              <span className="report-badge green">Operational</span>
            </div>
            <InfoRow label="Frontend"       value="React 18 + Vite" />
            <InfoRow label="Backend"        value="FastAPI + Uvicorn" />
            <InfoRow label="ML Runtime"     value="scikit-learn + joblib" />
            <InfoRow label="Mapping"        value="React-Leaflet + OSRM" />
            <InfoRow label="Routing API"    value="OpenRouteService (ORS)" />
            <InfoRow label="Geocoding"      value="Nominatim (OSM)" />
            <InfoRow label="Tile Layer"     value="CartoDB Dark Matter" />
            <InfoRow label="Deployment"     value="localhost · demo-ready" />
          </div>

          {/* Distribution Card */}
          <div className="report-card">
            <div className="report-card-header">
              <span className="report-icon">🚦</span>
              <h3>Traffic Distribution</h3>
              <span className="report-badge cyan">Historical</span>
            </div>
            {dist.map((d) => (
              <div key={d.level} className="dist-row">
                <div className="dist-bar-header">
                  <span style={{ color: d.color, fontWeight: 600, fontSize: 13 }}>
                    {d.level}
                  </span>
                  <span style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 12, color: "var(--text-secondary)"
                  }}>
                    {d.count.toLocaleString()} · {d.pct}%
                  </span>
                </div>
                <div className="dist-bar-bg">
                  <div
                    className="dist-bar-fill"
                    style={{
                      width: `${d.pct}%`,
                      background: d.color,
                      boxShadow: `0 0 10px ${d.color}55`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Reports;
