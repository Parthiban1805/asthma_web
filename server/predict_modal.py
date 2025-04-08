import sys
import json
import pandas as pd
import joblib

# Load model and preprocessors
model = joblib.load("asthma_model_final_rf.pkl")
scaler = joblib.load("scaler.pkl")
label_encoders = joblib.load("label_encoders.pkl")

# Read input
input_data = json.loads(sys.stdin.read())

# Columns should match training format
columns = ['Age', 'Gender', 'Ethnicity', 'EducationLevel', 'BMI', 'Smoking', 'PhysicalActivity',
           'DietQuality', 'SleepQuality', 'PollutionExposure', 'PollenExposure', 'DustExposure',
           'PetAllergy', 'FamilyHistoryAsthma', 'HistoryOfAllergies', 'Eczema', 'HayFever',
           'GastroesophagealReflux', 'LungFunctionFEV1', 'LungFunctionFVC', 'Wheezing',
           'ShortnessOfBreath', 'ChestTightness', 'Coughing', 'NighttimeSymptoms', 'ExerciseInduced']

df = pd.DataFrame([input_data], columns=columns)
print(df)
# Apply label encoding if required (here we assume Ethnicity & EducationLevel are encoded already)
for col in ['Gender', 'Ethnicity', 'EducationLevel']:
    if col in label_encoders:
        df[col] = label_encoders[col].transform(df[col])

# Scale and predict
scaled = scaler.transform(df)
pred = model.predict(scaled)
prob = model.predict_proba(scaled)[:, 1]

# Output result

print(f"{'Asthma' if pred[0] == 1 else 'No Asthma'}, {prob[0]:.4f}")
