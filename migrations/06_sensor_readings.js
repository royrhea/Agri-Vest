const { connect, close } = require('./00_connect');

async function run() {
  let db;
  try {
    db = await connect();
    
    // Drop collection if it exists to ensure idempotency
    await db.collection('sensor_readings').drop().catch(() => {});

    await db.createCollection('sensor_readings', {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["device_id", "plot_id", "type", "v", "u", "ts"],
          properties: {
            _id: {
              bsonType: "objectId",
              description: "automatically generated ObjectId"
            },
            device_id: {
              bsonType: "string",
              description: "device_id must be a string and is required"
            },
            plot_id: {
              bsonType: "objectId",
              description: "plot_id must be an ObjectId and is required"
            },
            type: {
              bsonType: "string",
              enum: ["soil_moisture", "temperature", "humidity", "rainfall", "co2", "light"],
              description: "type must be one of: soil_moisture, temperature, humidity, rainfall, co2, light and is required"
            },
            v: {
              type: "number",
              description: "v (value) must be a number and is required"
            },
            u: {
              bsonType: "string",
              description: "u (unit) must be a string (e.g. %, °C, mm, lux) and is required"
            },
            ts: {
              bsonType: "date",
              description: "ts (timestamp) must be a date and is required"
            }
          }
        }
      },
      validationAction: "error",
      validationLevel: "strict"
    });

    // Create Indexes
    const collection = db.collection('sensor_readings');
    await collection.createIndex({ plot_id: 1, type: 1, ts: -1 });
    await collection.createIndex({ ts: 1 }, { expireAfterSeconds: 7776000 });

    console.log("✓ sensor_readings done");
  } catch (err) {
    console.error("✗ sensor_readings failed:", err);
    process.exit(1);
  } finally {
    await close();
  }
}

if (require.main === module) {
  run();
}
