// renderer.js - electron renderer process
console.log("renderer script loaded."); // debug log: initial load confirmation

const consoleOutput = document.getElementById('console-output');
const appVersionSpan = document.getElementById('app-version');
let currentSettings = {
    modFolderPath: '',
    pakFolderPath: '',
    language: 'english',
    platform: 'steam',
    discordRpcEnabled: true
};
let installedModsData = {}; // stores the data about installed mods from main process

// --- localization data ---
const translations = {
    english: {
        'home-dashboard-title': 'dashboard',
        'home-greeting': 'welcome back!',
        'home-install-mods-title': 'install mods',
        'home-install-mods-desc': 'browse and install new mods.',
        'home-conversor-title': 'conversor',
        'home-conversor-desc': 'convert your files to .mmpackage.',
        'home-settings-title': 'settings',
        'home-settings-desc': 'configure paths and preferences.',
        'home-update-status-title': 'update status',
        'home-platform-title': 'platform',
        'update-available': 'update available!',
        'up-to-date': 'up to date',
        'mods-title': 'mods',
        'install-mods-button': 'install mods',
        'no-mods-installed': 'no mods installed yet.',
        'settings-title': 'settings',
        'mod-folder-path-label': 'mod folder path:',
        'pak-folder-path-label': 'pak folder path:',
        'browse-button': 'browse',
        'language-label': 'language:',
        'platform-label': 'platform:',
        'uninstall-all-mods-button': 'uninstall all mods',
        'console-title': 'console output',
        'confirm-action-title': 'confirm action',
        'confirm-uninstall-all-mods-message': 'are you sure you want to uninstall all non-base mods from your pak folder? this action cannot be undone.',
        'yes-button': 'yes',
        'no-button': 'no',
        'success-title': 'success',
        'error-title': 'error',
        'pak-folder-not-set': 'pak folder path is not set. cannot install/uninstall mods.',
        'mod-folder-not-set': 'mod folder path is not set. cannot list available mods.',
        'select-mods-title': 'select mods to install',
        'no-available-mods': 'no .mmpackage mods found in the selected mod folder.',
        'install-button': 'install',
        'installed-button': 'installed',
        'uninstall-button': 'uninstall',
        'installing-button': 'installing...',
        'confirm-uninstall-mod-message': 'are you sure you want to uninstall "{modName}"?',
        'update-available-title': 'update available!',
        'update-available-message': 'a new version ({latestVersion}) of disobey.top mod manager is available! would you like to download it from the website?',
        'ok-button': 'ok',
        'close-button': 'close',
        'select-language-title': 'select language',
        'conversor-title': 'conversor',
        'mod-name-label': 'mod name:',
        'all-files-label': 'files (.pak, .sig, .ucas, .utoc):',
        'convert-button': 'convert to .mmpackage',
        'conversion-success': 'successfully converted files to "{modName}.mmpackage".',
        'conversion-error': 'failed to convert files to .mmpackage: {error}',
        'invalid-files-selected': 'please select one .pak, one .sig, one .ucas, and one .utoc file.',
        'mod-name-required': 'please enter a name for the mod.',
        'look-for-updates-button': 'look for updates',
        'mod-uninstalled-success': 'mod "{modName}" has been successfully uninstalled.',
        'discord-rpc-label': 'discord rich presence',
        'developed-by': 'developed by desgubernamentalizar',
        'latest-version-message': 'you are in the latest version!'
    },
    russian: {
        'home-dashboard-title': 'панель управления',
        'home-greeting': 'с возвращением!',
        'home-install-mods-title': 'установить моды',
        'home-install-mods-desc': 'просмотр и установка новых модов.',
        'home-conversor-title': 'конвертер',
        'home-conversor-desc': 'конвертируйте ваши файлы в .mmpackage.',
        'home-settings-title': 'настройки',
        'home-settings-desc': 'настройте пути и предпочтения.',
        'home-update-status-title': 'статус обновления',
        'home-platform-title': 'платформа',
        'update-available': 'доступно обновление!',
        'up-to-date': 'актуальная версия',
        'mods-title': 'моды',
        'install-mods-button': 'установить моды',
        'no-mods-installed': 'моды еще не установлены.',
        'settings-title': 'настройки',
        'mod-folder-path-label': 'путь к папке с модами:',
        'pak-folder-path-label': 'путь к папке pak:',
        'browse-button': 'обзор',
        'language-label': 'язык:',
        'platform-label': 'платформа:',
        'uninstall-all-mods-button': 'удалить все моды',
        'console-title': 'вывод консоли',
        'confirm-action-title': 'подтвердить действие',
        'confirm-uninstall-all-mods-message': 'вы уверены, что хотите удалить все не-базовые моды из вашей папки pak? это действие необратимо.',
        'yes-button': 'да',
        'no-button': 'нет',
        'success-title': 'успех',
        'error-title': 'ошибка',
        'pak-folder-not-set': 'путь к папке pak не установлен. невозможно установить/удалить моды.',
        'mod-folder-not-set': 'путь к папке с модами не установлен. невозможно отобразить доступные моды.',
        'select-mods-title': 'выберите моды для установки',
        'no-available-mods': 'в выбранной папке с модами не найдено файлов .mmpackage.',
        'install-button': 'установить',
        'installed-button': 'установлено',
        'uninstall-button': 'удалить',
        'installing-button': 'установка...',
        'confirm-uninstall-mod-message': 'вы уверены, что хотите удалить "{modName}"?',
        'update-available-title': 'доступно обновление!',
        'update-available-message': 'доступна новая версия ({latestVersion}) disobey.top mod manager! хотите загрузить ее с веб-сайта?',
        'ok-button': 'ок',
        'close-button': 'закрыть',
        'select-language-title': 'выберите язык',
        'conversor-title': 'конвертер',
        'mod-name-label': 'название мода:',
        'all-files-label': 'файлы (.pak, .sig, .ucas, .utoc):',
        'convert-button': 'конвертировать в .mmpackage',
        'conversion-success': 'файлы успешно конвертированы в "{modName}.mmpackage".',
        'conversion-error': 'не удалось конвертировать файлы в .mmpackage: {error}',
        'invalid-files-selected': 'пожалуйста, выберите один файл .pak, один .sig, один .ucas и один .utoc.',
        'mod-name-required': 'пожалуйста, введите название для мода.',
        'look-for-updates-button': 'проверить обновления',
        'mod-uninstalled-success': 'мод "{modName}" был успешно удален.',
        'discord-rpc-label': 'discord rich presence',
        'developed-by': 'разработано desgubernamentalizar',
        'latest-version-message': 'у вас последняя версия!'
    },
    german: {
        'home-dashboard-title': 'dashboard',
        'home-greeting': 'willkommen zurück!',
        'home-install-mods-title': 'mods installieren',
        'home-install-mods-desc': 'durchsuchen und installieren sie neue mods.',
        'home-conversor-title': 'konverter',
        'home-conversor-desc': 'konvertieren sie ihre dateien in .mmpackage.',
        'home-settings-title': 'einstellungen',
        'home-settings-desc': 'konfigurieren sie pfade und einstellungen.',
        'home-update-status-title': 'update-status',
        'home-platform-title': 'plattform',
        'update-available': 'update verfügbar!',
        'up-to-date': 'aktuell',
        'mods-title': 'mods',
        'install-mods-button': 'mods installieren',
        'no-mods-installed': 'noch keine mods installiert.',
        'settings-title': 'einstellungen',
        'mod-folder-path-label': 'mod-ordnerpfad:',
        'pak-folder-path-label': 'pak-ordnerpfad:',
        'browse-button': 'durchsuchen',
        'language-label': 'sprache:',
        'platform-label': 'plattform:',
        'uninstall-all-mods-button': 'alle mods deinstallieren',
        'console-title': 'konsolenausgabe',
        'confirm-action-title': 'aktion bestätigen',
        'confirm-uninstall-all-mods-message': 'möchten sie wirklich alle nicht-basismods aus ihrem pak-ordner deinstallieren? diese aktion kann nicht rückgängig gemacht werden.',
        'yes-button': 'ja',
        'no-button': 'nein',
        'success-title': 'erfolg',
        'error-title': 'fehler',
        'pak-folder-not-set': 'pak-ordnerpfad ist nicht festgelegt. mods können nicht installiert/deinstalliert werden.',
        'mod-folder-not-set': 'mod-ordnerpfad ist nicht festgelegt. verfügbare mods können nicht aufgelistet werden.',
        'select-mods-title': 'mods zur installation auswählen',
        'no-available-mods': 'keine .mmpackage-mods im ausgewählten mod-ordner gefunden.',
        'install-button': 'installieren',
        'installed-button': 'installiert',
        'uninstall-button': 'deinstallieren',
        'installing-button': 'installiere...',
        'confirm-uninstall-mod-message': 'möchten sie "{modName}" wirklich deinstallieren?',
        'update-available-title': 'update verfügbar!',
        'update-available-message': 'eine neue version ({latestVersion}) des disobey.top mod managers ist verfügbar! möchten sie sie von der website herunterladen?',
        'ok-button': 'ok',
        'close-button': 'schließen',
        'select-language-title': 'sprache auswählen',
        'conversor-title': 'konverter',
        'mod-name-label': 'mod-name:',
        'all-files-label': 'dateien (.pak, .sig, .ucas, .utoc):',
        'convert-button': 'konvertieren in .mmpackage',
        'conversion-success': 'dateien erfolgreich in "{modName}.mmpackage" konvertiert.',
        'conversion-error': 'fehler beim konvertieren der dateien in .mmpackage: {error}',
        'invalid-files-selected': 'bitte wählen sie eine .pak-, eine .sig-, eine .ucas- und eine .utoc-datei aus.',
        'mod-name-required': 'bitte geben sie einen namen für den mod ein.',
        'look-for-updates-button': 'nach updates suchen',
        'mod-uninstalled-success': 'mod "{modName}" wurde erfolgreich deinstalliert.',
        'discord-rpc-label': 'discord rich presence',
        'developed-by': 'entwickelt von desgubernamentalizar',
        'latest-version-message': 'sie haben die neueste version!'
    },
    spanish: {
        'home-dashboard-title': 'panel',
        'home-greeting': '¡bienvenido de nuevo!',
        'home-install-mods-title': 'instalar mods',
        'home-install-mods-desc': 'explora e instala nuevos mods.',
        'home-conversor-title': 'conversor',
        'home-conversor-desc': 'convierte tus archivos a .mmpackage.',
        'home-settings-title': 'ajustes',
        'home-settings-desc': 'configura rutas y preferencias.',
        'home-update-status-title': 'estado de actualización',
        'home-platform-title': 'plataforma',
        'update-available': '¡actualización disponible!',
        'up-to-date': 'actualizado',
        'mods-title': 'mods',
        'install-mods-button': 'instalar mods',
        'no-mods-installed': 'aún no hay mods instalados.',
        'settings-title': 'ajustes',
        'mod-folder-path-label': 'ruta de la carpeta de mods:',
        'pak-folder-path-label': 'ruta de la carpeta pak:',
        'browse-button': 'examinar',
        'language-label': 'idioma:',
        'platform-label': 'plataforma:',
        'uninstall-all-mods-button': 'desinstalar todos los mods',
        'console-title': 'salida de la consola',
        'confirm-action-title': 'confirmar acción',
        'confirm-uninstall-all-mods-message': '¿estás seguro de que quieres desinstalar todos los mods no base de tu carpeta pak? esta acción no se puede deshacer.',
        'yes-button': 'sí',
        'no-button': 'no',
        'success-title': 'éxito',
        'error-title': 'error',
        'pak-folder-not-set': 'la ruta de la carpeta pak no está configurada. no se pueden instalar/desinstalar mods.',
        'mod-folder-not-set': 'la ruta de la carpeta de mods no está configurada. no se pueden listar los mods disponibles.',
        'select-mods-title': 'seleccionar mods para instalar',
        'no-available-mods': 'no se encontraron mods .mmpackage en la carpeta de mods seleccionada.',
        'install-button': 'instalar',
        'installed-button': 'instalado',
        'uninstall-button': 'desinstalar',
        'installing-button': 'instalando...',
        'confirm-uninstall-mod-message': '¿estás seguro de que quieres desinstalar "{modName}"?',
        'update-available-title': '¡actualización disponible!',
        'update-available-message': '¡una nueva versión ({latestVersion}) de disobey.top mod manager está disponible! ¿quieres descargarla desde el sitio web?',
        'ok-button': 'aceptar',
        'close-button': 'cerrar',
        'select-language-title': 'seleccionar idioma',
        'conversor-title': 'conversor',
        'mod-name-label': 'nombre del mod:',
        'all-files-label': 'archivos (.pak, .sig, .ucas, .utoc):',
        'convert-button': 'convertir a .mmpackage',
        'conversion-success': 'archivos convertidos exitosamente a "{modName}.mmpackage".',
        'conversion-error': 'fallo al convertir archivos a .mmpackage: {error}',
        'invalid-files-selected': 'por favor, selecciona un archivo .pak, uno .sig, uno .ucas y uno .utoc.',
        'mod-name-required': 'por favor, introduce un nombre para el mod.',
        'look-for-updates-button': 'buscar actualizaciones',
        'mod-uninstalled-success': 'el mod "{modName}" ha sido desinstalado exitosamente.',
        'discord-rpc-label': 'discord rich presence',
        'developed-by': 'desarrollado por desgubernamentalizar',
        'latest-version-message': '¡estás en la última versión!'
    },
    chinese: {
        'home-dashboard-title': '仪表板',
        'home-greeting': '欢迎回来！',
        'home-install-mods-title': '安装模组',
        'home-install-mods-desc': '浏览并安装新的模组。',
        'home-conversor-title': '转换器',
        'home-conversor-desc': '将您的文件转换为 .mmpackage。',
        'home-settings-title': '设置',
        'home-settings-desc': '配置路径和首选项。',
        'home-update-status-title': '更新状态',
        'home-platform-title': '平台',
        'update-available': '有可用更新！',
        'up-to-date': '最新版本',
        'mods-title': '模组',
        'install-mods-button': '安装模组',
        'no-mods-installed': '尚未安装模组。',
        'settings-title': '设置',
        'mod-folder-path-label': '模组文件夹路径：',
        'pak-folder-path-label': 'pak 文件夹路径：',
        'browse-button': '浏览',
        'language-label': '语言：',
        'platform-label': '平台：',
        'uninstall-all-mods-button': '卸载所有模组',
        'console-title': '控制台输出',
        'confirm-action-title': '确认操作',
        'confirm-uninstall-all-mods-message': '您确定要从您的 pak 文件夹中卸载所有非基础模组吗？此操作无法撤销。',
        'yes-button': '是',
        'no-button': '否',
        'success-title': '成功',
        'error-title': '错误',
        'pak-folder-not-set': '未设置 pak 文件夹路径。无法安装/卸载模组。',
        'mod-folder-not-set': '未设置模组文件夹路径。无法列出可用模组。',
        'select-mods-title': '选择要安装的模组',
        'no-available-mods': '在所选模组文件夹中找不到 .mmpackage 模组。',
        'install-button': '安装',
        'installed-button': '已安装',
        'uninstall-button': '卸载',
        'installing-button': '正在安装...',
        'confirm-uninstall-mod-message': '您确定要卸载“{modName}”吗？',
        'update-available-title': '有可用更新！',
        'update-available-message': 'disobey.top 模组管理器有新版本 ({latestVersion}) 可用！您想从网站下载吗？',
        'ok-button': '确定',
        'close-button': '关闭',
        'select-language-title': '选择语言',
        'conversor-title': '转换器',
        'mod-name-label': '模组名称：',
        'all-files-label': '文件 (.pak, .sig, .ucas, .utoc):',
        'convert-button': '转换为 .mmpackage',
        'conversion-success': '文件已成功转换为“{modName}.mmpackage”。',
        'conversion-error': '无法将文件转换为 .mmpackage: {error}',
        'invalid-files-selected': '请选择一个 .pak, 一个 .sig, 一个 .ucas, 和一个 .utoc 文件。',
        'mod-name-required': '请输入模组的名称。',
        'look-for-updates-button': '检查更新',
        'mod-uninstalled-success': '模组“{modName}”已成功卸载。',
        'discord-rpc-label': 'discord rich presence',
        'developed-by': '由 desgubernamentalizar 开发',
        'latest-version-message': '您使用的是最新版本！'
    }
};


