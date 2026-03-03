import React, { useState, useRef } from "react";
import PredictionForm from "../components/PredictionForm";
import ResultBar from "../components/ResultBar";
import TrafficMap from "../components/TrafficMap";
import NavigationPanel from "../components/NavigationPanel";

const Home = () => {
  const [prediction,      setPrediction]      = useState(null);
  const [formInput,       setFormInput]       = useState(null);
  const [loading,         setLoading]         = useState(false);
  const [navRoute,        setNavRoute]        = useState(null);
  const [sliderHour,      setSliderHour]      = useState(12);
  const [sliderPrediction,setSliderPrediction]= useState(null);
  const [sliderLoading,   setSliderLoading]   = useState(false);
  const [activeFormInput, setActiveFormInput] = useState(null); // feeds TrafficMap
  const debounceRef = useRef(null);

  // Shared fetch helper — keeps both handlers DRY
  const fetchPrediction = async (dateTimeStr, base) => {
    const res = await fetch("http://127.0.0.1:8000/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date_time: dateTimeStr,
        holiday:   base.holiday,
        temp:      Number(base.temp),
        rain_1h:   Number(base.rain_1h),
        snow_1h:   Number(base.snow_1h),
        clouds_all:Number(base.clouds_all),
      }),
    });
    return res.json();
  };

  // ── Main form prediction ──────────────────────────────────
  const handlePrediction = async (data) => {
    if (!data.date_time || !data.temp) { alert("Please fill required fields"); return; }
    setLoading(true);
    try {
      setFormInput(data);
      setActiveFormInput(data);
      setSliderPrediction(null);                             // clear stale scrub result
      setSliderHour(new Date(data.date_time).getHours());    // sync slider to chosen hour

      const result = await fetchPrediction(
        data.date_time.replace("T", " ") + ":00", data
      );
      setPrediction(result);
    } catch (err) {
      console.error(err);
      alert("Backend connection failed");
    } finally {
      setLoading(false);
    }
  };

  // ── Slider handler (debounced 300 ms) ────────────────────
  const handleSliderChange = (e) => {
    const hour = Number(e.target.value);
    setSliderHour(hour);
    if (!formInput) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      const base    = new Date(formInput.date_time);
      const pad     = (n) => String(n).padStart(2, "0");
      const datePart= `${base.getFullYear()}-${pad(base.getMonth()+1)}-${pad(base.getDate())}`;
      const newDT   = `${datePart} ${pad(hour)}:00:00`;

      // Build a modified formInput so TrafficMap directional colours update too
      const modifiedInput = {
        ...formInput,
        date_time: `${datePart}T${pad(hour)}:00`,
      };

      setSliderLoading(true);
      try {
        const result = await fetchPrediction(newDT, formInput);
        setSliderPrediction(result);
        setActiveFormInput(modifiedInput);
      } catch (err) {
        console.error("Slider prediction failed:", err);
      } finally {
        setSliderLoading(false);
      }
    }, 300);
  };

  const displayPrediction = sliderPrediction || prediction;

  return (
    <div className="home-wrapper">
      <div className="app-container">

        <div className="page-header">
          <h1 className="page-title">Traffic Intelligence Dashboard</h1>
          <p className="page-subtitle">Real-time congestion prediction · Hyderabad, Telangana</p>
        </div>

        <div className="dashboard-content">
          <div className="map-section">
            <TrafficMap
              predictionInput={activeFormInput}
              loading={loading}
              navRoute={navRoute}
            />

            <ResultBar
              prediction={displayPrediction}
              isSliderActive={!!sliderPrediction}
              sliderLoading={sliderLoading}
              sliderHour={sliderHour}
            />

            {/* ── Timeline Scrubber ── */}
            <div className={`timeline-section ${!formInput ? "timeline-disabled" : ""}`}>
              <div className="timeline-header">
                <p className="timeline-label">⏱ Time Scrubber</p>
                <div className="timeline-right">
                  {!formInput && (
                    <span className="timeline-hint">Run a prediction to enable</span>
                  )}
                  {formInput && (
                    <div className="timeline-display">
                      <span className="timeline-hour">
                        {String(sliderHour).padStart(2, "0")}:00
                      </span>
                      {sliderLoading && (
                        <span className="timeline-updating">updating…</span>
                      )}
                      {sliderPrediction && !sliderLoading && (
                        <span
                          className="timeline-level"
                          style={{ color: sliderPrediction.color }}
                        >
                          {sliderPrediction.traffic_level}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <input
                type="range"
                min="0" max="23"
                value={sliderHour}
                onChange={handleSliderChange}
                disabled={!formInput}
                className="timeline-slider"
              />

              {/* Hour tick marks */}
              <div className="timeline-ticks">
                {["00h","03h","06h","09h","12h","15h","18h","21h","23h"].map((t) => (
                  <span key={t} className="timeline-tick">{t}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="form-section">
            <PredictionForm onPredict={handlePrediction} loading={loading} />
            <NavigationPanel
              formInput={formInput}
              onRouteResult={(data) => setNavRoute(data)}
              onClear={() => setNavRoute(null)}
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default Home;
