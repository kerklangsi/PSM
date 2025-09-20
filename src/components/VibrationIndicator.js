import { ref, onValue } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";
import { db } from '../services/database.js';

export class VibrationIndicator {
  constructor() {
    this.containerId = 'vibrationCard';
    this.vibrationRef = ref(db, "Vibrating");
    this.init();
  }

  init() {
    this.setupRealtimeListener();
  }

  updateVibration(value) {
    const card = document.getElementById(this.containerId);
    if (!card) return;

    const active = value === true || value === "true";

    card.innerHTML = `
      <h2 style="text-align:center;">Vibration</h2>
      <div style="
        display: flex;
        justify-content: center;
        align-items: center;
        aspect-ratio: 1 / 1;
        width: 70%;
        margin: auto;
      ">
        <div style="
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background-color: ${active ? 'red' : '#ccc'};
          transition: all 0.3s ease;
          box-shadow: ${active ? '0 0 20px rgba(255, 0, 0, 0.5)' : 'none'};
        "></div>
      </div>
      <p style="text-align:center; font-weight:bold; margin-top: 10px;">
        ${active ? 'Detected' : 'None'}
      </p>
    `;
  }

  setupRealtimeListener() {
    onValue(this.vibrationRef, (snapshot) => {
      const value = snapshot.val();
      this.updateVibration(value);
    });
  }

  destroy() {
    // Firebase listeners are automatically cleaned up
  }
}