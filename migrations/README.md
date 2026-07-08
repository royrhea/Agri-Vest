# Agri-Vest Database Migrations & Architecture Documentation

This document explains the MongoDB database migration system created for the **Agri-Investment Platform**. All migration scripts are built using the official MongoDB Node.js driver (no Mongoose/ODMs) and run as self-contained sequential scripts.

---

## 1. Connection Architecture & DNS Setup

To ensure all migration scripts connect reliably across different development and sandboxed environments, a shared connection module was created.

### Connection Module: `migrations/00_connect.js`
- **Connection String**: `mongodb+srv://royrishita744_db_user:<password>@cluster0.kzfs2rf.mongodb.net/?appName=Cluster0`
- **Database**: `agrivest_db`
- **DNS Lookup Workaround**: Programmatically configures Node's DNS resolver to Google Public DNS (`8.8.8.8`, `8.8.4.4`, `1.1.1.1`) at runtime. This avoids failures (`ECONNREFUSED` on SRV querySrv) caused by local loopback resolvers (`127.0.0.1`) that fail to resolve Atlas SRV routing queries in sandboxed networks.

---

## 2. Collections and Validation Schemas

All collections are created with strict schema validators (`$jsonSchema`) with the options:
- `validationAction: "error"` (rejections on bad data)
- `validationLevel: "strict"` (applies to all inserts and updates)

### Collection 1: `users`
Represents platform users (landowners, investors, agronomists, admins, etc.) and their KYC/wallet details.
- **Fields**:
  - `_id`: ObjectId (auto)
  - `email`: String (required)
  - `name`: String (required, max length 100)
  - `phone`: String (optional, regex pattern for 10-14 digits: `^\+?[0-9]{10,14}$`)
  - `role`: String (required, enum: `["landowner", "investor", "agronomist", "agri_tech", "admin"]`)
  - `is_active`: Boolean (defaults to `true`)
  - `last_login`: Date (optional)
  - `created_at` / `updated_at`: Date (required)
  - `kyc` (Embedded Object, optional):
    - `verified`: Boolean (required, defaults to `false`)
    - `doc_type`: String (enum: `["PAN", "AADHAAR", "PASSPORT"]`)
    - `doc_ref`: String (optional)
    - `verified_at`: Date (optional)
  - `wallet` (Embedded Object, required):
    - `balance`: Decimal128 (validated as `["string", "decimal"]` to accept both string format in the validator and Decimal128 BSON type in the driver)
      > [!NOTE]
      > MongoDB's raw `$jsonSchema` engine does **not** recognize `"decimal128"` as a BSON type string; using `"decimal128"` results in a server-side `BadValue` / `Unknown type name alias` error. The standard BSON type alias for Decimal128 in `$jsonSchema` is `"decimal"`.
    - `currency`: String (required, defaults to `"INR"`)
- **Indexes**:
  - `{ email: 1 }` (Unique index to prevent duplicate accounts)
  - `{ role: 1 }` (Optimizes queries filtering users by user groups)

---

### Collection 2: `land_parcels`
Represents agricultural land listings registered by landowners.
- **Fields**:
  - `_id`: ObjectId (auto)
  - `owner_id`: ObjectId (required, references `users`)
  - `title`: String (required, max length 150)
  - `area_ha`: Double/Number (required, minimum `0.1`)
  - `soil_type`: String (optional, enum: `["alluvial", "black", "red", "laterite", "sandy", "loamy"]`)
  - `water_source`: String (optional, enum: `["canal", "borewell", "rainfed", "river", "mixed"]`)
  - `status`: String (required, enum: `["listed", "active", "inactive"]`, defaults to `"listed"`)
  - `location` (Embedded GeoJSON Point, required):
    - `type`: String (fixed `"Point"`)
    - `coordinates`: Array of 2 Numbers (required, `[longitude, latitude]`)
  - `address` (Embedded Object, optional):
    - `village` / `district` / `state` / `pincode`: Strings
  - `docs` (Array of Objects, optional):
    - Each doc: `doc_type` (String, required), `file_ref` (String, required), `uploaded_at` (Date, required)
  - `created_at` / `updated_at`: Date (required)
