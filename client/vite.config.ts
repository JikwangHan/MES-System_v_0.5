import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite 설정: 번들 크기 경고 완화를 위해 vendor 청크 분리 및 경고 기준 상향
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          router: ['react-router-dom'],
          antd: ['antd', '@ant-design/icons'],
        },
      },
    },
  },
});
