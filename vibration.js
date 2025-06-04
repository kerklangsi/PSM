// vibration.js
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";
import { app } from './firebase-init.js';

const db = getDatabase(app);
const vibrationRef = ref(db, "Vibrating");

function updateVibration(value) {
  const card = document.getElementById("vibrationCard");
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
      "></div>
    </div>
    <p style="text-align:center; font-weight:bold; margin-top: 10px;">
      ${active ? 'Detected' : 'None'}
    </p>
  `;
}

onValue(vibrationRef, (snapshot) => {
  const value = snapshot.val();
  if (value !== null) {
    updateVibration(value);
  }
});
