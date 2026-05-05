const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronBackend', {
  isElectron: () => true,
  checkPython: () => ipcRenderer.invoke('backend:check-python'),
  installDeps: () => ipcRenderer.invoke('backend:install-deps'),
  startServer: () => ipcRenderer.invoke('backend:start-server'),
})
