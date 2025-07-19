// renderer.js - Electron Renderer Process
console.log("Renderer script loaded."); // Debug log: Initial load confirmation

const consoleOutput = document.getElementById('console-output');
const appVersionSpan = document.getElementById('app-version');
let currentSettings = {
    modFolderPath: '',
    pakFolderPath: '',
    language: 'English',
    platform: 'Steam',
    theme: 'Default',
    discordRpcEnabled: true
};
let installedModsData = {}; // Stores the data about installed mods from main process

// --- Localization Data ---
const translations = {
    English: {
        'home-dashboard-title': 'Dashboard',
        'home-greeting': 'Welcome back!',
        'home-install-mods-title': 'Install Mods',
        'home-install-mods-desc': 'Browse and install new mods.',
        'home-conversor-title': 'Conversor',
        'home-conversor-desc': 'Convert your files to .mmpackage.',
        'home-settings-title': 'Settings',
        'home-settings-desc': 'Configure paths and preferences.',
        'home-update-status-title': 'Update Status',
        'home-platform-title': 'Platform',
        'update-available': 'Update Available!',
        'up-to-date': 'Up to Date',
        'mods-title': 'Mods',
        'install-mods-button': 'Install Mods',
        'no-mods-installed': 'No mods installed yet.',
        'settings-title': 'Settings',
        'mod-folder-path-label': 'Mod Folder Path:',
        'pak-folder-path-label': 'PAK Folder Path:',
        'browse-button': 'Browse',
        'language-label': 'Language:',
        'platform-label': 'Platform:',
        'uninstall-all-mods-button': 'Uninstall All Mods',
        'console-title': 'Console Output',
        'confirm-action-title': 'Confirm Action',
        'confirm-uninstall-all-mods-message': 'Are you sure you want to uninstall ALL non-base mods from your PAK folder? This action cannot be undone.',
        'yes-button': 'Yes',
        'no-button': 'No',
        'success-title': 'Success',
        'error-title': 'Error',
        'pak-folder-not-set': 'PAK folder path is not set. Cannot install/uninstall mods.',
        'mod-folder-not-set': 'Mod folder path is not set. Cannot list available mods.',
        'select-mods-title': 'Select Mods to Install',
        'no-available-mods': 'No .mmpackage mods found in the selected mod folder.',
        'install-button': 'Install',
        'installed-button': 'Installed',
        'uninstall-button': 'Uninstall',
        'installing-button': 'Installing...',
        'confirm-uninstall-mod-message': 'Are you sure you want to uninstall "{modName}"?',
        'update-available-title': 'Update Available!',
        'update-available-message': 'A new version ({latestVersion}) of disobey.top Mod Manager is available! Would you like to download it from the website?',
        'ok-button': 'OK',
        'close-button': 'Close',
        'select-language-title': 'Select Language',
        'conversor-title': 'Conversor',
        'mod-name-label': 'Mod Name:',
        'all-files-label': 'Files (.pak, .sig, .ucas, .utoc):',
        'convert-button': 'Convert to .mmpackage',
        'conversion-success': 'Successfully converted files to "{modName}.mmpackage".',
        'conversion-error': 'Failed to convert files to .mmpackage: {error}',
        'invalid-files-selected': 'Please select one .pak, one .sig, one .ucas, and one .utoc file.',
        'mod-name-required': 'Please enter a name for the mod.',
        'look-for-updates-button': 'Look for Updates',
        'theme-label': 'Theme:',
        'mod-uninstalled-success': 'Mod "{modName}" has been successfully uninstalled.',
        'discord-rpc-label': 'Discord Rich Presence',
        'developed-by': 'developed by desgubernamentalizar'
    },
    Russian: {
        'home-dashboard-title': 'Панель управления',
        'home-greeting': 'С возвращением!',
        'home-install-mods-title': 'Установить моды',
        'home-install-mods-desc': 'Просмотр и установка новых модов.',
        'home-conversor-title': 'Конвертер',
        'home-conversor-desc': 'Конвертируйте ваши файлы в .mmpackage.',
        'home-settings-title': 'Настройки',
        'home-settings-desc': 'Настройте пути и предпочтения.',
        'home-update-status-title': 'Статус обновления',
        'home-platform-title': 'Платформа',
        'update-available': 'Доступно обновление!',
        'up-to-date': 'Актуальная версия',
        'mods-title': 'Моды',
        'install-mods-button': 'Установить моды',
        'no-mods-installed': 'Моды еще не установлены.',
        'settings-title': 'Настройки',
        'mod-folder-path-label': 'Путь к папке с модами:',
        'pak-folder-path-label': 'Путь к папке PAK:',
        'browse-button': 'Обзор',
        'language-label': 'Язык:',
        'platform-label': 'Платформа:',
        'uninstall-all-mods-button': 'Удалить все моды',
        'console-title': 'Вывод консоли',
        'confirm-action-title': 'Подтвердить действие',
        'confirm-uninstall-all-mods-message': 'Вы уверены, что хотите удалить ВСЕ не-базовые моды из вашей папки PAK? Это действие необратимо.',
        'yes-button': 'Да',
        'no-button': 'Нет',
        'success-title': 'Успех',
        'error-title': 'Ошибка',
        'pak-folder-not-set': 'Путь к папке PAK не установлен. Невозможно установить/удалить моды.',
        'mod-folder-not-set': 'Путь к папке с модами не установлен. Невозможно отобразить доступные моды.',
        'select-mods-title': 'Выберите моды для установки',
        'no-available-mods': 'В выбранной папке с модами не найдено файлов .mmpackage.',
        'install-button': 'Установить',
        'installed-button': 'Установлено',
        'uninstall-button': 'Удалить',
        'installing-button': 'Установка...',
        'confirm-uninstall-mod-message': 'Вы уверены, что хотите удалить "{modName}"?',
        'update-available-title': 'Доступно обновление!',
        'update-available-message': 'Доступна новая версия ({latestVersion}) disobey.top Mod Manager! Хотите загрузить ее с веб-сайта?',
        'ok-button': 'ОК',
        'close-button': 'Закрыть',
        'select-language-title': 'Выберите язык',
        'conversor-title': 'Конвертер',
        'mod-name-label': 'Название мода:',
        'all-files-label': 'Файлы (.pak, .sig, .ucas, .utoc):',
        'convert-button': 'Конвертировать в .mmpackage',
        'conversion-success': 'Файлы успешно конвертированы в "{modName}.mmpackage".',
        'conversion-error': 'Не удалось конвертировать файлы в .mmpackage: {error}',
        'invalid-files-selected': 'Пожалуйста, выберите один файл .pak, один .sig, один .ucas и один .utoc.',
        'mod-name-required': 'Пожалуйста, введите название для мода.',
        'look-for-updates-button': 'Проверить обновления',
        'theme-label': 'Тема:',
        'mod-uninstalled-success': 'Мод "{modName}" был успешно удален.',
        'discord-rpc-label': 'Discord Rich Presence',
        'developed-by': 'разработано desgubernamentalizar'
    },
    German: {
        'home-dashboard-title': 'Dashboard',
        'home-greeting': 'Willkommen zurück!',
        'home-install-mods-title': 'Mods installieren',
        'home-install-mods-desc': 'Durchsuchen und installieren Sie neue Mods.',
        'home-conversor-title': 'Konverter',
        'home-conversor-desc': 'Konvertieren Sie Ihre Dateien in .mmpackage.',
        'home-settings-title': 'Einstellungen',
        'home-settings-desc': 'Konfigurieren Sie Pfade und Einstellungen.',
        'home-update-status-title': 'Update-Status',
        'home-platform-title': 'Plattform',
        'update-available': 'Update verfügbar!',
        'up-to-date': 'Aktuell',
        'mods-title': 'Mods',
        'install-mods-button': 'Mods installieren',
        'no-mods-installed': 'Noch keine Mods installiert.',
        'settings-title': 'Einstellungen',
        'mod-folder-path-label': 'Mod-Ordnerpfad:',
        'pak-folder-path-label': 'PAK-Ordnerpfad:',
        'browse-button': 'Durchsuchen',
        'language-label': 'Sprache:',
        'platform-label': 'Plattform:',
        'uninstall-all-mods-button': 'Alle Mods deinstallieren',
        'console-title': 'Konsolenausgabe',
        'confirm-action-title': 'Aktion bestätigen',
        'confirm-uninstall-all-mods-message': 'Möchten Sie wirklich ALLE nicht-Basismods aus Ihrem PAK-Ordner deinstallieren? Diese Aktion kann nicht rückgängig gemacht werden.',
        'yes-button': 'Ja',
        'no-button': 'Nein',
        'success-title': 'Erfolg',
        'error-title': 'Fehler',
        'pak-folder-not-set': 'PAK-Ordnerpfad ist nicht festgelegt. Mods können nicht installiert/deinstalliert werden.',
        'mod-folder-not-set': 'Mod-Ordnerpfad ist nicht festgelegt. Verfügbare Mods können nicht aufgelistet werden.',
        'select-mods-title': 'Mods zur Installation auswählen',
        'no-available-mods': 'Keine .mmpackage-Mods im ausgewählten Mod-Ordner gefunden.',
        'install-button': 'Installieren',
        'installed-button': 'Installiert',
        'uninstall-button': 'Deinstallieren',
        'installing-button': 'Installiere...',
        'confirm-uninstall-mod-message': 'Möchten Sie "{modName}" wirklich deinstallieren?',
        'update-available-title': 'Update verfügbar!',
        'update-available-message': 'Eine neue Version ({latestVersion}) des disobey.top Mod Managers ist verfügbar! Möchten Sie sie von der Website herunterladen?',
        'ok-button': 'OK',
        'close-button': 'Schließen',
        'select-language-title': 'Sprache auswählen',
        'conversor-title': 'Konverter',
        'mod-name-label': 'Mod-Name:',
        'all-files-label': 'Dateien (.pak, .sig, .ucas, .utoc):',
        'convert-button': 'Konvertieren in .mmpackage',
        'conversion-success': 'Dateien erfolgreich in "{modName}.mmpackage" konvertiert.',
        'conversion-error': 'Fehler beim Konvertieren der Dateien in .mmpackage: {error}',
        'invalid-files-selected': 'Bitte wählen Sie eine .pak-, eine .sig-, eine .ucas- und eine .utoc-Datei aus.',
        'mod-name-required': 'Bitte geben Sie einen Namen für den Mod ein.',
        'look-for-updates-button': 'Nach Updates suchen',
        'theme-label': 'Thema:',
        'mod-uninstalled-success': 'Mod "{modName}" wurde erfolgreich deinstalliert.',
        'discord-rpc-label': 'Discord Rich Presence',
        'developed-by': 'entwickelt von desgubernamentalizar'
    }
};

