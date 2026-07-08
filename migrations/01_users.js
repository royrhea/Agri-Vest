const { connect, close } = require('./00_connect');

async function run() {
  let db;
  try {
    db = await connect();
    
    // Drop collection if it exists to ensure idempotency
    await db.collection('users').drop().catch(() => {});

    await db.createCollection('users', {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["email", "name", "role", "created_at", "updated_at", "wallet"],
          properties: {
            email: {
              bsonType: "string",
              description: "email must be a string and is required"
            },
            name: {
              bsonType: "string",
              maxLength: 100,
              description: "name must be a string of max length 100 and is required"
            },
            phone: {
              bsonType: "string",
              pattern: "^\\+?[0-9]{10,14}$",
              description: "phone must be a string matching the pattern ^\\+?[0-9]{10,14}$"
            },
            role: {
              bsonType: "string",
              enum: ["landowner", "investor", "agronomist", "agri_tech", "admin"],
              description: "role must be one of landowner, investor, agronomist, agri_tech, admin and is required"
            },
            is_active: {
              bsonType: "bool",
              description: "is_active must be a boolean"
            },
            last_login: {
              bsonType: "date",
              description: "last_login must be a date"
            },
            created_at: {
              bsonType: "date",
              description: "created_at must be a date and is required"
            },
            updated_at: {
              bsonType: "date",
              description: "updated_at must be a date and is required"
            },
            kyc: {
              bsonType: "object",
              required: ["verified"],
              properties: {
                verified: {
                  bsonType: "bool",
                  description: "kyc.verified must be a boolean and is required"
                },
                doc_type: {
                  bsonType: "string",
                  enum: ["PAN", "AADHAAR", "PASSPORT"],
                  description: "kyc.doc_type must be one of PAN, AADHAAR, PASSPORT"
                },
                doc_ref: {
                  bsonType: "string",
                  description: "kyc.doc_ref must be a string"
                },
                verified_at: {
                  bsonType: "date",
                  description: "kyc.verified_at must be a date"
                }
              }
            },
            wallet: {
              bsonType: "object",
              required: ["balance", "currency"],
              properties: {
                balance: {
                  bsonType: ["string", "decimal"],
                  description: "wallet.balance must be a decimal (represented as string or BSON decimal) and is required"
                },
                currency: {
                  bsonType: "string",
                  description: "wallet.currency must be a string and is required"
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
    const collection = db.collection('users');
    await collection.createIndex({ email: 1 }, { unique: true });
    await collection.createIndex({ role: 1 });

    console.log("✓ users done");
  } catch (err) {
    console.error("✗ users failed:", err);
    process.exit(1);
  } finally {
    await close();
  }
}

if (require.main === module) {
  run();
}
