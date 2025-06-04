// gas_type.js
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";
import { app } from './firebase-init.js';

const db = getDatabase(app);
const gasTypeRef = ref(db, "gastype");

function updateGasType(value) {
  const card = document.getElementById("gasTypeCard");
  if (card) {
    card.innerHTML = `
      <div style="
        width: 100%;
        text-align: center;
        box-sizing: border-box;
        border-radius: 12px;
        font-size: 200%;
        font-weight: bold;
        text-transform: uppercase;
        min-height: 100px;              /* ✅ more height */
        display: flex;
        justify-content: center;
        align-items: center;
      ">
        TYPE OF GAS: ${value}
      </div>
    `;
  }
}


onValue(gasTypeRef, (snapshot) => {
  const value = snapshot.val();
  if (value !== null) {
    updateGasType(value);
  }
});
