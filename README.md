# 🚦 TrafficAI

TrafficAI is a full-stack Machine Learning project that predicts traffic congestion and shows it on an interactive 8-lane map.

This project uses a trained ML model on the backend and a React + Leaflet frontend to visualize traffic levels direction-wise.

---

## 🔥 What This Project Does

- Predicts traffic volume using a trained ML model
- Uses lag features and rolling averages
- Takes weather and time inputs
- Shows congestion level (Low / Medium / High)
- Renders an 8-lane intersection (4 directions, incoming + outgoing)
- Colors each direction based on predicted congestion

---

## 🛠 Tech Stack

Frontend:
- React
- Leaflet
- CSS

Backend:
- FastAPI
- Scikit-learn
- Pandas
- NumPy

API Used:
- OpenRouteService (for route drawing)

---

## 📂 Project Structure
ML-PROJECT01/
│
├── ML-Backend/
├── ML-UI/
├── .gitignore
└── README.md

---

## ⚙️ How To Run This Project

### 1️⃣ Backend

Go inside backend folder:
cd ML-Backend

Install dependencies:
pip install -r requirements.txt

Start server:
uvicorn main:app --reload

Note:
The trained model file is not uploaded because it is too large.
Place `TrafficAi-Model.pkl` inside:
ML-Backend/models/

and i hope we all know how frontend starts

---

## 🚀 Future Improvements

- True direction-wise ML model (not simulated multipliers)
- Time-based traffic animation
- Deployment to cloud
- Real weather API integration

---

## 👩‍💻 Author

Built as part of learning full-stack ML and real-time visualization.



