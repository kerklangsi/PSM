
import { db } from './firebase-init.js';
import { ref, onValue } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

if (!window.Chart) {
  const chartScript = document.createElement("script");
  chartScript.src = "https://cdn.jsdelivr.net/npm/chart.js";
  document.head.appendChild(chartScript);
  chartScript.onload = () => setupGauge();
} else {
  setupGauge();
}

function setupGauge() {
  const card = document.getElementById("humidityCard");
  if (!card) return;

  card.innerHTML = `
    <h2>Humidity</h2>
    <div style="position: relative; right: 0; bottom: 10%; width: 95%; margin: auto;">
      <canvas id="humidityGaugeCanvas" style="width: 100%; height: auto;"></canvas>
      <div id="humidityGaugeCenter"
           style="position: absolute; top: 65%; left: 50%; transform: translate(-50%, -50%);
                  font-size: 250%; font-weight: bold; color: #444;">--</div>
      <div style="position: absolute; left: 0; bottom: 10%; font-size: 150%;">0%</div>
      <div style="position: absolute; right: 0; bottom: 10%; font-size: 150%;">100%</div>
    </div>
  `;

  const ctx = document.getElementById("humidityGaugeCanvas").getContext("2d");

  const gaugeChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      datasets: [{
        data: [0, 100],
        backgroundColor: ["#36a2eb", "#eaeaea"],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 1,
      cutout: "70%",
      rotation: -90,
      circumference: 180,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false }
      }
    }
  });

  const label = document.getElementById("humidityGaugeCenter");
  onValue(ref(db, "humidity"), snapshot => {
    const value = parseFloat(snapshot.val());
    if (!isNaN(value)) {
      const clamped = Math.min(Math.max(value, 0), 100);
      gaugeChart.data.datasets[0].data = [clamped, 100 - clamped];
      gaugeChart.update();
      label.textContent = value.toFixed(2) + "%";
    }
  });
}
