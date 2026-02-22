import React, { useState } from "react";
import PredictionForm from "../components/PredictionForm";
import ResultCard from "../components/ResultCard";

const Home = () => {
  const [prediction, setPrediction] = useState(null);
  const [loading, setloading] = useState(false)
  const handlePrediction = (data) => {
    const vehicleCount = Number(data.vehicles);

    if (!data.time || !data.weather || !data.vehicles) {
      alert("Please fill all fields");
      return;
    }

    if (isNaN(vehicleCount) || vehicleCount < 0) {
      alert("Vehicle count must be a valid positive number");
      return;
    }

    let trafficLevel = "";

    if (vehicleCount > 100) {
      trafficLevel = "High Traffic";
    } else if (vehicleCount >= 50) {
      trafficLevel = "Medium Traffic";
    } else {
      trafficLevel = "Low Traffic";
    }
    setPrediction(null)
    setloading(true);

    setTimeout(() => {
      setPrediction({
        ...data,
        trafficLevel,
      });
      setloading(false);
    }, 1000);
  };

  return (
    <div className="home-wrapper">
    <div className="app-container">
      <h1>Traffic AI Dashboard</h1>
      <p>Predict Traffic Levels Based on Input Conditions</p>

      <div className="dashboard-content">
        <PredictionForm onPredict={handlePrediction} />
        <ResultCard prediction={prediction} loading={loading} />
      </div>
    </div>
    </div>
  );
};

export default Home;