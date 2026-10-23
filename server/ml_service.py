"""
ExcelInsight Python ML Microservice (FastAPI + scikit-learn)
Dedicated Machine Learning Service for Tabular AutoML, Time-Series Forecasting & Model Inference
As prescribed in the ExcelInsight AIML Project Assessment & Architecture Plan.
"""

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.dummy import DummyRegressor, DummyClassifier
from sklearn.linear_model import LinearRegression, Ridge, LogisticRegression
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier, HistGradientBoostingRegressor, HistGradientBoostingClassifier
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score, accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
import joblib
import os
import datetime

app = FastAPI(
    title="ExcelInsight ML Microservice",
    description="Dedicated scikit-learn AutoML & Forecasting Engine for ExcelInsight",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- Request / Response Models -----------------

class TrainRequest(BaseModel):
    datasetId: Optional[str] = "dataset_active"
    rows: List[Dict[str, Any]]
    targetColumn: str
    taskType: Optional[str] = "regression" # 'regression' | 'classification'
    primaryMetric: Optional[str] = "mae"
    testSize: Optional[float] = 0.2
    randomState: Optional[int] = 42

class ForecastRequest(BaseModel):
    rows: List[Dict[str, Any]]
    dateColumn: str
    valueColumn: str
    horizon: Optional[int] = 6

class PredictRequest(BaseModel):
    features: Dict[str, Any]
    modelArtifactId: Optional[str] = None

# In-memory artifact cache
ARTIFACTS_DIR = os.path.join(os.path.dirname(__file__), "ml_artifacts")
os.makedirs(ARTIFACTS_DIR, exist_ok=True)
CACHE = {}

# ----------------- Endpoints -----------------

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "ExcelInsight Python ML Microservice (FastAPI)",
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "scikit_learn_ready": True
    }

