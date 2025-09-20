import { BaseChart } from '../BaseChart.js';
import { supabase } from '../../services/database.js';

export class MQ6Chart extends BaseChart {
  constructor() {
    super('mq6Chart', 'MQ6 PPM Sensor Data', 'PPM', '#28a745', 'MQ6');
  }

  async fetchData() {
    const { data, error } = await supabase
      .from('ESP32PSM')
      .select('mq6PPM, created_at')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Supabase fetch error:', error);
      return [];
    }

    return data.map(row => ({
      time: new Date(new Date(row.created_at).getTime() + 8 * 60 * 60 * 1000).getTime(),
      value: row.mq6PPM
    }));
  }
}