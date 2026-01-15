import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.js'],
    include: ['src/**/__tests__/**/*.{js,jsx}'],
    exclude: ['server/**', 'node_modules/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary'],
      include: [
        'src/App.jsx',
        'src/context/**/*.jsx',
        'src/services/api.js'
      ],
      thresholds: {
        lines: 90,
        statements: 90,
        functions: 90,
        branches: 80
      }
    }
  }
});
