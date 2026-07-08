const { connect, close } = require('./00_connect');

async function run() {
  let db;
  try {
    db = await connect();
    
    // Drop collection if it exists to ensure idempotency
    await db.collection('investments').drop().catch(() => {});

    await db.createCollection('investments', {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["investor_id", "plot_id", "type", "amount", "invested_at", "created_at", "updated_at"],
          properties: {
            investor_id: {
              bsonType: "objectId",
              description: "investor_id must be an ObjectId and is required"
            },
            plot_id: {
              bsonType: "objectId",
              description: "plot_id must be an ObjectId and is required"
            },
            type: {
              bsonType: "string",
              enum: ["equity", "factor_allocation"],
              description: "type must be one of: equity, factor_allocation and is required"
            },
            amount: {
              bsonType: "string",
              pattern: "^[0-9]+(\\.[0-9]{1,2})?$",
              description: "amount must be a valid financial decimal string (Decimal128) and is required"
            },
            ownership_pct: {
              type: "number",
              minimum: 0,
              maximum: 100,
              description: "ownership_pct must be a number between 0 and 100"
            },
            expected_return_pct: {
              type: "number",
              description: "expected_return_pct must be a number"
            },
            maturity_date: {
              bsonType: "date",
              description: "maturity_date must be a date"
            },
            status: {
              bsonType: "string",
              enum: ["active", "matured", "withdrawn", "cancelled"],
              description: "status must be one of: active, matured, withdrawn, cancelled"
            },
            invested_at: {
              bsonType: "date",
              description: "invested_at must be a date and is required"
            },
            created_at: {
              bsonType: "date",
              description: "created_at must be a date and is required"
            },
            updated_at: {
              bsonType: "date",
              description: "updated_at must be a date and is required"
            },
            allocations: {
              bsonType: "array",
              items: {
                bsonType: "object",
                required: ["factor", "amount"],
                properties: {
                  factor: {
                    bsonType: "string",
                    enum: ["irrigation", "fertilizer", "seeds", "tech_upgrade", "storage"],
                    description: "allocations.factor must be one of: irrigation, fertilizer, seeds, tech_upgrade, storage and is required"
                  },
                  amount: {
                    bsonType: "string",
                    description: "allocations.amount must be a string representing Decimal128 and is required"
                  },
                  vendor: {
                    bsonType: "string",
                    description: "allocations.vendor must be a string"
                  },
                  status: {
                    bsonType: "string",
                    enum: ["pending", "deployed", "completed"],
                    description: "allocations.status must be one of: pending, deployed, completed"
                  },
                  deployed_at: {
                    bsonType: "date",
                    description: "allocations.deployed_at must be a date"
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
    const collection = db.collection('investments');
    await collection.createIndex({ investor_id: 1, status: 1 });
    await collection.createIndex({ plot_id: 1, status: 1 });
    await collection.createIndex({ investor_id: 1, invested_at: -1 });

    console.log("✓ investments done");
  } catch (err) {
    console.error("✗ investments failed:", err);
    process.exit(1);
  } finally {
    await close();
  }
}

if (require.main === module) {
  run();
}
