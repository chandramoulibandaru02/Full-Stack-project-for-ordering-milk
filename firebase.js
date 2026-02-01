// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDwxi9wrRYHSgNf665eCR1p1Pi-Z1JXqyI",
  authDomain: "milk-delivery-dac1a.firebaseapp.com",
  projectId: "milk-delivery-dac1a",
  storageBucket: "milk-delivery-dac1a.appspot.com",
  messagingSenderId: "500716890959",
  appId: "1:500716890959:web:bbfe720440f9532f72333a"
};

const app = initializeApp(firebaseConfig);

// 🔥 THIS must be Firestore
const db = getFirestore(app);

export { db };