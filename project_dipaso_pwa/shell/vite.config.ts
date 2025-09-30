import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';
import { VitePWA } from 'vite-plugin-pwa';
import fs from 'fs';
import path from 'path';

// Plugin para detectar cambios en remotos
function remoteNotifyPlugin() {
  return {
    name: 'remote-notify',
    configureServer(server: any) {
      const remotes = [
        '../iam-admin/dist/assets/remoteEntry.js',
        //'../pos-billing/dist/remoteEntry.js',
        // agrega los demás remotos si quieres
      ];

      remotes.forEach((remotePath) => {
        const fullPath = path.resolve(__dirname, remotePath);
        if (fs.existsSync(fullPath)) {
          fs.watch(fullPath, () => {
            console.log(`[HMR] Remote rebuilt: ${remotePath}`);
            server.ws.send({ type: 'full-reload', path: '*' });
          });
        }
      });
    }
  };
}

export default defineConfig({
  plugins: [
    react(),

    federation({
      name: 'shell',
      remotes: {
        iamAdmin: 'http://localhost:3001/assets/remoteEntry.js',
       
      },
      shared: ['react', 'react-dom', 'react-router-dom'],
      exposes:{},
    }),

    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "robots.txt"],
      manifest: {
        name: "Shell App",
        short_name: "Shell",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#0f172a",
        icons: [
          { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" }
        ]
      },
      workbox: {
        runtimeCaching: [
          { urlPattern: /^\/iam.*/, handler: "NetworkOnly" },
          { urlPattern: /^\/pos-billing.*/, handler: "NetworkFirst", options: { cacheName: "pos-billing-cache", expiration: { maxEntries: 50, maxAgeSeconds: 60*60*24*7 } } },
          { urlPattern: /^\/pos-cash.*/, handler: "NetworkFirst", options: { cacheName: "pos-cash-cache", expiration: { maxEntries: 50, maxAgeSeconds: 60*60*24*7 } } },
          { urlPattern: /^\/pos-inventory.*/, handler: "NetworkFirst", options: { cacheName: "pos-inventory-cache", expiration: { maxEntries: 50, maxAgeSeconds: 60*60*24*7 } } },
          { urlPattern: /^\/pos-clients.*/, handler: "NetworkFirst", options: { cacheName: "pos-clients-cache", expiration: { maxEntries: 50, maxAgeSeconds: 60*60*24*7 } } },
          { urlPattern: /^\/pos-audit.*/, handler: "NetworkFirst", options: { cacheName: "pos-audit-cache", expiration: { maxEntries: 50, maxAgeSeconds: 60*60*24*7 } } }
        ]
      }
    }),

    remoteNotifyPlugin(), // ✅ Aquí agregas el plugin
  ],

  server: {
    port: 3000,
    hmr: {
      host: 'localhost',
      port: 3000,
      protocol: 'ws'
    },
  watch: {
    usePolling: true,
  },
  },

  build:{
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
    modulePreload:false
  }
});
