// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBHJm_w5sts-HyWmXUI8ay9NFvUqRQcWGE",
  authDomain: "intellidesk-zerith.firebaseapp.com",
  projectId: "intellidesk-zerith",
  storageBucket: "intellidesk-zerith.firebasestorage.app",
  messagingSenderId: "362837383551",
  appId: "1:362837383551:web:3965e24a3fbb84f4d4e24a",
  measurementId: "G-X4E3KFXV48"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
const analytics = getAnalytics(app);