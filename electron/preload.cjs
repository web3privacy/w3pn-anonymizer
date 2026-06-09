const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronApp', {
  isElectron: () => ipcRenderer.invoke('app:is-electron'),
})
