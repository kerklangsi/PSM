import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'firebase': ['@supabase/supabase-js'],
          'charts': ['chart.js', 'highcharts']
        }
      }
    }
  },
  server: {
    port: 3000
  }
});