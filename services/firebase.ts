import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration, provided by the user
const firebaseConfig = {
  apiKey: "AIzaSyAceN00BfIQ_Kd8MlZSTsghxCz75OSSSGs",
  authDomain: "test-2a804.firebaseapp.com",
  projectId: "test-2a804",
  storageBucket: "test-2a804.firebasestorage.app",
  messagingSenderId: "755653288956",
  appId: "1:755653288956:web:184df54b7dd347c5b68879"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export instances of Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
