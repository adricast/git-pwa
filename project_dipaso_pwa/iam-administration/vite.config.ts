import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'iamAdmin',
      filename: 'remoteEntry.js',
      exposes: {
        './AdminPage': './src/app.tsx',
      },
      shared: ['react', 'react-dom','react-router-dom'],
      remotes: {},
    }),
  ],
  build: {
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
    modulePreload:false
  },
  server: {
    port: 3001,
  },
});
