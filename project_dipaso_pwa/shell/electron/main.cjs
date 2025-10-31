const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const url = require('url');
require('dotenv').config();

let mainWindow = null;

// ⭐ DEFINICIÓN GLOBAL: Lista de todos los orígenes de los Micro Frontends (MFEs)
const MFE_ORIGINS = [
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003',
    'http://localhost:3004',
    'http://localhost:3005',
    'http://localhost:3006',
    'http://localhost:3007'
].join(' '); // Une todos los orígenes en un solo string para la CSP

function createWindow() {
    // ## Configuración de la Ventana
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        // Elimina el marco nativo y los botones
        frame: false, 
        resizable: false, 
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            // Deshabilita webSecurity en build para permitir carga local de MFEs
            webSecurity: process.env.VITE_ELECTRON_BUILD === 'true' ? false : true, 
            allowRunningInsecureContent: false,
        },
    });

    // ## Bloqueo de Cierre
    // Previene que Alt+F4, Ctrl+W, o el botón de la ventana cierren la app
    mainWindow.on('close', (e) => {
        e.preventDefault(); 
        console.log('Intento de cierre bloqueado.');
    });

    // ## Configuración de Content Security Policy (CSP)
    // 🛡️ CORRECCIÓN CLAVE: Permite la carga de scripts y conexiones a todos los puertos MFE
    mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self'; " +
          // (Script-src, connect-src, etc. se mantienen igual y funcionan)
          `script-src 'self' 'unsafe-eval' ${MFE_ORIGINS}; ` + 
          // ⭐ CORRECCIÓN CLAVE: Permitir estilos desde los MFEs
          `style-src 'self' 'unsafe-inline' ${MFE_ORIGINS}; ` + 
          "img-src 'self' data: blob:; " +
          `connect-src 'self' http://127.0.0.1:5000 http://localhost:3000 ws://localhost:3000 wss://* https://* ${MFE_ORIGINS}; ` +
          "font-src 'self' data:; " +
          "object-src 'none'; " +
          "base-uri 'self';"
        ],
      },
    });
  });

    // ## Lógica de Carga de Contenido
    if (process.env.VITE_DEV_SERVER_URL) {
        // Modo Desarrollo: Carga desde el servidor Vite (http://localhost:3000)
        mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    } else {
        // Modo Producción (Build): Carga desde dist/ con protocolo file://
        const startUrl = url.format({
            pathname: path.join(__dirname, '../dist/index.html'),
            protocol: 'file:',
            slashes: true,
        });
        mainWindow.loadURL(startUrl);
    }

    // Opcional: Abre las DevTools
    if (process.env.NODE_ENV === 'development' || !process.env.VITE_ELECTRON_BUILD) {
        // mainWindow.webContents.openDevTools(); 
    }

    // Limpia la referencia a la ventana al cerrarse
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// 🚀 Inicialización y Eventos de la Aplicación
app.whenReady().then(createWindow);

// Cierra la app cuando todas las ventanas se cierran (excepto en macOS)
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

ipcMain.on('navigate', (_, route) => {
    console.log(`Maps to ${route}`);
});