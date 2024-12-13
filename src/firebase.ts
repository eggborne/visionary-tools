import { initializeApp } from "firebase/app";
import { getAuth, sendSignInLinkToEmail } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAYF9GaBpvV3B1UGFuLN4zdbz-Olhvu00A",
  authDomain: "visionary-tools.firebaseapp.com",
  projectId: "visionary-tools",
  storageBucket: "visionary-tools.firebasestorage.app",
  messagingSenderId: "149311907487",
  appId: "1:149311907487:web:ab7d3cd83485713c2b64aa",
  measurementId: "G-N6S8NNL32E"
};

const app = initializeApp(firebaseConfig);

const actionCodeSettings = {
  url: 'https://visionary.tools/',
  handleCodeInApp: true,
  iOS: {
    bundleId: 'com.example.ios'
  },
  android: {
    packageName: 'com.example.android',
    installApp: true,
    minimumVersion: '12'
  },
  dynamicLinkDomain: 'example.page.link'
};

const auth = getAuth();

const sendFirebaseEmail = (email: string) => {
  sendSignInLinkToEmail(auth, email, actionCodeSettings)
    .then(() => {
      console.log('email sent to', email);
      window.localStorage.setItem('emailForSignIn', email);
    })
    .catch((error) => {
      console.log(error);
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error(errorCode, errorMessage)
    });
};

export { app, sendFirebaseEmail };