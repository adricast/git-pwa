// shell/vite.config.dev.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'shell',
      remotes: {
        // Para desarrollo - apuntar a los dev servers
        iamAdmin: 'http://localhost:3001/assets/remoteEntry.js',
        posBilling: 'http://localhost:3002/assets/remoteEntry.js',
        posCash: 'http://localhost:3003/assets/remoteEntry.js',
        posInventory: 'http://localhost:3004/assets/remoteEntry.js',
        posClients: 'http://localhost:3005/assets/remoteEntry.js',
        posAudit: 'http://localhost:3006/assets/remoteEntry.js',
        authorizer: 'http://localhost:3007/assets/remoteEntry.js'
      },
      shared: ['react', 'react-dom', 'react-router-dom'],
    }),
    VitePWA({
      // ... tu configuración PWA
    })
  ],
  server: {
    port: 3000
  }
})