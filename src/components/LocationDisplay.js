import { ref, onValue } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";
import { db } from '../services/database.js';
import { CONFIG } from '../config/constants.js';
import { DataProcessor } from '../utils/dataProcessor.js';

export class LocationDisplay {
  constructor() {
    this.containerId = 'locationCard';
    this.latRef = ref(db, "latitude");
    this.lngRef = ref(db, "longitude");
    this.latitude = null;
    this.longitude = null;
    
    this.debouncedUpdateMap = DataProcessor.debounce(this.updateMap.bind(this), 500);
    this.init();
  }

  init() {
    this.createLocationCard();
    this.setupRealtimeListeners();
    this.startPeriodicUpdate();
  }

  createLocationCard() {
    const card = document.getElementById(this.containerId);
    if (!card) return;

    card.innerHTML = `
      <h2 style="text-align:center; font-size: 200%; margin: 10px 0;">DEVICE LOCATION</h2>
      <div>
        <p id="coords" style="text-align:center; font-weight: bold; margin-bottom: 15px;">
          Waiting for location data...
        </p>
        <div style="
          width: 100%;
          aspect-ratio: 16 / 9;
          overflow: hidden;
          border: 1px solid #ccc;
          border-radius: 10px;
          position: relative;
        ">
          <iframe id="mapFrame"
            src=""
            style="width: 100%; height: 100%; border: 0; display: block;"
            allowfullscreen
            loading="lazy">
          </iframe>
          <div id="mapLoader" style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 255, 255, 0.9);
            padding: 20px;
            border-radius: 8px;
            display: none;
          ">Loading map...</div>
        </div>
      </div>
    `;
  }

  updateMap() {
    const mapFrame = document.getElementById("mapFrame");
    const coords = document.getElementById("coords");
    const loader = document.getElementById("mapLoader");
    
    if (!mapFrame || this.latitude === null || this.longitude === null) return;

    // Show loader
    if (loader) loader.style.display = 'block';

    const mapURL = `https://www.google.com/maps?q=${this.latitude},${this.longitude}&hl=en&z=14&output=embed`;
    
    // Update coordinates display
    if (coords) {
      coords.innerHTML = `Latitude: ${this.latitude} | Longitude: ${this.longitude}`;
    }

    // Update map with loading handling
    mapFrame.onload = () => {
      if (loader) loader.style.display = 'none';
    };
    
    mapFrame.src = mapURL;
  }

  setupRealtimeListeners() {
    onValue(this.latRef, (snapshot) => {
      const val = snapshot.val();
      if (val !== null && val !== this.latitude) {
        this.latitude = val;
        this.debouncedUpdateMap();
      }
    });

    onValue(this.lngRef, (snapshot) => {
      const val = snapshot.val();
      if (val !== null && val !== this.longitude) {
        this.longitude = val;
        this.debouncedUpdateMap();
      }
    });
  }

  startPeriodicUpdate() {
    this.updateInterval = setInterval(() => {
      if (this.latitude !== null && this.longitude !== null) {
        this.updateMap();
      }
    }, CONFIG.UPDATE_INTERVALS.LOCATION);
  }

  destroy() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }
}