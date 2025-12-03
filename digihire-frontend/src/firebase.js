// src/firebase.js
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

// 🔹 Firebase configuration for your DigiHire project
const firebaseConfig = {
  apiKey: "AIzaSyDXevidklsZ5l31qkXJN7HGwMdodqLL9R4",
  authDomain: "global-caseway-6602a.firebaseapp.com",
  projectId: "global-caseway-6602a",
  storageBucket: "global-caseway-6602a.appspot.com",
  messagingSenderId: "617229832875",
  appId: "1:617229832875:web:5e51551238207e4cac1dee",
  measurementId: "G-BC5M80EC6L"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Initialize Firebase Storage
const storage = getStorage(app);

// ✅ Export storage so you can use it in UploadResume.jsx
export { storage };
