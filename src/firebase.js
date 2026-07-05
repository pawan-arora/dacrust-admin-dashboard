// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCA4dYjPDKhjCbw_JZAs_i9YUxlKtHJZhI",
  authDomain: "da-crust-dev.firebaseapp.com",
  projectId: "da-crust-dev",
  storageBucket: "da-crust-dev.firebasestorage.app",
  messagingSenderId: "218238886185",
  appId: "1:218238886185:web:a9adf4b942686a3e639738",
  measurementId: "G-ZEFXPFKEFP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);