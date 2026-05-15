import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBv8DS4eqWsLBlCPzzVeKZ0GglNyvasfJE",
  authDomain: "vista-15739.firebaseapp.com",
  projectId: "vista-15739",
  storageBucket: "vista-15739.firebasestorage.app",
  messagingSenderId: "350433205494",
  appId: "1:350433205494:web:f637d65d4830572abfa0d7",
  measurementId: "G-N7SVR20WV4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
