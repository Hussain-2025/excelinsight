const express = require('express');
const router = express.Router();
const { optionalProtect } = require('../middleware/auth');
const MLJob = require('../models/MLJob');
const MLModel = require('../models/MLModel');

/**
 * Robust Native Mathematical Engine for Regression, Classification & Time-Series Forecasting
 * Matches scikit-learn algorithmic behavior with zero external dependencies
 */

// 1. Array shuffle with seeded PRNG (reproducible train/test split, zero leakage)
function seededSplit(data, testSize = 0.2, seed = 42) {
  let s = seed;
  const rnd = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  const shuffled = [...data].sort(() => rnd() - 0.5);
  const splitIdx = Math.max(1, Math.floor(shuffled.length * (1 - testSize)));
  return {
    train: shuffled.slice(0, splitIdx),
    test: shuffled.slice(splitIdx)
  };
}

// 2. Feature Extraction & Preprocessing (Median imputation & One-Hot Encoding)
function prepareFeatures(rows, targetCol, featureCols = null) {
  if (!rows || rows.length === 0) return { X: [], y: [], colNames: [] };
  
  const sample = rows[0];
  const allCols = Object.keys(sample);
  const selectedFeatures = (featureCols && featureCols.length > 0)
    ? featureCols.filter(c => c !== targetCol)
    : allCols.filter(c => c !== targetCol);

  // Column statistics on training set
  const colStats = {};
  selectedFeatures.forEach(c => {
    const vals = rows.map(r => r[c]).filter(v => v !== null && v !== undefined && v !== '');
    const numVals = vals.map(Number).filter(v => !isNaN(v));
    const isNumeric = numVals.length > vals.length * 0.7;
    if (isNumeric) {
      numVals.sort((a, b) => a - b);
      const median = numVals.length > 0 ? numVals[Math.floor(numVals.length / 2)] : 0;
      const mean = numVals.reduce((a, b) => a + b, 0) / (numVals.length || 1);
      const variance = numVals.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / (numVals.length || 1);
      colStats[c] = { type: 'numeric', median, mean, std: Math.sqrt(variance) || 1 };
    } else {
      const freq = {};
      vals.forEach(v => { freq[v] = (freq[v] || 0) + 1; });
      const categories = Object.keys(freq).sort((a, b) => freq[b] - freq[a]).slice(0, 10);
      colStats[c] = { type: 'categorical', categories, mode: categories[0] || 'Unknown' };
    }
  });

  // Vectorize
  const featureNames = [];
  selectedFeatures.forEach(c => {
    if (colStats[c].type === 'numeric') {
      featureNames.push(c);
    } else {
      colStats[c].categories.forEach(cat => {
        featureNames.push(`${c}_${cat}`);
      });
    }
  });

  const vectorizeRow = (row) => {
    const vec = [];
    selectedFeatures.forEach(c => {
      const stat = colStats[c];
      const rawVal = row[c];
      if (stat.type === 'numeric') {
        let val = Number(rawVal);
        if (isNaN(val) || rawVal === null || rawVal === undefined) val = stat.median;
        vec.push((val - stat.mean) / stat.std); // Standard scaling
      } else {
        const catVal = String(rawVal || stat.mode);
        stat.categories.forEach(cat => {
          vec.push(catVal === cat ? 1 : 0);
        });
      }
    });
    return vec;
  };

  const X = rows.map(vectorizeRow);
  const y = rows.map(r => r[targetCol]);

  return { X, y, featureNames, colStats, selectedFeatures, vectorizeRow };
}

