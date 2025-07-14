import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  // Replace with your Firebase configuration
  apiKey: "AIzaSyAj2bP6mwuAPFCSjEscDhMkNQyhr61X43I",
  authDomain: "garage-9ceb6.firebaseapp.com",
  projectId: "garage-9ceb6",
  storageBucket: "garage-9ceb6.firebasestorage.app",
  messagingSenderId: "1033524641672",
  appId: "1:1033524641672:web:202fc4a9c21bf02dac843d",
  measurementId: "G-808FM5FN7Q"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);