/**
 * applies translations to the ui elements.
 * @param {string} langkey - the key for the selected language (e.g., 'english').
 */
function applyTranslations(langKey) {
    const lang = langKey ? langKey.toLowerCase() : 'english';
    const currentLang = translations[lang] || translations.english;
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        if (currentLang[key]) {
            element.textContent = currentLang[key];
        }
    });

    // handle elements with combined icons and text
    const setHtml = (selector, key) => {
        const element = document.querySelector(selector);
        if (element) {
            const translationText = currentLang[key] || `missing: ${key}`;
            const iconMatch = element.innerHTML.match(/<i class="[^"]+"><\/i>/);
            element.innerHTML = iconMatch ? `${iconMatch[0]} ${translationText}` : translationText;
        }
    };
    
    setHtml('#install-mods-button', 'install-mods-button');
    setHtml('#select-mod-folder', 'browse-button');
    setHtml('#select-pak-folder', 'browse-button');
    setHtml('#uninstall-all-mods-button', 'uninstall-all-mods-button');
    setHtml('#check-for-updates-button', 'look-for-updates-button');
    
    // update dynamic button texts
    document.querySelectorAll('.mod-toggle-button').forEach(button => {
        const currentText = button.textContent.toLowerCase();
        if (currentText.includes('install')) button.textContent = currentLang['install-button'];
        else if (currentText.includes('installed')) button.textContent = currentLang['installed-button'];
        else if (currentText.includes('uninstall')) button.textContent = currentLang['uninstall-button'];
    });

    log(`applied translations for: ${langKey}`, 'system');
}


