import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'posInventory',                // Nombre único del MFE
      filename: 'remoteEntry.js',          // Archivo que se exporta al shell
      exposes: {
        './InventoryApp': './src/App.tsx'  // Componente principal que el shell consumirá
      },
      shared: ['react', 'react-dom','react-router-dom'],      // Evita duplicar React y ReactDOM
    })
  ],
    build: {
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
    modulePreload:false
  },
  server: {
    port: 3004  // Puerto independiente para desarrollo
  }
})
