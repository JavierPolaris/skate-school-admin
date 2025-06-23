const fs = require('fs');
const path = require('path');

module.exports = function withGoogleServices(config) {
  if (process.env.GOOGLE_SERVICES_JSON) {
    const filePath = path.join(__dirname, '..', 'android', 'app', 'google-services.json');
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, process.env.GOOGLE_SERVICES_JSON);
    console.log('✅ google-services.json written from env variable');
  } else {
    console.warn('⚠️ GOOGLE_SERVICES_JSON env var not found');
  }
  return config;
};
