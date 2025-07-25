// main.js - electron main process

const { app, BrowserWindow, ipcMain, dialog, shell, Menu } = require('electron');
const path = require('path');
const fs = require('fs-extra');
const os = require('os');
const yauzl = require('yauzl');
const yazl = require('yazl');
const DiscordRPC = require('discord-rpc');

// --- application details ---
const APP_VERSION = '';
const UPDATE_CHECK_URL = '';
const DOWNLOAD_URL = '';
const DISCORD_CLIENT_ID = ''; // used for discord rpc

// --- paths ---
const appDataPath = path.join(os.homedir(), 'AppData', 'Roaming', 'disobey.top');
const settingsFilePath = path.join(appDataPath, 'settings.json');
const installedModsFilePath = path.join(appDataPath, 'installed_mods.json');
const crashLogPath = path.join(appDataPath, 'crashlog.txt');

// --- crash reporter ---
process.on('uncaughtException', (error) => {
    const errorMessage = `\n=====================================================\nuncaught exception\ntimestamp: ${new Date().toISOString()}\nversion: ${APP_VERSION}\n-----------------------------------------------------\nerror: ${error.stack || error.toString()}\n=====================================================\n`;
    try {
        fs.appendFileSync(crashLogPath, errorMessage);
    } catch (logError) {
        console.error('failed to write to crash log:', logError);
    }
    dialog.showErrorBox('unhandled exception', `a critical error occurred. a crash log has been saved to:\n${crashLogPath}`);
    app.quit();
});

// --- discord rpc ---
let rpc;
const startTime = Date.now();

async function setActivity() {
    if (!rpc || !mainWindow) return;

    rpc.setActivity({
        state: 'modding dbd',
        startTimestamp: startTime,
        largeImageKey: 'iconomolon', // asset name in your discord app
        largeImageText: 'https://disobey.top',
        instance: false,
        buttons: [{
            label: 'visit disobey.top',
            url: 'https://disobey.top'
        }]
    }).catch(err => console.error('failed to set discord activity:', err));
}

async function initRPC() {
    if (rpc) return;
    try {
        rpc = new DiscordRPC.Client({ transport: 'ipc' });
        rpc.on('ready', () => {
            logToConsole('discord rpc connected.', 'system');
            setActivity();
            setInterval(setActivity, 15e3);
        });
        await rpc.login({ clientId: DISCORD_CLIENT_ID });
    } catch (error) {
        logToConsole(`discord rpc connection failed: ${error.message}`, 'error');
        rpc = null;
    }
}

async function destroyRPC() {
    if (!rpc) return;
    await rpc.destroy();
    rpc = null;
    logToConsole('discord rpc disconnected.', 'system');
}