// --- utility functions ---

function log(message, type = 'info') {
    const entry = document.createElement('div');
    entry.classList.add('console-log-entry', type);
    entry.textContent = `${new Date().toLocaleTimeString()} [${type.toUpperCase()}]: ${message}`;
    consoleOutput?.appendChild(entry);
    if (consoleOutput) {
        consoleOutput.scrollTop = consoleOutput.scrollHeight;
    }
}

function showConfirmationModal(title, message) {
    return new Promise(resolve => {
        const modal = document.getElementById('confirmation-modal');
        document.getElementById('confirmation-modal-title').textContent = title;
        document.getElementById('confirmation-modal-message').textContent = message;
        const confirmBtn = document.getElementById('confirmation-modal-confirm');
        const cancelBtn = document.getElementById('confirmation-modal-cancel');
        
        const onConfirm = () => { 
            hideModal('confirmation-modal'); 
            resolve(true); 
            confirmBtn.removeEventListener('click', onConfirm);
            cancelBtn.removeEventListener('click', onCancel);
        };
        const onCancel = () => { 
            hideModal('confirmation-modal'); 
            resolve(false); 
            confirmBtn.removeEventListener('click', onConfirm);
            cancelBtn.removeEventListener('click', onCancel);
        };

        confirmBtn.addEventListener('click', onConfirm, { once: true });
        cancelBtn.addEventListener('click', onCancel, { once: true });

        modal.classList.remove('hidden');
    });
}

