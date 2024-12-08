import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Détermine si nous sommes en production (GitHub Pages) ou en développement (local)
const isProduction = process.env.NODE_ENV === 'production'

export default defineConfig({
  base: isProduction ? '/SeasonStay/' : '/SeasonStay/',
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name].[hash].[ext]',
        chunkFileNames: 'assets/[name].[hash].js',
        entryFileNames: 'assets/[name].[hash].js',
      },
    },
  }
})