/**
 * Applies translations to the UI elements.
 * @param {string} langKey - The key for the selected language (e.g., 'English').
 */
function applyTranslations(langKey) {
    const currentLang = translations[langKey] || translations.English;
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        if (currentLang[key]) {
            element.textContent = currentLang[key];
        }
    });

    // Handle elements with combined icons and text
    const setHtml = (selector, key) => {
        const element = document.querySelector(selector);
        if (element) {
            const translationText = currentLang[key] || `Missing: ${key}`;
            const iconMatch = element.innerHTML.match(/<i class="[^"]+"><\/i>/);
            element.innerHTML = iconMatch ? `${iconMatch[0]} ${translationText}` : translationText;
        }
    };
    
    setHtml('#install-mods-button', 'install-mods-button');
    setHtml('#select-mod-folder', 'browse-button');
    setHtml('#select-pak-folder', 'browse-button');
    setHtml('#uninstall-all-mods-button', 'uninstall-all-mods-button');
    setHtml('#check-for-updates-button', 'look-for-updates-button');
    
    // Update dynamic button texts
    document.querySelectorAll('.mod-toggle-button').forEach(button => {
        const currentText = button.textContent;
        if (currentText.includes('Install')) button.textContent = currentLang['install-button'];
        else if (currentText.includes('Installed')) button.textContent = currentLang['installed-button'];
        else if (currentText.includes('Uninstall')) button.textContent = currentLang['uninstall-button'];
    });

    log(`Applied translations for: ${langKey}`, 'system');
}