function showMessageModal(title, message) {
    const modal = document.getElementById('message-modal');
    document.getElementById('message-modal-title').textContent = title;
    document.getElementById('message-modal-message').textContent = message;
    modal.classList.remove('hidden');
}

function hideModal(modalId) {
    document.getElementById(modalId)?.classList.add('hidden');
}

// --- tab management ---

function activateTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    const activeTab = document.getElementById(tabId);
    if (activeTab) {
        activeTab.classList.add('active');
    }

    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });
    document.querySelector(`.tab-button[data-tab="${tabId.replace('-tab', '')}"]`)?.classList.add('active');

    log(`switched to tab: ${tabId}`, 'user');

    if (tabId === 'mods-tab' || tabId === 'home-tab') {
        renderInstalledMods();
    }
    applyTranslations(currentSettings.language);
}

// --- settings management ---

async function loadSettings() {
    log('loading settings...', 'system');
    currentSettings = await window.electronAPI.loadSettings();
    document.getElementById('mod-folder-path').value = currentSettings.modFolderPath || '';
    document.getElementById('pak-folder-path').value = currentSettings.pakFolderPath || '';
    document.getElementById('platform-selector').value = currentSettings.platform || 'steam';
    document.getElementById('discord-rpc-toggle').checked = currentSettings.discordRpcEnabled;
    updateLanguageDisplay(currentSettings.language || 'english');
    applyTranslations(currentSettings.language);
    log('settings loaded and ui updated.', 'system');
}

