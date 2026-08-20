from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import joblib


# =====================================================
# APP
# =====================================================

app = FastAPI(
    title="Predictive Maintenance API",
    description="Predictive maintenance system using XGBoost",
    version="1.0"
)


# =====================================================
# CORS
# =====================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =====================================================
# LOAD MODELS
# =====================================================

failure_24h_model = joblib.load("models/xgb_model_24hrs.pkl")

failure_type_model = joblib.load("models/new_xgb_model.pkl")

feature_columns = joblib.load("models/features_cols.pkl")

failure_type_labels = {
    0: "bearing",
    1: "electrical",
    2: "hydraulic",
    3: "motor_overheat",
    4: "none"
}

# =====================================================
# REQUEST MODEL
# =====================================================

class MachineData(BaseModel):

    machine_type: str

    vibration_rms: float

    temperature_motor: float

    current_phase_avg: float

    hours_since_maintenance: float

    pressure_level: float

    rpm: float


# =====================================================
# HOME
# =====================================================

@app.get("/")
def home():

    return {
        "message": "Predictive Maintenance API is running"
    }


# =====================================================
# PREDICTION
# =====================================================

@app.post("/predict")
def predict(data: MachineData):

    # ---------------------------------------------
    # Convert request into DataFrame
    # ---------------------------------------------

    input_data = pd.DataFrame([
        {
            "machine_type": data.machine_type,
            "vibration_rms": data.vibration_rms,
            "temperature_motor": data.temperature_motor,
            "current_phase_avg": data.current_phase_avg,
            "hours_since_maintenance":data.hours_since_maintenance,
            "pressure_level": data.pressure_level,
            "rpm": data.rpm
        }
    ])


    # ---------------------------------------------
    # One-hot encoding
    # ---------------------------------------------

    input_encoded = pd.get_dummies(
        input_data
    )


    # ---------------------------------------------
    # Match training columns
    # ---------------------------------------------

    input_encoded = input_encoded.reindex(
        columns=feature_columns,
        fill_value=0
    )


    # ---------------------------------------------
    # Failure within 24 hours
    # ---------------------------------------------

    failure_24h_prediction = (
        failure_24h_model.predict(
            input_encoded
        )[0]
    )


    # ---------------------------------------------
    # Failure type
    # ---------------------------------------------

    failure_type_prediction = (
        failure_type_model.predict(
            input_encoded
        )[0]
    )

    failure_type = failure_type_labels[int(failure_type_prediction)]

    # ---------------------------------------------
    # Return response
    # ---------------------------------------------

    return {

        "machine_type":
            data.machine_type,

        "failure_within_24h":
            bool(failure_24h_prediction),

        "failure_type": failure_type
    }