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
const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME || 'cjdevelopmenttc-storage';

console.log('Testing with region: us-east-1');

const r2Client = new S3Client({
  region: 'us-east-1',
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

async function run() {
  try {
    const result = await r2Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: 'test/hello-us-east-1.txt',
        Body: Buffer.from('Hello us-east-1'),
        ContentType: 'text/plain',
      })
    );
    console.log('Upload successful with us-east-1!', result);
  } catch (err) {
    console.error('Upload failed with us-east-1:', err);
  }
}

run();
