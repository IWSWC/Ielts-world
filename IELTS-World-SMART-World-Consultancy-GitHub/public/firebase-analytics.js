import { getApp, getApps, initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { getAnalytics, isSupported, setConsent } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyC0wEmGPbzB2Xyze5AXElDwHjvHreuuUmM",
  authDomain: "ielts-a4c80.firebaseapp.com",
  projectId: "ielts-a4c80",
  storageBucket: "ielts-a4c80.firebasestorage.app",
  messagingSenderId: "600854223885",
  appId: "1:600854223885:web:a37060b9f8e53092540944",
  measurementId: "G-XELQ5XWY02",
};

if (await isSupported()) {
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  getAnalytics(app);
  setConsent({
    analytics_storage:"granted",
    ad_storage:"denied",
    ad_user_data:"denied",
    ad_personalization:"denied",
  });
}
