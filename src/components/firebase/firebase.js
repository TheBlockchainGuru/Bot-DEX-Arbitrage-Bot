// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBI1WF0GvrC8IqFaa6bPZmpSzejJJ1pfb8",
  authDomain: "front-run-bot.firebaseapp.com",
  databaseURL: "https://front-run-bot-default-rtdb.firebaseio.com",
  projectId: "front-run-bot",
  storageBucket: "front-run-bot.appspot.com",
  messagingSenderId: "512648242141",
  appId: "1:512648242141:web:3449a9f38ce1d00f0c0c34",
  measurementId: "G-GNPS4GLDHP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
