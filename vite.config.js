import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: '/frontend-CST3144/',
  build: {
    outDir: 'docs'
  }
})
