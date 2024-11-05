// lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyCYJo0zLCwLrno7rh7XkADOOmKsIAvMoT0",
    authDomain: "bytebase-tech.firebaseapp.com",
    projectId: "bytebase-tech",
    storageBucket: "bytebase-tech.appspot.com",
    messagingSenderId: "45134401319",
    appId: "1:45134401319:web:ef1f0598a317cffc3a2302",
    measurementId: "G-PPPLMLPJ0M"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

export { app, db, storage, auth };