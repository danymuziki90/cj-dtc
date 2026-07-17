const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Load environment variables from .env
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const parts = trimmed.split('=');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        let val = parts.slice(1).join('=').trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        process.env[key] = val;
      }
    }
  });
}

const vars = {
  CLOUDFLARE_R2_ACCOUNT_ID: process.env.CLOUDFLARE_R2_ACCOUNT_ID,
  CLOUDFLARE_R2_ACCESS_KEY_ID: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
  CLOUDFLARE_R2_SECRET_ACCESS_KEY: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  CLOUDFLARE_R2_BUCKET_NAME: process.env.CLOUDFLARE_R2_BUCKET_NAME,
  CLOUDFLARE_R2_PUBLIC_URL: process.env.CLOUDFLARE_R2_PUBLIC_URL
};

console.log('Loaded R2 configurations (from .env):');
console.log('CLOUDFLARE_R2_ACCOUNT_ID:', vars.CLOUDFLARE_R2_ACCOUNT_ID);
console.log('CLOUDFLARE_R2_ACCESS_KEY_ID:', vars.CLOUDFLARE_R2_ACCESS_KEY_ID ? '***' + vars.CLOUDFLARE_R2_ACCESS_KEY_ID.slice(-4) : 'undefined');
console.log('CLOUDFLARE_R2_BUCKET_NAME:', vars.CLOUDFLARE_R2_BUCKET_NAME);

for (const [key, value] of Object.entries(vars)) {
  console.log(`Processing ${key}...`);
  try {
    console.log(`  Removing existing ${key} from Vercel...`);
    execSync(`vercel env rm ${key} production --yes`, { stdio: 'inherit' });
  } catch (e) {
    console.log(`  ${key} might not exist or failed to remove, proceeding to add.`);
  }

  try {
    console.log(`  Adding ${key} to Vercel...`);
    execSync(`vercel env add ${key} production --value "${value}" --yes`, { stdio: 'inherit' });
    console.log(`  Successfully added ${key}`);
  } catch (e) {
    console.error(`  Failed to add ${key}:`, e.message);
  }
}

console.log('Finished updating Vercel environment variables.');
