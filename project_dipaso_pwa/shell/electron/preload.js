const { contextBridge, ipcRenderer } = require('electron')

// Expone un objeto global llamado 'electronAPI' en la ventana del navegador.
contextBridge.exposeInMainWorld('electronAPI', {
  /**
   * Envía un mensaje al proceso principal para solicitar una navegación.
   * La función en el proceso principal es la que escucha 'navigate'.
   */
  navigate: (route) => ipcRenderer.send('navigate', route)
})