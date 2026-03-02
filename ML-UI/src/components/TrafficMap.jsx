import { MapContainer, TileLayer, Polyline } from "react-leaflet";
import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";

const TrafficMap = ({ predictionInput, loading }) => {

  const [routeCoords, setRouteCoords] = useState([]);
  const [directionData, setDirectionData] = useState(null);

  // FETCH ROUTES
  useEffect(() => {
    const fetchRoute = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/route");
        const data = await res.json();
        console.log("Direcctional api returend")
        setRouteCoords(data.routes);
      } catch (err) {
        console.error("Route fetch failed:", err);
      }
    };

    fetchRoute();
  }, []);

  // FETCH DIRECTIONAL PREDICTION
  useEffect(() => {
    if (!predictionInput) return;

    const fetchDirections = async () => {

      let formattedDate = predictionInput.date_time;

      if (formattedDate.includes("T")) {
        formattedDate = formattedDate.replace("T", " ") + ":00";
      }

      const payload = {
        date_time: formattedDate,
        holiday: predictionInput.holiday || "None",
        temp: Number(predictionInput.temp),
        rain_1h: Number(predictionInput.rain_1h),
        snow_1h: Number(predictionInput.snow_1h),
        clouds_all: Number(predictionInput.clouds_all)
      };

      try {
        const res = await fetch("http://127.0.0.1:8000/predict-directions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        const data = await res.json();
        setDirectionData(data);

      } catch (err) {
        console.error("Directional prediction failed:", err);
      }
    };

    fetchDirections();

  }, [predictionInput]);

  const directionNames = ["North", "South", "East", "West"];

  return (
    <div
      style={{
        width: "100%",
        height: "520px",
        borderRadius: "24px",
        overflow: "hidden",
        position: "relative",
        boxShadow: "0 25px 60px rgba(0,0,0,0.4)",
      }}
    >
      <MapContainer
        center={[17.44036058625879, 78.49537827116433]}
        zoom={18}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />

        {routeCoords.map((route, index) => {

          const directionIndex = Math.floor(index / 2);
          const direction = directionNames[directionIndex];
          const isIncoming = index % 2 !== 0;

          const color =
            directionData && directionData[direction]
              ? directionData[direction].color
              : "#3b82f6";

          return (
            <Polyline
              key={index}
              positions={route}
              pathOptions={{
                color: color,
                weight: isIncoming ? 6 : 10,
                opacity: 1,
                dashArray: isIncoming ? "8,10" : null
              }}
            />
          );
        })}

      </MapContainer>

      {loading && (
        <div className="map-loader">
          <div className="spinner"></div>
        </div>
      )}
    </div>
  );
};

export default TrafficMap;