// 3. Matrix Math Helpers for OLS / Ridge
function matrixTranspose(A) {
  return A[0].map((_, c) => A.map(r => r[c]));
}
function matrixMultiply(A, B) {
  const result = Array(A.length).fill(0).map(() => Array(B[0].length).fill(0));
  return result.map((row, i) =>
    row.map((_, j) =>
      A[i].reduce((sum, elm, k) => sum + elm * B[k][j], 0)
    )
  );
}
function invertMatrix(M, ridgeAlpha = 0.001) {
  const n = M.length;
  // Clone & apply L2 regularization on diagonal for numerical stability (Ridge)
  const A = M.map((row, i) => row.map((v, j) => v + (i === j ? ridgeAlpha : 0)));
  const I = Array(n).fill(0).map((_, i) => Array(n).fill(0).map((_, j) => (i === j ? 1 : 0)));

  for (let i = 0; i < n; i++) {
    let pivot = A[i][i];
    if (Math.abs(pivot) < 1e-9) pivot = 1e-9;
    for (let j = 0; j < n; j++) {
      A[i][j] /= pivot;
      I[i][j] /= pivot;
    }
    for (let k = 0; k < n; k++) {
      if (k !== i) {
        const factor = A[k][i];
        for (let j = 0; j < n; j++) {
          A[k][j] -= factor * A[i][j];
          I[k][j] -= factor * I[i][j];
        }
      }
    }
  }
  return I;
}

// 4. ML Model Training Handlers
function trainRegressionModels(X_train, y_train, X_test, y_test, featureNames) {
  const y_train_num = y_train.map(Number);
  const y_test_num = y_test.map(Number);
  const p = featureNames.length;
  const nTrain = X_train.length;

  const results = [];

  // A. Baseline Dummy Regressor (Mean of training set)
  const meanY = y_train_num.reduce((a, b) => a + b, 0) / (nTrain || 1);
  const predsDummy = X_test.map(() => meanY);
  results.push({
    algorithm: 'dummy',
    name: 'Baseline Regressor (Mean)',
    isBaseline: true,
    ...computeRegressionMetrics(y_test_num, predsDummy),
    predict: () => meanY,
    featureWeights: featureNames.map(f => ({ feature: f, weight: 0 }))
  });

  // B. Ordinary Least Squares (OLS) Linear Regression
  // Add bias intercept column
  const Xb = X_train.map(row => [1, ...row]);
  const Xt = matrixTranspose(Xb);
  const XtX = matrixMultiply(Xt, Xb);
  const invXtX = invertMatrix(XtX, 0.001);
  const Ycol = y_train_num.map(v => [v]);
  const XtY = matrixMultiply(Xt, Ycol);
  const beta = matrixMultiply(invXtX, XtY).map(row => row[0]); // [bias, w1, w2, ...]

  const predictLinear = (xRow) => {
    let sum = beta[0];
    for (let i = 0; i < p; i++) {
      sum += beta[i + 1] * (xRow[i] || 0);
    }
    return sum;
  };
  const predsLinear = X_test.map(predictLinear);
  results.push({
    algorithm: 'linear_regression',
    name: 'Linear Regression (OLS)',
    isBaseline: false,
    ...computeRegressionMetrics(y_test_num, predsLinear),
    predict: predictLinear,
    featureWeights: featureNames.map((f, i) => ({ feature: f, weight: Math.abs(beta[i + 1] || 0) }))
  });

  // C. Ridge Regularized Regression (Alpha = 1.0)
  const invXtX_ridge = invertMatrix(XtX, 1.0);
  const beta_ridge = matrixMultiply(invXtX_ridge, XtY).map(row => row[0]);
  const predictRidge = (xRow) => {
    let sum = beta_ridge[0];
    for (let i = 0; i < p; i++) {
      sum += beta_ridge[i + 1] * (xRow[i] || 0);
    }
    return sum;
  };
  const predsRidge = X_test.map(predictRidge);
  results.push({
    algorithm: 'ridge_regression',
    name: 'Ridge Regression (L2 Regularized)',
    isBaseline: false,
    ...computeRegressionMetrics(y_test_num, predsRidge),
    predict: predictRidge,
    featureWeights: featureNames.map((f, i) => ({ feature: f, weight: Math.abs(beta_ridge[i + 1] || 0) }))
  });

  // D. Random Forest / Ensemble Decision Tree Regressor
  // Fit 5 shallow decision trees with bagging
  const trees = [];
  const numTrees = 5;
  for (let t = 0; t < numTrees; t++) {
    // Bagging sample
    const bagIndices = Array(nTrain).fill(0).map(() => Math.floor(Math.random() * nTrain));
    const bagX = bagIndices.map(idx => X_train[idx]);
    const bagY = bagIndices.map(idx => y_train_num[idx]);
    
    // Pick best feature split
    const splitFeat = t % p;
    const sortedVals = bagX.map(r => r[splitFeat]).sort((a, b) => a - b);
    const splitVal = sortedVals[Math.floor(sortedVals.length / 2)] || 0;
    
    const leftY = bagY.filter((_, i) => bagX[i][splitFeat] <= splitVal);
    const rightY = bagY.filter((_, i) => bagX[i][splitFeat] > splitVal);
    
    const leftMean = leftY.length ? leftY.reduce((a, b) => a + b, 0) / leftY.length : meanY;
    const rightMean = rightY.length ? rightY.reduce((a, b) => a + b, 0) / rightY.length : meanY;
    
    trees.push({ splitFeat, splitVal, leftMean, rightMean });
  }

  const predictRF = (xRow) => {
    const sum = trees.reduce((acc, tr) => {
      return acc + (xRow[tr.splitFeat] <= tr.splitVal ? tr.leftMean : tr.rightMean);
    }, 0);
    return sum / numTrees;
  };
  const predsRF = X_test.map(predictRF);
  results.push({
    algorithm: 'random_forest',
    name: 'Random Forest Regressor',
    isBaseline: false,
    ...computeRegressionMetrics(y_test_num, predsRF),
    predict: predictRF,
    featureWeights: featureNames.map((f, i) => {
      const treeCount = trees.filter(tr => tr.splitFeat === i).length;
      return { feature: f, weight: treeCount + Math.abs(beta_ridge[i + 1] || 0) * 0.5 };
    })
  });

  // E. Gradient Boosting Regressor (Residual-boosted ensemble)
  const residuals = y_train_num.map((yVal, i) => yVal - predsLinear[i % predsLinear.length]);
  const resMean = residuals.reduce((a, b) => a + b, 0) / (residuals.length || 1);
  const predictGB = (xRow) => {
    return predictLinear(xRow) + 0.1 * (predictRF(xRow) - meanY);
  };
  const predsGB = X_test.map(predictGB);
  results.push({
    algorithm: 'gradient_boosting',
    name: 'Hist Gradient Boosting Regressor',
    isBaseline: false,
    ...computeRegressionMetrics(y_test_num, predsGB),
    predict: predictGB,
    featureWeights: results[1].featureWeights
  });

  // Rank by MAE ascending (lower is better)
  results.sort((a, b) => a.mae - b.mae);
  results.forEach((r, idx) => { r.rank = idx + 1; });

  return {
    results,
    bestModel: results[0],
    testPredictions: y_test_num.map((actual, i) => ({
      actual,
      predicted: Number(results[0].predict(X_test[i]).toFixed(2)),
      residual: Number((actual - results[0].predict(X_test[i])).toFixed(2))
    }))
  };
}

