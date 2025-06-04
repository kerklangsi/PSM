// mq4_gauge.js
import { db } from './firebase-init.js';
import { ref, onValue } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

if (!window.Chart) {
  const chartScript = document.createElement("script");
  chartScript.src = "https://cdn.jsdelivr.net/npm/chart.js";
  document.head.appendChild(chartScript);
  chartScript.onload = () => setupMQ2Gauge();
} else {
  setupMQ2Gauge();
}

function setupMQ2Gauge() {
  const card = document.getElementById("mq4Card");
  if (!card) return;

  // Create layout
  card.innerHTML = `
    <h2>MQ-4</h2>
    <div style="position: relative; right: 0; bottom: 10%; width: 95%; margin: auto;">
      <canvas id="mq4GaugeCanvas" style="width: 100%; height: auto;"></canvas>
      <div id="mq4GaugeCenter"
           style="position: absolute; top: 65%; left: 50%; transform: translate(-50%, -50%);
                  font-size: 300%; font-weight: bold; color: #444;">--</div>
      <div style="position: absolute; left: 0; bottom: 10%; font-size: 150%;">0</div>
      <div style="position: absolute; right: 0; bottom: 10%; font-size: 150%;">1000</div>
      <div style="position: absolute; right: 40%; bottom: 0; font-weight: bold; font-size: 200%;">PPM</div>
    </div>
  `;

  const ctx = document.getElementById("mq4GaugeCanvas").getContext("2d");

  const gaugeChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      datasets: [{
        data: [0, 100],
        backgroundColor: ["#ff6f61", "#eaeaea"],
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


  // Update Firebase live data
  const label = document.getElementById("mq4GaugeCenter");
  onValue(ref(db, "mq4PPM"), snapshot => {
    const value = parseFloat(snapshot.val());
    if (!isNaN(value)) {
      const scaled = Math.min(Math.max(value / 10, 0), 100); // scale to 0–100
      gaugeChart.data.datasets[0].data = [scaled, 100 - scaled];
      gaugeChart.update();
      label.textContent = value.toFixed(0);
    }
  });
}
