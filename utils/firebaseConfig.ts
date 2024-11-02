import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyA48oz_EUII3UU2p3XuEw9OZKGP3b4a-ZE",
    authDomain: "e-somero-platform.firebaseapp.com",
    projectId: "e-somero-platform",
    storageBucket: "e-somero-platform.firebasestorage.app",
    messagingSenderId: "909455494480",
    appId: "1:909455494480:web:51cd09030c370325e87055",
    measurementId: "G-6YWGZSXEHT"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };
