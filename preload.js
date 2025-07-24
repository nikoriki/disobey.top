// preload.js - electron preload process

console.log("preload script started execution."); // debug log: confirm preload script is running

const { contextBridge, ipcRenderer } = require('electron');

// expose electron apis to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
    // window controls
    minimizeWindow: () => {
        console.log("preload: sending minimize-window ipc."); // debug log
        ipcRenderer.send('minimize-window');
    },
    maximizeWindow: () => {
        console.log("preload: sending maximize-window ipc."); // debug log
        ipcRenderer.send('maximize-window');
    },
    closeWindow: () => {
        console.log("preload: sending close-window ipc."); // debug log
        ipcRenderer.send('close-window');
    },

    // dialogs
    openFolderDialog: () => {
        console.log("preload: invoking open-folder-dialog ipc."); // debug log
        return ipcRenderer.invoke('open-folder-dialog');
    },
    openFileDialog: (filters) => {
        console.log("preload: invoking open-file-dialog ipc with filters:", filters); // debug log
        return ipcRenderer.invoke('open-file-dialog', filters);
    },

    // settings
    saveSettings: (settings) => {
        console.log("preload: invoking save-settings ipc."); // debug log
        return ipcRenderer.invoke('save-settings', settings);
    },
    loadSettings: () => {
        console.log("preload: invoking load-settings ipc."); // debug log
        return ipcRenderer.invoke('load-settings');
    },

    // discord rpc
    setRpcStatus: (enabled) => {
        ipcRenderer.send('set-rpc-status', { enabled });
    },

    // mod management
    getInstalledMods: () => {
        console.log("preload: invoking get-installed-mods ipc."); // debug log
        return ipcRenderer.invoke('get-installed-mods');
    },
    getAvailableMods: () => {
        console.log("preload: invoking get-available-mods ipc."); // debug log
        return ipcRenderer.invoke('get-available-mods');
    },
    installMod: (modName, modPath) => {
        console.log("preload: invoking install-mod ipc."); // debug log
        return ipcRenderer.invoke('install-mod', modName, modPath);
    },
    uninstallMod: (modName) => {
        console.log("preload: invoking uninstall-mod ipc."); // debug log
        return ipcRenderer.invoke('uninstall-mod', modName);
    },
    uninstallAllMods: () => {
        console.log("preload: invoking uninstall-all-mods ipc."); // debug log
        return ipcRenderer.invoke('uninstall-all-mods');
    },

    // conversor
    convertToMmpackage: (modName, filePaths) => {
        console.log("preload: invoking convert-to-mmpackage ipc."); // debug log
        return ipcRenderer.invoke('convert-to-mmpackage', modName, filePaths);
    },

    // updates
    triggerUpdateCheck: () => {
        console.log("preload: sending trigger-update-check ipc."); // debug log
        ipcRenderer.send('trigger-update-check');
    },
    openUpdateUrl: () => {
        console.log("preload: invoking open-update-url ipc."); // debug log
        return ipcRenderer.invoke('open-update-url');
    },
    getAppVersion: () => {
        console.log("preload: invoking get-app-version ipc."); // debug log
        return ipcRenderer.invoke('get-app-version');
    },

    // console logging from main process
    onLogMessage: (callback) => {
        console.log("preload: setting up onlogmessage listener."); // debug log
        ipcRenderer.on('log-message', (event, message) => callback(message));
    },

    // update notifications from main process
    onUpdateAvailable: (callback) => {
        console.log("preload: setting up onupdateavailable listener."); // debug log
        ipcRenderer.on('update-available', (event, data) => callback(data));
    },
    onNoUpdateAvailable: (callback) => {
        console.log("preload: setting up onnoupdateavailable listener."); // debug log
        ipcRenderer.on('no-update-available', (event, data) => callback(data));
    },
    
    // signal that renderer is ready
    rendererReady: () => {
        ipcRenderer.send('renderer-ready');
    }
});

console.log("preload script finished exposing electronapi."); // debug log: confirm exposure completed
