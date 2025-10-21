import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation';
// https://vite.dev/config/
export default defineConfig({
   plugins: [
    react(),
    federation({
      name: 'authorizer',
      filename: 'remoteEntry.js',
      remotes: {
        shell: 'http://localhost:3000/assets/remoteEntry.js',
       
      },
      exposes: {
          // Exponemos la función de login y el sensor para la lógica
         './authExports': './src/auth-exports.ts', // Contiene authSensor, initAuthService, login
         
         // 🚨 NUEVA EXPOSICIÓN: El componente de la página de Login (UI)
         './LoginPage': './src/pages/LoginPage/LoginPage.jsx', // Asegúrate que esta ruta es correcta en Authorizer
  
        
      },
      shared: ['react', 'react-dom','react-router-dom'],
     
    }),
  ],
  build: {
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
    modulePreload:false
  },
  server: {
    port: 3007,
  },
})