// --- main application logic ---
const BASE_PAK_FILES_TEMPLATE = [ 
    "global.ucas", "global.utoc",
    "pakchunk0-{platformCode}.pak", "pakchunk0-{platformCode}.sig", "pakchunk0-{platformCode}.ucas", "pakchunk0-{platformCode}.utoc",
    "pakchunk1-{platformCode}.pak", "pakchunk1-{platformCode}.sig", "pakchunk1-{platformCode}.ucas", "pakchunk1-{platformCode}.utoc",
    "pakchunk2-{platformCode}.pak", "pakchunk2-{platformCode}.sig", "pakchunk2-{platformCode}.ucas", "pakchunk2-{platformCode}.utoc",
    "pakchunk3-{platformCode}.pak", "pakchunk3-{platformCode}.sig", "pakchunk3-{platformCode}.ucas", "pakchunk3-{platformCode}.utoc",
    "pakchunk4-{platformCode}.pak", "pakchunk4-{platformCode}.sig", "pakchunk4-{platformCode}.ucas", "pakchunk4-{platformCode}.utoc",
    "pakchunk5-{platformCode}.pak", "pakchunk5-{platformCode}.sig", "pakchunk5-{platformCode}.ucas", "pakchunk5-{platformCode}.utoc",
    "pakchunk6-{platformCode}.pak", "pakchunk6-{platformCode}.sig", "pakchunk6-{platformCode}.ucas", "pakchunk6-{platformCode}.utoc",
    "pakchunk7-{platformCode}.pak", "pakchunk7-{platformCode}.sig", "pakchunk7-{platformCode}.ucas", "pakchunk7-{platformCode}.utoc",
    "pakchunk8-{platformCode}.pak", "pakchunk8-{platformCode}.sig", "pakchunk8-{platformCode}.ucas", "pakchunk8-{platformCode}.utoc",
    "pakchunk9-{platformCode}.pak", "pakchunk9-{platformCode}.sig", "pakchunk9-{platformCode}.ucas", "pakchunk9-{platformCode}.utoc",
    "pakchunk10-{platformCode}.pak", "pakchunk10-{platformCode}.sig", "pakchunk10-{platformCode}.ucas", "pakchunk10-{platformCode}.utoc",
    "pakchunk11-{platformCode}.pak", "pakchunk11-{platformCode}.sig", "pakchunk11-{platformCode}.ucas", "pakchunk11-{platformCode}.utoc",
    "pakchunk12-{platformCode}.pak", "pakchunk12-{platformCode}.sig", "pakchunk12-{platformCode}.ucas", "pakchunk12-{platformCode}.utoc",
    "pakchunk13-{platformCode}.pak", "pakchunk13-{platformCode}.sig", "pakchunk13-{platformCode}.ucas", "pakchunk13-{platformCode}.utoc",
    "pakchunk14-{platformCode}.pak", "pakchunk14-{platformCode}.sig", "pakchunk14-{platformCode}.ucas", "pakchunk14-{platformCode}.utoc",
    "pakchunk15-{platformCode}.pak", "pakchunk15-{platformCode}.sig", "pakchunk15-{platformCode}.ucas", "pakchunk15-{platformCode}.utoc",
    "pakchunk16-{platformCode}.pak", "pakchunk16-{platformCode}.sig", "pakchunk16-{platformCode}.ucas", "pakchunk16-{platformCode}.utoc",
    "pakchunk17-{platformCode}.pak", "pakchunk17-{platformCode}.sig", "pakchunk17-{platformCode}.ucas", "pakchunk17-{platformCode}.utoc",
    "pakchunk18-{platformCode}.pak", "pakchunk18-{platformCode}.sig", "pakchunk18-{platformCode}.ucas", "pakchunk18-{platformCode}.utoc",
    "pakchunk19-{platformCode}.pak", "pakchunk19-{platformCode}.sig", "pakchunk19-{platformCode}.ucas", "pakchunk19-{platformCode}.utoc",
    "pakchunk20-{platformCode}.pak", "pakchunk20-{platformCode}.sig", "pakchunk20-{platformCode}.ucas", "pakchunk20-{platformCode}.utoc",
    "pakchunk21-{platformCode}.pak", "pakchunk21-{platformCode}.sig", "pakchunk21-{platformCode}.ucas", "pakchunk21-{platformCode}.utoc",
    "pakchunk22-{platformCode}.pak", "pakchunk22-{platformCode}.sig", "pakchunk22-{platformCode}.ucas", "pakchunk22-{platformCode}.utoc",
    "pakchunk99-{platformCode}.pak", "pakchunk99-{platformCode}.sig", "pakchunk99-{platformCode}.ucas", "pakchunk99-{platformCode}.utoc",
    "pakchunk1002-{platformCode}.pak", "pakchunk1002-{platformCode}.sig", "pakchunk1002-{platformCode}.ucas", "pakchunk1002-{platformCode}.utoc",
    "pakchunk1004-{platformCode}.pak", "pakchunk1004-{platformCode}.sig", "pakchunk1004-{platformCode}.ucas", "pakchunk1004-{platformCode}.utoc",
    "pakchunk1006-{platformCode}.pak", "pakchunk1006-{platformCode}.sig", "pakchunk1006-{platformCode}.ucas", "pakchunk1006-{platformCode}.utoc",
    "pakchunk1007-{platformCode}.pak", "pakchunk1007-{platformCode}.sig", "pakchunk1007-{platformCode}.ucas", "pakchunk1007-{platformCode}.utoc",
    "pakchunk1008-{platformCode}.pak", "pakchunk1008-{platformCode}.sig", "pakchunk1008-{platformCode}.ucas", "pakchunk1008-{platformCode}.utoc",
    "pakchunk1009-{platformCode}.pak", "pakchunk1009-{platformCode}.sig", "pakchunk1009-{platformCode}.ucas", "pakchunk1009-{platformCode}.utoc",
    "pakchunk1010-{platformCode}.pak", "pakchunk1010-{platformCode}.sig", "pakchunk1010-{platformCode}.ucas", "pakchunk1010-{platformCode}.utoc",
    "pakchunk1011-{platformCode}.pak", "pakchunk1011-{platformCode}.sig", "pakchunk1011-{platformCode}.ucas", "pakchunk1011-{platformCode}.utoc",
    "pakchunk1014-{platformCode}.pak", "pakchunk1014-{platformCode}.sig", "pakchunk1014-{platformCode}.ucas", "pakchunk1014-{platformCode}.utoc",
    "pakchunk1015-{platformCode}.pak", "pakchunk1015-{platformCode}.sig", "pakchunk1015-{platformCode}.ucas", "pakchunk1015-{platformCode}.utoc",
    "pakchunk1016-{platformCode}.pak", "pakchunk1016-{platformCode}.sig", "pakchunk1016-{platformCode}.ucas", "pakchunk1016-{platformCode}.utoc",
    "pakchunk1017-{platformCode}.pak", "pakchunk1017-{platformCode}.sig", "pakchunk1017-{platformCode}.ucas", "pakchunk1017-{platformCode}.utoc",
    "pakchunk1018-{platformCode}.pak", "pakchunk1018-{platformCode}.sig", "pakchunk1018-{platformCode}.ucas", "pakchunk1018-{platformCode}.utoc",
    "pakchunk1020-{platformCode}.pak", "pakchunk1020-{platformCode}.sig", "pakchunk1020-{platformCode}.ucas", "pakchunk1020-{platformCode}.utoc",
    "pakchunk1024-{platformCode}.pak", "pakchunk1024-{platformCode}.sig", "pakchunk1024-{platformCode}.ucas", "pakchunk1024-{platformCode}.utoc",
    "pakchunk1025-{platformCode}.pak", "pakchunk1025-{platformCode}.sig", "pakchunk1025-{platformCode}.ucas", "pakchunk1025-{platformCode}.utoc",
    "pakchunk1027-{platformCode}.pak", "pakchunk1027-{platformCode}.sig", "pakchunk1027-{platformCode}.ucas", "pakchunk1027-{platformCode}.utoc",
    "pakchunk1029-{platformCode}.pak", "pakchunk1029-{platformCode}.sig", "pakchunk1029-{platformCode}.ucas", "pakchunk1029-{platformCode}.utoc",
    "pakchunk1030-{platformCode}.pak", "pakchunk1030-{platformCode}.sig", "pakchunk1030-{platformCode}.ucas", "pakchunk1030-{platformCode}.utoc",
    "pakchunk1032-{platformCode}.pak", "pakchunk1032-{platformCode}.sig", "pakchunk1032-{platformCode}.ucas", "pakchunk1032-{platformCode}.utoc",
    "pakchunk1033-{platformCode}.pak", "pakchunk1033-{platformCode}.sig", "pakchunk1033-{platformCode}.ucas", "pakchunk1033-{platformCode}.utoc",
    "pakchunk1034-{platformCode}.pak", "pakchunk1034-{platformCode}.sig", "pakchunk1034-{platformCode}.ucas", "pakchunk1034-{platformCode}.utoc",
    "pakchunk1035-{platformCode}.pak", "pakchunk1035-{platformCode}.sig", "pakchunk1035-{platformCode}.ucas", "pakchunk1035-{platformCode}.utoc",
    "pakchunk1036-{platformCode}.pak", "pakchunk1036-{platformCode}.sig", "pakchunk1036-{platformCode}.ucas", "pakchunk1036-{platformCode}.utoc",
    "pakchunk1037-{platformCode}.pak", "pakchunk1037-{platformCode}.sig", "pakchunk1037-{platformCode}.ucas", "pakchunk1037-{platformCode}.utoc",
    "pakchunk1038-{platformCode}.pak", "pakchunk1038-{platformCode}.sig", "pakchunk1038-{platformCode}.ucas", "pakchunk1038-{platformCode}.utoc",
    "pakchunk1039-{platformCode}.pak", "pakchunk1039-{platformCode}.sig", "pakchunk1039-{platformCode}.ucas", "pakchunk1039-{platformCode}.utoc",
    "pakchunk1040-{platformCode}.pak", "pakchunk1040-{platformCode}.sig", "pakchunk1040-{platformCode}.ucas", "pakchunk1040-{platformCode}.utoc",
    "pakchunk1501-{platformCode}.pak", "pakchunk1501-{platformCode}.sig", "pakchunk1501-{platformCode}.ucas", "pakchunk1501-{platformCode}.utoc",
    "pakchunk1502-{platformCode}.pak", "pakchunk1502-{platformCode}.sig", "pakchunk1502-{platformCode}.ucas", "pakchunk1502-{platformCode}.utoc",
    "pakchunk1503-{platformCode}.pak", "pakchunk1503-{platformCode}.sig", "pakchunk1503-{platformCode}.ucas", "pakchunk1503-{platformCode}.utoc",
    "pakchunk1504-{platformCode}.pak", "pakchunk1504-{platformCode}.sig", "pakchunk1504-{platformCode}.ucas", "pakchunk1504-{platformCode}.utoc",
    "pakchunk1505-{platformCode}.pak", "pakchunk1505-{platformCode}.sig", "pakchunk1505-{platformCode}.ucas", "pakchunk1505-{platformCode}.utoc",
    "pakchunk1506-{platformCode}.pak", "pakchunk1506-{platformCode}.sig", "pakchunk1506-{platformCode}.ucas", "pakchunk1506-{platformCode}.utoc",
    "pakchunk1507-{platformCode}.pak", "pakchunk1507-{platformCode}.sig", "pakchunk1507-{platformCode}.ucas", "pakchunk1507-{platformCode}.utoc",
    "pakchunk1508-{platformCode}.pak", "pakchunk1508-{platformCode}.sig", "pakchunk1508-{platformCode}.ucas", "pakchunk1508-{platformCode}.utoc",
    "pakchunk1509-{platformCode}.pak", "pakchunk1509-{platformCode}.sig", "pakchunk1509-{platformCode}.ucas", "pakchunk1509-{platformCode}.utoc",
    "pakchunk1510-{platformCode}.pak", "pakchunk1510-{platformCode}.sig", "pakchunk1510-{platformCode}.ucas", "pakchunk1510-{platformCode}.utoc",
    "pakchunk1511-{platformCode}.pak", "pakchunk1511-{platformCode}.sig", "pakchunk1511-{platformCode}.ucas", "pakchunk1511-{platformCode}.utoc",
    "pakchunk1512-{platformCode}.pak", "pakchunk1512-{platformCode}.sig", "pakchunk1512-{platformCode}.ucas", "pakchunk1512-{platformCode}.utoc",
    "pakchunk1513-{platformCode}.pak", "pakchunk1513-{platformCode}.sig", "pakchunk1513-{platformCode}.ucas", "pakchunk1513-{platformCode}.utoc",
    "pakchunk1514-{platformCode}.pak", "pakchunk1514-{platformCode}.sig", "pakchunk1514-{platformCode}.ucas", "pakchunk1514-{platformCode}.utoc",
    "pakchunk1515-{platformCode}.pak", "pakchunk1515-{platformCode}.sig", "pakchunk1515-{platformCode}.ucas", "pakchunk1515-{platformCode}.utoc",
    "pakchunk1516-{platformCode}.pak", "pakchunk1516-{platformCode}.sig", "pakchunk1516-{platformCode}.ucas", "pakchunk1516-{platformCode}.utoc",
    "pakchunk1517-{platformCode}.pak", "pakchunk1517-{platformCode}.sig", "pakchunk1517-{platformCode}.ucas", "pakchunk1517-{platformCode}.utoc",
    "pakchunk1518-{platformCode}.pak", "pakchunk1518-{platformCode}.sig", "pakchunk1518-{platformCode}.ucas", "pakchunk1518-{platformCode}.utoc",
    "pakchunk1519-{platformCode}.pak", "pakchunk1519-{platformCode}.sig", "pakchunk1519-{platformCode}.ucas", "pakchunk1519-{platformCode}.utoc",
    "pakchunk1520-{platformCode}.pak", "pakchunk1520-{platformCode}.sig", "pakchunk1520-{platformCode}.ucas", "pakchunk1520-{platformCode}.utoc",
    "pakchunk1521-{platformCode}.pak", "pakchunk1521-{platformCode}.sig", "pakchunk1521-{platformCode}.ucas", "pakchunk1521-{platformCode}.utoc",
    "pakchunk1522-{platformCode}.pak", "pakchunk1522-{platformCode}.sig", "pakchunk1522-{platformCode}.ucas", "pakchunk1522-{platformCode}.utoc",
    "pakchunk1523-{platformCode}.pak", "pakchunk1523-{platformCode}.sig", "pakchunk1523-{platformCode}.ucas", "pakchunk1523-{platformCode}.utoc",
    "pakchunk1524-{platformCode}.pak", "pakchunk1524-{platformCode}.sig", "pakchunk1524-{platformCode}.ucas", "pakchunk1524-{platformCode}.utoc",
    "pakchunk1525-{platformCode}.pak", "pakchunk1525-{platformCode}.sig", "pakchunk1525-{platformCode}.ucas", "pakchunk1525-{platformCode}.utoc",
    "pakchunk1526-{platformCode}.pak", "pakchunk1526-{platformCode}.sig", "pakchunk1526-{platformCode}.ucas", "pakchunk1526-{platformCode}.utoc",
    "pakchunk1527-{platformCode}.pak", "pakchunk1527-{platformCode}.sig", "pakchunk1527-{platformCode}.ucas", "pakchunk1527-{platformCode}.utoc",
    "pakchunk1528-{platformCode}.pak", "pakchunk1528-{platformCode}.sig", "pakchunk1528-{platformCode}.ucas", "pakchunk1528-{platformCode}.utoc",
    "pakchunk1529-{platformCode}.pak", "pakchunk1529-{platformCode}.sig", "pakchunk1529-{platformCode}.ucas", "pakchunk1529-{platformCode}.utoc",
    "pakchunk1530-{platformCode}.pak", "pakchunk1530-{platformCode}.sig", "pakchunk1530-{platformCode}.ucas", "pakchunk1530-{platformCode}.utoc",
    "pakchunk1531-{platformCode}.pak", "pakchunk1531-{platformCode}.sig", "pakchunk1531-{platformCode}.ucas", "pakchunk1531-{platformCode}.utoc",
    "pakchunk1532-{platformCode}.pak", "pakchunk1532-{platformCode}.sig", "pakchunk1532-{platformCode}.ucas", "pakchunk1532-{platformCode}.utoc",
    "pakchunk1533-{platformCode}.pak", "pakchunk1533-{platformCode}.sig", "pakchunk1533-{platformCode}.ucas", "pakchunk1533-{platformCode}.utoc",
    "pakchunk1534-{platformCode}.pak", "pakchunk1534-{platformCode}.sig", "pakchunk1534-{platformCode}.ucas", "pakchunk1534-{platformCode}.utoc",
    "pakchunk1535-{platformCode}.pak", "pakchunk1535-{platformCode}.sig", "pakchunk1535-{platformCode}.ucas", "pakchunk1535-{platformCode}.utoc",
    "pakchunk1536-{platformCode}.pak", "pakchunk1536-{platformCode}.sig", "pakchunk1536-{platformCode}.ucas", "pakchunk1536-{platformCode}.utoc",
    "pakchunk1537-{platformCode}.pak", "pakchunk1537-{platformCode}.sig", "pakchunk1537-{platformCode}.ucas", "pakchunk1537-{platformCode}.utoc",
    "pakchunk1538-{platformCode}.pak", "pakchunk1538-{platformCode}.sig", "pakchunk1538-{platformCode}.ucas", "pakchunk1538-{platformCode}.utoc",
    "pakchunk1539-{platformCode}.pak", "pakchunk1539-{platformCode}.sig", "pakchunk1539-{platformCode}.ucas", "pakchunk1539-{platformCode}.utoc",
    "pakchunk1540-{platformCode}.pak", "pakchunk1540-{platformCode}.sig", "pakchunk1540-{platformCode}.ucas", "pakchunk1540-{platformCode}.utoc",
    "pakchunk1541-{platformCode}.pak", "pakchunk1541-{platformCode}.sig", "pakchunk1541-{platformCode}.ucas", "pakchunk1541-{platformCode}.utoc",
    "pakchunk1542-{platformCode}.pak", "pakchunk1542-{platformCode}.sig", "pakchunk1542-{platformCode}.ucas", "pakchunk1542-{platformCode}.utoc",
    "pakchunk1543-{platformCode}.pak", "pakchunk1543-{platformCode}.sig", "pakchunk1543-{platformCode}.ucas", "pakchunk1543-{platformCode}.utoc",
    "pakchunk1544-{platformCode}.pak", "pakchunk1544-{platformCode}.sig", "pakchunk1544-{platformCode}.ucas", "pakchunk1544-{platformCode}.utoc",
    "pakchunk1545-{platformCode}.pak", "pakchunk1545-{platformCode}.sig", "pakchunk1545-{platformCode}.ucas", "pakchunk1545-{platformCode}.utoc",
    "pakchunk1546-{platformCode}.pak", "pakchunk1546-{platformCode}.sig", "pakchunk1546-{platformCode}.ucas", "pakchunk1546-{platformCode}.utoc",
    "pakchunk2000-{platformCode}.pak", "pakchunk2000-{platformCode}.sig", "pakchunk2000-{platformCode}.ucas", "pakchunk2000-{platformCode}.utoc",
    "pakchunk2001-{platformCode}.pak", "pakchunk2001-{platformCode}.sig", "pakchunk2001-{platformCode}.ucas", "pakchunk2001-{platformCode}.utoc",
    "pakchunk2003-{platformCode}.pak", "pakchunk2003-{platformCode}.sig", "pakchunk2003-{platformCode}.ucas", "pakchunk2003-{platformCode}.utoc",
    "pakchunk2006-{platformCode}.pak", "pakchunk2006-{platformCode}.sig", "pakchunk2006-{platformCode}.ucas", "pakchunk2006-{platformCode}.utoc",
    "pakchunk2007-{platformCode}.pak", "pakchunk2007-{platformCode}.sig", "pakchunk2007-{platformCode}.ucas", "pakchunk2007-{platformCode}.utoc",
    "pakchunk2008-{platformCode}.pak", "pakchunk2008-{platformCode}.sig", "pakchunk2008-{platformCode}.ucas", "pakchunk2008-{platformCode}.utoc",
    "pakchunk2010-{platformCode}.pak", "pakchunk2010-{platformCode}.sig", "pakchunk2010-{platformCode}.ucas", "pakchunk2010-{platformCode}.utoc",
    "pakchunk2011-{platformCode}.pak", "pakchunk2011-{platformCode}.sig", "pakchunk2011-{platformCode}.ucas", "pakchunk2011-{platformCode}.utoc",
    "pakchunk2012-{platformCode}.pak", "pakchunk2012-{platformCode}.sig", "pakchunk2012-{platformCode}.ucas", "pakchunk2012-{platformCode}.utoc",
    "pakchunk2016-{platformCode}.pak", "pakchunk2016-{platformCode}.sig", "pakchunk2016-{platformCode}.ucas", "pakchunk2016-{platformCode}.utoc",
    "pakchunk2017-{platformCode}.pak", "pakchunk2017-{platformCode}.sig", "pakchunk2017-{platformCode}.ucas", "pakchunk2017-{platformCode}.utoc",
    "pakchunk2018-{platformCode}.pak", "pakchunk2018-{platformCode}.sig", "pakchunk2018-{platformCode}.ucas", "pakchunk2018-{platformCode}.utoc",
    "pakchunk2019-{platformCode}.pak", "pakchunk2019-{platformCode}.sig", "pakchunk2019-{platformCode}.ucas", "pakchunk2019-{platformCode}.utoc",
    "pakchunk2020-{platformCode}.pak", "pakchunk2020-{platformCode}.sig", "pakchunk2020-{platformCode}.ucas", "pakchunk2020-{platformCode}.utoc",
    "pakchunk2021-{platformCode}.pak", "pakchunk2021-{platformCode}.sig", "pakchunk2021-{platformCode}.ucas", "pakchunk2021-{platformCode}.utoc",
    "pakchunk2022-{platformCode}.pak", "pakchunk2022-{platformCode}.sig", "pakchunk2022-{platformCode}.ucas", "pakchunk2022-{platformCode}.utoc",
    "pakchunk2023-{platformCode}.pak", "pakchunk2023-{platformCode}.sig", "pakchunk2023-{platformCode}.ucas", "pakchunk2023-{platformCode}.utoc",
    "pakchunk2024-{platformCode}.pak", "pakchunk2024-{platformCode}.sig", "pakchunk2024-{platformCode}.ucas", "pakchunk2024-{platformCode}.utoc",
    "pakchunk2025-{platformCode}.pak", "pakchunk2025-{platformCode}.sig", "pakchunk2025-{platformCode}.ucas", "pakchunk2025-{platformCode}.utoc",
    "pakchunk2026-{platformCode}.pak", "pakchunk2026-{platformCode}.sig", "pakchunk2026-{platformCode}.ucas", "pakchunk2026-{platformCode}.utoc",
    "pakchunk2027-{platformCode}.pak", "pakchunk2027-{platformCode}.sig", "pakchunk2027-{platformCode}.ucas", "pakchunk2027-{platformCode}.utoc",
    "pakchunk2028-{platformCode}.pak", "pakchunk2028-{platformCode}.sig", "pakchunk2028-{platformCode}.ucas", "pakchunk2028-{platformCode}.utoc",
    "pakchunk2029-{platformCode}.pak", "pakchunk2029-{platformCode}.sig", "pakchunk2029-{platformCode}.ucas", "pakchunk2029-{platformCode}.utoc",
    "pakchunk2030-{platformCode}.pak", "pakchunk2030-{platformCode}.sig", "pakchunk2030-{platformCode}.ucas", "pakchunk2030-{platformCode}.utoc",
    "pakchunk2031-{platformCode}.pak", "pakchunk2031-{platformCode}.sig", "pakchunk2031-{platformCode}.ucas", "pakchunk2031-{platformCode}.utoc",
    "pakchunk2032-{platformCode}.pak", "pakchunk2032-{platformCode}.sig", "pakchunk2032-{platformCode}.ucas", "pakchunk2032-{platformCode}.utoc",
    "pakchunk2033-{platformCode}.pak", "pakchunk2033-{platformCode}.sig", "pakchunk2033-{platformCode}.ucas", "pakchunk2033-{platformCode}.utoc",
    "pakchunk2034-{platformCode}.pak", "pakchunk2034-{platformCode}.sig", "pakchunk2034-{platformCode}.ucas", "pakchunk2034-{platformCode}.utoc",
    "pakchunk2035-{platformCode}.pak", "pakchunk2035-{platformCode}.sig", "pakchunk2035-{platformCode}.ucas", "pakchunk2035-{platformCode}.utoc",
    "pakchunk2036-{platformCode}.pak", "pakchunk2036-{platformCode}.sig", "pakchunk2036-{platformCode}.ucas", "pakchunk2036-{platformCode}.utoc",
    "pakchunk2037-{platformCode}.pak", "pakchunk2037-{platformCode}.sig", "pakchunk2037-{platformCode}.ucas", "pakchunk2037-{platformCode}.utoc",
    "pakchunk2038-{platformCode}.pak", "pakchunk2038-{platformCode}.sig", "pakchunk2038-{platformCode}.ucas", "pakchunk2038-{platformCode}.utoc",
    "pakchunk2039-{platformCode}.pak", "pakchunk2039-{platformCode}.sig", "pakchunk2039-{platformCode}.ucas", "pakchunk2039-{platformCode}.utoc",
    "pakchunk2040-{platformCode}.pak", "pakchunk2040-{platformCode}.sig", "pakchunk2040-{platformCode}.ucas", "pakchunk2040-{platformCode}.utoc",
    "pakchunk2041-{platformCode}.pak", "pakchunk2041-{platformCode}.sig", "pakchunk2041-{platformCode}.ucas", "pakchunk2041-{platformCode}.utoc",
    "pakchunk2042-{platformCode}.pak", "pakchunk2042-{platformCode}.sig", "pakchunk2042-{platformCode}.ucas", "pakchunk2042-{platformCode}.utoc",
    "pakchunk2043-{platformCode}.pak", "pakchunk2043-{platformCode}.sig", "pakchunk2043-{platformCode}.ucas", "pakchunk2043-{platformCode}.utoc",
    "pakchunk2044-{platformCode}.pak", "pakchunk2044-{platformCode}.sig", "pakchunk2044-{platformCode}.ucas", "pakchunk2044-{platformCode}.utoc",
    "pakchunk2045-{platformCode}.pak", "pakchunk2045-{platformCode}.sig", "pakchunk2045-{platformCode}.ucas", "pakchunk2045-{platformCode}.utoc",
    "pakchunk2046-{platformCode}.pak", "pakchunk2046-{platformCode}.sig", "pakchunk2046-{platformCode}.ucas", "pakchunk2046-{platformCode}.utoc",
    "pakchunk2047-{platformCode}.pak", "pakchunk2047-{platformCode}.sig", "pakchunk2047-{platformCode}.ucas", "pakchunk2047-{platformCode}.utoc",
    "pakchunk2048-{platformCode}.pak", "pakchunk2048-{platformCode}.sig", "pakchunk2048-{platformCode}.ucas", "pakchunk2048-{platformCode}.utoc",
    "pakchunk2049-{platformCode}.pak", "pakchunk2049-{platformCode}.sig", "pakchunk2049-{platformCode}.ucas", "pakchunk2049-{platformCode}.utoc",
    "pakchunk2050-{platformCode}.pak", "pakchunk2050-{platformCode}.sig", "pakchunk2050-{platformCode}.ucas", "pakchunk2050-{platformCode}.utoc",
    "pakchunk2051-{platformCode}.pak", "pakchunk2051-{platformCode}.sig", "pakchunk2051-{platformCode}.ucas", "pakchunk2051-{platformCode}.utoc",
    "pakchunk2052-{platformCode}.pak", "pakchunk2052-{platformCode}.sig", "pakchunk2052-{platformCode}.ucas", "pakchunk2052-{platformCode}.utoc",
    "pakchunk2053-{platformCode}.pak", "pakchunk2053-{platformCode}.sig", "pakchunk2053-{platformCode}.ucas", "pakchunk2053-{platformCode}.utoc",
    "pakchunk2054-{platformCode}.pak", "pakchunk2054-{platformCode}.sig", "pakchunk2054-{platformCode}.ucas", "pakchunk2054-{platformCode}.utoc",
    "pakchunk2055-{platformCode}.pak", "pakchunk2055-{platformCode}.sig", "pakchunk2055-{platformCode}.ucas", "pakchunk2055-{platformCode}.utoc",
    "pakchunk2056-{platformCode}.pak", "pakchunk2056-{platformCode}.sig", "pakchunk2056-{platformCode}.ucas", "pakchunk2056-{platformCode}.utoc",
    "pakchunk2057-{platformCode}.pak", "pakchunk2057-{platformCode}.sig", "pakchunk2057-{platformCode}.ucas", "pakchunk2057-{platformCode}.utoc",
    "pakchunk2058-{platformCode}.pak", "pakchunk2058-{platformCode}.sig", "pakchunk2058-{platformCode}.ucas", "pakchunk2058-{platformCode}.utoc",
    "pakchunk2059-{platformCode}.pak", "pakchunk2059-{platformCode}.sig", "pakchunk2059-{platformCode}.ucas", "pakchunk2059-{platformCode}.utoc",
    "pakchunk2060-{platformCode}.pak", "pakchunk2060-{platformCode}.sig", "pakchunk2060-{platformCode}.ucas", "pakchunk2060-{platformCode}.utoc",
    "pakchunk2061-{platformCode}.pak", "pakchunk2061-{platformCode}.sig", "pakchunk2061-{platformCode}.ucas", "pakchunk2061-{platformCode}.utoc",
    "pakchunk2062-{platformCode}.pak", "pakchunk2062-{platformCode}.sig", "pakchunk2062-{platformCode}.ucas", "pakchunk2062-{platformCode}.utoc",
    "pakchunk2063-{platformCode}.pak", "pakchunk2063-{platformCode}.sig", "pakchunk2063-{platformCode}.ucas", "pakchunk2063-{platformCode}.utoc",
    "pakchunk2064-{platformCode}.pak", "pakchunk2064-{platformCode}.sig", "pakchunk2064-{platformCode}.ucas", "pakchunk2064-{platformCode}.utoc",
    "pakchunk2065-{platformCode}.pak", "pakchunk2065-{platformCode}.sig", "pakchunk2065-{platformCode}.ucas", "pakchunk2065-{platformCode}.utoc",
    "pakchunk2066-{platformCode}.pak", "pakchunk2066-{platformCode}.sig", "pakchunk2066-{platformCode}.ucas", "pakchunk2066-{platformCode}.utoc",
    "pakchunk2067-{platformCode}.pak", "pakchunk2067-{platformCode}.sig", "pakchunk2067-{platformCode}.ucas", "pakchunk2067-{platformCode}.utoc",
    "pakchunk2068-{platformCode}.pak", "pakchunk2068-{platformCode}.sig", "pakchunk2068-{platformCode}.ucas", "pakchunk2068-{platformCode}.utoc",
    "pakchunk2069-{platformCode}.pak", "pakchunk2069-{platformCode}.sig", "pakchunk2069-{platformCode}.ucas", "pakchunk2069-{platformCode}.utoc",
    "pakchunk2070-{platformCode}.pak", "pakchunk2070-{platformCode}.sig", "pakchunk2070-{platformCode}.ucas", "pakchunk2070-{platformCode}.utoc",
    "pakchunk2800-{platformCode}.pak", "pakchunk2800-{platformCode}.sig", "pakchunk2800-{platformCode}.ucas", "pakchunk2800-{platformCode}.utoc",
    "pakchunk2801-{platformCode}.pak", "pakchunk2801-{platformCode}.sig", "pakchunk2801-{platformCode}.ucas", "pakchunk2801-{platformCode}.utoc",
    "pakchunk2802-{platformCode}.pak", "pakchunk2802-{platformCode}.sig", "pakchunk2802-{platformCode}.ucas", "pakchunk2802-{platformCode}.utoc",
    "pakchunk3501-{platformCode}.pak", "pakchunk3501-{platformCode}.sig", "pakchunk3501-{platformCode}.ucas", "pakchunk3501-{platformCode}.utoc",
    "pakchunk3502-{platformCode}.pak", "pakchunk3502-{platformCode}.sig", "pakchunk3502-{platformCode}.ucas", "pakchunk3502-{platformCode}.utoc",
    "pakchunk3503-{platformCode}.pak", "pakchunk3503-{platformCode}.sig", "pakchunk3503-{platformCode}.ucas", "pakchunk3503-{platformCode}.utoc",
    "pakchunk3504-{platformCode}.pak", "pakchunk3504-{platformCode}.sig", "pakchunk3504-{platformCode}.ucas", "pakchunk3504-{platformCode}.utoc",
    "pakchunk3505-{platformCode}.pak", "pakchunk3505-{platformCode}.sig", "pakchunk3505-{platformCode}.ucas", "pakchunk3505-{platformCode}.utoc",
    "pakchunk3506-{platformCode}.pak", "pakchunk3506-{platformCode}.sig", "pakchunk3506-{platformCode}.ucas", "pakchunk3506-{platformCode}.utoc",
    "pakchunk3507-{platformCode}.pak", "pakchunk3507-{platformCode}.sig", "pakchunk3507-{platformCode}.ucas", "pakchunk3507-{platformCode}.utoc",
    "pakchunk3508-{platformCode}.pak", "pakchunk3508-{platformCode}.sig", "pakchunk3508-{platformCode}.ucas", "pakchunk3508-{platformCode}.utoc",
    "pakchunk3509-{platformCode}.pak", "pakchunk3509-{platformCode}.sig", "pakchunk3509-{platformCode}.ucas", "pakchunk3509-{platformCode}.utoc",
    "pakchunk3511-{platformCode}.pak", "pakchunk3511-{platformCode}.sig", "pakchunk3511-{platformCode}.ucas", "pakchunk3511-{platformCode}.utoc",
    "pakchunk3512-{platformCode}.pak", "pakchunk3512-{platformCode}.sig", "pakchunk3512-{platformCode}.ucas", "pakchunk3512-{platformCode}.utoc",
    "pakchunk3513-{platformCode}.pak", "pakchunk3513-{platformCode}.sig", "pakchunk3513-{platformCode}.ucas", "pakchunk3513-{platformCode}.utoc",
    "pakchunk3514-{platformCode}.pak", "pakchunk3514-{platformCode}.sig", "pakchunk3514-{platformCode}.ucas", "pakchunk3514-{platformCode}.utoc",
    "pakchunk3515-{platformCode}.pak", "pakchunk3515-{platformCode}.sig", "pakchunk3515-{platformCode}.ucas", "pakchunk3515-{platformCode}.utoc",
    "pakchunk3516-{platformCode}.pak", "pakchunk3516-{platformCode}.sig", "pakchunk3516-{platformCode}.ucas", "pakchunk3516-{platformCode}.utoc",
    "pakchunk3517-{platformCode}.pak", "pakchunk3517-{platformCode}.sig", "pakchunk3517-{platformCode}.ucas", "pakchunk3517-{platformCode}.utoc",
    "pakchunk3518-{platformCode}.pak", "pakchunk3518-{platformCode}.sig", "pakchunk3518-{platformCode}.ucas", "pakchunk3518-{platformCode}.utoc",
    "pakchunk3519-{platformCode}.pak", "pakchunk3519-{platformCode}.sig", "pakchunk3519-{platformCode}.ucas", "pakchunk3519-{platformCode}.utoc",
    "pakchunk3520-{platformCode}.pak", "pakchunk3520-{platformCode}.sig", "pakchunk3520-{platformCode}.ucas", "pakchunk3520-{platformCode}.utoc",
    "pakchunk3521-{platformCode}.pak", "pakchunk3521-{platformCode}.sig", "pakchunk3521-{platformCode}.ucas", "pakchunk3521-{platformCode}.utoc",
    "pakchunk3522-{platformCode}.pak", "pakchunk3522-{platformCode}.sig", "pakchunk3522-{platformCode}.ucas", "pakchunk3522-{platformCode}.utoc",
    "pakchunk3523-{platformCode}.pak", "pakchunk3523-{platformCode}.sig", "pakchunk3523-{platformCode}.ucas", "pakchunk3523-{platformCode}.utoc",
    "pakchunk3524-{platformCode}.pak", "pakchunk3524-{platformCode}.sig", "pakchunk3524-{platformCode}.ucas", "pakchunk3524-{platformCode}.utoc",
    "pakchunk3525-{platformCode}.pak", "pakchunk3525-{platformCode}.sig", "pakchunk3525-{platformCode}.ucas", "pakchunk3525-{platformCode}.utoc",
    "pakchunk3526-{platformCode}.pak", "pakchunk3526-{platformCode}.sig", "pakchunk3526-{platformCode}.ucas", "pakchunk3526-{platformCode}.utoc",
    "pakchunk3527-{platformCode}.pak", "pakchunk3527-{platformCode}.sig", "pakchunk3527-{platformCode}.ucas", "pakchunk3527-{platformCode}.utoc",
    "pakchunk3528-{platformCode}.pak", "pakchunk3528-{platformCode}.sig", "pakchunk3528-{platformCode}.ucas", "pakchunk3528-{platformCode}.utoc",
    "pakchunk3529-{platformCode}.pak", "pakchunk3529-{platformCode}.sig", "pakchunk3529-{platformCode}.ucas", "pakchunk3529-{platformCode}.utoc",
    "pakchunk3530-{platformCode}.pak", "pakchunk3530-{platformCode}.sig", "pakchunk3530-{platformCode}.ucas", "pakchunk3530-{platformCode}.utoc",
    "pakchunk3531-{platformCode}.pak", "pakchunk3531-{platformCode}.sig", "pakchunk3531-{platformCode}.ucas", "pakchunk3531-{platformCode}.utoc",
    "pakchunk3532-{platformCode}.pak", "pakchunk3532-{platformCode}.sig", "pakchunk3532-{platformCode}.ucas", "pakchunk3532-{platformCode}.utoc",
    "pakchunk3533-{platformCode}.pak", "pakchunk3533-{platformCode}.sig", "pakchunk3533-{platformCode}.ucas", "pakchunk3533-{platformCode}.utoc",
    "pakchunk3534-{platformCode}.pak", "pakchunk3534-{platformCode}.sig", "pakchunk3534-{platformCode}.ucas", "pakchunk3534-{platformCode}.utoc",
    "pakchunk3536-{platformCode}.pak", "pakchunk3536-{platformCode}.sig", "pakchunk3536-{platformCode}.ucas", "pakchunk3536-{platformCode}.utoc",
    "pakchunk3537-{platformCode}.pak", "pakchunk3537-{platformCode}.sig", "pakchunk3537-{platformCode}.ucas", "pakchunk3537-{platformCode}.utoc",
    "pakchunk3538-{platformCode}.pak", "pakchunk3538-{platformCode}.sig", "pakchunk3538-{platformCode}.ucas", "pakchunk3538-{platformCode}.utoc",
    "pakchunk3539-{platformCode}.pak", "pakchunk3539-{platformCode}.sig", "pakchunk3539-{platformCode}.ucas", "pakchunk3539-{platformCode}.utoc",
    "pakchunk3701-{platformCode}.pak", "pakchunk3701-{platformCode}.sig", "pakchunk3701-{platformCode}.ucas", "pakchunk3701-{platformCode}.utoc",
    "pakchunk3702-{platformCode}.pak", "pakchunk3702-{platformCode}.sig", "pakchunk3702-{platformCode}.ucas", "pakchunk3702-{platformCode}.utoc",
    "pakchunk3703-{platformCode}.pak", "pakchunk3703-{platformCode}.sig", "pakchunk3703-{platformCode}.ucas", "pakchunk3703-{platformCode}.utoc",
    "pakchunk3704-{platformCode}.pak", "pakchunk3704-{platformCode}.sig", "pakchunk3704-{platformCode}.ucas", "pakchunk3704-{platformCode}.utoc",
    "pakchunk3705-{platformCode}.pak", "pakchunk3705-{platformCode}.sig", "pakchunk3705-{platformCode}.ucas", "pakchunk3705-{platformCode}.utoc",
    "pakchunk3706-{platformCode}.pak", "pakchunk3706-{platformCode}.sig", "pakchunk3706-{platformCode}.ucas", "pakchunk3706-{platformCode}.utoc",
    "pakchunk3707-{platformCode}.pak", "pakchunk3707-{platformCode}.sig", "pakchunk3707-{platformCode}.ucas", "pakchunk3707-{platformCode}.utoc",
    "pakchunk3708-{platformCode}.pak", "pakchunk3708-{platformCode}.sig", "pakchunk3708-{platformCode}.ucas", "pakchunk3708-{platformCode}.utoc",
    "pakchunk3709-{platformCode}.pak", "pakchunk3709-{platformCode}.sig", "pakchunk3709-{platformCode}.ucas", "pakchunk3709-{platformCode}.utoc",
    "pakchunk3710-{platformCode}.pak", "pakchunk3710-{platformCode}.sig", "pakchunk3710-{platformCode}.ucas", "pakchunk3710-{platformCode}.utoc",
    "pakchunk3712-{platformCode}.pak", "pakchunk3712-{platformCode}.sig", "pakchunk3712-{platformCode}.ucas", "pakchunk3712-{platformCode}.utoc",
    "pakchunk3713-{platformCode}.pak", "pakchunk3713-{platformCode}.sig", "pakchunk3713-{platformCode}.ucas", "pakchunk3713-{platformCode}.utoc",
    "pakchunk3714-{platformCode}.pak", "pakchunk3714-{platformCode}.sig", "pakchunk3714-{platformCode}.ucas", "pakchunk3714-{platformCode}.utoc",
    "pakchunk3715-{platformCode}.pak", "pakchunk3715-{platformCode}.sig", "pakchunk3715-{platformCode}.ucas", "pakchunk3715-{platformCode}.utoc",
    "pakchunk3716-{platformCode}.pak", "pakchunk3716-{platformCode}.sig", "pakchunk3716-{platformCode}.ucas", "pakchunk3716-{platformCode}.utoc",
    "pakchunk3717-{platformCode}.pak", "pakchunk3717-{platformCode}.sig", "pakchunk3717-{platformCode}.ucas", "pakchunk3717-{platformCode}.utoc",
    "pakchunk3718-{platformCode}.pak", "pakchunk3718-{platformCode}.sig", "pakchunk3718-{platformCode}.ucas", "pakchunk3718-{platformCode}.utoc",
    "pakchunk3719-{platformCode}.pak", "pakchunk3719-{platformCode}.sig", "pakchunk3719-{platformCode}.ucas", "pakchunk3719-{platformCode}.utoc",
    "pakchunk3720-{platformCode}.pak", "pakchunk3720-{platformCode}.sig", "pakchunk3720-{platformCode}.ucas", "pakchunk3720-{platformCode}.utoc",
    "pakchunk3721-{platformCode}.pak", "pakchunk3721-{platformCode}.sig", "pakchunk3721-{platformCode}.ucas", "pakchunk3721-{platformCode}.utoc",
    "pakchunk3722-{platformCode}.pak", "pakchunk3722-{platformCode}.sig", "pakchunk3722-{platformCode}.ucas", "pakchunk3722-{platformCode}.utoc",
    "pakchunk3723-{platformCode}.pak", "pakchunk3723-{platformCode}.sig", "pakchunk3723-{platformCode}.ucas", "pakchunk3723-{platformCode}.utoc",
    "pakchunk3724-{platformCode}.pak", "pakchunk3724-{platformCode}.sig", "pakchunk3724-{platformCode}.ucas", "pakchunk3724-{platformCode}.utoc",
    "pakchunk3725-{platformCode}.pak", "pakchunk3725-{platformCode}.sig", "pakchunk3725-{platformCode}.ucas", "pakchunk3725-{platformCode}.utoc",
    "pakchunk3726-{platformCode}.pak", "pakchunk3726-{platformCode}.sig", "pakchunk3726-{platformCode}.ucas", "pakchunk3726-{platformCode}.utoc",
    "pakchunk3727-{platformCode}.pak", "pakchunk3727-{platformCode}.sig", "pakchunk3727-{platformCode}.ucas", "pakchunk3727-{platformCode}.utoc",
    "pakchunk3728-{platformCode}.pak", "pakchunk3728-{platformCode}.sig", "pakchunk3728-{platformCode}.ucas", "pakchunk3728-{platformCode}.utoc",
    "pakchunk3729-{platformCode}.pak", "pakchunk3729-{platformCode}.sig", "pakchunk3729-{platformCode}.ucas", "pakchunk3729-{platformCode}.utoc",
    "pakchunk3730-{platformCode}.pak", "pakchunk3730-{platformCode}.sig", "pakchunk3730-{platformCode}.ucas", "pakchunk3730-{platformCode}.utoc",
    "pakchunk3731-{platformCode}.pak", "pakchunk3731-{platformCode}.sig", "pakchunk3731-{platformCode}.ucas", "pakchunk3731-{platformCode}.utoc",
    "pakchunk3732-{platformCode}.pak", "pakchunk3732-{platformCode}.sig", "pakchunk3732-{platformCode}.ucas", "pakchunk3732-{platformCode}.utoc",
    "pakchunk3733-{platformCode}.pak", "pakchunk3733-{platformCode}.sig", "pakchunk3733-{platformCode}.ucas", "pakchunk3733-{platformCode}.utoc",
    "pakchunk3734-{platformCode}.pak", "pakchunk3734-{platformCode}.sig", "pakchunk3734-{platformCode}.ucas", "pakchunk3734-{platformCode}.utoc",
    "pakchunk3735-{platformCode}.pak", "pakchunk3735-{platformCode}.sig", "pakchunk3735-{platformCode}.ucas", "pakchunk3535-{platformCode}.utoc",
    "pakchunk3736-{platformCode}.pak", "pakchunk3736-{platformCode}.sig", "pakchunk3736-{platformCode}.ucas", "pakchunk3736-{platformCode}.utoc",
    "pakchunk3737-{platformCode}.pak", "pakchunk3737-{platformCode}.sig", "pakchunk3737-{platformCode}.ucas", "pakchunk3737-{platformCode}.utoc",
    "pakchunk3738-{platformCode}.pak", "pakchunk3738-{platformCode}.sig", "pakchunk3738-{platformCode}.ucas", "pakchunk3738-{platformCode}.utoc",
    "pakchunk3739-{platformCode}.pak", "pakchunk3739-{platformCode}.sig", "pakchunk3739-{platformCode}.ucas", "pakchunk3739-{platformCode}.utoc",
    "pakchunk3740-{platformCode}.pak", "pakchunk3740-{platformCode}.sig", "pakchunk3740-{platformCode}.ucas", "pakchunk3740-{platformCode}.utoc",
    "pakchunk3742-{platformCode}.pak", "pakchunk3742-{platformCode}.sig", "pakchunk3742-{platformCode}.ucas", "pakchunk3742-{platformCode}.utoc",
    "pakchunk3743-{platformCode}.pak", "pakchunk3743-{platformCode}.sig", "pakchunk3743-{platformCode}.ucas", "pakchunk3743-{platformCode}.utoc",
    "pakchunk3744-{platformCode}.pak", "pakchunk3744-{platformCode}.sig", "pakchunk3744-{platformCode}.ucas", "pakchunk3744-{platformCode}.utoc",
    "pakchunk3745-{platformCode}.pak", "pakchunk3745-{platformCode}.sig", "pakchunk3745-{platformCode}.ucas", "pakchunk3745-{platformCode}.utoc",
    "pakchunk4001-{platformCode}.pak", "pakchunk4001-{platformCode}.sig", "pakchunk4001-{platformCode}.ucas", "pakchunk4001-{platformCode}.utoc",
    "pakchunk4100-{platformCode}.pak", "pakchunk4100-{platformCode}.sig", "pakchunk4100-{platformCode}.ucas", "pakchunk4100-{platformCode}.utoc",
    "pakchunk4101-{platformCode}.pak", "pakchunk4101-{platformCode}.sig", "pakchunk4101-{platformCode}.ucas", "pakchunk4101-{platformCode}.utoc",
    "pakchunk4102-{platformCode}.pak", "pakchunk4102-{platformCode}.sig", "pakchunk4102-{platformCode}.ucas", "pakchunk4102-{platformCode}.utoc",
    "pakchunk4103-{platformCode}.pak", "pakchunk4103-{platformCode}.sig", "pakchunk4103-{platformCode}.ucas", "pakchunk4103-{platformCode}.utoc",
    "pakchunk4104-{platformCode}.pak", "pakchunk4104-{platformCode}.sig", "pakchunk4104-{platformCode}.ucas", "pakchunk4104-{platformCode}.utoc",
    "pakchunk4105-{platformCode}.pak", "pakchunk4105-{platformCode}.sig", "pakchunk4105-{platformCode}.ucas", "pakchunk4105-{platformCode}.utoc",
    "pakchunk4106-{platformCode}.pak", "pakchunk4106-{platformCode}.sig", "pakchunk4106-{platformCode}.ucas", "pakchunk4106-{platformCode}.utoc",
    "pakchunk4107-{platformCode}.pak", "pakchunk4107-{platformCode}.sig", "pakchunk4107-{platformCode}.ucas", "pakchunk4107-{platformCode}.utoc",
    "pakchunk4108-{platformCode}.pak", "pakchunk4108-{platformCode}.sig", "pakchunk4108-{platformCode}.ucas", "pakchunk4108-{platformCode}.utoc",
    "pakchunk4109-{platformCode}.pak", "pakchunk4109-{platformCode}.sig", "pakchunk4109-{platformCode}.ucas", "pakchunk4109-{platformCode}.utoc",
    "pakchunk4110-{platformCode}.pak", "pakchunk4110-{platformCode}.sig", "pakchunk4110-{platformCode}.ucas", "pakchunk4110-{platformCode}.utoc",
    "pakchunk4111-{platformCode}.pak", "pakchunk4111-{platformCode}.sig", "pakchunk4111-{platformCode}.ucas", "pakchunk4111-{platformCode}.utoc",
    "pakchunk4112-{platformCode}.pak", "pakchunk4112-{platformCode}.sig", "pakchunk4112-{platformCode}.ucas", "pakchunk4112-{platformCode}.utoc",
    "pakchunk4113-{platformCode}.pak", "pakchunk4113-{platformCode}.sig", "pakchunk4113-{platformCode}.ucas", "pakchunk4113-{platformCode}.utoc",
    "pakchunk4114-{platformCode}.pak", "pakchunk4114-{platformCode}.sig", "pakchunk4114-{platformCode}.ucas", "pakchunk4114-{platformCode}.utoc",
    "pakchunk4115-{platformCode}.pak", "pakchunk4115-{platformCode}.sig", "pakchunk4115-{platformCode}.ucas", "pakchunk4115-{platformCode}.utoc",
    "pakchunk4116-{platformCode}.pak", "pakchunk4116-{platformCode}.sig", "pakchunk4116-{platformCode}.ucas", "pakchunk4116-{platformCode}.utoc",
    "pakchunk4117-{platformCode}.pak", "pakchunk4117-{platformCode}.sig", "pakchunk4117-{platformCode}.ucas", "pakchunk4117-{platformCode}.utoc",
    "pakchunk4118-{platformCode}.pak", "pakchunk4118-{platformCode}.sig", "pakchunk4118-{platformCode}.ucas", "pakchunk4118-{platformCode}.utoc",
    "pakchunk4119-{platformCode}.pak", "pakchunk4119-{platformCode}.sig", "pakchunk4119-{platformCode}.ucas", "pakchunk4119-{platformCode}.utoc",
    "pakchunk4120-{platformCode}.pak", "pakchunk4120-{platformCode}.sig", "pakchunk4120-{platformCode}.ucas", "pakchunk4120-{platformCode}.utoc",
    "pakchunk4121-{platformCode}.pak", "pakchunk4121-{platformCode}.sig", "pakchunk4121-{platformCode}.ucas", "pakchunk4121-{platformCode}.utoc",
    "pakchunk4900-{platformCode}.pak", "pakchunk4900-{platformCode}.sig", "pakchunk4900-{platformCode}.ucas", "pakchunk4900-{platformCode}.utoc",
    "pakchunk4999-{platformCode}.pak", "pakchunk4999-{platformCode}.sig", "pakchunk4999-{platformCode}.ucas", "pakchunk4999-{platformCode}.utoc",
    "pakchunk5001-{platformCode}.pak", "pakchunk5001-{platformCode}.sig", "pakchunk5001-{platformCode}.ucas", "pakchunk5001-{platformCode}.utoc",
    "pakchunk5003-{platformCode}.pak", "pakchunk5003-{platformCode}.sig", "pakchunk5003-{platformCode}.ucas", "pakchunk5003-{platformCode}.utoc",
    "pakchunk5004-{platformCode}.pak", "pakchunk5004-{platformCode}.sig", "pakchunk5004-{platformCode}.ucas", "pakchunk5004-{platformCode}.utoc",
    "pakchunk5005-{platformCode}.pak", "pakchunk5005-{platformCode}.sig", "pakchunk5005-{platformCode}.ucas", "pakchunk5005-{platformCode}.utoc",
    "pakchunk5995-{platformCode}.pak", "pakchunk5995-{platformCode}.sig", "pakchunk5995-{platformCode}.ucas", "pakchunk5995-{platformCode}.utoc",
    "pakchunk5996-{platformCode}.pak", "pakchunk5996-{platformCode}.sig", "pakchunk5996-{platformCode}.ucas", "pakchunk5996-{platformCode}.utoc",
    "pakchunk5998-{platformCode}.pak", "pakchunk5998-{platformCode}.sig", "pakchunk5998-{platformCode}.ucas", "pakchunk5998-{platformCode}.utoc",
    "pakchunk5999-{platformCode}.pak", "pakchunk5999-{platformCode}.sig", "pakchunk5999-{platformCode}.ucas", "pakchunk5999-{platformCode}.utoc",
    "pakchunk6000-{platformCode}.pak", "pakchunk6000-{platformCode}.sig", "pakchunk6000-{platformCode}.ucas", "pakchunk6000-{platformCode}.utoc"
];


