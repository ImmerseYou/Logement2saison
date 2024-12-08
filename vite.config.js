import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/SeasonStay/',
  plugins: [react()],
  build: {
    outDir: 'dist'
  }
})