// --- Utility Functions ---

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
        confirmBtn.onclick = null;
        cancelBtn.onclick = null;
        const onConfirm = () => { hideModal('confirmation-modal'); resolve(true); };
        const onCancel = () => { hideModal('confirmation-modal'); resolve(false); };
        confirmBtn.onclick = onConfirm;
        cancelBtn.onclick = onCancel;
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

// --- Tab Management ---

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

    log(`Switched to tab: ${tabId}`, 'user');

    if (tabId === 'mods-tab' || tabId === 'home-tab') {
        renderInstalledMods();
    }
    applyTranslations(currentSettings.language);
}

document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => {
        const tab = button.dataset.tab;
        activateTab(`${tab}-tab`);
    });
});

// --- Settings Management ---

async function loadSettings() {
    log('Loading settings...', 'system');
    currentSettings = await window.electronAPI.loadSettings();
    document.getElementById('mod-folder-path').value = currentSettings.modFolderPath || '';
    document.getElementById('pak-folder-path').value = currentSettings.pakFolderPath || '';
    document.getElementById('platform-selector').value = currentSettings.platform || 'Steam';
    document.getElementById('discord-rpc-toggle').checked = currentSettings.discordRpcEnabled;
    updateLanguageDisplay(currentSettings.language || 'English');
    await populateThemeSelector();
    await loadAndApplyTheme(currentSettings.theme || 'Default');
    applyTranslations(currentSettings.language);
    log('Settings loaded and UI updated.', 'system');
}

