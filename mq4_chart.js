import { supabase } from './firebase-init.js';

let allDataMQ4 = [];
let timeRangeMQ4 = '1m';

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

async function fetchSupabaseMQ4Data() {
  const { data, error } = await supabase
    .from('ESP32PSM')
    .select('mq4PPM, created_at')
    .order('created_at', { ascending: true });

  if (error) return [];

  return data.map(row => ({
    time: new Date(new Date(row.created_at).getTime() + 8 * 60 * 60 * 1000).getTime(),
    value: row.mq4PPM
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

function updateMQ4Chart() {
  const now = Date.now() + 8 * 60 * 60 * 1000;
  const duration = timeRanges[timeRangeMQ4];
  const interval = intervalMap[timeRangeMQ4];
  const fromTime = now - duration;

  const filtered = allDataMQ4.filter(p => timeRangeMQ4 === 'max' || (p.time >= fromTime && p.time <= now));
  const points = ['1m','max'].includes(timeRangeMQ4) ? filtered.map(p => [p.time, p.value]) : aggregateData(filtered, interval);

  Highcharts.chart('mq4Chart', {
    chart: { type: 'spline', reflow: true, spacingRight: 10 },
    title: { text: 'MQ4 PPM Sensor Data' },
    xAxis: { type: 'datetime', title: { text: 'Time' }, min: timeRangeMQ4 === 'max' ? null : fromTime, max: timeRangeMQ4 === 'max' ? null : now },
    yAxis: { title: { text: 'PPM' }, min: 0, max: 10000 },
    tooltip: { xDateFormat: '%Y-%m-%d %H:%M:%S', valueSuffix: ' PPM' },
    legend: { layout: 'vertical', align: 'right', verticalAlign: 'top', floating: true, borderWidth: 1, backgroundColor: '#FFFFFF' },
    series: [{ name: 'MQ4 PPM', data: points, color: '#e60909' }]
  });
}

document.getElementById('timeRangeMQ4').addEventListener('change', e => {
  timeRangeMQ4 = e.target.value;
  updateMQ4Chart();
});

setInterval(async () => {
  allDataMQ4 = await fetchSupabaseMQ4Data();
  updateMQ4Chart();
}, 5000);

fetchSupabaseMQ4Data().then(data => {
  allDataMQ4 = data;
  updateMQ4Chart();
});