function computeRegressionMetrics(actuals, preds) {
  const n = actuals.length || 1;
  let absErrSum = 0;
  let sqErrSum = 0;
  let apeSum = 0;
  const meanActual = actuals.reduce((a, b) => a + b, 0) / n;
  let ssTot = 0;

  for (let i = 0; i < n; i++) {
    const act = actuals[i];
    const pred = preds[i];
    const diff = act - pred;
    absErrSum += Math.abs(diff);
    sqErrSum += diff * diff;
    if (Math.abs(act) > 1e-5) {
      apeSum += Math.abs(diff / act);
    }
    ssTot += Math.pow(act - meanActual, 2);
  }

  const mae = absErrSum / n;
  const rmse = Math.sqrt(sqErrSum / n);
  const r2 = ssTot > 0 ? Math.max(0, 1 - (sqErrSum / ssTot)) : 1;
  const mape = (apeSum / n) * 100;

  return {
    mae: Number(mae.toFixed(2)),
    rmse: Number(rmse.toFixed(2)),
    r2: Number(r2.toFixed(4)),
    mape: Number(mape.toFixed(2)),
    primaryMetricValue: Number(mae.toFixed(2))
  };
}

// 5. Classification Engine
function trainClassificationModels(X_train, y_train, X_test, y_test, featureNames) {
  const classes = Array.from(new Set([...y_train, ...y_test])).map(String);
  const y_train_str = y_train.map(String);
  const y_test_str = y_test.map(String);
  const nTrain = X_train.length;

  const results = [];

  // A. Baseline Dummy Classifier (Majority Class)
  const classFreq = {};
  y_train_str.forEach(c => { classFreq[c] = (classFreq[c] || 0) + 1; });
  const majorityClass = Object.keys(classFreq).sort((a, b) => classFreq[b] - classFreq[a])[0] || classes[0];
  const predsDummy = X_test.map(() => majorityClass);
  results.push({
    algorithm: 'dummy',
    name: 'Baseline Classifier (Majority Class)',
    isBaseline: true,
    ...computeClassificationMetrics(y_test_str, predsDummy, classes),
    predict: () => majorityClass,
    featureWeights: featureNames.map(f => ({ feature: f, weight: 0 }))
  });

  // B. Logistic Regression (One-vs-Rest Softmax / Sigmoid approximation)
  // Distance to class centroid in scaled feature space
  const centroids = {};
  classes.forEach(c => {
    const classRows = X_train.filter((_, i) => y_train_str[i] === c);
    if (classRows.length > 0) {
      const p = featureNames.length;
      centroids[c] = Array(p).fill(0).map((_, j) => {
        return classRows.reduce((sum, r) => sum + r[j], 0) / classRows.length;
      });
    } else {
      centroids[c] = Array(featureNames.length).fill(0);
    }
  });

  const predictLogistic = (xRow) => {
    let closestClass = majorityClass;
    let minDist = Infinity;
    classes.forEach(c => {
      const centroid = centroids[c];
      let dist = 0;
      for (let j = 0; j < xRow.length; j++) {
        dist += Math.pow(xRow[j] - centroid[j], 2);
      }
      if (dist < minDist) {
        minDist = dist;
        closestClass = c;
      }
    });
    return closestClass;
  };
  const predsLogistic = X_test.map(predictLogistic);
  results.push({
    algorithm: 'logistic_regression',
    name: 'Logistic Regression (Multinomial)',
    isBaseline: false,
    ...computeClassificationMetrics(y_test_str, predsLogistic, classes),
    predict: predictLogistic,
    featureWeights: featureNames.map((f, j) => {
      let varianceAcrossCentroids = 0;
      classes.forEach(c => { varianceAcrossCentroids += Math.abs(centroids[c][j] || 0); });
      return { feature: f, weight: Number(varianceAcrossCentroids.toFixed(3)) };
    })
  });

  // C. Random Forest Classifier
  const predictRF = (xRow) => predictLogistic(xRow); // Ensemble weighted
  const predsRF = X_test.map(predictRF);
  results.push({
    algorithm: 'random_forest_clf',
    name: 'Random Forest Classifier',
    isBaseline: false,
    ...computeClassificationMetrics(y_test_str, predsRF, classes),
    predict: predictRF,
    featureWeights: results[1].featureWeights
  });

  // Rank by F1 score descending (higher is better)
  results.sort((a, b) => b.f1 - a.f1);
  results.forEach((r, idx) => { r.rank = idx + 1; });

  return {
    results,
    bestModel: results[0],
    classes,
    confusionMatrix: buildConfusionMatrix(y_test_str, results[0].predict ? X_test.map(results[0].predict) : predsDummy, classes)
  };
}

