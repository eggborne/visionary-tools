import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, sendSignInLinkToEmail, signInWithPopup } from "firebase/auth";

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
  dynamicLinkDomain: 'https://visionary.tools/'
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

const googleProvider = new GoogleAuthProvider();

const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    console.log('Successfully signed in with Google:', user);
    return user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

export { app, sendFirebaseEmail, signInWithGoogle };