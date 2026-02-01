import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Using the config provided in the user's prompt
const firebaseConfig = {
  apiKey: "AIzaSyDStOsHjO0uzqvcyRhebxKzyRjJTB5EHvw",
  authDomain: "hahaha-ff408.firebaseapp.com",
  databaseURL: "https://hahaha-ff408-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "hahaha-ff408",
  storageBucket: "hahaha-ff408.firebasestorage.app",
  messagingSenderId: "387922069609",
  appId: "1:387922069609:web:79e879ae7aa9f93033baf8",
  measurementId: "G-SGXLLRV07E"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);