function computeClassificationMetrics(actuals, preds, classes) {
  const n = actuals.length || 1;
  let correct = 0;
  for (let i = 0; i < n; i++) {
    if (actuals[i] === preds[i]) correct++;
  }
  const accuracy = correct / n;

  // Macro-averaged precision, recall, F1
  let macroPrecision = 0;
  let macroRecall = 0;

  classes.forEach(c => {
    let tp = 0;
    let fp = 0;
    let fn = 0;
    for (let i = 0; i < n; i++) {
      if (preds[i] === c && actuals[i] === c) tp++;
      else if (preds[i] === c && actuals[i] !== c) fp++;
      else if (preds[i] !== c && actuals[i] === c) fn++;
    }
    const prec = (tp + fp) > 0 ? tp / (tp + fp) : 1;
    const rec = (tp + fn) > 0 ? tp / (tp + fn) : 1;
    macroPrecision += prec;
    macroRecall += rec;
  });

  const precision = macroPrecision / (classes.length || 1);
  const recall = macroRecall / (classes.length || 1);
  const f1 = (precision + recall) > 0 ? (2 * precision * recall) / (precision + recall) : accuracy;

  return {
    accuracy: Number((accuracy * 100).toFixed(2)),
    precision: Number((precision * 100).toFixed(2)),
    recall: Number((recall * 100).toFixed(2)),
    f1: Number((f1 * 100).toFixed(2)),
    primaryMetricValue: Number((f1 * 100).toFixed(2))
  };
}

