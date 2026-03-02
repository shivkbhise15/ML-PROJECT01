import React, { useState } from "react";

const PredictionForm = ({ onPredict, loading }) => {
  const [formData, setFormData] = useState({
    date_time: "",
    holiday: "None",
    temp: "",
    rain_1h: "",
    snow_1h: "",
    clouds_all: "",
    auto_history: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Temporary smart defaults for now
    const smartHistory = {
      lag_1: 3200,
      lag_2: 3800,
      lag_24: 4200,
      lag_168: 3900,
      rolling_3: 3950,
      rolling_6: 4100
    };

    onPredict({
      ...formData,
      ...(formData.auto_history ? smartHistory : {})
    });
  };

  return (
    <form className="predict-form-body" onSubmit={handleSubmit}>
      <h2>Traffic Prediction</h2>

      <h4>Time Context</h4>
      <input
        type="datetime-local"
        name="date_time"
        value={formData.date_time}
        onChange={handleChange}
      />

      <select
        name="holiday"
        value={formData.holiday}
        onChange={handleChange}
      >
        <option value="None">Not Holiday</option>
        <option value="Holiday">Holiday</option>
      </select>

      <h4>Weather Conditions</h4>

      <input
        type="number"
        name="temp"
        placeholder="Temperature (°C)"
        value={formData.temp}
        onChange={handleChange}
      />

      <input
        type="number"
        name="rain_1h"
        placeholder="Rain (last 1h)"
        value={formData.rain_1h}
        onChange={handleChange}
      />

      <input
        type="number"
        name="snow_1h"
        placeholder="Snow (last 1h)"
        value={formData.snow_1h}
        onChange={handleChange}
      />

      <input
        type="number"
        name="clouds_all"
        placeholder="Cloud Coverage %"
        value={formData.clouds_all}
        onChange={handleChange}
      />

      <h4>Historical Strategy</h4>

      <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <input
          type="checkbox"
          name="auto_history"
          checked={formData.auto_history}
          onChange={handleChange}
        />
        Auto-compute historical traffic features

      </label>
      <div className="full-width-section">

        {!formData.auto_history && (
          <div className="manual-history-section">
            <h4>Manual Historical Inputs</h4>

            <input type="number" name="lag_1" placeholder="Traffic 1 Hour Ago" onChange={handleChange} />
            <input type="number" name="lag_2" placeholder="Traffic 2 Hours Ago" onChange={handleChange} />
            <input type="number" name="lag_24" placeholder="Traffic 24 Hours Ago" onChange={handleChange} />
            <input type="number" name="lag_168" placeholder="Traffic 168 Hours Ago" onChange={handleChange} />
            <input type="number" name="rolling_3" placeholder="Rolling Mean (3)" onChange={handleChange} />
            <input type="number" name="rolling_6" placeholder="Rolling Mean (6)" onChange={handleChange} />
          </div>
        )}
      </div>

      <button type="submit" disabled={loading}>
        {loading ? "Running Model..." : "Predict Traffic"}
      </button>
    </form>
  );
};

export default PredictionForm;