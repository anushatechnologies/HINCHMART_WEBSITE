import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBa1Arilraettuqi_8IA0v4Qae0mwrkYjQ",
  authDomain: "anushabazaar-2288e.firebaseapp.com",
  databaseURL: "https://anushabazaar-2288e-default-rtdb.firebaseio.com",
  projectId: "anushabazaar-2288e",
  storageBucket: "anushabazaar-2288e.firebasestorage.app",
  messagingSenderId: "64875938387",
  appId: "1:64875938387:web:0ae8c08c931e2dabba7ca6",
  measurementId: "G-HP45RKD0BT"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

// Initialize Analytics conditionally (it only works in browser environments, not SSR)
let analytics;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { app, analytics, auth };
