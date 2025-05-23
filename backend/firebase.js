const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // ✅ tu clave de Firebase exportada

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

module.exports = admin;