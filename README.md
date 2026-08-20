________________________________
--------Project Overview--------
________________________________

Unplanned industrial machine downtime results in substantial operational and financial losses. This project implements a full machine learning lifecycle:

1. Exploratory Data Analysis & Modeling: Sensor telemetry preprocessing, feature engineering, and training high-performance classification models
    (XGBoost / Random Forest).
3. REST API Backend: A FastAPI microservice serving predictions with input validation.
4. Interactive Frontend Dashboard: A responsive web UI enabling operators to input live sensor telemetry, visualize health status, and receive preventive
   maintenance recommendations.

________________________________
-Architecture and Data Pipeline-
________________________________

[ Sensor Telemetry ] ──> [ Web Dashboard (UI) ] 
                                  │ (JSON POST)
                                  ▼
                        [ FastAPI Backend ]
                                  │ 
                                  ▼
                      [ ML Inference Pipeline ]
                        ├── Binary Classifier: Failure in 24h (Yes / No)
                        └── Multi-class Classifier: Fault Type (Bearing / Overheat / etc.)
                                  │
                                  ▼
                        [ Health Assessment & Recommendations ]
____________________________________________________________________________________________


_______________________________
------Project Structure--------
_______________________________

PDM_main/
├── pdm_backend/
│   ├── models/
│   │   ├── features_cols.pkl       # Serialized input feature list
│   │   ├── new_xgb_model.pkl       # Multi-class failure type model
│   │   └── xgb_model_24hrs.pkl     # Binary 24-hour failure prediction model
│   ├── main.py                     # FastAPI application entry point
│   ├── requirements.txt            # Python dependencies
│   └── testModel.py                # Standalone model test script
├── pdm_frontend/
│   ├── index.html                  # Main operator interface
│   ├── script.js                   # Client-side API integration & UI state logic
│   └── style.css                   # Custom UI styling & responsive design
├── pdm.ipynb                       # Model training, data exploration & evaluation
├── .gitignore                      # Git ignore rules for environments/cache
└── README.md
