const { connect, close } = require('./00_connect');

async function run() {
  let db;
  try {
    db = await connect();
    
    // Drop collection if it exists to ensure idempotency
    await db.collection('transactions').drop().catch(() => {});

    await db.createCollection('transactions', {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["user_id", "type", "amount", "direction", "created_at"],
          properties: {
            user_id: {
              bsonType: "objectId",
              description: "user_id must be an ObjectId and is required"
            },
            investment_id: {
              bsonType: "objectId",
              description: "investment_id must be an ObjectId"
            },
            type: {
              bsonType: "string",
              enum: ["deposit", "withdrawal", "return_payout", "platform_fee", "refund"],
              description: "type must be one of: deposit, withdrawal, return_payout, platform_fee, refund and is required"
            },
            amount: {
              bsonType: "string",
              pattern: "^[0-9]+(\\.[0-9]{1,2})?$",
              description: "amount must be a valid financial decimal string (Decimal128) and is required"
            },
            currency: {
              bsonType: "string",
              description: "currency must be a string"
            },
            direction: {
              bsonType: "string",
              enum: ["credit", "debit"],
              description: "direction must be credit or debit and is required"
            },
            status: {
              bsonType: "string",
              enum: ["pending", "completed", "failed", "reversed"],
              description: "status must be one of: pending, completed, failed, reversed"
            },
            note: {
              bsonType: "string",
              maxLength: 300,
              description: "note must be a string of max length 300"
            },
            created_at: {
              bsonType: "date",
              description: "created_at must be a date and is required"
            },
            gateway: {
              bsonType: "object",
              properties: {
                provider: {
                  bsonType: "string",
                  description: "gateway.provider must be a string"
                },
                ref_id: {
                  bsonType: "string",
                  description: "gateway.ref_id must be a string"
                },
                raw_response: {
                  bsonType: "object",
                  description: "gateway.raw_response must be an object"
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
    const collection = db.collection('transactions');
    await collection.createIndex({ user_id: 1, created_at: -1 });
    await collection.createIndex({ investment_id: 1 });
    await collection.createIndex({ status: 1, type: 1 });
    await collection.createIndex({ "gateway.ref_id": 1 }, { sparse: true });

    console.log("✓ transactions done");
  } catch (err) {
    console.error("✗ transactions failed:", err);
    process.exit(1);
  } finally {
    await close();
  }
}

if (require.main === module) {
  run();
}
