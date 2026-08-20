import joblib
import pandas as pd

model = joblib.load("models/new_xgb_model.pkl")
feature_columns = joblib.load("models/features_cols.pkl")

print("Model loaded:", type(model))
print("Number of features:", len(feature_columns))

input_data = pd.DataFrame([{
    "machine_type": "CNC",
    "vibration_rms": 4.21,
    "temperature_motor": 87.3,
    "current_phase_avg": 12.4,
    "hours_since_maintenance": 145,
    "pressure_level": 6.8,
    "rpm": 3200
}])

input_encoded = pd.get_dummies(input_data)

input_encoded = input_encoded.reindex(
    columns=feature_columns,
    fill_value=0
)

prediction = model.predict(input_encoded)

print("\nFailure Type Prediction:")
print(prediction)
print(model.classes_)