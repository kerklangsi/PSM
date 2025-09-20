// Configuration constants
export const CONFIG = {
  FIREBASE: {
    apiKey: "AIzaSyAfI7T8d4HdKa6jW_NAuJ1MJrFHX2RyHZU",
    authDomain: "esp32psm.firebaseapp.com",
    databaseURL: "https://esp32psm-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "esp32psm",
    storageBucket: "esp32psm.appspot.com",
    messagingSenderId: "",
    appId: ""
  },
  SUPABASE: {
    url: "https://qnbxmexmsbpivyqspbal.supabase.co",
    anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFuYnhtZXhtc2JwaXZ5cXNwYmFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3NjAyNTMsImV4cCI6MjA2NDMzNjI1M30.UzD7lLzBWDzNxAUGnLLTr9HXIUA_XdK4CspExx4Ufao"
  },
  UPDATE_INTERVALS: {
    REALTIME: 5000,
    LOCATION: 10000,
    CHART_REFRESH: 30000
  },
  TIME_RANGES: {
    '1m': 1 * 60 * 1000,
    '10m': 10 * 60 * 1000,
    '30m': 30 * 60 * 1000,
    '1h': 60 * 60 * 1000,
    '6h': 6 * 60 * 60 * 1000,
    '12h': 12 * 60 * 60 * 1000,
    '1d': 24 * 60 * 60 * 1000,
    '1w': 7 * 24 * 60 * 60 * 1000,
    '2w': 14 * 24 * 60 * 60 * 1000,
    '1mo': 30 * 24 * 60 * 60 * 1000,
    'max': Infinity
  },
  AGGREGATION_INTERVALS: {
    '10m': 10 * 1000,
    '30m': 30 * 1000,
    '1h': 60 * 1000,
    '6h': 5 * 60 * 1000,
    '12h': 10 * 60 * 1000,
    '1d': 15 * 60 * 1000,
    '1w': 30 * 60 * 1000,
    '2w': 60 * 60 * 1000,
    '1mo': 2 * 60 * 60 * 1000
  }
};