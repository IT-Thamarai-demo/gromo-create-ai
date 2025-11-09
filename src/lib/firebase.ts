import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

let firebaseApp: any = null;
let auth: any = null;
let googleProvider: GoogleAuthProvider | null = null;

export const initializeFirebase = () => {
  const configStr = localStorage.getItem('firebase_config');
  if (!configStr) return false;

  try {
    const config = JSON.parse(configStr);
    
    // Initialize Firebase only if not already initialized
    if (!getApps().length) {
      firebaseApp = initializeApp(config);
    } else {
      firebaseApp = getApp();
    }
    
    auth = getAuth(firebaseApp);
    googleProvider = new GoogleAuthProvider();
    return true;
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
    return false;
  }
};

export const signInWithGoogle = async () => {
  if (!auth || !googleProvider) {
    throw new Error('Firebase not initialized. Please configure Firebase first.');
  }
  
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to sign in with Google');
  }
};

export const getFirebaseAuth = () => auth;
