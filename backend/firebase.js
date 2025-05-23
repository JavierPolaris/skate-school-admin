const admin = require('firebase-admin');
const serviceAccount = require('./skate-app-cc014-firebase-adminsdk-3fe3c-fe893e8f91.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

module.exports = admin;