let mainWindow;
let appSettings = {
    modFolderPath: '',
    pakFolderPath: '',
    language: 'english',
    platform: 'steam', // default platform changed to steam
    discordRpcEnabled: true
};
let installedMods = {}; // { modName: { originalFiles: [], installedFiles: [] } }

function createWindow() {
    const preloadPath = path.join(__dirname, 'preload.js');
    console.log(`main: preload script path: ${preloadPath}`); // log preload path

    mainWindow = new BrowserWindow({
        width: 1100,
        height: 750,
        minWidth: 800,
        minHeight: 600,
        frame: false, // <--- important: this removes the default title bar
        webPreferences: {
            preload: preloadPath, // ensure preload script is loaded
            nodeIntegration: false, // keep false for security
            contextIsolation: true, // keep true for security
            sandbox: false // disabled sandbox for debugging ipc issues
        },
        icon: path.join(__dirname, 'build/icon.ico') // set application icon
    });

    // define the application menu (optional, but good practice)
    const template = [
        {
            label: 'file',
            submenu: [
                { role: 'quit' }
            ]
        },
        {
            label: 'edit',
            submenu: [
                { role: 'undo' },
                { role: 'redo' },
                { type: 'separator' },
                { role: 'cut' },
                { role: 'copy' },
                { role: 'paste' },
                { role: 'delete' },
                { type: 'separator' },
                { role: 'selectAll' }
            ]
        },
        {
            label: 'view',
            submenu: [
                { role: 'reload' },
                { role: 'forceReload' },
                { type: 'separator' },
                { role: 'resetZoom' },
                { role: 'zoomIn' },
                { role: 'zoomOut' },
                { type: 'separator' },
                { role: 'togglefullscreen' },
                { // add devtools toggle back for debugging
                    label: 'toggle developer tools',
                    accelerator: process.platform === 'darwin' ? 'alt+command+i' : 'ctrl+shift+i',
                    click (item, focusedWindow) {
                        if (focusedWindow) focusedWindow.webContents.toggleDevTools();
                    }
                }
            ]
        },
        {
            label: 'window',
            submenu: [
                { role: 'minimize' },
                { role: 'zoom' },
                { role: 'close' }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

    mainWindow.loadFile('index.html');

    // add a listener for when the renderer process has finished loading
    mainWindow.webContents.on('did-finish-load', () => {
        console.log("main: renderer process has finished loading.");
        logToConsole('renderer process loaded.', 'system');
        // optionally open devtools on start for easier debugging
        // mainWindow.webContents.openDevTools();
    });
}

// function to log messages to the console tab
function logToConsole(message, type = 'info') {
    if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('log-message', { message, type, timestamp: new Date().toLocaleTimeString() });
    }
}

// initialize settings and installed mods on app ready
app.whenReady().then(async () => {
    logToConsole('application started.', 'system');

    // ensure app data directory exist
    await fs.ensureDir(appDataPath);

    // load settings
    try {
        if (await fs.pathExists(settingsFilePath)) {
            const data = await fs.readFile(settingsFilePath, 'utf8');
            appSettings = { ...appSettings, ...JSON.parse(data) };
            logToConsole('settings loaded successfully.', 'system');
        } else {
            // save default settings if file doesn't exist
            await fs.writeFile(settingsFilePath, JSON.stringify(appSettings, null, 2));
            logToConsole('default settings created.', 'system');
        }
    } catch (error) {
        logToConsole(`error loading settings: ${error.message}`, 'error');
    }

    // load installed mods
    try {
        if (await fs.pathExists(installedModsFilePath)) {
            const data = await fs.readFile(installedModsFilePath, 'utf8');
            installedMods = JSON.parse(data);
            logToConsole('installed mods data loaded successfully.', 'system');
        } else {
            // save empty installed mods if file doesn't exist
            await fs.writeFile(installedModsFilePath, JSON.stringify(installedMods, null, 2));
            logToConsole('empty installed mods data created.', 'system');
        }
    } catch (error) {
        logToConsole(`error loading installed mods: ${error.message}`, 'error');
    }

    if (appSettings.discordRpcEnabled) {
        initRPC();
    }

    createWindow();
});

// wait for renderer to be ready before checking for updates
ipcMain.on('renderer-ready', () => {
    logToConsole('renderer is ready, checking for updates.', 'system');
    checkForUpdates(false); // `false` indicates this is not a manual check
});


app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// ipc handlers for window controls
ipcMain.on('minimize-window', () => {
    console.log("main: received minimize-window ipc."); // debug log
    if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.minimize();
        logToConsole('window minimize request processed.', 'system');
    } else {
        logToConsole('failed to minimize window: mainwindow is invalid or destroyed.', 'error');
    }
});

ipcMain.on('maximize-window', () => {
    console.log("main: received maximize-window ipc."); // debug log
    if (mainWindow && !mainWindow.isDestroyed()) {
        if (mainWindow.isMaximized()) {
            mainWindow.unmaximize();
            logToConsole('window unmaximized processed.', 'system');
        } else {
            mainWindow.maximize();
            logToConsole('window maximized processed.', 'system');
        }
    } else {
        logToConsole('failed to maximize/unmaximize window: mainwindow is invalid or destroyed.', 'error');
    }
});

ipcMain.on('close-window', () => {
    console.log("main: received close-window ipc."); // debug log
    if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.close();
        logToConsole('window close request processed.', 'system');
    } else {
        logToConsole('failed to close window: mainwindow is invalid or destroyed.', 'error');
    }
});


