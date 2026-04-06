import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Replace with your actual Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAXfea39DO2ID6kRVidZYsiUhkHGCIW7dA",
  authDomain: "e-khataassist.firebaseapp.com",
  databaseURL: "https://e-khataassist-default-rtdb.firebaseio.com",
  projectId: "e-khataassist",
  storageBucket: "e-khataassist.firebasestorage.app",
  messagingSenderId: "834216282230",
  appId: "1:834216282230:web:5cd78be5e886c30cc5f757",
  measurementId: "G-XBQKMGK37W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
