const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'android/app/google-services.json');
const outputPath = path.join(__dirname, 'google-services.base64.txt');

const file = fs.readFileSync(filePath);
const encoded = Buffer.from(file).toString('base64');

fs.writeFileSync(outputPath, encoded);

console.log('✅ Archivo codificado en base64: google-services.base64.txt');
