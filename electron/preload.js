const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('desktop', {
  load: () => ipcRenderer.sendSync('data:load'),
  save: (list) => ipcRenderer.sendSync('data:save', list),
  dir: () => ipcRenderer.sendSync('data:dir')
});
