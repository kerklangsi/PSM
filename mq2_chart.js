import { supabase } from './firebase-init.js'; // Clean import

let allDataMQ2 = [];
let timeRangeMQ2 = '1m';

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

async function fetchSupabaseMQ2Data() {
  const { data, error } = await supabase
    .from('ESP32PSM')
    .select('mq2PPM, created_at')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Supabase fetch error:', error);
    return [];
  }

  return data.map(row => ({
    time: new Date(row.created_at).getTime(),
    value: row.mq2PPM
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

function updateMQ2Chart() {
  const now = allDataMQ2.at(-1)?.time || Date.now();
  const duration = timeRanges[timeRangeMQ2];
  const interval = intervalMap[timeRangeMQ2];
  const fromTime = now - duration;

  const filtered = allDataMQ2.filter(p => timeRangeMQ2 === 'max' || (p.time >= fromTime && p.time <= now));
  const points = ['1m','10m','30m','max'].includes(timeRangeMQ2) ? filtered.map(p => [p.time, p.value]) : aggregateData(filtered, interval);

  Highcharts.chart('mq2Chart', {
    chart: { type: 'spline', reflow: true, spacingRight: 10 },
    title: { text: 'MQ2 PPM Sensor Data' },
    xAxis: { type: 'datetime', title: { text: 'Time' }, min: timeRangeMQ2 === 'max' ? null : fromTime, max: timeRangeMQ2 === 'max' ? null : now },
    yAxis: { title: { text: 'PPM' }, min: 0, max: 1000 },
    tooltip: { xDateFormat: '%Y-%m-%d %H:%M:%S', valueSuffix: ' PPM' },
    legend: { layout: 'vertical', align: 'right', verticalAlign: 'top', floating: true, borderWidth: 1, backgroundColor: '#FFFFFF' },
    series: [{ name: 'MQ2 PPM', data: points, color: '#28a745' }]
  });
}

document.getElementById('timeRangeMQ2').addEventListener('change', (e) => {
  timeRangeMQ2 = e.target.value;
  updateMQ2Chart();
});

setInterval(async () => {
  const data = await fetchSupabaseMQ2Data();
  allDataMQ2 = data;
  updateMQ2Chart();
}, 5000);

fetchSupabaseMQ2Data().then(data => {
  allDataMQ2 = data;
  updateMQ2Chart();
});
