const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');
if (!fs.existsSync(envPath)) {
  console.error('.env file not found!');
  process.exit(1);
}

const content = fs.readFileSync(envPath, 'utf8');
const envVars = {};

content.split(/\r?\n/).forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx > 0) {
      const key = trimmed.substring(0, eqIdx).trim();
      let val = trimmed.substring(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (key && val) {
        envVars[key] = val;
      }
    }
  }
});

const keys = Object.keys(envVars);
console.log(`Found ${keys.length} environment variables to sync.`);

const environments = ['production', 'preview'];

for (const key of keys) {
  const value = envVars[key];
  // Mask sensitive values in output
  const displayVal = (key.includes('SECRET') || key.includes('PASSWORD') || key.includes('KEY'))
    ? '********'
    : value;
  console.log(`Processing ${key} (${displayVal})...`);

  for (const env of environments) {
    // Attempt to remove existing variable to avoid duplicates/errors
    spawnSync('vercel', ['env', 'rm', key, env, '--scope', 'danymuziki90s-projects', '--yes'], {
      stdio: 'ignore',
      shell: true
    });

    // Add new variable
    const addResult = spawnSync('vercel', ['env', 'add', key, env, '--value', value, '--scope', 'danymuziki90s-projects', '--yes'], {
      stdio: 'inherit',
      shell: true
    });
    
    if (addResult.status === 0) {
      console.log(`  [${env}] Successfully added ${key}`);
    } else {
      console.error(`  [${env}] Failed to add ${key}. Status: ${addResult.status}, Error:`, addResult.error);
    }
  }
}

console.log('Environment synchronization completed!');
