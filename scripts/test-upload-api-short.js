const urls = [
  'https://cj-dtc-main-942arx4jw-danymuziki90s-projects.vercel.app/api/upload'
];

async function testUrl(url) {
  console.log(`Testing URL: ${url}`);
  try {
    const formData = new FormData();
    const blob = new Blob(['Hello World'], { type: 'text/plain' });
    formData.append('file', blob, 'test.txt');
    formData.append('folder', 'sessions');

    const res = await fetch(url, {
      method: 'POST',
      body: formData
    });

    console.log(`Status: ${res.status}`);
    const text = await res.text();
    console.log('Response body (truncated):', text.slice(0, 300));
  } catch (err) {
    console.error(`Error:`, err.message);
  }
}

testUrl(urls[0]);
