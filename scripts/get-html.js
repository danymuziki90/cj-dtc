const url = 'https://cj-dtc-main-942arx4jw-danymuziki90s-projects.vercel.app/api/upload';

async function run() {
  const formData = new FormData();
  const blob = new Blob(['Hello World'], { type: 'text/plain' });
  formData.append('file', blob, 'test.txt');
  formData.append('folder', 'sessions');

  const res = await fetch(url, {
    method: 'POST',
    body: formData
  });

  const text = await res.text();
  console.log('Status:', res.status);
  
  // Extract <title> if present
  const titleMatch = text.match(/<title>([^<]+)<\/title>/i);
  if (titleMatch) {
    console.log('Page Title:', titleMatch[1]);
  } else {
    console.log('No title found.');
  }

  // Print first 1000 characters
  console.log('HTML snippet:', text.slice(0, 1000));
}

run();
