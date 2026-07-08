const { fork } = require('child_process');
const path = require('path');

function runScript(scriptName) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, scriptName);
    const child = fork(scriptPath);
    
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
