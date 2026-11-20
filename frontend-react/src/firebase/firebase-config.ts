
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyBHJm_w5sts-HyWmXUI8ay9NFvUqRQcWGE',
  authDomain: 'intellidesk-zerith.firebaseapp.com',
  projectId: 'intellidesk-zerith',
  storageBucket: 'intellidesk-zerith.firebasestorage.app',
  messagingSenderId: '362837383551',
  appId: '1:362837383551:web:3965e24a3fbb84f4d4e24a',
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const firestore = getFirestore(app)

export default app
