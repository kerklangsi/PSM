import { BaseGauge } from './components/BaseGauge.js';
import { MQ2Chart } from './components/charts/MQ2Chart.js';
import { MQ4Chart } from './components/charts/MQ4Chart.js';
import { MQ6Chart } from './components/charts/MQ6Chart.js';
import { TempHumidityChart } from './components/charts/TempHumidityChart.js';
import { GasTypeDisplay } from './components/GasTypeDisplay.js';
import { VibrationIndicator } from './components/VibrationIndicator.js';
import { LocationDisplay } from './components/LocationDisplay.js';
import { ref, onValue } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";
import { db } from './services/database.js';
import { CONFIG } from './config/constants.js';

class DashboardManager {
  constructor() {
    this.components = {};
    this.gauges = {};
    this.isInitialized = false;
  }

  async init() {
    if (this.isInitialized) return;

    try {
      // Wait for DOM to be ready
      if (document.readyState === 'loading') {
        await new Promise(resolve => {
          document.addEventListener('DOMContentLoaded', resolve);
        });
      }

      // Wait for Chart.js and Highcharts to load
      await this.waitForLibraries();

      // Initialize all components
      this.initializeGauges();
      this.initializeCharts();
      this.initializeDisplays();

      this.isInitialized = true;
      console.log('Dashboard initialized successfully');
    } catch (error) {
      console.error('Failed to initialize dashboard:', error);
    }
  }

  async waitForLibraries() {
    const checkLibraries = () => {
      return window.Chart && window.Highcharts;
    };

    if (checkLibraries()) return;

    return new Promise((resolve) => {
      const interval = setInterval(() => {
        if (checkLibraries()) {
          clearInterval(interval);
          resolve();
        }
      }, 100);
    });
  }

  initializeGauges() {
    // Create gauge instances
    this.gauges.mq2 = new BaseGauge('mq2Card', 'MQ-2', 'PPM', 1000, '#ff6f61');
    this.gauges.mq4 = new BaseGauge('mq4Card', 'MQ-4', 'PPM', 1000, '#ff6f61');
    this.gauges.mq6 = new BaseGauge('mq6Card', 'MQ-6', 'PPM', 1000, '#ff6f61');
    this.gauges.temperature = new BaseGauge('temperatureCard', 'Temperature', '°C', 100, '#36a2eb');
    this.gauges.humidity = new BaseGauge('humidityCard', 'Humidity', '%', 100, '#36a2eb');

    // Setup real-time data listeners with throttling
    const throttledUpdate = (gauge, path, scaleFactor = 1) => {
      let lastUpdate = 0;
      return onValue(ref(db, path), (snapshot) => {
        const now = Date.now();
        if (now - lastUpdate < 100) return; // Throttle updates to 10fps max
        
        const value = parseFloat(snapshot.val());
        if (!isNaN(value)) {
          gauge.updateValue(value / scaleFactor);
          lastUpdate = now;
        }
      });
    };

    // Setup listeners
    throttledUpdate(this.gauges.mq2, "mq2PPM");
    throttledUpdate(this.gauges.mq4, "mq4PPM");
    throttledUpdate(this.gauges.mq6, "mq6PPM");
    throttledUpdate(this.gauges.temperature, "temperature");
    throttledUpdate(this.gauges.humidity, "humidity");
  }

  initializeCharts() {
    this.components.mq2Chart = new MQ2Chart();
    this.components.mq4Chart = new MQ4Chart();
    this.components.mq6Chart = new MQ6Chart();
    this.components.tempHumiChart = new TempHumidityChart();

    // Start auto-refresh for all charts
    Object.values(this.components).forEach(chart => {
      if (chart.startAutoRefresh) {
        chart.startAutoRefresh();
      }
    });
  }

  initializeDisplays() {
    this.components.gasType = new GasTypeDisplay();
    this.components.vibration = new VibrationIndicator();
    this.components.location = new LocationDisplay();
  }

  destroy() {
    // Clean up all components
    Object.values(this.components).forEach(component => {
      if (component.destroy) {
        component.destroy();
      }
    });

    Object.values(this.gauges).forEach(gauge => {
      if (gauge.destroy) {
        gauge.destroy();
      }
    });

    this.components = {};
    this.gauges = {};
    this.isInitialized = false;
  }
}

// Initialize dashboard
const dashboard = new DashboardManager();
dashboard.init();

// Handle page visibility changes to optimize performance
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // Pause updates when page is not visible
    Object.values(dashboard.components).forEach(component => {
      if (component.stopAutoRefresh) {
        component.stopAutoRefresh();
      }
    });
  } else {
    // Resume updates when page becomes visible
    Object.values(dashboard.components).forEach(component => {
      if (component.startAutoRefresh) {
        component.startAutoRefresh();
      }
    });
  }
});

// Clean up on page unload
window.addEventListener('beforeunload', () => {
  dashboard.destroy();
});

// Export for debugging
window.dashboard = dashboard;