async function saveSettings() {
    log('saving settings...', 'system');
    const settingsToSave = {
        modFolderPath: document.getElementById('mod-folder-path').value,
        pakFolderPath: document.getElementById('pak-folder-path').value,
        language: document.getElementById('current-language-text').textContent,
        platform: document.getElementById('platform-selector').value,
        discordRpcEnabled: document.getElementById('discord-rpc-toggle').checked
    };
    const result = await window.electronAPI.saveSettings(settingsToSave);
    if (result.success) {
        currentSettings = settingsToSave;
        log('settings saved successfully.', 'success');
        applyTranslations(currentSettings.language);
        // also update platform display on home tab
        document.getElementById('platform-stat-text').textContent = `platform: ${currentSettings.platform}`;
    } else {
        const lang = currentSettings.language.toLowerCase();
        log(`failed to save settings: ${result.error}`, 'error');
        showMessageModal(translations[lang]['error-title'], `failed to save settings: ${result.error}`);
    }
}

// --- language management ---
const languages = { english: 'us', russian: 'ru', german: 'de', spanish: 'es', chinese: 'cn' };
function updateLanguageDisplay(lang) {
    const langKey = lang.toLowerCase();
    document.getElementById('current-language-flag').src = `https://flagcdn.com/w20/${languages[langKey]}.png`;
    document.getElementById('current-language-flag').alt = `${lang} flag`;
    document.getElementById('current-language-text').textContent = lang;
}

