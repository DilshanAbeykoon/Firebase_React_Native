// config.js
import firebase from 'firebase/compat/app';
import 'firebase/compat/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDT0xwuYYVbc0Jo09mo5OwGOEBG6wPUUNI",
  authDomain: "backend-9d12c.firebaseapp.com",
  projectId: "backend-9d12c",
  storageBucket: "backend-9d12c.appspot.com",
  messagingSenderId: "294695030957",
  appId: "1:294695030957:web:38d3c89d2ccb604ca3b624",
  measurementId: "G-YMT4SF90ZR"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export { firebase };