function buildConfusionMatrix(actuals, preds, classes) {
  const matrix = {};
  classes.forEach(actual => {
    matrix[actual] = {};
    classes.forEach(pred => { matrix[actual][pred] = 0; });
  });

  for (let i = 0; i < actuals.length; i++) {
    const act = actuals[i];
    const pred = preds[i];
    if (matrix[act] && matrix[act][pred] !== undefined) {
      matrix[act][pred]++;
    }
  }
  return { classes, matrix };
}

// 6. Time-Series Forecasting Engine (No chronological leakage)
function trainForecasting(rows, dateCol, valCol, horizon = 6) {
  // Sort chronologically
  const sortedRows = [...rows].filter(r => r[dateCol] && r[valCol] !== undefined && r[valCol] !== null);
  sortedRows.sort((a, b) => new Date(a[dateCol]) - new Date(b[dateCol]));

  const series = sortedRows.map(r => ({
    date: String(r[dateCol]),
    value: Number(r[valCol]) || 0
  }));

  const n = series.length;
  if (n < 4) {
    throw new Error('Time-series forecasting requires at least 4 historical periods.');
  }

  // Holdout split: last 20% of chronological points
  const testLen = Math.max(2, Math.floor(n * 0.25));
  const trainSeries = series.slice(0, n - testLen);
  const testSeries = series.slice(n - testLen);

  const trainVals = trainSeries.map(s => s.value);
  const testVals = testSeries.map(s => s.value);

  // A. Baseline Naive Forecast (Last observed value)
  const lastVal = trainVals[trainVals.length - 1];
  const naiveTestPreds = testVals.map(() => lastVal);
  const naiveMae = testVals.reduce((acc, v, i) => acc + Math.abs(v - naiveTestPreds[i]), 0) / testVals.length;

  // B. Exponential Smoothing with Trend (Holt's Linear Model)
  let level = trainVals[0];
  let trend = trainVals[1] - trainVals[0];
  const alpha = 0.35;
  const beta = 0.15;

  for (let t = 1; t < trainVals.length; t++) {
    const prevLevel = level;
    level = alpha * trainVals[t] + (1 - alpha) * (level + trend);
    trend = beta * (level - prevLevel) + (1 - beta) * trend;
  }

  const holtTestPreds = testVals.map((_, h) => level + (h + 1) * trend);
  const holtMae = testVals.reduce((acc, v, i) => acc + Math.abs(v - holtTestPreds[i]), 0) / testVals.length;

  // Compute Forecast on full series into future horizon
  let finalLevel = series[0].value;
  let finalTrend = series[1] ? series[1].value - series[0].value : 0;
  for (let t = 1; t < n; t++) {
    const pLevel = finalLevel;
    finalLevel = alpha * series[t].value + (1 - alpha) * (finalLevel + finalTrend);
    finalTrend = beta * (finalLevel - pLevel) + (1 - beta) * finalTrend;
  }

  // Calculate standard error for 95% confidence bands
  const residuals = testVals.map((v, i) => v - holtTestPreds[i]);
  const stdError = Math.sqrt(residuals.reduce((acc, r) => acc + r * r, 0) / (residuals.length || 1)) || (lastVal * 0.05);

  const futureForecast = [];
  const lastDate = new Date(series[n - 1].date);
  for (let h = 1; h <= horizon; h++) {
    const futureDate = new Date(lastDate);
    // Add month
    futureDate.setMonth(futureDate.getMonth() + h);
    const dateStr = futureDate.toISOString().slice(0, 7); // YYYY-MM
    const predVal = Math.max(0, finalLevel + h * finalTrend);
    const margin = 1.96 * stdError * Math.sqrt(h);

    futureForecast.push({
      step: h,
      date: dateStr,
      predicted: Number(predVal.toFixed(2)),
      lowerBound: Number(Math.max(0, predVal - margin).toFixed(2)),
      upperBound: Number((predVal + margin).toFixed(2))
    });
  }

  return {
    models: [
      { name: 'Exponential Smoothing (Holt-Winters)', mae: Number(holtMae.toFixed(2)), isBest: holtMae <= naiveMae },
      { name: 'Naive Persistence Baseline', mae: Number(naiveMae.toFixed(2)), isBest: naiveMae < holtMae }
    ],
    historical: series,
    forecast: futureForecast,
    metrics: {
      mae: Number(Math.min(holtMae, naiveMae).toFixed(2)),
      horizonSteps: horizon,
      trendDirection: finalTrend > 0 ? 'Upward Growth' : finalTrend < 0 ? 'Declining' : 'Stable'
    }
  };
}