async function saveSettings() {
    log('Saving settings...', 'system');
    const settingsToSave = {
        modFolderPath: document.getElementById('mod-folder-path').value,
        pakFolderPath: document.getElementById('pak-folder-path').value,
        language: document.getElementById('current-language-text').textContent,
        platform: document.getElementById('platform-selector').value,
        theme: document.getElementById('theme-selector').value,
        discordRpcEnabled: document.getElementById('discord-rpc-toggle').checked
    };
    const result = await window.electronAPI.saveSettings(settingsToSave);
    if (result.success) {
        currentSettings = settingsToSave;
        log('Settings saved successfully.', 'success');
        applyTranslations(currentSettings.language);
    } else {
        log(`Failed to save settings: ${result.error}`, 'error');
        showMessageModal(translations[currentSettings.language]['error-title'], `Failed to save settings: ${result.error}`);
    }
}

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

document.getElementById('platform-selector')?.addEventListener('change', async () => {
    await saveSettings();
});

// --- Theme Management ---
async function populateThemeSelector() {
    const themeSelector = document.getElementById('theme-selector');
    const customThemes = await window.electronAPI.getThemes();
    themeSelector.innerHTML = ''; // Clear previous options
    
    const allThemes = ['Default', ...customThemes];
    allThemes.forEach(theme => {
        const option = document.createElement('option');
        option.value = theme;
        option.textContent = theme;
        themeSelector.appendChild(option);
    });
    themeSelector.value = currentSettings.theme || 'Default';
}

