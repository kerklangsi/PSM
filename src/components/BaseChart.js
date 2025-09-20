import { DataProcessor } from '../utils/dataProcessor.js';
import { CONFIG } from '../config/constants.js';

export class BaseChart {
  constructor(containerId, title, yAxisTitle, color, dataKey) {
    this.containerId = containerId;
    this.title = title;
    this.yAxisTitle = yAxisTitle;
    this.color = color;
    this.dataKey = dataKey;
    this.allData = [];
    this.timeRange = '1m';
    this.chart = null;
    this.isUpdating = false;
    
    this.debouncedUpdate = DataProcessor.debounce(this.updateChart.bind(this), 100);
    this.setupEventListeners();
  }

  setupEventListeners() {
    const selector = document.getElementById(`timeRange${this.containerId.replace('Chart', '').toUpperCase()}`);
    if (selector) {
      selector.addEventListener('change', (e) => {
        this.timeRange = e.target.value;
        this.debouncedUpdate();
      });
    }
  }

  async fetchData() {
    // Override in subclasses
    return [];
  }

  updateChart() {
    if (this.isUpdating) return;
    this.isUpdating = true;

    try {
      const now = Date.now() + 8 * 60 * 60 * 1000;
      const duration = CONFIG.TIME_RANGES[this.timeRange];
      const fromTime = now - duration;

      const points = DataProcessor.processChartData(this.allData, this.timeRange);

      const chartConfig = {
        chart: { 
          type: 'spline', 
          reflow: true, 
          spacingRight: 10,
          animation: {
            duration: 300
          }
        },
        title: { text: this.title },
        xAxis: { 
          type: 'datetime', 
          title: { text: 'Time' }, 
          min: this.timeRange === 'max' ? null : fromTime, 
          max: this.timeRange === 'max' ? null : now 
        },
        yAxis: { 
          title: { text: this.yAxisTitle }, 
          min: 0, 
          max: this.yAxisTitle === 'PPM' ? 10000 : undefined 
        },
        tooltip: { 
          xDateFormat: '%Y-%m-%d %H:%M:%S', 
          valueSuffix: this.yAxisTitle === 'PPM' ? ' PPM' : (this.yAxisTitle === 'Values' ? '' : ` ${this.yAxisTitle}`)
        },
        legend: { 
          layout: 'vertical', 
          align: 'right', 
          verticalAlign: 'top', 
          floating: true, 
          borderWidth: 1, 
          backgroundColor: '#FFFFFF' 
        },
        series: [{ 
          name: `${this.dataKey} ${this.yAxisTitle}`, 
          data: points, 
          color: this.color,
          marker: {
            enabled: points.length < 50
          }
        }],
        plotOptions: {
          spline: {
            lineWidth: 2,
            states: {
              hover: {
                lineWidth: 3
              }
            }
          }
        }
      };

      if (this.chart) {
        this.chart.destroy();
      }
      
      this.chart = Highcharts.chart(this.containerId, chartConfig);
    } finally {
      this.isUpdating = false;
    }
  }

  async refreshData() {
    try {
      this.allData = await this.fetchData();
      this.debouncedUpdate();
    } catch (error) {
      console.error(`Error refreshing data for ${this.containerId}:`, error);
    }
  }

  startAutoRefresh() {
    this.refreshData(); // Initial load
    
    this.refreshInterval = setInterval(() => {
      this.refreshData();
    }, CONFIG.UPDATE_INTERVALS.CHART_REFRESH);
  }

  stopAutoRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  destroy() {
    this.stopAutoRefresh();
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
  }
}