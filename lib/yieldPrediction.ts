/**
 * yieldPrediction.ts
 * 
 * Utility functions for agricultural yield prediction and probability calculation
 * using various regression models and statistical algorithms.
 */

// ---------------------------------------------------------------------------
// 1. Simple Linear Regression Model
// Suitable for single-variable prediction (e.g., predicting yield just from rainfall)
// ---------------------------------------------------------------------------
export class SimpleLinearRegression {
  private m: number = 0; // slope
  private b: number = 0; // y-intercept

  /**
   * Train the model using historical data.
   * @param x Array of independent variable values (e.g., historical moisture)
   * @param y Array of dependent variable values (e.g., historical yield)
   */
  public fit(x: number[], y: number[]): void {
    if (x.length !== y.length || x.length === 0) {
      throw new Error("Data arrays must be of equal length and non-empty.");
    }

    const n = x.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;

    for (let i = 0; i < n; i++) {
      sumX += x[i];
      sumY += y[i];
      sumXY += x[i] * y[i];
      sumXX += x[i] * x[i];
    }

    const meanX = sumX / n;
    const meanY = sumY / n;

    // Calculate slope (m) and intercept (b)
    const numerator = sumXY - n * meanX * meanY;
    const denominator = sumXX - n * meanX * meanX;

    this.m = denominator === 0 ? 0 : numerator / denominator;
    this.b = meanY - this.m * meanX;
  }

  /**
   * Predict the yield based on a new input.
   * @param x New independent variable value
   */
  public predict(x: number): number {
    return this.m * x + this.b;
  }
}


// ---------------------------------------------------------------------------
// 2. Multiple Linear Regression (via Gradient Descent)
// Suitable for multi-variable prediction: NPK, Moisture, Light Index, Temp
// ---------------------------------------------------------------------------
export class MultipleLinearRegression {
  private weights: number[];
  private bias: number;
  private learningRate: number;
  private iterations: number;

  constructor(featuresCount: number, learningRate = 0.01, iterations = 1000) {
    // Initialize weights to zero
    this.weights = new Array(featuresCount).fill(0);
    this.bias = 0;
    this.learningRate = learningRate;
    this.iterations = iterations;
  }

  /**
   * Train the multiple regression model using Gradient Descent.
   * @param X 2D array of independent variables (e.g., [[npk, moisture, light], ...])
   * @param y Array of historical yields
   */
  public fit(X: number[][], y: number[]): void {
    const n = y.length;
    
    for (let iter = 0; iter < this.iterations; iter++) {
      let dWeight = new Array(this.weights.length).fill(0);
      let dBias = 0;

      for (let i = 0; i < n; i++) {
        // Calculate prediction for this sample
        let yPredicted = this.bias;
        for (let j = 0; j < this.weights.length; j++) {
          yPredicted += this.weights[j] * X[i][j];
        }

        // Calculate error
        const error = yPredicted - y[i];

        // Accumulate gradients
        for (let j = 0; j < this.weights.length; j++) {
          dWeight[j] += (2 / n) * error * X[i][j];
        }
        dBias += (2 / n) * error;
      }

      // Update weights and bias
      for (let j = 0; j < this.weights.length; j++) {
        this.weights[j] -= this.learningRate * dWeight[j];
      }
      this.bias -= this.learningRate * dBias;
    }
  }

  /**
   * Predict the yield based on an array of new inputs.
   */
  public predict(x: number[]): number {
    if (x.length !== this.weights.length) {
      throw new Error("Input features length does not match trained weights.");
    }
    let prediction = this.bias;
    for (let i = 0; i < this.weights.length; i++) {
      prediction += this.weights[i] * x[i];
    }
    return prediction;
  }
}

// ---------------------------------------------------------------------------
// 3. Logistic Sigmoid Probability Algorithm
// Used to convert continuous sensor metrics into a 0-100% Probability Score.
// ---------------------------------------------------------------------------

/**
 * Standard sigmoid function: maps any real number into a (0, 1) range.
 */
function sigmoid(z: number): number {
  return 1 / (1 + Math.exp(-z));
}

export interface SensorData {
  npkIndex: number;       // e.g., 0-100 scale of soil nutrient richness
  moisturePct: number;    // e.g., 0-100%
  lightIndex: number;     // e.g., 0-100 scale of solar exposure
  tempCelsius: number;    // e.g., current average soil/air temp
}

/**
 * Calculates the probability of achieving optimal crop yield (target yield)
 * based on live sensor telemetry using a heuristic algorithmic model.
 * 
 * @param data Live sensor data
 * @param targetYield The target yield (bu/ac) the farm is aiming for
 * @returns An object containing the predicted yield and the probability of hitting the target.
 */
export function calculateYieldProbability(data: SensorData, targetYield: number = 200) {
  // Step 1: Normalize variables to a baseline where 0 is neutral, positive is good.
  // Ideal conditions (Heuristic): NPK=80, Moisture=35, Light=85, Temp=22C
  
  const npkScore = (data.npkIndex - 50) / 10;
  const moistureScore = -Math.abs(data.moisturePct - 35) / 5 + 3; // Bell curve peak at 35%
  const lightScore = (data.lightIndex - 60) / 10;
  const tempScore = -Math.abs(data.tempCelsius - 22) / 3 + 2; // Peak at 22C

  // Step 2: Combine scores into a continuous Z-score (weighted algorithm)
  // These weights would ideally come from the MultipleLinearRegression model above.
  const zScore = (npkScore * 1.5) + (moistureScore * 2.0) + (lightScore * 0.8) + (tempScore * 1.2);

  // Step 3: Convert Z-score to a Probability (0 to 1) using Sigmoid
  const probability = sigmoid(zScore);

  // Step 4: Calculate estimated biological yield
  // Base yield 150 + dynamic factors
  const estimatedYield = 150 + (zScore * 15);

  return {
    estimatedYield: Math.max(0, Math.round(estimatedYield * 10) / 10), // e.g. 210.4
    probabilityPercent: Math.round(probability * 100), // e.g. 88%
    isOptimal: probability > 0.75, // > 75% chance is considered highly probable
    targetYield,
  };
}
