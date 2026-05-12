import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyALC1_WrJtBTnpKqOcKgPXEM2a6mD-N91c",
  authDomain: "agent-ia-2d81a.firebaseapp.com",
  projectId: "agent-ia-2d81a",
  storageBucket: "agent-ia-2d81a.firebasestorage.app",
  messagingSenderId: "143281079038",
  appId: "1:143281079038:web:8772df39815f0b14009baf",
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
