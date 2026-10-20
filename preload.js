const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('petApi', {
  getAssets: () => ipcRenderer.invoke('pet:assets'),
  chat: (text) => ipcRenderer.invoke('pet:chat', text),
  onScript: (cb) => ipcRenderer.on('pet:script', (_e, script) => cb(script)),
  quit: () => ipcRenderer.send('pet:quit')
});