async function loadAndApplyTheme(themeName) {
    const style = document.getElementById('custom-theme-style') || document.createElement('style');
    style.id = 'custom-theme-style';
    document.head.appendChild(style);

    let theme = {};
    if (themeName === 'Default') {
        style.textContent = '';
        log('Switched to Default theme.', 'system');
        return;
    } 
    
    const themeScript = await window.electronAPI.loadTheme(themeName);
    if (themeScript) {
        try {
            const themeFunction = new Function('applyTheme', themeScript);
            themeFunction((styles) => { theme = styles; });
        } catch (error) {
            log(`Error applying theme "${themeName}": ${error.message}`, 'error');
            return;
        }
    }

    let css = ':root {';
    for (const [key, value] of Object.entries(theme)) {
        css += `--${key}: ${value};`;
    }
    css += '}';
    style.textContent = css;
    log(`Applied theme: ${themeName}`, 'success');
}

document.getElementById('theme-selector')?.addEventListener('change', async (event) => {
    const themeName = event.target.value;
    await loadAndApplyTheme(themeName);
    await saveSettings();
});


// Language selection
const languages = { English: 'us', Russian: 'ru', German: 'de' };
function updateLanguageDisplay(lang) {
    document.getElementById('current-language-flag').src = `https://flagcdn.com/w20/${languages[lang]}.png`;
    document.getElementById('current-language-flag').alt = `${lang} Flag`;
    document.getElementById('current-language-text').textContent = lang;
}

document.getElementById('language-selector')?.addEventListener('click', () => {
    const modal = document.getElementById('language-selection-modal');
    modal?.classList.remove('hidden');
    document.querySelectorAll('.language-option').forEach(option => {
        option.classList.toggle('selected', option.dataset.lang === currentSettings.language);
        const newOption = option.cloneNode(true);
        option.parentNode.replaceChild(newOption, option);
    });
    document.querySelectorAll('.language-option').forEach(option => {
        option.addEventListener('click', async () => {
            const selectedLang = option.dataset.lang;
            updateLanguageDisplay(selectedLang);
            currentSettings.language = selectedLang;
            await saveSettings();
            hideModal('language-selection-modal');
        });
    });
});

// Uninstall all mods
document.getElementById('uninstall-all-mods-button')?.addEventListener('click', async () => {
    const confirmed = await showConfirmationModal(
        translations[currentSettings.language]['confirm-action-title'],
        translations[currentSettings.language]['confirm-uninstall-all-mods-message']
    );
    if (confirmed) {
        const result = await window.electronAPI.uninstallAllMods();
        if (result.success) {
            showMessageModal(translations[currentSettings.language]['success-title'], `Successfully uninstalled ${result.count} non-base mods.`);
            renderInstalledMods();
        } else {
            showMessageModal(translations[currentSettings.language]['error-title'], `Failed to uninstall all mods: ${result.error}`);
        }
    }
});

// --- Mod Management ---

