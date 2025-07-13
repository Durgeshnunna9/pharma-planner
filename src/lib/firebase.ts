   // src/lib/firebase.ts
   import { initializeApp } from "firebase/app";
   import { getFirestore } from "firebase/firestore";

   const firebaseConfig = {
    apiKey: "AIzaSyBLhkhcd4dBvmzQfgdP7Ymz5xXxv_ejA9s",
    authDomain: "sansan-group.firebaseapp.com",
    projectId: "sansan-group",
    storageBucket: "sansan-group.firebasestorage.app",
    messagingSenderId: "1058311975076",
    appId: "1:1058311975076:web:61cd17452f538c0ca87631",
    measurementId: "G-N16GP5Y3V3"
   };

   const app = initializeApp(firebaseConfig);
   export const db = getFirestore(app);


