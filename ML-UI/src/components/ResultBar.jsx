import React from "react";

const ResultBar = ({ prediction }) => {

  if (!prediction) return null;

  return (
    <div className="result-bar">
      <div className="result-item">
        <span>Traffic Volume</span>
        <strong>{prediction.predicted_traffic_volume.toFixed(2)}</strong>
      </div>

      <div className="result-item">
        <span>Congestion Level</span>
        <strong style={{ color: prediction.color }}>
          {prediction.traffic_level}
        </strong>
      </div>
    </div>
  );
};

export default ResultBar;
