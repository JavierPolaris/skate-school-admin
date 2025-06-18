// public/firebase-messaging-sw.js
importScripts("https://www.gstatic.com/firebasejs/10.7.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.2/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyC26QKbn0YZGUQQRV1Q1Nu-HH1aO4Q7qUg",
  authDomain: "skate-app-cc014.firebaseapp.com",
  projectId: "skate-app-cc014",
  messagingSenderId: "1027397835625",
  appId: "1:1027397835625:android:2d5424a370aac04d71fbf8",
});


const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log("[firebase-messaging-sw.js] Recibido mensaje en background ", payload);
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: "/icon-192.png"
  });
});