// handle opening folder dialog
ipcMain.handle('open-folder-dialog', async (event) => {
    logToConsole('opening folder selection dialog...', 'info');
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory']
    });
    if (!canceled && filePaths.length > 0) {
        logToConsole(`folder selected: ${filePaths[0]}`, 'info');
        return filePaths[0];
    }
    logToConsole('folder selection canceled.', 'info');
    return null;
});

// handle opening file dialog
ipcMain.handle('open-file-dialog', async (event, filters) => {
    logToConsole(`opening file selection dialog with filters: ${JSON.stringify(filters)}`, 'info');
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
        properties: ['openFile', 'multiSelections'], // allow multiple file selections
        filters: filters
    });
    if (!canceled && filePaths.length > 0) {
        logToConsole(`files selected: ${filePaths.join(', ')}`, 'info');
        return filePaths; // return array of file paths
    }
    logToConsole('file selection canceled.', 'info');
    return null;
});


// handle saving settings
ipcMain.handle('save-settings', async (event, settings) => {
    try {
        appSettings = { ...appSettings, ...settings };
        await fs.writeFile(settingsFilePath, JSON.stringify(appSettings, null, 2));
        logToConsole('settings saved successfully.', 'system');
        return { success: true };
    } catch (error) {
        logToConsole(`error saving settings: ${error.message}`, 'error');
        return { success: false, error: error.message };
    }
});

