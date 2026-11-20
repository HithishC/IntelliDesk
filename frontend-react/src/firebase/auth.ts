
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User
} from 'firebase/auth'

import { auth } from './firebase-config'

export async function loginUser(email: string, password: string) {
  const result = await signInWithEmailAndPassword(
    auth,
    email,
    password
  )

  return result.user
}

export async function registerUser(email: string, password: string) {
  const result = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  )

  return result.user
}

export async function logoutUser() {
  await signOut(auth)
}

export function monitorAuthState(
  callback: (user: User | null) => void
) {
  return onAuthStateChanged(auth, callback)
}

export async function getUserToken(): Promise<string> {
  const user = auth.currentUser

  if (!user) {
    throw new Error('User is not logged in')
  }

  return await user.getIdToken()
}
