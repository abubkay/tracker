// src/firebase.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCmLvPeooB0s_ar9tWeu11j1ubgTxwAfTI",
  authDomain: "fudma-gps.firebaseapp.com",
  databaseURL: "https://fudma-gps-default-rtdb.firebaseio.com",
  projectId: "fudma-gps",
  storageBucket: "fudma-gps.firebasestorage.app",
  messagingSenderId: "564677590322",
  appId: "1:564677590322:web:821f3b2220a20a6d856b2b",
  measurementId: "G-9GYEYVJRWK"
};
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database };