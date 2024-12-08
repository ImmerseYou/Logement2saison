import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Détermine si nous sommes en production (GitHub Pages) ou en développement (local)
const isProduction = process.env.NODE_ENV === 'production'

export default defineConfig({
  base: '/SeasonStay/',
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.')
          const ext = info[info.length - 1]
          if (/\.(png|jpe?g|gif|svg|webp|ico)$/.test(assetInfo.name)) {
            return `assets/images/[name].[hash][extname]`
          }
          if (/\.(css)$/.test(assetInfo.name)) {
            return `assets/css/[name].[hash][extname]`
          }
          if (/\.(woff|woff2|eot|ttf|otf)$/.test(assetInfo.name)) {
            return `assets/fonts/[name].[hash][extname]`
          }
          return `assets/[name].[hash][extname]`
        },
        chunkFileNames: 'assets/js/[name].[hash].js',
        entryFileNames: 'assets/js/[name].[hash].js',
      },
    },
  }
})
