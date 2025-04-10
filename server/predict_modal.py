import sys
import json
import pandas as pd
import joblib
import traceback

try:
    # Load model and preprocessors
    model = joblib.load("asthma_model_final_rf.pkl")
    scaler = joblib.load("scaler.pkl")
    label_encoders = joblib.load("label_encoders.pkl")

    # Read input data from command line argument
    if len(sys.argv) < 2:
        sys.stderr.write("Error: Missing patient data argument\n")
        sys.exit(1)
        
    input_data = json.loads(sys.argv[1])
    
    # Create DataFrame directly from the JSON object (which should have matching column names)
    df = pd.DataFrame([input_data])
    
    # Make sure we have all required columns
    expected_columns = ['Age', 'Gender', 'Ethnicity', 'EducationLevel', 'BMI', 'Smoking', 'PhysicalActivity',
               'DietQuality', 'SleepQuality', 'PollutionExposure', 'PollenExposure', 'DustExposure',
               'PetAllergy', 'FamilyHistoryAsthma', 'HistoryOfAllergies', 'Eczema', 'HayFever',
               'GastroesophagealReflux', 'LungFunctionFEV1', 'LungFunctionFVC', 'Wheezing',
               'ShortnessOfBreath', 'ChestTightness', 'Coughing', 'NighttimeSymptoms', 'ExerciseInduced']
    
    missing_columns = set(expected_columns) - set(df.columns)
    if missing_columns:
        sys.stderr.write(f"Error: Missing columns: {missing_columns}\n")
        sys.exit(1)
    
    # Apply label encoding only for non-numeric values
    # Since we're already getting encoded values from JavaScript, we'll skip this step
    # but ensure the column types are correct
    df = df.astype(float)
    
    # Scale and predict
    scaled = scaler.transform(df)
    pred = model.predict(scaled)
    prob = model.predict_proba(scaled)[:, 1]
    
    # Output result (clean output for node.js to parse)
    print(f"{'Asthma' if pred[0] == 1 else 'No Asthma'},{prob[0]:.4f}")

except Exception as e:
    sys.stderr.write(f"Error in prediction script: {str(e)}\n")
    sys.stderr.write(traceback.format_exc())
    sys.exit(1)