import { CONFIG } from '../config/constants.js';

export class DataProcessor {
  static aggregateData(data, interval) {
    if (!data || data.length === 0) return [];
    
    const buckets = [];
    let bucketStart = data[0].time;
    let sum = 0;
    let count = 0;

    for (const point of data) {
      if (point.time < bucketStart + interval) {
        sum += point.value;
        count++;
      } else {
        if (count > 0) {
          buckets.push([bucketStart, sum / count]);
        }
        bucketStart += interval * Math.floor((point.time - bucketStart) / interval);
        sum = point.value;
        count = 1;
      }
    }
    
    if (count > 0) {
      buckets.push([bucketStart, sum / count]);
    }
    
    return buckets;
  }

  static filterDataByTimeRange(data, timeRange) {
    const now = Date.now() + 8 * 60 * 60 * 1000; // UTC+8
    const duration = CONFIG.TIME_RANGES[timeRange];
    const fromTime = now - duration;

    return timeRange === 'max' 
      ? data 
      : data.filter(p => p.time >= fromTime && p.time <= now);
  }

  static processChartData(data, timeRange) {
    const filtered = this.filterDataByTimeRange(data, timeRange);
    const interval = CONFIG.AGGREGATION_INTERVALS[timeRange];

    if (['1m', 'max'].includes(timeRange) || !interval) {
      return filtered.map(p => [p.time, p.value]);
    }

    return this.aggregateData(filtered, interval);
  }

  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  static throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
}