// handle loading settings
ipcMain.handle('load-settings', async () => {
    logToConsole('loading settings...', 'info');
    return appSettings;
});

// --- discord rpc ipc ---
ipcMain.on('set-rpc-status', (event, { enabled }) => {
    if (enabled) {
        initRPC();
    } else {
        destroyRPC();
    }
});


// handle getting installed mods
ipcMain.handle('get-installed-mods', async () => {
    logToConsole('retrieving installed mods data.', 'info');
    return installedMods;
});

// handle getting available mods from mod folder
ipcMain.handle('get-available-mods', async (event) => {
    logToConsole(`scanning mod folder for .mmpackage files: ${appSettings.modFolderPath}`, 'info');
    if (!appSettings.modFolderPath) {
        logToConsole('mod folder path is not set.', 'warn');
        return [];
    }
    try {
        const files = await fs.readdir(appSettings.modFolderPath);
        const mmpackageFiles = files.filter(file => file.endsWith('.mmpackage'));
        logToConsole(`found ${mmpackageFiles.length} .mmpackage files.`, 'info');
        return mmpackageFiles.map(file => ({
            name: file,
            path: path.join(appSettings.modFolderPath, file),
            installed: !!installedMods[file] // check if this mod is already marked as installed
        }));
    } catch (error) {
        logToConsole(`error reading mod folder: ${error.message}`, 'error');
        return [];
    }
});