@app.post("/internal/train")
def train_models(payload: TrainRequest):
    try:
        df = pd.DataFrame(payload.rows)
        if df.empty or payload.targetColumn not in df.columns:
            raise HTTPException(status_code=400, detail="Target column not found in dataset rows.")

        y = df[payload.targetColumn]
        X = df.drop(columns=[payload.targetColumn])

        # Detect column types
        num_cols = X.select_dtypes(include=[np.number]).columns.tolist()
        cat_cols = X.select_dtypes(exclude=[np.number]).columns.tolist()

        # Build Preprocessing Pipeline (zero data leakage)
        num_transformer = Pipeline(steps=[
            ('imputer', SimpleImputer(strategy='median')),
            ('scaler', StandardScaler())
        ])
        cat_transformer = Pipeline(steps=[
            ('imputer', SimpleImputer(strategy='most_frequent')),
            ('onehot', OneHotEncoder(handle_unknown='ignore', sparse_output=False))
        ])

        preprocessor = ColumnTransformer(
            transformers=[
                ('num', num_transformer, num_cols),
                ('cat', cat_transformer, cat_cols)
            ]
        )

        # Train / Test holdout split
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=payload.testSize, random_state=payload.randomState
        )

        results = []

        if payload.taskType == "classification":
            models = {
                "dummy": ("Baseline (Majority Class)", DummyClassifier(strategy="most_frequent"), True),
                "logistic_regression": ("Logistic Regression", LogisticRegression(max_iter=500), False),
                "random_forest": ("Random Forest Classifier", RandomForestClassifier(n_estimators=50, random_state=42), False),
                "hist_gradient_boosting": ("Hist Gradient Boosting Classifier", HistGradientBoostingClassifier(random_state=42), False)
            }

            for algo_key, (name, clf, is_baseline) in models.items():
                pipe = Pipeline(steps=[('preprocessor', preprocessor), ('classifier', clf)])
                pipe.fit(X_train, y_train)
                preds = pipe.predict(X_test)

                acc = float(accuracy_score(y_test, preds))
                f1 = float(f1_score(y_test, preds, average='weighted', zero_division=0))
                prec = float(precision_score(y_test, preds, average='weighted', zero_division=0))
                rec = float(recall_score(y_test, preds, average='weighted', zero_division=0))

                results.append({
                    "algorithm": algo_key,
                    "name": name,
                    "isBaseline": is_baseline,
                    "accuracy": round(acc * 100, 2),
                    "f1": round(f1 * 100, 2),
                    "precision": round(prec * 100, 2),
                    "recall": round(rec * 100, 2),
                    "primaryMetricValue": round(f1 * 100, 2)
                })

            results.sort(key=lambda r: r["f1"], reverse=True)
            for idx, r in enumerate(results):
                r["rank"] = idx + 1

            best_pipe = Pipeline(steps=[('preprocessor', preprocessor), ('classifier', RandomForestClassifier(n_estimators=50, random_state=42))])
            best_pipe.fit(X, y)
            joblib.dump(best_pipe, os.path.join(ARTIFACTS_DIR, "best_model.joblib"))

            return {
                "success": True,
                "taskType": "classification",
                "targetColumn": payload.targetColumn,
                "trainSize": len(X_train),
                "testSize": len(X_test),
                "models": results,
                "bestModel": results[0]
            }

        else: # Regression
            models = {
                "dummy": ("Baseline (Mean Regressor)", DummyRegressor(strategy="mean"), True),
                "linear_regression": ("Linear Regression (OLS)", LinearRegression(), False),
                "ridge": ("Ridge Regression (L2 Regularized)", Ridge(alpha=1.0), False),
                "random_forest": ("Random Forest Regressor", RandomForestRegressor(n_estimators=50, random_state=42), False),
                "hist_gradient_boosting": ("Hist Gradient Boosting Regressor", HistGradientBoostingRegressor(random_state=42), False)
            }

            for algo_key, (name, reg, is_baseline) in models.items():
                pipe = Pipeline(steps=[('preprocessor', preprocessor), ('regressor', reg)])
                pipe.fit(X_train, y_train)
                preds = pipe.predict(X_test)

                mae = float(mean_absolute_error(y_test, preds))
                rmse = float(np.sqrt(mean_squared_error(y_test, preds)))
                r2 = float(r2_score(y_test, preds))

                results.append({
                    "algorithm": algo_key,
                    "name": name,
                    "isBaseline": is_baseline,
                    "mae": round(mae, 2),
                    "rmse": round(rmse, 2),
                    "r2": round(r2, 4),
                    "primaryMetricValue": round(mae, 2)
                })

            results.sort(key=lambda r: r["mae"]) # Ascending for error
            for idx, r in enumerate(results):
                r["rank"] = idx + 1

            best_pipe = Pipeline(steps=[('preprocessor', preprocessor), ('regressor', RandomForestRegressor(n_estimators=50, random_state=42))])
            best_pipe.fit(X, y)
            joblib.dump(best_pipe, os.path.join(ARTIFACTS_DIR, "best_model.joblib"))

            # Calculate Feature Importances
            feature_names = num_cols + cat_cols
            weights = best_pipe.named_steps['regressor'].feature_importances_ if hasattr(best_pipe.named_steps['regressor'], 'feature_importances_') else [1.0] * len(feature_names)
            feat_imp = []
            for i, fn in enumerate(feature_names[:len(weights)]):
                feat_imp.append({"feature": fn, "importance": round(float(weights[i]), 3)})

            return {
                "success": True,
                "taskType": "regression",
                "targetColumn": payload.targetColumn,
                "trainSize": len(X_train),
                "testSize": len(X_test),
                "models": results,
                "bestModel": results[0],
                "featureImportance": feat_imp
            }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/internal/forecast")
def forecast(payload: ForecastRequest):
    try:
        df = pd.DataFrame(payload.rows)
        df[payload.dateColumn] = pd.to_datetime(df[payload.dateColumn])
        df = df.sort_values(payload.dateColumn)
        
        y = df[payload.valueColumn].astype(float).values
        n = len(y)
        
        # Exponential Smoothing Baseline
        alpha = 0.35
        beta = 0.15
        level = y[0]
        trend = (y[1] - y[0]) if n > 1 else 0
        
        for t in range(1, n):
            prev_l = level
            level = alpha * y[t] + (1 - alpha) * (level + trend)
            trend = beta * (level - prev_l) + (1 - beta) * trend
            
        std_err = float(np.std(np.diff(y))) if n > 2 else float(y[-1] * 0.05)
        
        future = []
        last_date = df[payload.dateColumn].iloc[-1]
        for h in range(1, payload.horizon + 1):
            next_date = last_date + pd.DateOffset(months=h)
            pred_val = float(max(0, level + h * trend))
            margin = float(1.96 * std_err * np.sqrt(h))
            future.append({
                "step": h,
                "date": next_date.strftime("%Y-%m"),
                "predicted": round(pred_val, 2),
                "lowerBound": round(max(0, pred_val - margin), 2),
                "upperBound": round(pred_val + margin, 2)
            })
            
        return {
            "success": True,
            "historical": [{"date": str(d)[:7], "value": float(v)} for d, v in zip(df[payload.dateColumn], y)],
            "forecast": future,
            "metrics": {
                "horizonSteps": payload.horizon,
                "trend": "Positive Growth" if trend > 0 else "Decline"
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("ml_service:app", host="0.0.0.0", port=8001, reload=True)
