import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['three', '@react-three/fiber', '@react-three/drei'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3001',
      '/socket.io': { target: 'http://localhost:3001', ws: true },
      '/claw3d': {
        target: 'http://127.0.0.1:3010',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/claw3d/, ''),
      },
      '/claw3d-adapter': {
        target: 'http://127.0.0.1:18790',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/claw3d-adapter/, ''),
      },
    },
  },
})
