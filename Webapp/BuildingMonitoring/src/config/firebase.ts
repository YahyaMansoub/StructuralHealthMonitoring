import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import type { FirebaseConfig } from '../types';

const firebaseConfig: FirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Validate configuration
const validateConfig = (config: FirebaseConfig): boolean => {
  const requiredFields = ['apiKey', 'authDomain', 'databaseURL', 'projectId'];
  const isValid = requiredFields.every(field => {
    const value = config[field as keyof FirebaseConfig];
    const hasValue = value && value !== 'undefined' && value !== '';
    if (!hasValue) {
      console.error(`Missing or invalid Firebase config field: ${field}`, value);
    }
    return hasValue;
  });
  return isValid;
};

// Debug: Log the config (without sensitive data)
console.log('Firebase config validation:', {
  hasApiKey: !!firebaseConfig.apiKey,
  hasAuthDomain: !!firebaseConfig.authDomain,
  hasDatabaseURL: !!firebaseConfig.databaseURL,
  hasProjectId: !!firebaseConfig.projectId,
  databaseURL: firebaseConfig.databaseURL // This is safe to log
});

if (!validateConfig(firebaseConfig)) {
  console.error('Firebase configuration is incomplete. Please check your .env file.');
  console.error('Current environment variables:', {
    VITE_FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY ? 'Set' : 'Missing',
    VITE_FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ? 'Set' : 'Missing',
    VITE_FIREBASE_DATABASE_URL: import.meta.env.VITE_FIREBASE_DATABASE_URL ? 'Set' : 'Missing',
    VITE_FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID ? 'Set' : 'Missing'
  });
  throw new Error('Firebase configuration error');
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database
export const database = getDatabase(app);

// Test initialization
console.log('Firebase app initialized:', !!app);
console.log('Firebase database initialized:', !!database);

export default app;
