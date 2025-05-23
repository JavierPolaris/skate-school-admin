const admin = require('firebase-admin');
const serviceAccount = JSON.parse(process.config.FIREBASE_SERVICE_ACCOUNT);


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://skate-app.firebaseio.com'
});

module.exports = admin;