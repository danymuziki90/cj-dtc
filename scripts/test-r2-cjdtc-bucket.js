const fs = require('fs');
const path = require('path');

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

const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
// Try cjdtc-bucket instead of cjdevelopmenttc-storage
const bucketName = 'cjdtc-bucket';

console.log('Testing cjdtc-bucket...');

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
    console.log('Upload successful to cjdtc-bucket!', result);
  } catch (err) {
    console.error('Upload to cjdtc-bucket failed:', err);
  }
}

run();
