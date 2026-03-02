import React, { useState } from "react";
import PredictionForm from "../components/PredictionForm";
import ResultBar from "../components/ResultBar";
import TrafficMap from "../components/TrafficMap";

const Home = () => {

  const [prediction, setPrediction] = useState(null);
  const [formInput, setFormInput] = useState(null);   // ✅ NEW
  const [loading, setLoading] = useState(false);

  const handlePrediction = async (data) => {

    if (!data.date_time || !data.temp) {
      alert("Please fill required fields");
      return;
    }

    setLoading(true);

    try {

      // Save original form input for directional API
      setFormInput(data);   // ✅ THIS IS CRITICAL

      const formattedDate = data.date_time.replace("T", " ") + ":00";

      const response = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          date_time: formattedDate,
          temp: Number(data.temp),
          rain_1h: Number(data.rain_1h),
          snow_1h: Number(data.snow_1h),
          clouds_all: Number(data.clouds_all)
        })
      });

      const result = await response.json();
      setPrediction(result);

    } catch (error) {
      console.error("Error:", error);
      alert("Backend connection failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-wrapper">
      <div className="app-container">
        <div className="dashboard-content">

          <div className="map-section">
            <TrafficMap
              predictionInput={formInput}   // ✅ FIXED
              loading={loading}
            />

            <ResultBar prediction={prediction} />

            <div className="timeline-section">
              <input type="range" min="0" max="23" />
            </div>
          </div>

          <div className="form-section">
            <PredictionForm
              onPredict={handlePrediction}
              loading={loading}
            />
          </div>

        </div>
      </div>
    </div>
  );
};

export default Home;