// --- mod management ---
async function renderInstalledMods() {
    log('refreshing installed mods list.', 'system');
    installedModsData = await window.electronAPI.getInstalledMods();
    const installedModsListDiv = document.getElementById('installed-mods-list');
    if (!installedModsListDiv) return;
    installedModsListDiv.innerHTML = '';

    const modNames = Object.keys(installedModsData);
    const lang = currentSettings.language.toLowerCase();

    // update home page stats
    document.getElementById('platform-stat-text').textContent = `platform: ${currentSettings.platform}`;

    if (modNames.length === 0) {
        const noModsMessage = document.createElement('p');
        noModsMessage.id = 'no-mods-installed-message';
        noModsMessage.classList.add('text-gray-400', 'text-center');
        noModsMessage.textContent = translations[lang]['no-mods-installed'];
        installedModsListDiv.appendChild(noModsMessage);
        return;
    }

    modNames.forEach(modName => {
        const modItem = document.createElement('div');
        const isInstalled = !!installedModsData[modName];
        modItem.classList.add('mod-item', isInstalled ? 'mod-item-installed' : 'mod-item-not-installed');
        modItem.innerHTML = `
            <span class="mod-item-name">${modName.replace('.mmpackage', '')}</span>
            <button class="mod-toggle-button off" data-mod-name="${modName}">${translations[lang]['uninstall-button']}</button>
        `;
        installedModsListDiv.appendChild(modItem);
    });
}

// --- conversor tab logic ---
const modNameInput = document.getElementById('mod-name-input');
const allFilesPathInput = document.getElementById('all-files-path');
const convertButton = document.getElementById('convert-button');
let selectedConversionFiles = [];

function checkConvertButtonStatus() {
    const isReady = modNameInput?.value.trim() && selectedConversionFiles.length === 4;
    convertButton.disabled = !isReady;
    convertButton.classList.toggle('highlight', isReady);
}

function resetConversorForm() {
    modNameInput.value = '';
    allFilesPathInput.value = '';
    selectedConversionFiles = [];
    checkConvertButtonStatus();
}

// --- update checker ---
window.electronAPI.onUpdateAvailable((data) => {
    log(`update available! latest: ${data.latestVersion}, current: ${data.currentVersion}`, 'system');
    const lang = currentSettings.language.toLowerCase();
    if (appVersionSpan) {
        appVersionSpan.textContent = data.currentVersion;
    }
    document.getElementById('update-status-text').textContent = `update status: ${translations[lang]['update-available']}`;
    document.getElementById('update-status-text').style.color = '#f44336';
    showConfirmationModal(
        translations[lang]['update-available-title'],
        translations[lang]['update-available-message'].replace('{latestVersion}', data.latestVersion)
    ).then(confirmed => {
        if (confirmed) {
            window.electronAPI.openUpdateUrl().then(() => {
                window.electronAPI.closeWindow();
            });
        }
    });
});

window.electronAPI.onNoUpdateAvailable((data) => {
    log(`no update available. current version: ${data.currentVersion}`, 'system');
    const lang = currentSettings.language.toLowerCase();
    if (appVersionSpan) {
        appVersionSpan.textContent = data.currentVersion;
    }
    document.getElementById('update-status-text').textContent = `update status: ${translations[lang]['up-to-date']}`;
    document.getElementById('update-status-text').style.color = ''; // reset color
    if (data.error) log(`update check error: ${data.error}`, 'warn');

    if(data.isManual){
        showMessageModal(translations[lang]['success-title'], translations[lang]['latest-version-message']);
    }
});

window.electronAPI.getAppVersion().then(version => {
    if (appVersionSpan) appVersionSpan.textContent = version;
    log(`application version: ${version}`, 'system');
});