/**
 * helper to get platform code based on user-friendly platform name.
 * this maps 'steam', 'microsoft', 'epic games' to their common pak file suffixes.
 * @param {string} platform - the user-selected platform name.
 * @returns {string} the platform code used in pak file naming.
 */
function getPlatformCode(platform) {
    switch (platform.toLowerCase()) {
        case 'steam': return 'Windows';
        case 'microsoft': return 'WinGDK';
        case 'epic games': return 'EGS';
        default: return 'Windows';
    }
}

// handle installing a mod
ipcMain.handle('install-mod', async (event, modName, modPath) => {
    logToConsole(`attempting to install mod: ${modName} from ${modPath}`, 'info');
    if (!appSettings.pakFolderPath) {
        logToConsole('pak folder path is not set. cannot install mod.', 'error');
        return { success: false, error: 'pak folder path is not set.' };
    }

    const platformCode = getPlatformCode(appSettings.platform);
    const installedFiles = [];
    const tempExtractionPath = path.join(os.tmpdir(), 'disobeytop_mod_temp', modName.replace('.mmpackage', ''));

    try {
        // ensure temp directory is clean
        await fs.emptyDir(tempExtractionPath);

        // validate if it's a zip file
        const buffer = Buffer.alloc(4);
        let fd;
        try {
            fd = fs.openSync(modPath, 'r');
            fs.readSync(fd, buffer, 0, 4, 0);
        } finally {
            if (fd) fs.closeSync(fd);
        }


        // check for zip magic number (pk\x03\x04)
        if (buffer.toString('hex') !== '504b0304') {
            logToConsole(`mod file '${modName}' is not a valid zip (.mmpackage) file. cannot process.`, 'error');
            return { success: false, error: 'mod file is not a valid zip (.mmpackage) file.' };
        }
        logToConsole(`mod file '${modName}' is a valid zip file. proceeding with extraction.`, 'info');


        // unzip the .mmpackage file
        await new Promise((resolve, reject) => {
            yauzl.open(modPath, { lazyEntries: true }, (err, zipfile) => {
                if (err) {
                    logToConsole(`error opening zip file ${modPath}: ${err.message}`, 'error');
                    return reject(err);
                }
                zipfile.on('entry', (entry) => {
                    // skip directories
                    if (/\/$/.test(entry.fileName)) {
                        zipfile.readEntry();
                        return;
                    }

                    const entryPath = path.join(tempExtractionPath, entry.fileName);
                    fs.ensureDir(path.dirname(entryPath)).then(() => {
                        zipfile.openReadStream(entry, (err, readStream) => {
                            if (err) {
                                logToConsole(`error reading zip entry ${entry.fileName}: ${err.message}`, 'error');
                                return reject(err);
                            }
                            const writeStream = fs.createWriteStream(entryPath);
                            readStream.on('end', () => {
                                zipfile.readEntry();
                            });
                            readStream.pipe(writeStream);
                        });
                    }).catch(reject);
                });
                zipfile.on('end', () => {
                    logToConsole(`successfully extracted ${modName} to ${tempExtractionPath}.`, 'info');
                    resolve();
                });
                zipfile.on('error', reject);
                zipfile.readEntry(); // start reading entries
            });
        });

        // process extracted files
        const filesToProcess = await fs.readdir(tempExtractionPath);
        for (const file of filesToProcess) {
            const originalFilePath = path.join(tempExtractionPath, file);
            const fileNameWithoutExt = path.parse(file).name;
            const fileExt = path.parse(file).ext;

            // check if the file name already contains a platform code pattern
            // this regex looks for '-<platformcode>' before the extension
            const platformCodeRegex = /-[a-zA-Z0-9]+$/;
            let newFileName;

            if (platformCodeRegex.test(fileNameWithoutExt)) {
                // if it has a platform code, replace it
                newFileName = `${fileNameWithoutExt.replace(platformCodeRegex, `-${platformCode}`)}${fileExt}`;
            } else {
                // otherwise, append the platform code before the extension
                newFileName = `${fileNameWithoutExt}-${platformCode}${fileExt}`;
            }

            const destinationPath = path.join(appSettings.pakFolderPath, newFileName);

            await fs.copy(originalFilePath, destinationPath);
            installedFiles.push({ original: file, installed: newFileName });
            logToConsole(`copied and renamed ${file} to ${newFileName} in pak folder.`, 'info');
        }

        // update installed mods data
        installedMods[modName] = {
            originalName: modName,
            originalPath: modPath,
            installedFiles: installedFiles
        };
        await fs.writeFile(installedModsFilePath, JSON.stringify(installedMods, null, 2));
        logToConsole(`mod '${modName}' installed and saved.`, 'success');
        return { success: true };

    } catch (error) {
        logToConsole(`failed to install mod '${modName}': ${error.message}`, 'error');
        return { success: false, error: error.message };
    } finally {
        // clean up temporary extraction path
        try {
            await fs.remove(tempExtractionPath);
            logToConsole(`cleaned up temporary extraction path: ${tempExtractionPath}`, 'info');
        } catch (cleanupError) {
            logToConsole(`error cleaning up temp path ${tempExtractionPath}: ${cleanupError.message}`, 'error');
        }
    }
});

