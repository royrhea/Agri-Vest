const { connect, close } = require('./00_connect');

async function run() {
  let db;
  try {
    db = await connect();
    
    // Drop collection if it exists to ensure idempotency
    await db.collection('performance_snapshots').drop().catch(() => {});

    await db.createCollection('performance_snapshots', {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["plot_id", "date"],
          properties: {
            _id: {
              bsonType: "objectId",
              description: "automatically generated ObjectId"
            },
            plot_id: {
              bsonType: "objectId",
              description: "plot_id must be an ObjectId and is required"
            },
            date: {
              bsonType: "date",
              description: "date must be a date and is required"
            },
            metrics: {
              bsonType: "object",
              properties: {
                soil_score: {
                  type: "number",
                  minimum: 0,
                  maximum: 100,
                  description: "metrics.soil_score must be a number between 0 and 100"
                },
                efficiency: {
                  type: "number",
                  minimum: 0,
                  maximum: 100,
                  description: "metrics.efficiency must be a number between 0 and 100"
                },
                yield_pct: {
                  type: "number",
                  description: "metrics.yield_pct must be a number"
                },
                soil_moisture_avg: {
                  type: "number",
                  description: "metrics.soil_moisture_avg must be a number"
                },
                temperature_avg: {
                  type: "number",
                  description: "metrics.temperature_avg must be a number"
                },
                humidity_avg: {
                  type: "number",
                  description: "metrics.humidity_avg must be a number"
                },
                rainfall_mm: {
                  type: "number",
                  description: "metrics.rainfall_mm must be a number"
                }
              }
            },
            weather: {
              bsonType: "object",
              properties: {
                source: {
                  bsonType: "string",
                  description: "weather.source must be a string"
                },
                temp_avg: {
                  type: "number",
                  description: "weather.temp_avg must be a number"
                },
                temp_min: {
                  type: "number",
                  description: "weather.temp_min must be a number"
                },
                temp_max: {
                  type: "number",
                  description: "weather.temp_max must be a number"
                },
                humidity: {
                  type: "number",
                  description: "weather.humidity must be a number"
                },
                description: {
                  bsonType: "string",
                  description: "weather.description must be a string"
                }
              }
            },
            anomalies: {
              bsonType: "array",
              items: {
                bsonType: "object",
                required: ["type", "severity", "detail"],
                properties: {
                  type: {
                    bsonType: "string",
                    description: "anomalies.type must be a string and is required"
                  },
                  severity: {
                    bsonType: "string",
                    enum: ["low", "medium", "high"],
                    description: "anomalies.severity must be low, medium, or high and is required"
                  },
                  detail: {
                    bsonType: "string",
                    description: "anomalies.detail must be a string and is required"
                  }
                }
              }
            }
          }
        }
      },
      validationAction: "error",
      validationLevel: "strict"
    });

    // Create Indexes
    const collection = db.collection('performance_snapshots');
    await collection.createIndex({ plot_id: 1, date: -1 }, { unique: true });
    await collection.createIndex({ date: -1 });

    console.log("✓ performance_snapshots done");
  } catch (err) {
    console.error("✗ performance_snapshots failed:", err);
    process.exit(1);
  } finally {
    await close();
  }
}

if (require.main === module) {
  run();
}
