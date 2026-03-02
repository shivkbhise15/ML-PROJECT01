from fastapi import FastAPI
from pydantic import BaseModel
from datetime import datetime 
import math
import numpy as np
import joblib
import pandas as pd
import os
from fastapi.middleware.cors import CORSMiddleware
import requests
import polyline
from dotenv import load_dotenv

load_dotenv()
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Later restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Get absolute path to model file
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, "models", "TrafficAi-Model.pkl")
DATA_PATH = os.path.join(BASE_DIR, "data", "dataset.csv")

# Load model when server starts
model = joblib.load(MODEL_PATH)
print("Model loaded successfully ")

# Load historical dataset for lag computation

historical_df = pd.read_csv(DATA_PATH)

historical_df["date_time"] = pd.to_datetime(
    historical_df["date_time"],
    dayfirst=True
)

# Make datetime unique by averaging duplicates
historical_df = (
    historical_df
    .groupby("date_time")["traffic_volume"]
    .mean()
    .reset_index()
)

historical_df = historical_df.sort_values("date_time")
historical_df.set_index("date_time", inplace=True)

print("Historical dataset loaded for lag features ")
print(historical_df['traffic_volume'].describe())
print('max:',historical_df['traffic_volume'].max())
historical_df["hour"] = historical_df.index.hour
print(historical_df.groupby("hour")["traffic_volume"].mean())

class TrafficInput(BaseModel):
    date_time: str
    holiday: str
    temp: float
    rain_1h: float
    snow_1h: float
    clouds_all: float

class NavigateInput(BaseModel):
    start_lat: float
    start_lng: float
    end_lat: float
    end_lng: float
    date_time: str
    holiday: str
    temp: float
    rain_1h: float
    snow_1h: float
    clouds_all: float
    lag_1: float
    lag_2: float
    lag_24: float
    lag_168: float
    rolling_3: float
    rolling_6: float
     

class RouteInput(BaseModel):
    start_lat: float
    start_lng: float
    end_lat: float
    end_lng: float

@app.get("/")
def home():
    return {"message": "TrafficAI Backend is running 🚦"}

def predict_traffic_logic(data):
    dt = datetime.strptime(data.date_time, "%Y-%m-%d %H:%M:%S")
    # Find nearest available timestamp in dataset
    dt = pd.to_datetime(dt)

    hour = dt.hour  
# Handle wrap-around (like hour-1 when hour=0)
    def prev_hour(h, offset):
        return (h - offset) % 24

# Typical traffic by hour (mean across dataset)
    hourly_avg = historical_df.groupby(historical_df.index.hour)["traffic_volume"].mean()

    lag_1 = hourly_avg[prev_hour(hour, 1)]
    lag_2 = hourly_avg[prev_hour(hour, 2)]
    lag_24 = hourly_avg[hour]        # same hour previous day pattern
    lag_168 = hourly_avg[hour]       # weekly pattern approximation

    rolling_3 = (
        lag_1 +
        lag_2 +
        hourly_avg[prev_hour(hour, 3)]
    ) / 3

    rolling_6 = (
        lag_1 +
        lag_2 +
        hourly_avg[prev_hour(hour, 3)] +
        hourly_avg[prev_hour(hour, 4)] +
        hourly_avg[prev_hour(hour, 5)] +
        hourly_avg[prev_hour(hour, 6)]
    ) / 6
    # hour = dt.hour
    day_of_week = dt.weekday()

    hour_sin = math.sin(2 * math.pi * hour / 24)
    hour_cos = math.cos(2 * math.pi * hour / 24)

    is_peak_hour = 1 if (7 <= hour <= 10 or 16 <= hour <= 19) else 0
    is_holiday = 0 if data.holiday == "None" else 1

    features = [
        hour_sin,
        hour_cos,
        day_of_week,
        is_peak_hour,
        is_holiday,
        data.temp,
        data.rain_1h,
        data.snow_1h,
        data.clouds_all,
        lag_1,
        lag_2,
        lag_24,
        lag_168,
        rolling_3,
        rolling_6
    ]

    final_input = np.array([features])

    prediction = model.predict(final_input)
    prediction_value = float(prediction[0])

    print("Nearest DT:", dt)
    print("Lag1:", lag_1)
    print("Hour:", hour)
    return prediction_value


@app.post("/predict")
def predict(data: TrafficInput):

    prediction_value = predict_traffic_logic(data)

    if prediction_value < 1500:
        level = "Low"
        color = "green"
    elif prediction_value < 3000:
        level = "Medium"
        color = "orange"
    else:
        level = "High"
        color = "red"

    return {
        "predicted_traffic_volume": prediction_value,
        "traffic_level": level,
        "color": color
    }

@app.post("/navigate")
def navigate(data: RouteInput):

    osrm_url = (
        f"https://router.project-osrm.org/route/v1/driving/"
        f"{data.start_lng},{data.start_lat};"
        f"{data.end_lng},{data.end_lat}"
        f"?overview=full&geometries=geojson"
    )

    response = requests.get(osrm_url)
    route_data = response.json()

    if "routes" not in route_data:
        return {"error": "Route not found"}

    coordinates = route_data["routes"][0]["geometry"]["coordinates"]

    return {
        "route_coordinates": coordinates
    }

import requests
from fastapi import APIRouter

ORS_API_KEY =os.getenv("eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImIyYzAzNzU4ZjcxOTQwOWE4MzQ1Yjk2NDgzMDQ1NmM3IiwiaCI6Im11cm11cjY0In0=")

@app.get("/route")
def get_signal_routes():

    center_lat = 17.44036058625879
    center_lng = 78.49537827116433

    offset = 0.0025

    directions = [
        (center_lat + offset, center_lng),  # North
        (center_lat - offset, center_lng),  # South
        (center_lat, center_lng + offset),  # East
        (center_lat, center_lng - offset),  # West
    ]

    routes = []

    ors_url = "https://api.openrouteservice.org/v2/directions/driving-car"

    headers = {
        "Authorization": ORS_API_KEY,
        "Content-Type": "application/json"
    }

    for end_lat, end_lng in directions:

        body_out = {
            "coordinates": [
                [center_lng, center_lat],
                [end_lng, end_lat]
            ]
        }

        res_out = requests.post(ors_url, json=body_out, headers=headers)

        if res_out.status_code == 200:
            geometry = res_out.json()["routes"][0]["geometry"]
            decoded = polyline.decode(geometry, precision=5)
            routes.append(decoded)

        body_in = {
            "coordinates": [
                [end_lng, end_lat],
                [center_lng, center_lat]
            ]
        }

        res_in = requests.post(ors_url, json=body_in, headers=headers)

        if res_in.status_code == 200:
            geometry = res_in.json()["routes"][0]["geometry"]
            decoded = polyline.decode(geometry, precision=5)
            routes.append(decoded)

    print("Total routes generated:", len(routes))

    return {"routes": routes}

@app.post("/predict-directions")
def predict_directions(data: TrafficInput):

    directions = ["North", "South", "East", "West"]
    results = {}

    base_prediction = predict_traffic_logic(data)

    multipliers = {
        "North": 1.2,
        "South": 0.8,
        "East": 1.5,
        "West": 0.6
    }

    for direction in directions:

        prediction_value = base_prediction * multipliers[direction]

        if prediction_value < 1500:
            level = "Low"
            color = "#16a34a"
        elif prediction_value < 3000:
            level = "Medium"
            color = "#ff9f0a"
        else:
            level = "High"
            color = "#ff3b30"

        results[direction] = {
            "value": round(prediction_value, 0),
            "level": level,
            "color": color
        }

    print("Directional results:", results)

    return results