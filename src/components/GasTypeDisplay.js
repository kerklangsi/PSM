import { ref, onValue } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";
import { db } from '../services/database.js';

export class GasTypeDisplay {
  constructor() {
    this.containerId = 'gasTypeCard';
    this.gasTypeRef = ref(db, "gastype");
    this.init();
  }

  init() {
    this.setupRealtimeListener();
  }

  updateGasType(value) {
    const card = document.getElementById(this.containerId);
    if (!card) return;

    card.innerHTML = `
      <div style="
        width: 100%;
        text-align: center;
        box-sizing: border-box;
        border-radius: 12px;
        font-size: 200%;
        font-weight: bold;
        text-transform: uppercase;
        min-height: 100px;
        display: flex;
        justify-content: center;
        align-items: center;
        transition: all 0.3s ease;
      ">
        TYPE OF GAS: ${value || 'NONE'}
      </div>
    `;
  }

  setupRealtimeListener() {
    onValue(this.gasTypeRef, (snapshot) => {
      const value = snapshot.val();
      this.updateGasType(value);
    });
  }

  destroy() {
    // Firebase listeners are automatically cleaned up
  }
}