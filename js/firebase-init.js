

//SDK de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyA5xGsRZvm0Tj5twKqmCyZqDOvRUNorkJM",
    authDomain: "ateliershoppingsite.firebaseapp.com",
    projectId: "ateliershoppingsite",
    storageBucket: "ateliershoppingsite.firebasestorage.app",
    messagingSenderId: "145165553655",
    appId: "1:145165553655:web:c2f788513ea71c656ea8f2"
};

// Inicializar
const app = initializeApp(firebaseConfig);

// Exportar servicios
export const auth = getAuth(app);
export const db = getFirestore(app);
