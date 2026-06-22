const fs = require('fs');
const path = require('path');
const http = require('http');

const IMAGE_PATH = process.argv[2];

if (!IMAGE_PATH) {
  console.error('Usage: node test-scan.js <path-to-image>');
  console.error('Example: node test-scan.js ~/Downloads/registration.jpg');
  process.exit(1);
}

if (!fs.existsSync(IMAGE_PATH)) {
  console.error(`File not found: ${IMAGE_PATH}`);
  process.exit(1);
}

const fileBuffer = fs.readFileSync(IMAGE_PATH);
const boundary = '----FormBoundary' + Math.random().toString(36).slice(2);
let body = '';

body += `--${boundary}\r\n`;
body += `Content-Disposition: form-data; name="file"; filename="${path.basename(IMAGE_PATH)}"\r\n`;
body += `Content-Type: image/jpeg\r\n\r\n`;

const bodyStart = Buffer.from(body, 'utf-8');
const bodyEnd = Buffer.from(`\r\n--${boundary}\r\n` +
  `Content-Disposition: form-data; name="doc_type"\r\n\r\n` +
  `vehicle_registration\r\n` +
  `--${boundary}\r\n` +
  `Content-Disposition: form-data; name="clerk_user_id"\r\n\r\n` +
  `test-user\r\n` +
  `--${boundary}--\r\n`, 'utf-8');

const fullBody = Buffer.concat([bodyStart, fileBuffer, bodyEnd]);

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/ai/scan-document',
  method: 'POST',
  headers: {
    'Content-Type': `multipart/form-data; boundary=${boundary}`,
    'Content-Length': fullBody.length,
  },
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => (data += chunk));
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      console.log('Status:', res.statusCode);
      console.log('Extracted:', JSON.stringify(parsed.extracted, null, 2));
      if (parsed.image_url) console.log('Image URL:', parsed.image_url);
    } catch {
      console.log('Response:', data);
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (e) => console.error('Error:', e.message));
req.write(fullBody);
req.end();