- **Indexes**:
  - `{ owner_id: 1 }` (Optimizes lookup of parcels owned by a specific landowner)
  - `{ location: "2dsphere" }` (Allows geospatial queries like finding farms near coordinates)
  - `{ status: 1, "address.state": 1 }` (Compound index to filter active parcels in specific states)

---

### Collection 3: `plots`
Represents individual sub-plots allocated within a land parcel for cultivation.
- **Fields**:
  - `_id`: ObjectId (auto)
  - `parcel_id`: ObjectId (required, references `land_parcels`)
  - `agronomist_id`: ObjectId (optional, references `users`)
  - `crop_type`: String (required)
  - `season`: String (required, e.g., `"kharif-2025"`)
  - `status`: String (enum: `["pre_sowing", "sowing", "growing", "harvested", "failed"]`, defaults to `"pre_sowing"`)
  - `area_ha`: Double/Number (required, minimum `0.1`)
  - `season_start`: Date (required)
  - `season_end`: Date (optional)
  - `yield` (Embedded Object, optional):
    - `target_tonnes`: Number (optional)
    - `actual_tonnes`: Double or Null (validated as `bsonType: ["double", "null"]` to support `null` values cleanly before harvest)
  - `investment_summary` (Embedded Object, required):
    - `total_invested`: String representing Decimal128 (required, defaults to `"0"`)
    - `investor_count`: Number (required, defaults to `0`)
    - `funding_target`: String representing Decimal128 (required soft marketplace requirement, must be set during plot creation)
  - `latest_snapshot` (Embedded Object, optional):
    - `soil_score` / `efficiency` / `yield_pct`: Numbers
    - `updated_at`: Date
  - `sensors` (Array of Objects, optional):
    - Each sensor: `device_id` (String, required), `sensor_type` (enum, required: `["soil_moisture", "temperature", "humidity", "rainfall", "yield_sensor"]`), `active` (Boolean), `installed_at` (Date)
  - `created_at` / `updated_at`: Date (required)
- **Indexes**:
  - `{ parcel_id: 1, season: 1 }` (Unique index ensuring a land parcel has only one crop/plot listing per season)
  - `{ status: 1, season: 1 }` (Compound index for filtering active listings in a given crop season)
  - `{ agronomist_id: 1 }` (Optimizes lookup of plots managed by a specific agronomist)

---

### Collection 4: `investments`
Manages equity or factor allocation investments made by investors on specific plots.
- **Fields**:
  - `_id`: ObjectId (auto)
  - `investor_id`: ObjectId (required, references `users`)
  - `plot_id`: ObjectId (required, references `plots`)
  - `type`: String (required, enum: `["equity", "factor_allocation"]`)
  - `amount`: String representing Decimal128 (required, validated for financial decimal formatting: `^[0-9]+(\.[0-9]{1,2})?$`)
    > [!IMPORTANT]
    > To prevent rejections of standard financial decimals (e.g., `"1500.5"`, `"1500.50"`), the validator checks for generic decimal strings. The ₹1000 minimum floor is enforced at the **service layer**.
  - `ownership_pct`: Number (optional, range 0–100, only for equity)
  - `expected_return_pct`: Number (optional)
  - `maturity_date`: Date (optional)
  - `status`: String (enum: `["active", "matured", "withdrawn", "cancelled"]`, defaults to `"active"`)
  - `invested_at` / `created_at` / `updated_at`: Date (required)
  - `allocations` (Array of Objects, optional):
    - Each: `factor` (required, enum: `["irrigation", "fertilizer", "seeds", "tech_upgrade", "storage"]`), `amount` (String representing Decimal128, required), `vendor` (String), `status` (enum: `["pending", "deployed", "completed"]`), `deployed_at` (Date)