async function renderInstalledMods() {
    log('Refreshing installed mods list.', 'system');
    installedModsData = await window.electronAPI.getInstalledMods();
    const installedModsListDiv = document.getElementById('installed-mods-list');
    if (!installedModsListDiv) return;
    installedModsListDiv.innerHTML = '';

    const modNames = Object.keys(installedModsData);

    // Update home page stats
    document.getElementById('platform-stat').textContent = currentSettings.platform;

    if (modNames.length === 0) {
        const noModsMessage = document.createElement('p');
        noModsMessage.id = 'no-mods-installed-message';
        noModsMessage.classList.add('text-gray-400', 'text-center');
        noModsMessage.textContent = translations[currentSettings.language]['no-mods-installed'];
        installedModsListDiv.appendChild(noModsMessage);
        return;
    }

    modNames.forEach(modName => {
        const modItem = document.createElement('div');
        const isInstalled = !!installedModsData[modName];
        modItem.classList.add('mod-item', isInstalled ? 'mod-item-installed' : 'mod-item-not-installed');
        modItem.innerHTML = `
            <span class="mod-item-name">${modName.replace('.mmpackage', '')}</span>
            <button class="mod-toggle-button off" data-mod-name="${modName}">${translations[currentSettings.language]['uninstall-button']}</button>
        `;
        installedModsListDiv.appendChild(modItem);
        modItem.querySelector('.mod-toggle-button')?.addEventListener('click', async (event) => {
            const name = event.target.dataset.modName;
            const confirmed = await showConfirmationModal(
                translations[currentSettings.language]['confirm-action-title'],
                translations[currentSettings.language]['confirm-uninstall-mod-message'].replace('{modName}', name.replace('.mmpackage', ''))
            );
            if (confirmed) {
                event.target.textContent = 'Uninstalling...';
                event.target.disabled = true;
                const result = await window.electronAPI.uninstallMod(name);
                if (result.success) {
                    showMessageModal(translations[currentSettings.language]['success-title'], translations[currentSettings.language]['mod-uninstalled-success'].replace('{modName}', name.replace('.mmpackage', '')));
                    renderInstalledMods();
                } else {
                    showMessageModal(translations[currentSettings.language]['error-title'], `Failed to uninstall: ${result.error}`);
                    event.target.textContent = translations[currentSettings.language]['uninstall-button'];
                    event.target.disabled = false;
                }
            }
        });
    });
}

// --- Conversor Tab Logic ---
const modNameInput = document.getElementById('mod-name-input');
const allFilesPathInput = document.getElementById('all-files-path');
const selectAllFilesButton = document.getElementById('select-all-files');
const convertButton = document.getElementById('convert-button');
let selectedConversionFiles = [];

selectAllFilesButton?.addEventListener('click', async () => {
    const filePaths = await window.electronAPI.openFileDialog([{ name: 'Game Files', extensions: ['pak', 'sig', 'ucas', 'utoc'] }]);
    if (filePaths && filePaths.length > 0) {
        const extensions = new Set(filePaths.map(p => p.split('.').pop().toLowerCase()));
        if (filePaths.length === 4 && extensions.has('pak') && extensions.has('sig') && extensions.has('ucas') && extensions.has('utoc')) {
            selectedConversionFiles = filePaths;
            allFilesPathInput.value = filePaths.map(p => p.split(/[\\/]/).pop()).join(', ');
        } else {
            showMessageModal(translations[currentSettings.language]['error-title'], translations[currentSettings.language]['invalid-files-selected']);
            selectedConversionFiles = [];
            allFilesPathInput.value = '';
        }
        checkConvertButtonStatus();
    }
});

modNameInput?.addEventListener('input', checkConvertButtonStatus);

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

convertButton?.addEventListener('click', async () => {
    const modName = modNameInput?.value.trim();
    if (!modName || selectedConversionFiles.length !== 4) return;
    convertButton.textContent = 'Converting...';
    convertButton.disabled = true;
    const result = await window.electronAPI.convertToMmpackage(modName, selectedConversionFiles);
    if (result.success) {
        showMessageModal(translations[currentSettings.language]['success-title'], translations[currentSettings.language]['conversion-success'].replace('{modName}', modName));
        resetConversorForm();
    } else {
        showMessageModal(translations[currentSettings.language]['error-title'], translations[currentSettings.language]['conversion-error'].replace('{error}', result.error));
    }
    convertButton.textContent = translations[currentSettings.language]['convert-button'];
    checkConvertButtonStatus();
});


