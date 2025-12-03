import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// إعدادات Firebase الخاصة بمشروع Royal Clean Dashboard
const firebaseConfig = {
  apiKey: "AIzaSyA_4esEC8dayTUiV2a0Uqquotby5h7fIfk",
  authDomain: "royal-clean-new-dashboard.firebaseapp.com",
  projectId: "royal-clean-new-dashboard",
  storageBucket: "royal-clean-new-dashboard.firebasestorage.app",
  messagingSenderId: "295731274980",
  appId: "1:295731274980:web:7998ca5f1125097dfef8f1",
  measurementId: "G-15M3YL0J5G"
};

// التحقق مما إذا كان التطبيق قد تم إنشاؤه مسبقاً لتجنب الأخطاء (Singleton Pattern)
// هذا السطر يمنع توقف التطبيق عند تحديث الصفحة
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };