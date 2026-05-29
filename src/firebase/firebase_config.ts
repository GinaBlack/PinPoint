// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC4gbGrUnBKZv4l8w4Wo4vVU9CQtFI9UNw",
  authDomain: "pinpoint-e7a0d.firebaseapp.com",
  projectId: "pinpoint-e7a0d",
  storageBucket: "pinpoint-e7a0d.firebasestorage.app",
  messagingSenderId: "356471163298",
  appId: "1:356471163298:web:bf5b5f31a6db8f58fdcafb",
  measurementId: "G-N8Z1V3M843"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);