// --- initialization and event listeners ---
document.addEventListener('DOMContentLoaded', async () => {
    console.log("renderer script: domcontentloaded event fired.");
    
    try {
        await loadSettings();
        
        // signal to main process that renderer is ready
        window.electronAPI.rendererReady();

        // attach title bar listeners
        document.getElementById('minimize-button')?.addEventListener('click', () => window.electronAPI.minimizeWindow());
        document.getElementById('maximize-button')?.addEventListener('click', () => window.electronAPI.maximizeWindow());
        document.getElementById('close-button')?.addEventListener('click', () => window.electronAPI.closeWindow());
        
        // tab buttons
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', () => {
                const tab = button.dataset.tab;
                activateTab(`${tab}-tab`);
            });
        });

        // settings listeners
        document.getElementById('select-mod-folder')?.addEventListener('click', async () => {
            const folderPath = await window.electronAPI.openFolderDialog();
            if (folderPath) {
                document.getElementById('mod-folder-path').value = folderPath;
                await saveSettings();
            }
        });
        document.getElementById('select-pak-folder')?.addEventListener('click', async () => {
            const folderPath = await window.electronAPI.openFolderDialog();
            if (folderPath) {
                document.getElementById('pak-folder-path').value = folderPath;
                await saveSettings();
            }
        });
        document.getElementById('platform-selector')?.addEventListener('change', saveSettings);
        document.getElementById('discord-rpc-toggle')?.addEventListener('change', async (event) => {
            window.electronAPI.setRpcStatus(event.target.checked);
            currentSettings.discordRpcEnabled = event.target.checked;
            await saveSettings();
        });

        // language modal
        document.getElementById('language-selector')?.addEventListener('click', () => {
            const modal = document.getElementById('language-selection-modal');
            modal?.classList.remove('hidden');
            document.querySelectorAll('.language-option').forEach(option => {
                option.classList.toggle('selected', option.dataset.lang.toLowerCase() === currentSettings.language.toLowerCase());
            });
        });
        document.getElementById('language-selection-modal').addEventListener('click', async (event) => {
            const target = event.target.closest('.language-option');
            if (target) {
                const selectedLang = target.dataset.lang;
                updateLanguageDisplay(selectedLang);
                currentSettings.language = selectedLang;
                await saveSettings();
                hideModal('language-selection-modal');
            }
        });

        // uninstall all mods button
        document.getElementById('uninstall-all-mods-button')?.addEventListener('click', async () => {
            const lang = currentSettings.language.toLowerCase();
            const confirmed = await showConfirmationModal(
                translations[lang]['confirm-action-title'],
                translations[lang]['confirm-uninstall-all-mods-message']
            );
            if (confirmed) {
                const result = await window.electronAPI.uninstallAllMods();
                if (result.success) {
                    showMessageModal(translations[lang]['success-title'], `successfully uninstalled ${result.count} non-base mods.`);
                    await renderInstalledMods();
                } else {
                    showMessageModal(translations[lang]['error-title'], `failed to uninstall all mods: ${result.error}`);
                }
            }
        });
        
        // check for updates button
        document.getElementById('check-for-updates-button')?.addEventListener('click', () => {
            window.electronAPI.triggerUpdateCheck();
        });

        // mods tab listeners (using event delegation)
        document.getElementById('install-mods-button')?.addEventListener('click', async () => {
            const lang = currentSettings.language.toLowerCase();
            if (!currentSettings.modFolderPath || !currentSettings.pakFolderPath) {
                showMessageModal(translations[lang]['error-title'], translations[lang]['pak-folder-not-set']);
                return;
            }
            const availableMods = await window.electronAPI.getAvailableMods();
            const modSelectionList = document.getElementById('available-mods-list');
            if (!modSelectionList) return;
            modSelectionList.innerHTML = '';

            const noModsMessage = document.getElementById('no-available-mods-message');
            if (availableMods.length === 0) {
                if (noModsMessage) noModsMessage.style.display = 'block';
            } else {
                if (noModsMessage) noModsMessage.style.display = 'none';
                availableMods.forEach(mod => {
                    const isInstalled = !!installedModsData[mod.name];
                    const modItem = document.createElement('div');
                    modItem.classList.add('mod-item', isInstalled ? 'mod-item-installed' : 'mod-item-not-installed');
                    modItem.innerHTML = `
                        <span class="mod-item-name">${mod.name.replace('.mmpackage', '')}</span>
                        <button class="mod-toggle-button ${isInstalled ? 'off' : 'on'}" data-mod-name="${mod.name}" data-mod-path="${mod.path}" ${isInstalled ? 'disabled' : ''}>
                            ${isInstalled ? translations[lang]['installed-button'] : translations[lang]['install-button']}
                        </button>
                    `;
                    modSelectionList.appendChild(modItem);
                });
            }
            document.getElementById('mod-selection-modal')?.classList.remove('hidden');
        });

        document.getElementById('available-mods-list').addEventListener('click', async (event) => {
            const button = event.target.closest('.mod-toggle-button.on');
            if (button) {
                const lang = currentSettings.language.toLowerCase();
                const name = button.dataset.modName;
                const path = button.dataset.modPath;
                button.textContent = translations[lang]['installing-button'];
                button.disabled = true;
                const result = await window.electronAPI.installMod(name, path);
                if (result.success) {
                    button.textContent = translations[lang]['installed-button'];
                    button.classList.remove('on');
                    button.classList.add('off');
                    await renderInstalledMods(); // refresh main list
                } else {
                    showMessageModal(translations[lang]['error-title'], `failed to install: ${result.error}`);
                    button.textContent = translations[lang]['install-button'];
                    button.disabled = false;
                }
            }
        });

        document.getElementById('installed-mods-list').addEventListener('click', async (event) => {
            const button = event.target.closest('.mod-toggle-button.off');
            if(button){
                const lang = currentSettings.language.toLowerCase();
                const name = button.dataset.modName;
                const confirmed = await showConfirmationModal(
                    translations[lang]['confirm-action-title'],
                    translations[lang]['confirm-uninstall-mod-message'].replace('{modName}', name.replace('.mmpackage', ''))
                );
                if (confirmed) {
                    button.textContent = 'uninstalling...';
                    button.disabled = true;
                    const result = await window.electronAPI.uninstallMod(name);
                    if (result.success) {
                        showMessageModal(translations[lang]['success-title'], translations[lang]['mod-uninstalled-success'].replace('{modName}', name.replace('.mmpackage', '')));
                        await renderInstalledMods();
                    } else {
                        showMessageModal(translations[lang]['error-title'], `failed to uninstall: ${result.error}`);
                        button.textContent = translations[lang]['uninstall-button'];
                        button.disabled = false;
                    }
                }
            }
        });


        // conversor tab listeners
        document.getElementById('select-all-files')?.addEventListener('click', async () => {
            const filePaths = await window.electronAPI.openFileDialog([{ name: 'game files', extensions: ['pak', 'sig', 'ucas', 'utoc'] }]);
            const lang = currentSettings.language.toLowerCase();
            if (filePaths && filePaths.length > 0) {
                const extensions = new Set(filePaths.map(p => p.split('.').pop().toLowerCase()));
                if (filePaths.length === 4 && extensions.has('pak') && extensions.has('sig') && extensions.has('ucas') && extensions.has('utoc')) {
                    selectedConversionFiles = filePaths;
                    allFilesPathInput.value = filePaths.map(p => p.split(/[\\/]/).pop()).join(', ');
                } else {
                    showMessageModal(translations[lang]['error-title'], translations[lang]['invalid-files-selected']);
                    selectedConversionFiles = [];
                    allFilesPathInput.value = '';
                }
                checkConvertButtonStatus();
            }
        });

        modNameInput?.addEventListener('input', checkConvertButtonStatus);

        convertButton?.addEventListener('click', async () => {
            const modName = modNameInput?.value.trim();
            const lang = currentSettings.language.toLowerCase();
            if (!modName || selectedConversionFiles.length !== 4) return;
            
            convertButton.textContent = 'converting...';
            convertButton.disabled = true;

            const result = await window.electronAPI.convertToMmpackage(modName, selectedConversionFiles);
            
            if (result.success) {
                showMessageModal(translations[lang]['success-title'], translations[lang]['conversion-success'].replace('{modName}', modName));
                resetConversorForm();
            } else {
                showMessageModal(translations[lang]['error-title'], translations[lang]['conversion-error'].replace('{error}', result.error));
            }
            
            convertButton.textContent = translations[lang]['convert-button'];
            checkConvertButtonStatus();
        });

        // initial render
        await renderInstalledMods();
        activateTab('home-tab');

        window.electronAPI.onLogMessage((logEntry) => {
            log(logEntry.message, logEntry.type);
        });
        console.log("renderer: onlogmessage listener set up.");

        checkConvertButtonStatus();
    } catch (error) {
        console.error("error during initialization:", error);
        log(`critical error during initialization: ${error.message}`, 'error');
    }
});
