import React from "react";

const ResultBar = ({ prediction, isSliderActive, sliderLoading, sliderHour }) => {
  if (!prediction) return null;

  return (
    <div className={`result-bar ${isSliderActive ? "result-bar-scrubbed" : ""}`}>

      {/* Scrub indicator pill */}
      {isSliderActive && (
        <div className="scrub-badge">
          <span className="scrub-dot" />
          {sliderLoading
            ? "Updating…"
            : `Showing ${String(sliderHour).padStart(2,"0")}:00 forecast`}
        </div>
      )}

      <div className="result-item">
        <span>Traffic Volume</span>
        <strong style={{ color: "#f1f5f9" }}>
          {prediction.predicted_traffic_volume.toFixed(0)}
          <small style={{ fontSize: 12, fontWeight: 400, color: "#64748b", marginLeft: 4 }}>
            v/hr
          </small>
        </strong>
      </div>

      <div className="result-item">
        <span>Congestion Level</span>
        <strong style={{ color: prediction.color }}>
          {prediction.traffic_level}
          <span style={{
            marginLeft: 8,
            display: "inline-block",
            width: 8, height: 8,
            borderRadius: "50%",
            background: prediction.color,
            boxShadow: `0 0 8px ${prediction.color}`,
            verticalAlign: "middle",
          }} />
        </strong>
      </div>

    </div>
  );
};

export default ResultBar;
