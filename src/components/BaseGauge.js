export class BaseGauge {
  constructor(containerId, title, unit = '', maxValue = 100, color = '#36a2eb') {
    this.containerId = containerId;
    this.title = title;
    this.unit = unit;
    this.maxValue = maxValue;
    this.color = color;
    this.chart = null;
    this.label = null;
    
    this.init();
  }

  init() {
    this.createLayout();
    this.setupChart();
  }

  createLayout() {
    const card = document.getElementById(this.containerId);
    if (!card) return;

    card.innerHTML = `
      <h2>${this.title}</h2>
      <div style="position: relative; right: 0; bottom: 10%; width: 95%; margin: auto;">
        <canvas id="${this.containerId}Canvas" style="width: 100%; height: auto;"></canvas>
        <div id="${this.containerId}Center"
             style="position: absolute; top: 65%; left: 50%; transform: translate(-50%, -50%);
                    font-size: 250%; font-weight: bold; color: #444;">--</div>
        <div style="position: absolute; left: 0; bottom: 10%; font-size: 150%;">0${this.unit}</div>
        <div style="position: absolute; right: 0; bottom: 10%; font-size: 150%;">${this.maxValue}${this.unit}</div>
        ${this.unit === 'PPM' ? '<div style="position: absolute; right: 40%; bottom: 0; font-weight: bold; font-size: 200%;">PPM</div>' : ''}
      </div>
    `;
  }

  setupChart() {
    const ctx = document.getElementById(`${this.containerId}Canvas`)?.getContext("2d");
    if (!ctx) return;

    this.chart = new Chart(ctx, {
      type: "doughnut",
      data: {
        datasets: [{
          data: [0, 100],
          backgroundColor: [this.color, "#eaeaea"],
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
        },
        animation: {
          duration: 750,
          easing: 'easeInOutQuart'
        }
      }
    });

    this.label = document.getElementById(`${this.containerId}Center`);
  }

  updateValue(value) {
    if (!this.chart || !this.label || isNaN(value)) return;

    const scaledValue = this.unit === 'PPM' 
      ? Math.min(Math.max(value / (this.maxValue / 100), 0), 100)
      : Math.min(Math.max(value, 0), this.maxValue);

    this.chart.data.datasets[0].data = [scaledValue, 100 - scaledValue];
    this.chart.update('none'); // Disable animation for real-time updates
    
    const displayValue = this.unit === '%' || this.unit === '°C' 
      ? value.toFixed(2) 
      : value.toFixed(0);
    
    this.label.textContent = displayValue + this.unit;
  }

  destroy() {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
  }
}