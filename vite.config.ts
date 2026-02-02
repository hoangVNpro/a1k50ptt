import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Quan trọng: Giúp đường dẫn tài nguyên (js, css) hoạt động đúng trên GitHub Pages
  build: {
    outDir: 'docs', // Đổi tên folder build thành 'docs' để deploy GitHub Pages dễ hơn
  }
})