- **Indexes**:
  - `{ investor_id: 1, status: 1 }` (Compound index to find active/past investments of a user)
  - `{ plot_id: 1, status: 1 }` (Compound index to check active funding allocations on a plot)
  - `{ investor_id: 1, invested_at: -1 }` (Compound index to retrieve user investment logs sorted chronologically)

---

### Collection 5: `transactions`
Keeps record of deposits, withdrawals, payouts, and platform fees.
- **Fields**:
  - `_id`: ObjectId (auto)
  - `user_id`: ObjectId (required, references `users`)
  - `investment_id`: ObjectId (optional, references `investments`)
  - `type`: String (required, enum: `["deposit", "withdrawal", "return_payout", "platform_fee", "refund"]`)
  - `amount`: String representing Decimal128 (required, validated for financial decimal formatting: `^[0-9]+(\.[0-9]{1,2})?$`)
    > [!IMPORTANT]
    > The regex matches any financial string and avoids rejecting standard values like `"15000.00"` or `"1000.00"`. Positive-only constraints and minimum thresholds are managed at the **service layer**.
  - `currency`: String (defaults to `"INR"`)
  - `direction`: String (required, enum: `["credit", "debit"]`)
  - `status`: String (enum: `["pending", "completed", "failed", "reversed"]`, defaults to `"pending"`)
  - `note`: String (optional, max length 300)
  - `gateway` (Embedded Object, optional):
    - `provider` / `ref_id`: Strings
    - `raw_response`: Object
  - `created_at`: Date (required)
- **Indexes**:
  - `{ user_id: 1, created_at: -1 }` (Retrieves user transaction histories sorted by date)
  - `{ investment_id: 1 }` (Retrieves all transactions associated with a particular investment)
  - `{ status: 1, type: 1 }` (Compound index to query pending/completed transaction queues)
  - `{ "gateway.ref_id": 1 }` (Sparse index to verify payment gateway reference IDs without indexing documents missing transaction gateways)

---

### Collection 6: `sensor_readings`
High-volume time-series storage for environmental sensor data.
- **Fields**:
  - `_id`: ObjectId (auto)
  - `device_id`: String (required)
  - `plot_id`: ObjectId (required, references `plots`)
  - `type`: String (required, enum: `["soil_moisture", "temperature", "humidity", "rainfall", "co2", "light"]`)
  - `v`: Number (required, value metric, short name)
  - `u`: String (required, unit metric, short name)
  - `ts`: Date (required, timestamp metric)
  - **Note on Constraints**: `additionalProperties: false` was **removed** from this collection validator. In various MongoDB database versions, `additionalProperties` behaves inconsistently and can block the auto-insertion of the implicit `_id` field itself, failing all writes. Fields are instead strictly controlled in the application layer.
- **Indexes**:
  - `{ plot_id: 1, type: 1, ts: -1 }` (Optimizes timeseries graph queries per plot/sensor type)
  - `{ ts: 1 }` with `expireAfterSeconds: 7776000` (TTL Index: automatically purges records older than 90 days to control data size at scale)

---

### Collection 7: `performance_snapshots`
Daily aggregate snapshots capturing health metrics, weather parameters, and crop anomalies.
- **Fields**:
  - `_id`: ObjectId (auto)
  - `plot_id`: ObjectId (required, references `plots`)
  - `date`: Date (required, midnight UTC timestamp)
  - `metrics` (Embedded Object, optional):
    - `soil_score` / `efficiency`: Numbers (optional, range 0–100)
    - `yield_pct` / `soil_moisture_avg` / `temperature_avg` / `humidity_avg` / `rainfall_mm`: Numbers
  - `weather` (Embedded Object, optional):
    - `source`: String (defaults to `"openweather"`)
    - `temp_avg` / `temp_min` / `temp_max` / `humidity`: Numbers
    - `description`: String
  - `anomalies` (Array of Objects, optional):
    - Each: `type` (String, required), `severity` (String, enum: `["low", "medium", "high"]`, required), `detail` (String, required)
  - **Note on Constraints**: `additionalProperties: false` was **removed** for the same reasons as `sensor_readings` to guarantee MongoDB write compatibility.
