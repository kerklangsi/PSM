import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import { CONFIG } from '../config/constants.js';

// Singleton pattern for database connections
class DatabaseService {
  constructor() {
    if (DatabaseService.instance) {
      return DatabaseService.instance;
    }

    // Initialize Firebase
    this.firebaseApp = initializeApp(CONFIG.FIREBASE);
    this.firebaseDb = getDatabase(this.firebaseApp);

    // Initialize Supabase
    this.supabase = createClient(CONFIG.SUPABASE.url, CONFIG.SUPABASE.anonKey);

    DatabaseService.instance = this;
  }

  getFirebaseDb() {
    return this.firebaseDb;
  }

  getSupabase() {
    return this.supabase;
  }
}

export const dbService = new DatabaseService();
export const { firebaseDb: db, supabase } = dbService;