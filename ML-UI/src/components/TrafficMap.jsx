import { MapContainer, TileLayer, Polyline, CircleMarker } from "react-leaflet";
import { useEffect, useState, useRef } from "react";
import "leaflet/dist/leaflet.css";

const TrafficMap = ({ predictionInput, loading, navRoute }) => {
  const [routeCoords, setRouteCoords] = useState([]);
  const [directionData, setDirectionData] = useState(null);
  const mapRef = useRef(null);   // ✅ Safe alternative to useMap

  // Auto-fit map when navRoute changes — using ref, NOT useMap hook
  useEffect(() => {
    if (navRoute && mapRef.current && navRoute.route_coordinates?.length > 0) {
      mapRef.current.fitBounds(navRoute.route_coordinates, { padding: [50, 50] });
    }
  }, [navRoute]);

  // Fetch directional routes on mount
  useEffect(() => {
    const fetchRoute = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/route");
        const data = await res.json();
        console.log("Routes received:", data.routes?.length);
        setRouteCoords(data.routes || []);
      } catch (err) {
        console.error("Route fetch failed:", err);
      }
    };
    fetchRoute();
  }, []);

  // Fetch directional predictions when form is submitted
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
        clouds_all: Number(predictionInput.clouds_all),
      };

      try {
        const res = await fetch("http://127.0.0.1:8000/predict-directions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
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
        ref={mapRef}   // ✅ Attach ref here instead of useMap
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />

        {/* Existing directional routes — dim slightly when nav route is active */}
        {routeCoords.map((route, index) => {
          const direction = directionNames[Math.floor(index / 2)];
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
                color,
                weight: isIncoming ? 6 : 10,
                opacity: navRoute ? 0.25 : 1,
                dashArray: isIncoming ? "8,10" : null,
              }}
            />
          );
        })}

        {/* Navigation route overlay */}
        {navRoute && navRoute.route_coordinates && (
          <>
            <Polyline
              positions={navRoute.route_coordinates}
              pathOptions={{
                color: navRoute.color,
                weight: 8,
                opacity: 1,
                lineCap: "round",
                lineJoin: "round",
              }}
            />
            <CircleMarker
              center={navRoute.start_point}
              radius={10}
              pathOptions={{ color: "#22d3ee", fillColor: "#22d3ee", fillOpacity: 1, weight: 3 }}
            />
            <CircleMarker
              center={navRoute.end_point}
              radius={10}
              pathOptions={{ color: "#f43f5e", fillColor: "#f43f5e", fillOpacity: 1, weight: 3 }}
            />
          </>
        )}
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
