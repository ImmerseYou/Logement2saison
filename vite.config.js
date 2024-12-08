import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './',
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
            return `assets/images/[name][extname]`
          }
          if (/\.(mp4|webm|ogg)$/.test(assetInfo.name)) {
            return `assets/videos/[name][extname]`
          }
          if (/\.(woff|woff2|eot|ttf|otf)$/.test(assetInfo.name)) {
            return `assets/fonts/[name][extname]`
          }
          return `assets/[name][extname]`
        },
        chunkFileNames: 'assets/js/[name].[hash].js',
        entryFileNames: 'assets/js/[name].[hash].js',
      },
    },
  },
  publicDir: 'public',
})
