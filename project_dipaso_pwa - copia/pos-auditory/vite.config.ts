import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'posAudit',               // Nombre del MFE que usará el shell
      filename: 'remoteEntry.js',     // Archivo que expondrá el MFE
      exposes: {
        './AuditApp': './src/App.tsx' // Componente principal expuesto
      },
      shared: ['react', 'react-dom','react-router-dom'],

    })
  ],
  build: {
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
    modulePreload:false
  },
  server: {
    port: 3006 // Puerto de desarrollo del MFE
  }
})
