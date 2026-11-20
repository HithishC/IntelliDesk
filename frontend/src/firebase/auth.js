
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "firebase/auth";

import { auth } from "./firebase-config.js";

// Login existing user
export async function loginUser(email, password) {
  const result = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );

  return result.user;
}

// Register a new user
export async function registerUser(email, password) {
  const result = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  return result.user;
}

// Logout user
export async function logoutUser() {
  await signOut(auth);
}

// Monitor login status
export function monitorAuthState(callback) {
  return onAuthStateChanged(auth, callback);
}

// Get Firebase ID token for backend API requests
export async function getUserToken() {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("User is not logged in");
  }

  return await user.getIdToken();
}
