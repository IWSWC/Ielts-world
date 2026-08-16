import { getApp, getApps, initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import {
  RecaptchaVerifier,
  createUserWithEmailAndPassword,
  getAuth,
  inMemoryPersistence,
  sendEmailVerification,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  signOut,
  updateProfile,
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyC0wEmGPbzB2Xyze5AXElDwHjvHreuuUmM",
  authDomain: "ielts-a4c80.firebaseapp.com",
  projectId: "ielts-a4c80",
  storageBucket: "ielts-a4c80.firebasestorage.app",
  messagingSenderId: "600854223885",
  appId: "1:600854223885:web:a37060b9f8e53092540944",
  measurementId: "G-XELQ5XWY02",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
await setPersistence(auth, inMemoryPersistence);
let phoneConfirmation = null;
let recaptchaVerifier = null;

async function resultFor(user) {
  await user.reload();
  const result = {
    idToken:await user.getIdToken(true),
    email:user.email || "",
    emailVerified:user.emailVerified,
    displayName:user.displayName || "",
    phoneNumber:user.phoneNumber || "",
  };
  await signOut(auth);
  return result;
}

function verificationError() {
  const error = new Error("Verify your email before signing in.");
  error.code = "auth/email-not-verified";
  return error;
}

const bridge = {
  setLanguage(language) {
    auth.languageCode = language === "bn" ? "bn" : "en";
  },
  async signInEmail(email, password) {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    await credential.user.reload();
    if (!credential.user.emailVerified) {
      await signOut(auth);
      throw verificationError();
    }
    return resultFor(credential.user);
  },
  async signUpEmail(name, email, password) {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(credential.user, { displayName:name });
    await sendEmailVerification(credential.user, {
      url:`${window.location.origin}/auth?verified=1`,
      handleCodeInApp:false,
    });
    await signOut(auth);
    return { email:credential.user.email || email };
  },
  async sendPasswordReset(email) {
    await sendPasswordResetEmail(auth, email, { url:`${window.location.origin}/auth` });
  },
  async startPhone(phoneNumber, containerId) {
    if (recaptchaVerifier) recaptchaVerifier.clear();
    const container = document.getElementById(containerId);
    if (container) container.replaceChildren();
    recaptchaVerifier = new RecaptchaVerifier(auth, containerId, { size:"normal" });
    phoneConfirmation = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
    return { ok:true };
  },
  async confirmPhone(code) {
    if (!phoneConfirmation) {
      const error = new Error("Request a new verification code.");
      error.code = "auth/missing-verification-id";
      throw error;
    }
    const credential = await phoneConfirmation.confirm(code);
    phoneConfirmation = null;
    if (recaptchaVerifier) recaptchaVerifier.clear();
    recaptchaVerifier = null;
    return resultFor(credential.user);
  },
};

window.IELTSFirebaseAuth = bridge;
window.dispatchEvent(new Event("ielts-firebase-auth-ready"));
