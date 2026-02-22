import React from "react";

const ResultCard = ({ prediction, loading }) => {

  if (loading) {
    return (
      <div className="result-card">
        <h3>Prediction Result</h3>
        <div className="loader"></div>
        <p>Analyzing traffic patterns...</p>
      </div>
    );
  }

  if (!prediction) {
    return (
      <div className="result-card">
        <h3>Prediction Result</h3>
        <p>Fill the form to generate traffic analysis.</p>
      </div>
    );
  }

  return (
    <div className="result-card">
      <h3>Prediction Result</h3>
      <p><strong>Time:</strong> {prediction.time}</p>
      <p><strong>Weather:</strong> {prediction.weather}</p>
      <p><strong>Vehicles:</strong> {prediction.vehicles}</p>
      <p>
        <strong>Traffic Level:</strong>{" "}
        <span
          style={{
            color:
              prediction.trafficLevel === "High Traffic"
                ? "red"
                : prediction.trafficLevel === "Medium Traffic"
                ? "orange"
                : "lightgreen",
          }}
        >
          {prediction.trafficLevel}
        </span>
      </p>
    </div>
  );
};

export default ResultCard;