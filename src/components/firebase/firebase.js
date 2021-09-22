import firebase from 'firebase';


const firebaseConfig = {
  apiKey: "AIzaSyAQ7xkSsvcDP8a1dDjnxIh8H-4MsQdxrIw",
  authDomain: "flashloan-abitrage.firebaseapp.com",
  databaseURL: "https://flashloan-abitrage-default-rtdb.firebaseio.com",
  projectId: "flashloan-abitrage",
  storageBucket: "flashloan-abitrage.appspot.com",
  messagingSenderId: "223465919182",
  appId: "1:223465919182:web:b894c3c0c0fb886391769f",
  measurementId: "G-CF50P6X57S"
};

firebase.initializeApp(firebaseConfig);
firebase.analytics();

export default firebase;

export const database = firebase.database();
export const auth = firebase.auth();
export const storage = firebase.storage();
export const googleAuthProvider = new firebase.auth.GoogleAuthProvider();
