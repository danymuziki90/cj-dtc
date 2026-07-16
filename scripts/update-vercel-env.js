const { execSync } = require('child_process');

const vars = {
  CLOUDFLARE_R2_ACCOUNT_ID: "c38678e993939d2e46af9b661e196568",
  CLOUDFLARE_R2_ACCESS_KEY_ID: "b35c468d9022b5ac7651ac2074771f3b",
  CLOUDFLARE_R2_SECRET_ACCESS_KEY: "90157a233a84e9e8de9bd700d92b64d553d86ddff813592493baa82d47c7286a",
  CLOUDFLARE_R2_BUCKET_NAME: "cjdevelopmenttc-storage",
  CLOUDFLARE_R2_PUBLIC_URL: "https://pub-1e5e8ef317024ae7900f84ad344983d0.r2.dev"
};

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
