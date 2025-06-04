// firebase-init.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyAfI7T8d4HdKa6jW_NAuJ1MJrFHX2RyHZU",
  authDomain: "esp32psm.firebaseapp.com",
  databaseURL: "https://esp32psm-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "esp32psm",
  storageBucket: "esp32psm.appspot.com",
  messagingSenderId: "",
  appId: ""
};

// Supabase Config
const supabaseUrl = "https://qnbxmexmsbpivyqspbal.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFuYnhtZXhtc2JwaXZ5cXNwYmFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3NjAyNTMsImV4cCI6MjA2NDMzNjI1M30.UzD7lLzBWDzNxAUGnLLTr9HXIUA_XdK4CspExx4Ufao";

// Initialize
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Export both
export { app, db, supabase };
