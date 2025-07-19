// preload.js - Electron Preload Process

console.log("Preload script started execution."); // Debug log: Confirm preload script is running

const { contextBridge, ipcRenderer } = require('electron');

// Expose Electron APIs to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
    // Window controls
    minimizeWindow: () => {
        console.log("Preload: Sending minimize-window IPC."); // Debug log
        ipcRenderer.send('minimize-window');
    },
    maximizeWindow: () => {
        console.log("Preload: Sending maximize-window IPC."); // Debug log
        ipcRenderer.send('maximize-window');
    },
    closeWindow: () => {
        console.log("Preload: Sending close-window IPC."); // Debug log
        ipcRenderer.send('close-window');
    },

    // Dialogs
    openFolderDialog: () => {
        console.log("Preload: Invoking open-folder-dialog IPC."); // Debug log
        return ipcRenderer.invoke('open-folder-dialog');
    },
    openFileDialog: (filters) => {
        console.log("Preload: Invoking open-file-dialog IPC with filters:", filters); // Debug log
        return ipcRenderer.invoke('open-file-dialog', filters);
    },

    // Settings
    saveSettings: (settings) => {
        console.log("Preload: Invoking save-settings IPC."); // Debug log
        return ipcRenderer.invoke('save-settings', settings);
    },
    loadSettings: () => {
        console.log("Preload: Invoking load-settings IPC."); // Debug log
        return ipcRenderer.invoke('load-settings');
    },

    // Theme Management
    getThemes: () => {
        console.log("Preload: Invoking get-themes IPC.");
        return ipcRenderer.invoke('get-themes');
    },
    loadTheme: (themeName) => {
        console.log(`Preload: Invoking load-theme IPC for ${themeName}.`);
        return ipcRenderer.invoke('load-theme', themeName);
    },

    // Discord RPC
    setRpcStatus: (enabled) => {
        ipcRenderer.send('set-rpc-status', { enabled });
    },

    // Mod Management
    getInstalledMods: () => {
        console.log("Preload: Invoking get-installed-mods IPC."); // Debug log
        return ipcRenderer.invoke('get-installed-mods');
    },
    getAvailableMods: () => {
        console.log("Preload: Invoking get-available-mods IPC."); // Debug log
        return ipcRenderer.invoke('get-available-mods');
    },
    installMod: (modName, modPath) => {
        console.log("Preload: Invoking install-mod IPC."); // Debug log
        return ipcRenderer.invoke('install-mod', modName, modPath);
    },
    uninstallMod: (modName) => {
        console.log("Preload: Invoking uninstall-mod IPC."); // Debug log
        return ipcRenderer.invoke('uninstall-mod', modName);
    },
    uninstallAllMods: () => {
        console.log("Preload: Invoking uninstall-all-mods IPC."); // Debug log
        return ipcRenderer.invoke('uninstall-all-mods');
    },

    // Conversor
    convertToMmpackage: (modName, filePaths) => {
        console.log("Preload: Invoking convert-to-mmpackage IPC."); // Debug log
        return ipcRenderer.invoke('convert-to-mmpackage', modName, filePaths);
    },

    // Updates
    triggerUpdateCheck: () => {
        console.log("Preload: Invoking trigger-update-check IPC."); // Debug log
        return ipcRenderer.invoke('trigger-update-check');
    },
    openUpdateUrl: () => {
        console.log("Preload: Invoking open-update-url IPC."); // Debug log
        return ipcRenderer.invoke('open-update-url');
    },
    getAppVersion: () => {
        console.log("Preload: Invoking get-app-version IPC."); // Debug log
        return ipcRenderer.invoke('get-app-version');
    },

    // Console logging from main process
    onLogMessage: (callback) => {
        console.log("Preload: Setting up onLogMessage listener."); // Debug log
        ipcRenderer.on('log-message', (event, message) => callback(message));
    },

    // Update notifications from main process
    onUpdateAvailable: (callback) => {
        console.log("Preload: Setting up onUpdateAvailable listener."); // Debug log
        ipcRenderer.on('update-available', (event, data) => callback(data));
    },
    onNoUpdateAvailable: (callback) => {
        console.log("Preload: Setting up onNoUpdateAvailable listener."); // Debug log
        ipcRenderer.on('no-update-available', (event, data) => callback(data));
    }
});

console.log("Preload script finished exposing electronAPI."); // Debug log: Confirm exposure completed
