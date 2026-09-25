// ============================================================
// BaiYun Lingua — Firebase configuration
// ------------------------------------------------------------
// Replace every value below with the config object Firebase
// gives you at:
// Firebase Console > Project settings > General > Your apps > SDK setup and configuration
// ------------------------------------------------------------
// Full setup steps are in README.md.
// ============================================================

export const firebaseConfig = {
  apiKey: "YOUR_KEY",
  authDomain: "baiyun-lingua.firebaseapp.com",
  projectId: "baiyun-lingua",
  storageBucket: "baiyun-lingua.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Simple client-side gate for admin.html.
// This is NOT real security — see the README's "Admin panel security" note
// for how to lock this down properly with Firebase Auth + custom claims
// before you put real student data behind it.
export const ADMIN_PASSWORD = "BaiYun2026";
