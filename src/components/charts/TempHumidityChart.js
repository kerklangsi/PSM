import { DataProcessor } from '../../utils/dataProcessor.js';
import { CONFIG } from '../../config/constants.js';
import { supabase } from '../../services/database.js';

export class TempHumidityChart {
  constructor() {
    this.containerId = 'tempHumiChart';
    this.allData = [];
    this.timeRange = '1m';
    this.chart = null;
    this.isUpdating = false;
    
    this.debouncedUpdate = DataProcessor.debounce(this.updateChart.bind(this), 100);
    this.setupEventListeners();
  }

  setupEventListeners() {
    const selector = document.getElementById('timeRangeTempHumi');
    if (selector) {
      selector.addEventListener('change', (e) => {
        this.timeRange = e.target.value;
        this.debouncedUpdate();
      });
    }
  }

  async fetchData() {
    const { data, error } = await supabase
      .from('ESP32PSM')
      .select('temperature, humidity, created_at')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Supabase fetch error:', error);
      return [];
    }

    return data.map(row => ({
      time: new Date(new Date(row.created_at).getTime() + 8 * 60 * 60 * 1000).getTime(),
      temp: row.temperature,
      humi: row.humidity
    }));
  }

  updateChart() {
    if (this.isUpdating) return;
    this.isUpdating = true;

    try {
      const now = Date.now() + 8 * 60 * 60 * 1000;
      const duration = CONFIG.TIME_RANGES[this.timeRange];
      const fromTime = now - duration;

      const filtered = this.timeRange === 'max' 
        ? this.allData 
        : this.allData.filter(p => p.time >= fromTime && p.time <= now);

      let tempPoints, humiPoints;
      const interval = CONFIG.AGGREGATION_INTERVALS[this.timeRange];

      if (['1m', 'max'].includes(this.timeRange) || !interval) {
        tempPoints = filtered.map(p => [p.time, p.temp]);
        humiPoints = filtered.map(p => [p.time, p.humi]);
      } else {
        const tempData = filtered.map(p => ({ time: p.time, value: p.temp }));
        const humiData = filtered.map(p => ({ time: p.time, value: p.humi }));
        tempPoints = DataProcessor.aggregateData(tempData, interval);
        humiPoints = DataProcessor.aggregateData(humiData, interval);
      }

      const chartConfig = {
        chart: { 
          type: 'spline', 
          reflow: true, 
          spacingRight: 10,
          animation: { duration: 300 }
        },
        title: { text: 'Temperature & Humidity Sensor Data' },
        xAxis: { 
          type: 'datetime', 
          title: { text: 'Time' }, 
          min: this.timeRange === 'max' ? null : fromTime, 
          max: this.timeRange === 'max' ? null : now 
        },
        yAxis: { title: { text: 'Values' }, min: 0 },
        tooltip: { xDateFormat: '%Y-%m-%d %H:%M:%S' },
        legend: { 
          layout: 'vertical', 
          align: 'right', 
          verticalAlign: 'top', 
          floating: true, 
          borderWidth: 1, 
          backgroundColor: '#FFFFFF' 
        },
        series: [
          { 
            name: 'Temperature (°C)', 
            data: tempPoints, 
            color: '#f5450a',
            marker: { enabled: tempPoints.length < 50 }
          },
          { 
            name: 'Humidity (%)', 
            data: humiPoints, 
            color: '#1e90ff',
            marker: { enabled: humiPoints.length < 50 }
          }
        ],
        plotOptions: {
          spline: {
            lineWidth: 2,
            states: {
              hover: { lineWidth: 3 }
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
      console.error('Error refreshing temp/humidity data:', error);
    }
  }

  startAutoRefresh() {
    this.refreshData();
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