// --- Update Checker ---
window.electronAPI.onUpdateAvailable((data) => {
    log(`Update available! Latest: ${data.latestVersion}, Current: ${data.currentVersion}`, 'system');
    if (appVersionSpan) {
        appVersionSpan.textContent = data.currentVersion;
        appVersionSpan.style.color = '#f44336'; // Bright red for update available
    }
    document.getElementById('update-status-text').textContent = translations[currentSettings.language]['update-available'];
    document.getElementById('update-status-text').style.color = '#f44336';
    showConfirmationModal(
        translations[currentSettings.language]['update-available-title'],
        translations[currentSettings.language]['update-available-message'].replace('{latestVersion}', data.latestVersion)
    ).then(confirmed => {
        if (confirmed) {
            window.electronAPI.openUpdateUrl().then(() => {
                window.electronAPI.closeWindow();
            });
        }
    });
});

window.electronAPI.onNoUpdateAvailable((data) => {
    log(`No update available. Current version: ${data.currentVersion}`, 'system');
    if (appVersionSpan) {
        appVersionSpan.textContent = data.currentVersion;
        appVersionSpan.style.color = '#b0b0b0';
    }
    document.getElementById('update-status-text').textContent = translations[currentSettings.language]['up-to-date'];
    document.getElementById('update-status-text').style.color = ''; // Reset color
    if (data.error) log(`Update check error: ${data.error}`, 'warn');
});

document.getElementById('check-for-updates-button')?.addEventListener('click', () => {
    window.electronAPI.triggerUpdateCheck();
});

window.electronAPI.getAppVersion().then(version => {
    if (appVersionSpan) appVersionSpan.textContent = version;
    log(`Application version: ${version}`, 'system');
});

// --- Initialization ---
document.addEventListener('DOMContentLoaded', async () => {
    console.log("Renderer script: DOMContentLoaded event fired.");
    
    // Attach title bar listeners
    document.getElementById('minimize-button')?.addEventListener('click', () => window.electronAPI.minimizeWindow());
    document.getElementById('maximize-button')?.addEventListener('click', () => window.electronAPI.maximizeWindow());
    document.getElementById('close-button')?.addEventListener('click', () => window.electronAPI.closeWindow());
    
    // Attach Install Mods button listener here to ensure it's always available
    document.getElementById('install-mods-button')?.addEventListener('click', async () => {
        if (!currentSettings.modFolderPath || !currentSettings.pakFolderPath) {
            showMessageModal(translations[currentSettings.language]['error-title'], translations[currentSettings.language]['pak-folder-not-set']);
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
                        ${isInstalled ? translations[currentSettings.language]['installed-button'] : translations[currentSettings.language]['install-button']}
                    </button>
                `;
                modSelectionList.appendChild(modItem);
                if (!isInstalled) {
                    modItem.querySelector('.mod-toggle-button')?.addEventListener('click', async (event) => {
                        const name = event.target.dataset.modName;
                        const path = event.target.dataset.modPath;
                        event.target.textContent = translations[currentSettings.language]['installing-button'];
                        event.target.disabled = true;
                        const result = await window.electronAPI.installMod(name, path);
                        if (result.success) {
                            event.target.textContent = translations[currentSettings.language]['installed-button'];
                            renderInstalledMods();
                        } else {
                            showMessageModal(translations[currentSettings.language]['error-title'], `Failed to install: ${result.error}`);
                            event.target.textContent = translations[currentSettings.language]['install-button'];
                            event.target.disabled = false;
                        }
                    });
                }
            });
        }
        document.getElementById('mod-selection-modal')?.classList.remove('hidden');
    });

    document.getElementById('discord-rpc-toggle')?.addEventListener('change', async (event) => {
        window.electronAPI.setRpcStatus(event.target.checked);
        await saveSettings();
    });

    try {
        await loadSettings();
        await renderInstalledMods();
        activateTab('home-tab');
    } catch (error) {
        console.error("Error during initialization:", error);
        log(`Critical error during initialization: ${error.message}`, 'error');
    }

    window.electronAPI.onLogMessage((logEntry) => {
        log(logEntry.message, logEntry.type);
    });
    console.log("Renderer: onLogMessage listener set up.");

    checkConvertButtonStatus();
});
