// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyALSRQnT8wFEo-7EGSvrsjaa3YUGxi8VQI",
  authDomain: "chat-app-e2b11.firebaseapp.com",
  projectId: "chat-app-e2b11",
  storageBucket: "chat-app-e2b11.firebasestorage.app",
  messagingSenderId: "1089878307095",
  appId: "1:1089878307095:web:f6d52c66579b49c9478752",
  measurementId: "G-YGSSHPJPCN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);