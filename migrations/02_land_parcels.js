const { connect, close } = require('./00_connect');

async function run() {
  let db;
  try {
    db = await connect();
    
    // Drop collection if it exists to ensure idempotency
    await db.collection('land_parcels').drop().catch(() => {});

    await db.createCollection('land_parcels', {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["owner_id", "title", "area_ha", "created_at", "updated_at", "location"],
          properties: {
            owner_id: {
              bsonType: "objectId",
              description: "owner_id must be an ObjectId and is required"
            },
            title: {
              bsonType: "string",
              maxLength: 150,
              description: "title must be a string of max length 150 and is required"
            },
            area_ha: {
              type: "number",
              minimum: 0.1,
              description: "area_ha must be a number of minimum 0.1 and is required"
            },
            soil_type: {
              bsonType: "string",
              enum: ["alluvial", "black", "red", "laterite", "sandy", "loamy"],
              description: "soil_type must be one of: alluvial, black, red, laterite, sandy, loamy"
            },
            water_source: {
              bsonType: "string",
              enum: ["canal", "borewell", "rainfed", "river", "mixed"],
              description: "water_source must be one of: canal, borewell, rainfed, river, mixed"
            },
            status: {
              bsonType: "string",
              enum: ["listed", "active", "inactive"],
              description: "status must be one of listed, active, inactive"
            },
            created_at: {
              bsonType: "date",
              description: "created_at must be a date and is required"
            },
            updated_at: {
              bsonType: "date",
              description: "updated_at must be a date and is required"
            },
            location: {
              bsonType: "object",
              required: ["type", "coordinates"],
              properties: {
                type: {
                  bsonType: "string",
                  enum: ["Point"],
                  description: "location.type must be Point and is required"
                },
                coordinates: {
                  bsonType: "array",
                  minItems: 2,
                  maxItems: 2,
                  items: {
                    type: "number"
                  },
                  description: "location.coordinates must be an array of 2 numbers [longitude, latitude] and is required"
                }
              }
            },
            address: {
              bsonType: "object",
              properties: {
                village: { bsonType: "string" },
                district: { bsonType: "string" },
                state: { bsonType: "string" },
                pincode: { bsonType: "string" }
              }
            },
            docs: {
              bsonType: "array",
              items: {
                bsonType: "object",
                required: ["doc_type", "file_ref", "uploaded_at"],
                properties: {
                  doc_type: {
                    bsonType: "string",
                    description: "doc_type must be a string and is required"
                  },
                  file_ref: {
                    bsonType: "string",
                    description: "file_ref must be a string and is required"
                  },
                  uploaded_at: {
                    bsonType: "date",
                    description: "uploaded_at must be a date and is required"
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
    const collection = db.collection('land_parcels');
    await collection.createIndex({ owner_id: 1 });
    await collection.createIndex({ location: "2dsphere" });
    await collection.createIndex({ status: 1, "address.state": 1 });

    console.log("✓ land_parcels done");
  } catch (err) {
    console.error("✗ land_parcels failed:", err);
    process.exit(1);
  } finally {
    await close();
  }
}

if (require.main === module) {
  run();
}
