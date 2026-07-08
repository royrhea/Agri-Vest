// Manually parse .env to avoid external dotenv interceptors that hijack dotenv.config()
const fs = require('fs');
const envPath = require('path').join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    if (key && !(key in process.env)) process.env[key] = val;
  }
}

const { fork } = require('child_process');
const path = require('path');

if (!process.env.MONGODB_URI) {
  console.error('✗ MONGODB_URI is not set. Create a .env file — see .env.example.');
  process.exit(1);
}

function runScript(scriptName) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, scriptName);
    // Explicitly pass MONGODB_URI into each forked child so it never needs dotenv itself
    const child = fork(scriptPath, [], { env: { ...process.env } });
    
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Script ${scriptName} exited with code ${code}`));
      }
    });
    
    child.on('error', (err) => {
      reject(err);
    });
  });
}

async function main() {
  const scripts = [
    '01_users.js',
    '02_land_parcels.js',
    '03_plots.js',
    '04_investments.js',
    '05_transactions.js',
    '06_sensor_readings.js',
    '07_performance_snapshots.js',
    'seed.js'
  ];

  try {
    for (const script of scripts) {
      await runScript(script);
    }
    console.log("✓ agrivest_db setup complete — 7 collections created, seed data inserted");
  } catch (error) {
    console.error("✗ Migration workflow failed:", error.message);
    process.exit(1);
  }
}

main();
