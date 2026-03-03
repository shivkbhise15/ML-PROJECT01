import React, { useState } from "react";

const NavigationPanel = ({ formInput, onRouteResult, onClear }) => {
  const [startAddr, setStartAddr] = useState("");
  const [endAddr, setEndAddr] = useState("");
  const [loading, setLoading] = useState(false);
  const [routeInfo, setRouteInfo] = useState(null);
  const [error, setError] = useState("");

  // Nominatim geocoding — free, no API key needed
  const geocode = async (address) => {
    // Hyderabad bounding box: southwest [78.2, 17.2] → northeast [78.8, 17.7]
    const HYDERABAD_VIEWBOX = "78.2,17.7,78.8,17.2";

    const params = new URLSearchParams({
      format: "json",
      limit: "3",                        // fetch top 3 so we can pick best
      countrycodes: "in",                // restrict to India only
      viewbox: HYDERABAD_VIEWBOX,        // prefer results inside Hyderabad
      bounded: "0",                      // don't hard-fail if outside viewbox
      q: address.toLowerCase().includes("hyderabad")
        ? address                      // already specific, use as-is
        : `${address}, Hyderabad, Telangana`   // auto-append context
    });

    const url = `https://nominatim.openstreetmap.org/search?${params}`;
    const res = await fetch(url, {
      headers: {
        "Accept-Language": "en",
        "User-Agent": "TrafficAI-Demo/1.0"
      }
    });

    const data = await res.json();

    if (!data || data.length === 0) {
      throw new Error(`Location not found: "${address}" near Hyderabad`);
    }

    // Pick the result closest to Hyderabad center if multiple returned
    const HYD_LAT = 17.385, HYD_LNG = 78.486;
    const best = data.sort((a, b) => {
      const distA = Math.abs(a.lat - HYD_LAT) + Math.abs(a.lon - HYD_LNG);
      const distB = Math.abs(b.lat - HYD_LAT) + Math.abs(b.lon - HYD_LNG);
      return distA - distB;
    })[0];

    console.log(`Geocoded "${address}" → [${best.lat}, ${best.lon}] (${best.display_name})`);
    return { lat: parseFloat(best.lat), lng: parseFloat(best.lon) };
  };


  const buildWeatherPayload = () => {
    if (formInput) {
      return {
        date_time: formInput.date_time.includes("T")
          ? formInput.date_time.replace("T", " ") + ":00"
          : formInput.date_time,
        holiday: formInput.holiday || "None",
        temp: Number(formInput.temp) || 20,
        rain_1h: Number(formInput.rain_1h) || 0,
        snow_1h: Number(formInput.snow_1h) || 0,
        clouds_all: Number(formInput.clouds_all) || 0,
      };
    }
    // Fallback defaults if user hasn't run a prediction yet
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return {
      date_time: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:00`,
      holiday: "None",
      temp: 25,
      rain_1h: 0,
      snow_1h: 0,
      clouds_all: 20,
    };
  };

  const handleNavigate = async (e) => {
    e.preventDefault();
    if (!startAddr.trim() || !endAddr.trim()) {
      setError("Please enter both a starting point and destination.");
      return;
    }

    setLoading(true);
    setError("");
    setRouteInfo(null);

    try {
      const [startCoords, endCoords] = await Promise.all([
        geocode(startAddr),
        geocode(endAddr),
      ]);

      const payload = {
        start_lat: startCoords.lat,
        start_lng: startCoords.lng,
        end_lat: endCoords.lat,
        end_lng: endCoords.lng,
        ...buildWeatherPayload(),
      };

      const res = await fetch("http://127.0.0.1:8000/navigate-predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
        return;
      }

      setRouteInfo(data);
      onRouteResult(data);
    } catch (err) {
      setError(err.message || "Navigation failed. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setRouteInfo(null);
    setStartAddr("");
    setEndAddr("");
    setError("");
    onClear();
  };

  return (
    <div className="nav-panel">
      <div className="nav-header">
        <h2>Route Navigator</h2>
        {!formInput && (
          <p className="nav-warning">
            ⚠️ Run a prediction first to use real weather data
          </p>
        )}
        {formInput && (
          <p className="nav-using-data">✅ Using your prediction's weather data</p>
        )}
      </div>

      <form onSubmit={handleNavigate} className="nav-form">
        <div className="nav-input-group">
          <span className="nav-dot" style={{ color: "#22d3ee" }}>●</span>
          <input
            type="text"
            placeholder="Start (e.g. Gachibowli, Hyderabad)"
            value={startAddr}
            onChange={(e) => setStartAddr(e.target.value)}
            className="nav-input"
          />
        </div>

        <div className="nav-connector-line"></div>

        <div className="nav-input-group">
          <span className="nav-dot" style={{ color: "#f43f5e" }}>●</span>
          <input
            type="text"
            placeholder="Destination (e.g. HITEC City)"
            value={endAddr}
            onChange={(e) => setEndAddr(e.target.value)}
            className="nav-input"
          />
        </div>

        {error && <p className="nav-error">{error}</p>}

        <div className="nav-actions">
          <button type="submit" className="nav-btn-primary" disabled={loading}>
            {loading ? "Finding Route..." : "🗺️ Get Route & Predict"}
          </button>
          {routeInfo && (
            <button type="button" className="nav-btn-clear" onClick={handleClear}>
              ✕ Clear
            </button>
          )}
        </div>
      </form>

      {routeInfo && (
        <div className="nav-result-grid">
          <div className="nav-stat">
            <span>Distance</span>
            <strong>{routeInfo.distance_km} km</strong>
          </div>
          <div className="nav-stat">
            <span>Est. Time</span>
            <strong>{routeInfo.duration_min} min</strong>
          </div>
          <div className="nav-stat">
            <span>Traffic</span>
            <strong style={{ color: routeInfo.color }}>
              {routeInfo.traffic_level}
            </strong>
          </div>
          <div className="nav-stat">
            <span>Volume</span>
            <strong>{routeInfo.predicted_traffic_volume.toFixed(0)}</strong>
          </div>
        </div>
      )}
    </div>
  );
};

export default NavigationPanel;
