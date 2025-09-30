import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'posBilling',                // Nombre único del MFE
      filename: 'remoteEntry.js',        // Archivo que se exporta al shell
      exposes: {
        './BillingApp': './src/App.tsx'  // Componente principal que el shell consumirá
      },
      shared: ['react', 'react-dom']     // Evita duplicar React y ReactDOM
    })
  ],
  server: {
    port: 3002  // Puerto independiente de desarrollo
  }
})
