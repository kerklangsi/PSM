import { BaseChart } from '../BaseChart.js';
import { supabase } from '../../services/database.js';

export class MQ4Chart extends BaseChart {
  constructor() {
    super('mq4Chart', 'MQ4 PPM Sensor Data', 'PPM', '#e60909', 'MQ4');
  }

  async fetchData() {
    const { data, error } = await supabase
      .from('ESP32PSM')
      .select('mq4PPM, created_at')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Supabase fetch error:', error);
      return [];
    }

    return data.map(row => ({
      time: new Date(new Date(row.created_at).getTime() + 8 * 60 * 60 * 1000).getTime(),
      value: row.mq4PPM
    }));
  }
}