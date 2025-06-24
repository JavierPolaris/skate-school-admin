const { initializeApp, cert } = require("firebase-admin/app");
const { getMessaging } = require("firebase-admin/messaging");
const serviceAccount = require('./skate-app-cc014-firebase-adminsdk-3fe3c-fe893e8f91.json');

// Inicializa la app
initializeApp({
  credential: cert(serviceAccount),
});

// Exporta el cliente de mensajería
const messaging = getMessaging();
module.exports = messaging;
