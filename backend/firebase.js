const admin = require('firebase-admin');
const serviceAccount = require('./config/firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://skate-app.firebaseio.com'
});

module.exports = admin;