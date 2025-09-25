import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  // Replace with your Firebase configuration
  apiKey: "AIzaSyDyNhPMDK_AHfAWwyRxxmfmuZ3ptU5s160",
  authDomain: "cargest-d0c38.firebaseapp.com",
  projectId: "cargest-d0c38",
  storageBucket: "cargest-d0c38.firebasestorage.app",
  messagingSenderId: "848096665457",
  appId: "1:848096665457:web:c535fc66d3290f71c560d0",
  measurementId: "G-JHCRK4RGES"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);