- **Indexes**:
  - `{ plot_id: 1, date: -1 }` (Unique index ensuring only one performance snapshot per plot per day)
  - `{ date: -1 }` (Used for system-wide performance reports on specific dates)

---

## 3. Application / Service Layer Enforcement Rules

Since MongoDB validation schemas only govern document-level formatting, the following critical business rules **must** be enforced within the application's service layer:

1. **Plot Status Forward-Only Transition**:
   - The status field in `plots` must progress only in the sequence: `pre_sowing` → `sowing` → `growing` → `harvested`/`failed`.
   - **Enforcement**: Prior to performing an update on a plot's status, the service layer must retrieve the existing record and verify the transition is forward-only.

2. **Total Ownership Limit Cap (100%)**:
   - The sum of all active `ownership_pct` values on a single plot must not exceed 100%.
   - **Enforcement**: Prior to inserting/updating an equity investment, run an aggregation on the `investments` collection to sum the ownership of all active investors for the target `plot_id` and check remaining headroom.

3. **Append-Only Transaction Discipline**:
   - To keep ledgers auditable, `transactions` must never be updated or deleted. Reversals must write a new transaction document (of type `refund` or similar) with the opposing credit/debit sign.
   - **Enforcement**: Ban `updateOne`, `updateMany`, `deleteOne`, and `deleteMany` calls targeting the `transactions` collection in app code.

4. **Atomic Wallet updates (Transactions)**:
   - Updating a user's `wallet.balance` and inserting a ledger `transaction` record must occur atomically. If one fails, the other must roll back.
   - **Enforcement**: Use a session-based MongoDB transaction using `withTransaction()` or session abort logic:
     ```javascript
     const session = client.startSession();
     try {
       await session.withTransaction(async () => {
         await db.collection('users').updateOne({ _id: userId }, { $inc: { "wallet.balance": amount } }, { session });
         await db.collection('transactions').insertOne(transactionDoc, { session });
       });
     } finally {
       await session.endSession();
     }
     ```

---

## 4. Seed Data & Referential Integrity

The `migrations/seed.js` script inserts Indian agricultural records that satisfy all strict validators and cross-reference each other accurately:

- **Users**:
  - Landowner: **Ramesh Patel** (KYC verified, state: Gujarat, with a `last_login` timestamp populated)
  - Investor: **Priya Sharma** (KYC verified, initial balance: ₹15,000, with a `last_login` timestamp populated)
- **Land Parcel**: Ramesh's Farm in Anand District, Gujarat (2.5 hectares, coordinates: `[72.9634, 22.5645]`, verified document reference attached).
- **Plot**: Sub-allocated 1.2 ha plot cultivating **Rice** for the `"kharif-2025"` season, with the required marketplace `funding_target` set to `"50000"`.
- **Investment**: Priya Sharma makes an equity investment of **₹15,000** for a 30% ownership share in the Rice plot.
- **Transaction**: A deposit transaction for **₹15,000** mapped to Priya Sharma's user ID with payment gateway reference ID `"pay_G83hK89sn102"`.
- **Sensor Reading**: A mock soil moisture reading (`42.5%`) linked to the plot's active sensor.
- **Performance Snapshot**: A midnight snapshot for the plot recording weather conditions, average metrics, and a low-severity anomaly alert (`low_moisture_alert`).

---

## 5. Execution Protocol

To execute the migrations, run the orchestration script from the project root:
```bash
node migrations/run_all.js
```

### Process Safety & Connection Isolation:
- `run_all.js` resolves scripts sequentially.
- It iterates through the list of migrations in a `for...of` loop and uses `await` on the child processes' exit event. This guarantees that each migration finishes, closes its client connection, and releases the Atlas cluster's connection limit pool before the next script starts, avoiding race conditions or Atlas free-tier connection limits exhaustions.
