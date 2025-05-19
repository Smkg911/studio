// src/lib/firebase.ts
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
// import { getAuth } from 'firebase/auth'; // You would add this for Firebase Authentication

const firebaseConfig = {
  apiKey: "AIzaSyABbY7Nprd6ApVXzIfkaSGvgzV1gKPCqxs",
  authDomain: "bankmt.firebaseapp.com",
  projectId: "bankmt",
  storageBucket: "bankmt.firebasestorage.app",
  messagingSenderId: "1022213048387",
  appId: "1:1022213048387:web:23edbcdb75df4cbac9acf6"
};

// Initialize Firebase
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const db: Firestore = getFirestore(app);
// const auth = getAuth(app); // For Firebase Authentication

export { app, db /*, auth */ };
