const fs = require('fs');
const path = require('path');

const urls = [
  'http://localhost:3000/api/upload',
  'https://cj-dtc-main.vercel.app/api/upload'
];

async function testUrl(url) {
  console.log(`Testing URL: ${url}`);
  try {
    const formData = new FormData();
    // Create a dummy file buffer
    const blob = new Blob(['Hello World from API Test'], { type: 'text/plain' });
    formData.append('file', blob, 'test-api.txt');
    formData.append('folder', 'sessions');

    const res = await fetch(url, {
      method: 'POST',
      body: formData
    });

    console.log(`Status: ${res.status} ${res.statusText}`);
    const text = await res.text();
    console.log('Response body:', text);
  } catch (err) {
    console.error(`Failed to connect/request ${url}:`, err.message);
  }
  console.log('------------------------------------');
}

async function run() {
  for (const url of urls) {
    await testUrl(url);
  }
}

run();
