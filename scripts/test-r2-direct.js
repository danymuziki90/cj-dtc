// Test R2 configuration and upload functionality without dotenv dependency
const fs = require('fs');
const path = require('path');

// Manually parse .env
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
        // Remove quotes if present
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        process.env[key] = val;
      }
    }
  });
}

const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME || 'cjdtc-bucket';

console.log('R2 Config:');
console.log('accountId:', accountId);
console.log('accessKeyId:', accessKeyId ? '***' + accessKeyId.slice(-4) : 'undefined');
console.log('secretAccessKey:', secretAccessKey ? '***' + secretAccessKey.slice(-4) : 'undefined');
console.log('bucketName:', bucketName);

if (!accountId || !accessKeyId || !secretAccessKey) {
  console.error('Missing R2 environment variables!');
  process.exit(1);
}

const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

async function run() {
  try {
    console.log('Sending PutObjectCommand...');
    const result = await r2Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: 'test/hello.txt',
        Body: Buffer.from('Hello from test script!'),
        ContentType: 'text/plain',
      })
    );
    console.log('Upload successful!', result);
  } catch (err) {
    console.error('Upload failed with error:', err);
  }
}

run();
