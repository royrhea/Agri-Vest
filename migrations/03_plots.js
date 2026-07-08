const { connect, close } = require('./00_connect');

async function run() {
  let db;
  try {
    db = await connect();
    
    // Drop collection if it exists to ensure idempotency
    await db.collection('plots').drop().catch(() => {});

    await db.createCollection('plots', {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["parcel_id", "crop_type", "season", "area_ha", "season_start", "created_at", "updated_at"],
          properties: {
            parcel_id: {
              bsonType: "objectId",
              description: "parcel_id must be an ObjectId and is required"
            },
            agronomist_id: {
              bsonType: "objectId",
              description: "agronomist_id must be an ObjectId"
            },
            crop_type: {
              bsonType: "string",
              description: "crop_type must be a string and is required"
            },
            season: {
              bsonType: "string",
              description: "season must be a string (e.g. kharif-2025) and is required"
            },
            status: {
              bsonType: "string",
              enum: ["pre_sowing", "sowing", "growing", "harvested", "failed"],
              description: "status must be one of: pre_sowing, sowing, growing, harvested, failed"
            },
            area_ha: {
              type: "number",
              minimum: 0.1,
              description: "area_ha must be a number of minimum 0.1 and is required"
            },
            season_start: {
              bsonType: "date",
              description: "season_start must be a date and is required"
            },
            season_end: {
              bsonType: "date",
              description: "season_end must be a date"
            },
            created_at: {
              bsonType: "date",
              description: "created_at must be a date and is required"
            },
            updated_at: {
              bsonType: "date",
              description: "updated_at must be a date and is required"
            },
            yield: {
              bsonType: "object",
              properties: {
                target_tonnes: {
                  type: "number",
                  description: "target_tonnes must be a number"
                },
                actual_tonnes: {
                  bsonType: ["double", "null"],
                  description: "actual_tonnes must be a double or null"
                }
              }
            },
            investment_summary: {
              bsonType: "object",
              required: ["total_invested", "investor_count", "funding_target"],
              properties: {
                total_invested: {
                  bsonType: "string",
                  description: "total_invested must be a string representing Decimal128"
                },
                investor_count: {
                  type: "number",
                  description: "investor_count must be a number"
                },
                funding_target: {
                  bsonType: "string",
                  description: "funding_target must be a string representing Decimal128"
                }
              }
            },
            latest_snapshot: {
              bsonType: "object",
              properties: {
                soil_score: {
                  type: "number",
                  description: "soil_score must be a number"
                },
                efficiency: {
                  type: "number",
                  description: "efficiency must be a number"
                },
                yield_pct: {
                  type: "number",
                  description: "yield_pct must be a number"
                },
                updated_at: {
                  bsonType: "date",
                  description: "updated_at must be a date"
                }
              }
            },
            sensors: {
              bsonType: "array",
              items: {
                bsonType: "object",
                required: ["device_id", "sensor_type"],
                properties: {
                  device_id: {
                    bsonType: "string",
                    description: "device_id must be a string and is required"
                  },
                  sensor_type: {
                    bsonType: "string",
                    enum: ["soil_moisture", "temperature", "humidity", "rainfall", "yield_sensor"],
                    description: "sensor_type must be one of: soil_moisture, temperature, humidity, rainfall, yield_sensor and is required"
                  },
                  active: {
                    bsonType: "bool",
                    description: "active must be a boolean"
                  },
                  installed_at: {
                    bsonType: "date",
                    description: "installed_at must be a date"
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
    const collection = db.collection('plots');
    await collection.createIndex({ parcel_id: 1, season: 1 }, { unique: true });
    await collection.createIndex({ status: 1, season: 1 });
    await collection.createIndex({ agronomist_id: 1 });

    console.log("✓ plots done");
  } catch (err) {
    console.error("✗ plots failed:", err);
    process.exit(1);
  } finally {
    await close();
  }
}

if (require.main === module) {
  run();
}
