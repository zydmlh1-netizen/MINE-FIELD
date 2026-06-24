// Firebase Configuration
// For production: Replace these values with your own Firebase project credentials
// Get your config from: https://console.firebase.google.com/

const firebaseConfig = {
  apiKey: "AIzaSyBRgG7K8mP2nQ9xR5sT7uV9wX1yZ2aB3cD",
  authDomain: "minebattle-rtdb.firebaseapp.com",
  databaseURL: "https://minebattle-rtdb-default-rtdb.firebaseio.com",
  projectId: "minebattle-rtdb",
  storageBucket: "minebattle-rtdb.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};

// Initialize Firebase when ready
try {
  if (typeof firebase !== 'undefined' && firebase.apps.length === 0) {
    firebase.initializeApp(firebaseConfig);
  }
} catch (error) {
  console.warn('Firebase initialization warning:', error.message);
  console.log('The game will work with local multiplayer (same device) without Firebase.');
}

// Export for use in game.js
if (typeof window !== 'undefined') {
  window.firebaseReady = true;
}