// handle uninstalling a mod
ipcMain.handle('uninstall-mod', async (event, modName) => {
    logToConsole(`attempting to uninstall mod: ${modName}`, 'info');
    if (!appSettings.pakFolderPath) {
        logToConsole('pak folder path is not set. cannot uninstall mod.', 'error');
        return { success: false, error: 'pak folder path is not set.' };
    }

    const modData = installedMods[modName];
    if (!modData) {
        logToConsole(`mod '${modName}' not found in installed mods list.`, 'warn');
        return { success: false, error: 'mod not found.' };
    }

    try {
        for (const fileInfo of modData.installedFiles) {
            const filePath = path.join(appSettings.pakFolderPath, fileInfo.installed);
            if (await fs.pathExists(filePath)) {
                await fs.remove(filePath);
                logToConsole(`removed file: ${filePath}`, 'info');
            } else {
                logToConsole(`file not found during uninstall, skipping: ${filePath}`, 'warn');
            }
        }
        delete installedMods[modName];
        await fs.writeFile(installedModsFilePath, JSON.stringify(installedMods, null, 2));
        logToConsole(`mod '${modName}' uninstalled successfully.`, 'success');
        return { success: true };
    } catch (error) {
        logToConsole(`failed to uninstall mod '${modName}': ${error.message}`, 'error');
        return { success: false, error: error.message };
    }
});

