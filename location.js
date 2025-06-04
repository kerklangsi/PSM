// location.js
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";
import { app } from './firebase-init.js';

const db = getDatabase(app);
const latRef = ref(db, "latitude");
const lngRef = ref(db, "longitude");

let latitude = null;
let longitude = null;

function updateMap() {
  const mapFrame = document.getElementById("mapFrame");
  if (mapFrame && latitude !== null && longitude !== null) {
    const mapURL = `https://www.google.com/maps?q=${latitude},${longitude}&hl=es;z=14&output=embed`;
    mapFrame.src = mapURL;

    const coords = document.getElementById("coords");
    if (coords) {
      coords.innerHTML = `Latitude : ${latitude}  |  Longitude : ${longitude}`;
    }
  }
}

function createLocationCard() {
  const card = document.getElementById("locationCard");
  if (!card) return;

  card.innerHTML = `
    <h2 style="
      text-align:center;
      font-size: 200%;
      margin: 10px 0;
    ">DEVICE LOCATION</h2>

    <div style="">
      <p id="coords" style="text-align:center; font-weight: bold;"></p>
      <div style="
        width: 100%;
        aspect-ratio: 16 / 9;
        overflow: hidden;
        border: 1px solid #ccc;
        border-radius: 10px;
      ">
        <iframe id="mapFrame"
          src=""
          style="width: 100%; height: 100%; border: 0; display: block;"
          allowfullscreen>
        </iframe>
      </div>
    </div>
  `;
}

// Initialize UI
createLocationCard();

// Realtime database listeners
onValue(latRef, (snapshot) => {
  const val = snapshot.val();
  if (val !== null) {
    latitude = val;
    updateMap();
  }
});

onValue(lngRef, (snapshot) => {
  const val = snapshot.val();
  if (val !== null) {
    longitude = val;
    updateMap();
  }
});

// Update every 10 seconds
setInterval(updateMap, 10000);