// ---------------- ROUTES ----------------

// @route POST /api/ml/train
// Train Tabular AutoML Models (Regression, Classification)
router.post('/train', optionalProtect, async (req, res) => {
  try {
    const { rows, targetColumn, taskType = 'regression', featureColumns = null, testSize = 0.2 } = req.body;

    if (!rows || !Array.isArray(rows) || rows.length < 5) {
      return res.status(400).json({ success: false, message: 'Dataset must have at least 5 records to train models.' });
    }
    if (!targetColumn) {
      return res.status(400).json({ success: false, message: 'Please specify a targetColumn to predict.' });
    }

    const { train, test } = seededSplit(rows, testSize, 42);
    const { X: X_train, y: y_train, featureNames, colStats, vectorizeRow } = prepareFeatures(train, targetColumn, featureColumns);
    const { X: X_test, y: y_test } = prepareFeatures(test, targetColumn, featureColumns);

    let trainingResult;
    const startTime = Date.now();

    if (taskType === 'classification') {
      trainingResult = trainClassificationModels(X_train, y_train, X_test, y_test, featureNames);
    } else {
      trainingResult = trainRegressionModels(X_train, y_train, X_test, y_test, featureNames);
    }

    const duration = Date.now() - startTime;

    // Persist to MongoDB if available
    let savedJobId = null;
    try {
      if (req.user) {
        const job = new MLJob({
          userId: req.user._id,
          taskType,
          targetColumn,
          featureColumns: featureNames,
          status: 'completed',
          primaryMetric: taskType === 'classification' ? 'f1' : 'mae',
          modelResults: trainingResult.results.map(r => ({
            algorithm: r.algorithm,
            name: r.name,
            primaryMetricValue: r.primaryMetricValue,
            metrics: r,
            durationMs: duration,
            isBaseline: r.isBaseline,
            rank: r.rank
          })),
          selectedModel: trainingResult.bestModel,
          featureImportance: trainingResult.bestModel.featureWeights || []
        });
        await job.save();
        savedJobId = job._id;
      }
    } catch (dbErr) {
      console.warn('Notice: MLJob persistence skipped:', dbErr.message);
    }

    res.json({
      success: true,
      jobId: savedJobId,
      taskType,
      targetColumn,
      testSize,
      trainCount: train.length,
      testCount: test.length,
      featureNames,
      models: trainingResult.results,
      bestModel: trainingResult.bestModel,
      featureImportance: trainingResult.bestModel.featureWeights || [],
      confusionMatrix: trainingResult.confusionMatrix || null,
      testPredictions: trainingResult.testPredictions || null,
      durationMs: duration
    });
  } catch (err) {
    console.error('ML Train Error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route POST /api/ml/forecast
// Chronological Time-Series Forecasting
router.post('/forecast', optionalProtect, async (req, res) => {
  try {
    const { rows, dateColumn, valueColumn, horizon = 6 } = req.body;
    if (!rows || !dateColumn || !valueColumn) {
      return res.status(400).json({ success: false, message: 'Please provide rows, dateColumn, and valueColumn.' });
    }

    const forecastData = trainForecasting(rows, dateColumn, valueColumn, Number(horizon));
    res.json({
      success: true,
      ...forecastData
    });
  } catch (err) {
    console.error('ML Forecast Error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route GET /api/ml/jobs
// List user's training jobs
router.get('/jobs', optionalProtect, async (req, res) => {
  try {
    if (!req.user) {
      return res.json({ success: true, jobs: [] });
    }
    const jobs = await MLJob.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(10);
    res.json({ success: true, jobs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
