const fs = require('fs');
const path = require('path');

const decoded = Buffer.from(process.env.GOOGLE_SERVICES_JSON, 'base64').toString('utf8');
const targetPath = path.join(__dirname, '../android/app/google-services.json');

fs.mkdirSync(path.dirname(targetPath), { recursive: true });
fs.writeFileSync(targetPath, decoded);

console.log('✅ google-services.json creado desde EAS secret');
