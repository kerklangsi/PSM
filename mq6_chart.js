import { supabase } from './firebase-init.js'; // Clean import

let allDataMQ6 = [];
let timeRangeMQ6 = '1m';

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

async function fetchSupabaseMQ6Data() {
  const { data, error } = await supabase
    .from('ESP32PSM')
    .select('mq6PPM, created_at')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Supabase fetch error:', error);
    return [];
  }

  return data.map(row => ({
    time: new Date(row.created_at).getTime(),
    value: row.mq6PPM
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

function updateMQ6Chart() {
  const now = allDataMQ6.at(-1)?.time || Date.now();
  const duration = timeRanges[timeRangeMQ6];
  const interval = intervalMap[timeRangeMQ6];
  const fromTime = now - duration;

  const filtered = allDataMQ6.filter(p => timeRangeMQ6 === 'max' || (p.time >= fromTime && p.time <= now));
  const points = ['1m','10m','30m','max'].includes(timeRangeMQ6) ? filtered.map(p => [p.time, p.value]) : aggregateData(filtered, interval);

  Highcharts.chart('mq6Chart', {
    chart: { type: 'spline', reflow: true, spacingRight: 10 },
    title: { text: 'MQ6 PPM Sensor Data' },
    xAxis: { type: 'datetime', title: { text: 'Time' }, min: timeRangeMQ6 === 'max' ? null : fromTime, max: timeRangeMQ6 === 'max' ? null : now },
    yAxis: { title: { text: 'PPM' }, min: 0, max: 1000 },
    tooltip: { xDateFormat: '%Y-%m-%d %H:%M:%S', valueSuffix: ' PPM' },
    legend: { layout: 'vertical', align: 'right', verticalAlign: 'top', floating: true, borderWidth: 1, backgroundColor: '#FFFFFF' },
    series: [{ name: 'MQ6 PPM', data: points, color: '#28a745' }]
  });
}

document.getElementById('timeRangeMQ6').addEventListener('change', (e) => {
  timeRangeMQ6 = e.target.value;
  updateMQ6Chart();
});

setInterval(async () => {
  const data = await fetchSupabaseMQ6Data();
  allDataMQ6 = data;
  updateMQ6Chart();
}, 5000);

fetchSupabaseMQ6Data().then(data => {
  allDataMQ6 = data;
  updateMQ6Chart();
});