// handle uninstalling all mods
ipcMain.handle('uninstall-all-mods', async (event) => {
    logToConsole('attempting to uninstall all non-base mods.', 'info');
    if (!appSettings.pakFolderPath) {
        logToConsole('pak folder path is not set. cannot uninstall all mods.', 'error');
        return { success: false, error: 'pak folder path is not set.' };
    }

    const platformCode = getPlatformCode(appSettings.platform);
    // generate the full list of base pak files for the current platform
    const basePakFiles = BASE_PAK_FILES_TEMPLATE.map(file =>
        file.replace('{platformCode}', platformCode)
    );
    logToConsole(`base pak files for platform ${appSettings.platform} (${platformCode}): ${basePakFiles.join(', ')}`, 'info');


    try {
        const filesInPakFolder = await fs.readdir(appSettings.pakFolderPath);
        let uninstalledCount = 0;

        for (const file of filesInPakFolder) {
            // only remove files that are not in the basepakfiles list
            if (!basePakFiles.includes(file)) {
                const filePath = path.join(appSettings.pakFolderPath, file);
                await fs.remove(filePath);
                logToConsole(`removed non-base file: ${filePath}`, 'info');
                uninstalledCount++;
            } else {
                logToConsole(`skipping base file: ${file}`, 'info');
            }
        }
        installedMods = {}; // clear all installed mods from our tracking
        await fs.writeFile(installedModsFilePath, JSON.stringify(installedMods, null, 2));
        logToConsole(`uninstalled ${uninstalledCount} non-base mods.`, 'success');
        return { success: true, count: uninstalledCount };
    } catch (error) {
        logToConsole(`failed to uninstall all mods: ${error.message}`, 'error');
        return { success: false, error: error.message };
    }
});

// handle converting files to .mmpackage
ipcMain.handle('convert-to-mmpackage', async (event, modName, filePaths) => {
    logToConsole(`attempting to convert files to .mmpackage: ${modName}`, 'info');
    if (!appSettings.modFolderPath) {
        logToConsole('mod folder path is not set. cannot convert files.', 'error');
        return { success: false, error: 'mod folder path is not set.' };
    }
    // validate file extensions
    const requiredExtensions = ['.pak', '.sig', '.ucas', '.utoc'];
    const foundExtensions = new Set(filePaths.map(p => path.extname(p).toLowerCase())); // use path directly

    for (const ext of requiredExtensions) {
        if (!foundExtensions.has(ext)) {
            logToConsole(`missing required file type for conversion: ${ext}`, 'error');
            return { success: false, error: `missing required file type: ${ext}. please select one of each: .pak, .sig, .ucas, and one .utoc.` };
        }
    }
    if (filePaths.length !== 4) {
        logToConsole('invalid number of files provided for conversion. expected 4 (pak, sig, ucas, utoc).', 'error');
        return { success: false, error: 'invalid number of files selected. please select one .pak, one .sig, one .ucas, and one .utoc file.' };
    }


    const outputFilePath = path.join(appSettings.modFolderPath, `${modName}.mmpackage`); // use path directly
    const zipfile = new yazl.ZipFile();

    try {
        for (const filePath of filePaths) {
            const fileName = path.basename(filePath); // use path directly
            zipfile.addFile(filePath, fileName);
            logToConsole(`adding ${fileName} to zip archive.`, 'info');
        }

        await new Promise((resolve, reject) => {
            zipfile.outputStream.pipe(fs.createWriteStream(outputFilePath))
                .on('close', () => {
                    logToConsole(`successfully created .mmpackage file: ${outputFilePath}`, 'success');
                    resolve();
                })
                .on('error', (err) => {
                    logToConsole(`error writing zip file: ${err.message}`, 'error');
                    reject(err);
                });
            zipfile.end();
        });
        return { success: true };
    } catch (error) {
        logToConsole(`failed to convert files to .mmpackage: ${error.message}`, 'error');
        return { success: false, error: error.message };
    }
});


// function to check for updates
async function checkForUpdates(isManual) {
    logToConsole('checking for updates...', 'system');
    try {
        const response = await fetch(UPDATE_CHECK_URL);
        if (!response.ok) {
            throw new Error(`http error! status: ${response.status}`);
        }
        const latestVersion = (await response.text()).trim();

        if (latestVersion !== APP_VERSION) {
            logToConsole(`new version available: ${latestVersion}. current version: ${APP_VERSION}`, 'system');
            if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.webContents.send('update-available', {
                    latestVersion: latestVersion,
                    currentVersion: APP_VERSION
                });
            }
        } else {
            logToConsole('application is up to date.', 'system');
            if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.webContents.send('no-update-available', {
                    currentVersion: APP_VERSION,
                    isManual: isManual
                });
            }
        }
    } catch (error) {
        logToConsole(`failed to check for updates: ${error.message}`, 'error');
        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('no-update-available', {
                currentVersion: APP_VERSION,
                error: error.message,
                isManual: isManual
            });
        }
    }
}

// ipc handler to manually trigger update check
ipcMain.on('trigger-update-check', () => {
    logToConsole('manual update check triggered by renderer.', 'system');
    checkForUpdates(true); // `true` indicates this is a manual check
});

// handle opening external url for update
ipcMain.handle('open-update-url', async () => {
    logToConsole(`opening update url: ${DOWNLOAD_URL}`, 'info');
    await shell.openExternal(DOWNLOAD_URL);
});

// handle getting app version
ipcMain.handle('get-app-version', () => {
    return APP_VERSION;
});
