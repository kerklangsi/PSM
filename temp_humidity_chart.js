import { supabase } from './firebase-init.js';

let allDataTempHumi = [];
let timeRangeTempHumi = '1m';

const timeRanges = {
  '1m': 1 * 60 * 1000, '10m': 10 * 60 * 1000, '30m': 30 * 60 * 1000,
  '1h': 60 * 60 * 1000, '6h': 6 * 60 * 60 * 1000, '12h': 12 * 60 * 60 * 1000,
  '1d': 24 * 60 * 60 * 1000, '1w': 7 * 24 * 60 * 60 * 1000,
  '2w': 14 * 24 * 60 * 60 * 1000, '1mo': 30 * 24 * 60 * 60 * 1000,
  'max': Infinity
};

const intervalMap = {
  '10m': 10 * 1000, '30m': 30 * 1000, '1h': 60 * 1000,
  '6h': 5 * 60 * 1000, '12h': 10 * 60 * 1000, '1d': 15 * 60 * 1000,
  '1w': 30 * 60 * 1000, '2w': 60 * 60 * 1000, '1mo': 2 * 60 * 60 * 1000
};

async function fetchSupabaseTempHumiData() {
  const { data, error } = await supabase
    .from('ESP32PSM')
    .select('temperature, humidity, created_at')
    .order('created_at', { ascending: true });

  if (error) return [];

  return data.filter(row => {
    const adjusted = new Date(row.created_at).getTime() + 8 * 60 * 60 * 1000;
    return adjusted >= fromTime;
  }).map(row => ({
    time: new Date(new Date(row.created_at).getTime() + 8 * 60 * 60 * 1000).getTime(),
    temp: row.temperature,
    humi: row.humidity
  }));
}

function aggregateData(data, interval) {
  if (data.length === 0) return [];
  const buckets = [];
  let bucketStart = data[0].time;
  let sum = 0, count = 0;

  for (const point of data) {
    if (point.time < bucketStart + interval) {
      sum += point.value;
      count++;
    } else {
      buckets.push([bucketStart, sum / count]);
      bucketStart += interval * Math.floor((point.time - bucketStart) / interval);
      sum = point.value;
      count = 1;
    }
  }
  if (count > 0) buckets.push([bucketStart, sum / count]);
  return buckets;
}

function updateTempHumiChart() {
  const now = Date.now() + 8 * 60 * 60 * 1000;
  const duration = timeRanges[timeRangeTempHumi];
  const interval = intervalMap[timeRangeTempHumi];
  const fromTime = now - duration;

  const filtered = allDataTempHumi.filter(p => timeRangeTempHumi === 'max' || (p.time >= fromTime && p.time <= now));

  let tempPoints, humiPoints;
  if (['1m','10m','30m','max'].includes(timeRangeTempHumi)) {
    tempPoints = filtered.map(p => [p.time, p.temp]);
    humiPoints = filtered.map(p => [p.time, p.humi]);
  } else {
    const agg = aggregateData(filtered, interval);
    tempPoints = agg.temp;
    humiPoints = agg.humi;
  }

  Highcharts.chart('tempHumiChart', {
    chart: { type: 'spline', reflow: true, spacingRight: 10 },
    title: { text: 'Temperature & Humidity Sensor Data' },
    xAxis: { type: 'datetime', title: { text: 'Time' }, min: timeRangeTempHumi === 'max' ? null : fromTime, max: timeRangeTempHumi === 'max' ? null : now },
    yAxis: { title: { text: 'Values' }, min: 0 },
    tooltip: { xDateFormat: '%Y-%m-%d %H:%M:%S' },
    legend: { layout: 'vertical', align: 'right', verticalAlign: 'top', floating: true, borderWidth: 1, backgroundColor: '#FFFFFF' },
    series: [
      { name: 'Temperature (°C)', data: tempPoints, color: '#f5450a' },
      { name: 'Humidity (%)', data: humiPoints, color: '#1e90ff' }
    ]
  });
}

document.getElementById('timeRangeTempHumi').addEventListener('change', e => {
  timeRangeTempHumi = e.target.value;
  updateTempHumiChart();
});

setInterval(async () => {
  allDataTempHumi = await fetchSupabaseTempHumiData();
  updateTempHumiChart();
}, 5000);

fetchSupabaseTempHumiData().then(data => {
  allDataTempHumi = data;
  updateTempHumiChart();
});
