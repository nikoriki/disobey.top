const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // window controls
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  maximizeWindow: () => ipcRenderer.send('maximize-window'),
  closeWindow: () => ipcRenderer.send('close-window'),

  // dialogs
  openFolderDialog: () => ipcRenderer.invoke('open-folder-dialog'),
  openFileDialog: (filters) => ipcRenderer.invoke('open-file-dialog', filters),

  // settings
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  loadSettings: () => ipcRenderer.invoke('load-settings'),

  // discord rpc
  setRpcStatus: (enabled) => ipcRenderer.send('set-rpc-status', { enabled }),

  // mod management
  getInstalledMods: () => ipcRenderer.invoke('get-installed-mods'),
  getAvailableMods: () => ipcRenderer.invoke('get-available-mods'),
  installMod: (modName, modPath) => ipcRenderer.invoke('install-mod', modName, modPath),
  uninstallMod: (modName) => ipcRenderer.invoke('uninstall-mod', modName),
  uninstallAllMods: () => ipcRenderer.invoke('uninstall-all-mods'),
  getModConflicts: () => ipcRenderer.invoke('get-mod-conflicts'),

  // metadata
  saveModMetadata: (modName, metadata) => ipcRenderer.invoke('save-mod-metadata', modName, metadata),
  readModMetadata: (modName) => ipcRenderer.invoke('read-mod-metadata', modName),

  // conversor
  convertToMmpackage: (modName, filePaths) => ipcRenderer.invoke('convert-to-mmpackage', modName, filePaths),

  // update
  triggerUpdateCheck: () => ipcRenderer.send('trigger-update-check'),
  openUpdateUrl: () => ipcRenderer.invoke('open-update-url'),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  autoUpdateAndExit: (url) => ipcRenderer.send('auto-update-and-exit', url),

  // console logging from main process
  onLogMessage: (callback) => ipcRenderer.on('log-message', (event, message) => callback(message)),

  // update notifications from main process
  onUpdateAvailable: (callback) => ipcRenderer.on('update-available', (event, data) => callback(data)),
  onNoUpdateAvailable: (callback) => ipcRenderer.on('no-update-available', (event, data) => callback(data)),

  // live mods folder watcher
  onModsFolderChanged: (callback) => ipcRenderer.on('mods-folder-changed', callback),

  // signal that renderer is ready
  rendererReady: () => ipcRenderer.send('renderer-ready'),
});
