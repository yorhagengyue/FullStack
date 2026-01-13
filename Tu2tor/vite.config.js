import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['framer-motion', 'lucide-react'],
          'editor-vendor': ['monaco-editor'],
        }
      }
    }
  },
  server: {
    host: '127.0.0.1', // 使用 IPv4 localhost
    port: 5174,        // 固定端口
    strictPort: false, // 如果端口被占用，自动尝试下一个
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  }
})
