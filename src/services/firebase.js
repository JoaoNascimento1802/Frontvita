// src/services/firebase.js

import { initializeApp } from "firebase/app";
// CORREÇÃO: Importar 'initializeFirestore' e 'memoryLocalCache'
import { initializeFirestore, memoryLocalCache } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);

// CORREÇÃO: Inicializa o Firestore forçando o cache em memória.
// Isso evita os erros "INTERNAL ASSERTION FAILED" causados por 
// um cache corrompido no IndexedDB do navegador.
export const firestore = initializeFirestore(app, {
  localCache: memoryLocalCache()
});