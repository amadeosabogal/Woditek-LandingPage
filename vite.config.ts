import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/api-admin': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/api-scraper': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-scraper/, '/api')
      }
    }
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Woditek Admin',
        short_name: 'Admin',
        start_url: '/administracion',
        scope: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#3162fa',
        icons: [
          {
            src: '/pwa-192x192.webp',
            sizes: '192x192',
            type: 'image/webp'
          },
          {
            src: '/pwa-512x512.webp',
            sizes: '512x512',
            type: 'image/webp'
          }
        ]
      }
    })
  ],
})
