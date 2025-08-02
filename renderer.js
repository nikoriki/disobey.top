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
  "home-dashboard-title": "dashboard",
  "home-greeting": "welcome back!",
  "dashboard-installed-mods-title": "installed mods",
  "dashboard-installed-mods-desc": "see and manage your installed mods",
  "dashboard-install-mods-title": "install mods",
  "dashboard-install-mods-desc": "browse and install new mods",
  "dashboard-settings-title": "settings",
  "dashboard-settings-desc": "configure paths and preferences",
  "dashboard-console-title": "console",
  "dashboard-console-desc": "view logs and errors",
  "dashboard-platform-title": "platform",
  "dashboard-update-status-title": "update status",
  "dashboard-version-title": "version",
  "developed-by": "developed by desgubernamentalizar",
  "mods-title": "mods",
  "drop-mmpackage-message": "you can drop .mmpackage files here to install",
  "settings-title": "settings",
  "mod-folder-path-label": "mod folder path:",
  "pak-folder-path-label": "pak folder path:",
  "language-label": "language:",
  "platform-label": "platform:",
  "discord-rpc-label": "discord rich presence",
  "console-title": "console output",
  "no-button": "no",
  "yes-button": "yes",
  "ok-button": "ok",
  "select-mods-title": "select mods to install",
  "close-button": "close",
  "select-language-title": "select language",
  "install-mods-button": "install mods",
  "browse-button": "browse",
  "uninstall-all-mods-button": "uninstall all mods",
  "look-for-updates-button": "look for updates",
  "installed-button": "installed",
  "uninstall-button": "uninstall",
  "installing-button": "installing...",
  "installing-message": "installing, please wait",
  "no-mods-installed": "no mods installed yet.",
  "export-log-button": "export log",
  "clear-log-button": "clear log",
  "copy-log-button": "copy all",
  "show-errors-button": "only errors",
  "show-warnings-button": "only warnings",
  "show-all-log-button": "show all",
  "mod-folder-not-set": "mod folder path is not set. cannot display available mods.",
  "pak-folder-not-set": "pak folder path is not set. cannot install/uninstall mods.",
  "confirm-action-title": "confirm action",
  "confirm-uninstall-all-mods-message": "are you sure you want to uninstall all non-base mods from your pak folder? this action cannot be undone.",
  "success-title": "success",
  "error-title": "error",
  "select-language-title": "select language",
  "conversor-title": "conversor",
  "mod-name-label": "mod name:",
  "all-files-label": "files (.pak, .sig, .ucas, .utoc):",
  "convert-button": "convert to .mmpackage",
  "conversion-success": "files successfully converted to \"{modName}.mmpackage\".",
  "conversion-error": "failed to convert files to .mmpackage: {error}",
  "invalid-files-selected": "please select one .pak, one .sig, one .ucas, and one .utoc file.",
  "mod-name-required": "please enter a name for the mod.",
  "mod-uninstalled-success": "mod \"{modName}\" was successfully uninstalled.",
  "latest-version-message": "you have the latest version!",
  "update-available": "update available!",
  "up-to-date": "up to date",
  "update-available-title": "update available!",
  "update-available-message": "a new version ({latestVersion}) of disobey.top mod manager is available! do you want to download it from the website?",
  "home-update-status-title": "update status:",
  "home-update-status-up": "your version is up to date",
  "home-update-status-out": "your version is outdated",
  "home-update-status-check-failed": "update check failed",
  "home-update-modal-title": "update required",
  "home-update-modal-message": "your version is outdated. please download the latest version from the website. the program will now close and open the website.",
  "home-update-modal-ok": "ok",
  "home-platform-title": "platform",
  "update-available": "update available!",
  "up-to-date": "up to date",
  "install-button": "install",
  "installed-button": "installed",
  "uninstall-button": "uninstall",
  "installing-button": "installing...",
  "installing-message": "installing, please wait",
  "drop-mmpackage-message": "you can drop .mmpackage files here to install",
    "no-available-mods": "no available mods found.",
    "no-mods-installed": "no mods installed yet.",
    "mod-details-title": "mod details",
    "mod-details-body": "details will be shown here",
    "mod-details-close": "close",
    "mod-folder-not-set": "mod folder path is not set. cannot display available mods.",
    },
    russian: {
        "home-dashboard-title": "панель приборов",
  "home-greeting": "с возвращением!",
  "dashboard-installed-mods-title": "установленные моды",
  "dashboard-installed-mods-desc": "просмотр и управление установленными модами",
  "dashboard-install-mods-title": "установить моды",
  "dashboard-install-mods-desc": "обзор и установка новых модов",
  "dashboard-settings-title": "настройки",
  "dashboard-settings-desc": "настройка путей и предпочтений",
  "dashboard-console-title": "консоль",
  "dashboard-console-desc": "просмотр логов и ошибок",
  "dashboard-platform-title": "платформа",
  "dashboard-update-status-title": "статус обновления",
  "dashboard-version-title": "версия",
  "developed-by": "разработано desgubernamentalizar",
  "mods-title": "моды",
  "drop-mmpackage-message": "вы можете перетащить файлы .mmpackage сюда для установки",
  "settings-title": "настройки",
  "mod-folder-path-label": "путь к папке с модами:",
  "pak-folder-path-label": "путь к папке pak:",
  "language-label": "язык:",
  "platform-label": "платформа:",
  "discord-rpc-label": "discord rich presence",
  "console-title": "вывод консоли",
  "no-button": "нет",
  "yes-button": "да",
  "ok-button": "ок",
  "select-mods-title": "выберите моды для установки",
  "close-button": "закрыть",
  "select-language-title": "выберите язык",
  "install-mods-button": "установить моды",
  "browse-button": "обзор",
  "uninstall-all-mods-button": "удалить все моды",
  "look-for-updates-button": "проверить обновления",
  "installed-button": "установлено",
  "uninstall-button": "удалить",
  "installing-button": "установка...",
  "installing-message": "идет установка, пожалуйста, подождите",
  "no-mods-installed": "моды еще не установлены.",
  "export-log-button": "экспортировать лог",
  "clear-log-button": "очистить лог",
  "copy-log-button": "копировать всё",
  "show-errors-button": "только ошибки",
  "show-warnings-button": "только предупреждения",
  "show-all-log-button": "показать всё",
  "mod-folder-not-set": "путь к папке с модами не указан. невозможно отобразить доступные моды.",
  "pak-folder-not-set": "путь к папке pak не указан. невозможно установить/удалить моды.",
  "confirm-action-title": "подтвердите действие",
  "confirm-uninstall-all-mods-message": "вы уверены, что хотите удалить все не базовые моды из вашей папки pak? это действие нельзя отменить.",
  "success-title": "успех",
  "error-title": "ошибка",
  "conversor-title": "конвертер",
  "mod-name-label": "имя мода:",
  "all-files-label": "файлы (.pak, .sig, .ucas, .utoc):",
  "convert-button": "конвертировать в .mmpackage",
  "conversion-success": "файлы успешно конвертированы в «{modName}.mmpackage».",
  "conversion-error": "не удалось конвертировать файлы в .mmpackage: {error}",
  "invalid-files-selected": "пожалуйста, выберите по одному файлу .pak, .sig, .ucas и .utoc.",
  "mod-name-required": "пожалуйста, введите имя для мода.",
  "mod-uninstalled-success": "мод «{modName}» был успешно удален.",
  "latest-version-message": "у вас последняя версия!",
  "update-available": "доступно обновление!",
  "up-to-date": "актуальная версия",
  "update-available-title": "доступно обновление!",
  "update-available-message": "доступна новая версия ({latestVersion}) менеджера модов disobey.top! хотите загрузить ее с веб-сайта?",
  "home-update-status-title": "статус обновления:",
  "home-update-status-up": "ваша версия актуальна",
  "home-update-status-out": "ваша версия устарела",
  "home-update-status-check-failed": "проверка обновления не удалась",
  "home-update-modal-title": "требуется обновление",
  "home-update-modal-message": "ваша версия устарела. пожалуйста, загрузите последнюю версию с веб-сайта. программа сейчас закроется и откроет веб-сайт.",
  "home-update-modal-ok": "ок",
  "home-platform-title": "платформа",
  "install-button": "установить",
  "no-available-mods": "доступные моды не найдены.",
  "mod-details-title": "детали мода",
  "mod-details-body": "детали будут показаны здесь",
  "mod-details-close": "закрыть"
    },
    german: {
        "home-dashboard-title": "Dashboard",
  "home-greeting": "willkommen zurück!",
  "dashboard-installed-mods-title": "installierte mods",
  "dashboard-installed-mods-desc": "deine installierten mods ansehen und verwalten",
  "dashboard-install-mods-title": "mods installieren",
  "dashboard-install-mods-desc": "neue mods durchsuchen und installieren",
  "dashboard-settings-title": "einstellungen",
  "dashboard-settings-desc": "pfade und präferenzen konfigurieren",
  "dashboard-console-title": "konsole",
  "dashboard-console-desc": "protokolle und fehler anzeigen",
  "dashboard-platform-title": "plattform",
  "dashboard-update-status-title": "update-status",
  "dashboard-version-title": "version",
  "developed-by": "entwickelt von desgubernamentalizar",
  "mods-title": "mods",
  "drop-mmpackage-message": "du kannst .mmpackage-dateien hierher ziehen, um sie zu installieren",
  "settings-title": "einstellungen",
  "mod-folder-path-label": "mod-ordnerpfad:",
  "pak-folder-path-label": "pak-ordnerpfad:",
  "language-label": "sprache:",
  "platform-label": "plattform:",
  "discord-rpc-label": "discord rich presence",
  "console-title": "konsolenausgabe",
  "no-button": "nein",
  "yes-button": "ja",
  "ok-button": "ok",
  "select-mods-title": "mods zum installieren auswählen",
  "close-button": "schließen",
  "select-language-title": "sprache auswählen",
  "install-mods-button": "mods installieren",
  "browse-button": "durchsuchen",
  "uninstall-all-mods-button": "alle mods deinstallieren",
  "look-for-updates-button": "nach updates suchen",
  "installed-button": "installiert",
  "uninstall-button": "deinstallieren",
  "installing-button": "wird installiert...",
  "installing-message": "wird installiert, bitte warten",
  "no-mods-installed": "noch keine mods installiert.",
  "export-log-button": "protokoll exportieren",
  "clear-log-button": "protokoll löschen",
  "copy-log-button": "alles kopieren",
  "show-errors-button": "nur fehler",
  "show-warnings-button": "nur warnungen",
  "show-all-log-button": "alles anzeigen",
  "mod-folder-not-set": "mod-ordnerpfad ist nicht festgelegt. verfügbare mods können nicht angezeigt werden.",
  "pak-folder-not-set": "pak-ordnerpfad ist nicht festgelegt. mods können nicht installiert/deinstalliert werden.",
  "confirm-action-title": "aktion bestätigen",
  "confirm-uninstall-all-mods-message": "bist du sicher, dass du alle nicht-basis-mods aus deinem pak-ordner deinstallieren möchtest? diese aktion kann nicht rückgängig gemacht werden.",
  "success-title": "erfolg",
  "error-title": "fehler",
  "conversor-title": "konverter",
  "mod-name-label": "mod-name:",
  "all-files-label": "dateien (.pak, .sig, .ucas, .utoc):",
  "convert-button": "zu .mmpackage konvertieren",
  "conversion-success": "dateien erfolgreich zu „{modName}.mmpackage“ konvertiert.",
  "conversion-error": "fehler beim konvertieren der dateien zu .mmpackage: {error}",
  "invalid-files-selected": "bitte wähle eine .pak-, eine .sig-, eine .ucas- und eine .utoc-datei aus.",
  "mod-name-required": "bitte gib einen namen für den mod ein.",
  "mod-uninstalled-success": "mod „{modName}“ wurde erfolgreich deinstalliert.",
  "latest-version-message": "du hast die neueste version!",
  "update-available": "update verfügbar!",
  "up-to-date": "auf dem neuesten stand",
  "update-available-title": "update verfügbar!",
  "update-available-message": "eine neue version ({latestVersion}) des disobey.top mod managers ist verfügbar! möchtest du sie von der website herunterladen?",
  "home-update-status-title": "update-status:",
  "home-update-status-up": "deine version ist auf dem neuesten stand",
  "home-update-status-out": "deine version ist veraltet",
  "home-update-status-check-failed": "update-prüfung fehlgeschlagen",
  "home-update-modal-title": "update erforderlich",
  "home-update-modal-message": "deine version ist veraltet. bitte lade die neueste version von der website herunter. das programm wird sich nun schließen und die website öffnen.",
  "home-update-modal-ok": "ok",
  "home-platform-title": "plattform",
  "install-button": "installieren",
  "no-available-mods": "keine verfügbaren mods gefunden.",
  "mod-details-title": "mod-details",
  "mod-details-body": "details werden hier angezeigt",
  "mod-details-close": "schließen"
    },
    spanish: {
        "home-dashboard-title": "panel",
  "home-greeting": "¡bienvenido de vuelta!",
  "dashboard-installed-mods-title": "mods instalados",
  "dashboard-installed-mods-desc": "ver y gestionar tus mods instalados",
  "dashboard-install-mods-title": "instalar mods",
  "dashboard-install-mods-desc": "buscar e instalar nuevos mods",
  "dashboard-settings-title": "ajustes",
  "dashboard-settings-desc": "configurar rutas y preferencias",
  "dashboard-console-title": "consola",
  "dashboard-console-desc": "ver registros y errores",
  "dashboard-platform-title": "plataforma",
  "dashboard-update-status-title": "estado de la actualización",
  "dashboard-version-title": "versión",
  "developed-by": "desarrollado por desgubernamentalizar",
  "mods-title": "mods",
  "drop-mmpackage-message": "puedes arrastrar y soltar archivos .mmpackage aquí para instalar",
  "settings-title": "ajustes",
  "mod-folder-path-label": "ruta de la carpeta de mods:",
  "pak-folder-path-label": "ruta de la carpeta pak:",
  "language-label": "idioma:",
  "platform-label": "plataforma:",
  "discord-rpc-label": "discord rich presence",
  "console-title": "salida de la consola",
  "no-button": "no",
  "yes-button": "sí",
  "ok-button": "ok",
  "select-mods-title": "seleccionar mods para instalar",
  "close-button": "cerrar",
  "select-language-title": "seleccionar idioma",
  "install-mods-button": "instalar mods",
  "browse-button": "examinar",
  "uninstall-all-mods-button": "desinstalar todos los mods",
  "look-for-updates-button": "buscar actualizaciones",
  "installed-button": "instalado",
  "uninstall-button": "desinstalar",
  "installing-button": "instalando...",
  "installing-message": "instalando, por favor espera",
  "no-mods-installed": "aún no hay mods instalados.",
  "export-log-button": "exportar registro",
  "clear-log-button": "limpiar registro",
  "copy-log-button": "copiar todo",
  "show-errors-button": "solo errores",
  "show-warnings-button": "solo advertencias",
  "show-all-log-button": "mostrar todo",
  "mod-folder-not-set": "la ruta de la carpeta de mods no está configurada. no se pueden mostrar los mods disponibles.",
  "pak-folder-not-set": "la ruta de la carpeta pak no está configurada. no se pueden instalar/desinstalar mods.",
  "confirm-action-title": "confirmar acción",
  "confirm-uninstall-all-mods-message": "¿estás seguro de que quieres desinstalar todos los mods que no son de base de tu carpeta pak? esta acción no se puede deshacer.",
  "success-title": "éxito",
  "error-title": "error",
  "conversor-title": "conversor",
  "mod-name-label": "nombre del mod:",
  "all-files-label": "archivos (.pak, .sig, .ucas, .utoc):",
  "convert-button": "convertir a .mmpackage",
  "conversion-success": "archivos convertidos con éxito a \"{modName}.mmpackage\".",
  "conversion-error": "no se pudieron convertir los archivos a .mmpackage: {error}",
  "invalid-files-selected": "por favor, selecciona un archivo .pak, un .sig, un .ucas y un .utoc.",
  "mod-name-required": "por favor, introduce un nombre para el mod.",
  "mod-uninstalled-success": "el mod \"{modName}\" se ha desinstalado correctamente.",
  "latest-version-message": "¡tienes la última versión!",
  "update-available": "¡actualización disponible!",
  "up-to-date": "actualizado",
  "update-available-title": "¡actualización disponible!",
  "update-available-message": "¡una nueva versión ({latestVersion}) de disobey.top mod manager está disponible! ¿quieres descargarla desde el sitio web?",
  "home-update-status-title": "estado de la actualización:",
  "home-update-status-up": "tu versión está actualizada",
  "home-update-status-out": "tu versión está desactualizada",
  "home-update-status-check-failed": "fallo en la comprobación de actualizaciones",
  "home-update-modal-title": "actualización requerida",
  "home-update-modal-message": "tu versión está desactualizada. por favor, descarga la última versión desde el sitio web. el programa se cerrará y abrirá el sitio web.",
  "home-update-modal-ok": "ok",
  "home-platform-title": "plataforma",
  "install-button": "instalar",
  "no-available-mods": "no se encontraron mods disponibles.",
  "mod-details-title": "detalles del mod",
  "mod-details-body": "los detalles se mostrarán aquí",
  "mod-details-close": "cerrar"
    },
    chinese: {
        "home-dashboard-title": "仪表盘",
  "home-greeting": "欢迎回来！",
  "dashboard-installed-mods-title": "已安装的模组",
  "dashboard-installed-mods-desc": "查看和管理您已安装的模组",
  "dashboard-install-mods-title": "安装模组",
  "dashboard-install-mods-desc": "浏览并安装新模组",
  "dashboard-settings-title": "设置",
  "dashboard-settings-desc": "配置路径和偏好设置",
  "dashboard-console-title": "控制台",
  "dashboard-console-desc": "查看日志和错误",
  "dashboard-platform-title": "平台",
  "dashboard-update-status-title": "更新状态",
  "dashboard-version-title": "版本",
  "developed-by": "由 desgubernamentalizar 开发",
  "mods-title": "模组",
  "drop-mmpackage-message": "您可以将 .mmpackage 文件拖放到此处进行安装",
  "settings-title": "设置",
  "mod-folder-path-label": "模组文件夹路径：",
  "pak-folder-path-label": "pak 文件夹路径：",
  "language-label": "语言：",
  "platform-label": "平台：",
  "discord-rpc-label": "Discord 丰富状态",
  "console-title": "控制台输出",
  "no-button": "否",
  "yes-button": "是",
  "ok-button": "确定",
  "select-mods-title": "选择要安装的模组",
  "close-button": "关闭",
  "select-language-title": "选择语言",
  "install-mods-button": "安装模组",
  "browse-button": "浏览",
  "uninstall-all-mods-button": "卸载所有模组",
  "look-for-updates-button": "检查更新",
  "installed-button": "已安装",
  "uninstall-button": "卸载",
  "installing-button": "正在安装...",
  "installing-message": "正在安装，请稍候",
  "no-mods-installed": "尚未安装任何模组。",
  "export-log-button": "导出日志",
  "clear-log-button": "清除日志",
  "copy-log-button": "全部复制",
  "show-errors-button": "仅错误",
  "show-warnings-button": "仅警告",
  "show-all-log-button": "显示全部",
  "mod-folder-not-set": "未设置模组文件夹路径。无法显示可用模组。",
  "pak-folder-not-set": "未设置 pak 文件夹路径。无法安装/卸载模组。",
  "confirm-action-title": "确认操作",
  "confirm-uninstall-all-mods-message": "您确定要从您的 pak 文件夹中卸载所有非基础模组吗？此操作无法撤销。",
  "success-title": "成功",
  "error-title": "错误",
  "conversor-title": "转换器",
  "mod-name-label": "模组名称：",
  "all-files-label": "文件 (.pak, .sig, .ucas, .utoc)：",
  "convert-button": "转换为 .mmpackage",
  "conversion-success": "文件已成功转换为“{modName}.mmpackage”。",
  "conversion-error": "无法将文件转换为 .mmpackage：{error}",
  "invalid-files-selected": "请选择一个 .pak、一个 .sig、一个 .ucas 和一个 .utoc 文件。",
  "mod-name-required": "请输入模组的名称。",
  "mod-uninstalled-success": "模组“{modName}”已成功卸载。",
  "latest-version-message": "您已拥有最新版本！",
  "update-available": "有可用更新！",
  "up-to-date": "最新版本",
  "update-available-title": "有可用更新！",
  "update-available-message": "disobey.top 模组管理器的新版本 ({latestVersion}) 可用！您想从网站下载吗？",
  "home-update-status-title": "更新状态：",
  "home-update-status-up": "您的版本是最新版本",
  "home-update-status-out": "您的版本已过时",
  "home-update-status-check-failed": "更新检查失败",
  "home-update-modal-title": "需要更新",
  "home-update-modal-message": "您的版本已过时。请从网站下载最新版本。程序现在将关闭并打开网站。",
  "home-update-modal-ok": "确定",
  "home-platform-title": "平台",
  "install-button": "安装",
  "no-available-mods": "未找到可用的模组。",
  "mod-details-title": "模组详情",
  "mod-details-body": "详情将在此处显示",
  "mod-details-close": "关闭"
    }
};


/**
 * applies translations to the ui elements.
 * @param {string} langkey - the key for the selected language (e.g., 'english').
 */
// --- update status persistence ---
let lastUpdateStatusHTML = null;

function applyTranslations(langKey) {
    const lang = langKey ? langKey.toLowerCase() : 'english';
    const currentLang = translations[lang] || translations.english;
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        if (currentLang[key]) {
            element.textContent = currentLang[key];
        } else if (translations.english[key]) {
            // fallback to english if missing in currentLang
            element.textContent = translations.english[key];
        }
    });
    // Also update placeholders for inputs/selects
    document.querySelectorAll('[data-translate-placeholder]').forEach(element => {
        const key = element.getAttribute('data-translate-placeholder');
        if (currentLang[key]) {
            element.placeholder = currentLang[key];
        } else if (translations.english[key]) {
            element.placeholder = translations.english[key];
        }
    });
    // Restore update status message if available
    const updateStatusText = document.getElementById('update-status-text');
    if (updateStatusText && lastUpdateStatusHTML !== null) {
        updateStatusText.innerHTML = lastUpdateStatusHTML;
    }

    // handle elements with combined icons and text
    const setHtml = (selector, key) => {
        const element = document.querySelector(selector);
        if (element) {
            const translationText = currentLang[key] || translations.english[key] || `missing: ${key}`;
            // Fixed regex: match <i class="..."></i>
            const iconMatch = element.innerHTML.match(/<i class="[^"]+"><\/i>/);
            element.innerHTML = iconMatch ? `${iconMatch[0]} ${translationText}` : translationText;
        }
    };
// --- END regex fix ---
    setHtml('#install-mods-button', 'install-mods-button');
    setHtml('#select-mod-folder', 'browse-button');
    setHtml('#select-pak-folder', 'browse-button');
    setHtml('#uninstall-all-mods-button', 'uninstall-all-mods-button');
    setHtml('#check-for-updates-button', 'look-for-updates-button');
    setHtml('#export-log-button', 'export-log-button');
    setHtml('#clear-log-button', 'clear-log-button');
    setHtml('#copy-log-button', 'copy-log-button');
    setHtml('#show-errors-button', 'show-errors-button');
    setHtml('#show-warnings-button', 'show-warnings-button');
    setHtml('#show-all-log-button', 'show-all-log-button');

    document.querySelectorAll('.mod-toggle-button').forEach(button => {
        const currentText = button.textContent.toLowerCase();
        if (currentText.includes('install')) button.textContent = currentLang['install-button'] || translations.english['install-button'];
        else if (currentText.includes('installed')) button.textContent = currentLang['installed-button'] || translations.english['installed-button'];
        else if (currentText.includes('uninstall')) button.textContent = currentLang['uninstall-button'] || translations.english['uninstall-button'];
    });

    // dashboard squares
    const dashboardTitles = [
        ['dashboard-installed-mods-title', '.dashboard-card:nth-child(1) .dashboard-title'],
        ['dashboard-install-mods-title', '.dashboard-card:nth-child(2) .dashboard-title'],
        ['dashboard-settings-title', '.dashboard-card:nth-child(3) .dashboard-title'],
        ['dashboard-console-title', '.dashboard-card:nth-child(4) .dashboard-title']
    ];
    const dashboardDescs = [
        ['dashboard-installed-mods-desc', '.dashboard-card:nth-child(1) .dashboard-desc'],
        ['dashboard-install-mods-desc', '.dashboard-card:nth-child(2) .dashboard-desc'],
        ['dashboard-settings-desc', '.dashboard-card:nth-child(3) .dashboard-desc'],
        ['dashboard-console-desc', '.dashboard-card:nth-child(4) .dashboard-desc']
    ];
    dashboardTitles.forEach(([key, selector]) => {
        const el = document.querySelector(selector);
        if (el) el.textContent = currentLang[key] || translations.english[key] || el.textContent;
    });
    dashboardDescs.forEach(([key, selector]) => {
        const el = document.querySelector(selector);
        if (el) el.textContent = currentLang[key] || translations.english[key] || el.textContent;
    });
    // drop message
    const dropMsg = document.getElementById('mods-drop-message');
    if (dropMsg) {
        const icon = dropMsg.querySelector('i');
        dropMsg.innerHTML = '';
        if (icon) dropMsg.appendChild(icon);
        const span = document.createElement('span');
        span.textContent = currentLang['drop-mmpackage-message'] || translations.english['drop-mmpackage-message'];
        dropMsg.appendChild(span);
    }
    // platform and version
    const platformStat = document.getElementById('platform-stat-text');
    if (platformStat) {
        platformStat.textContent = `${currentLang['dashboard-platform-title'] || translations.english['dashboard-platform-title']}: ${currentSettings.platform}`;
    }
    // versionStat is just the number, so we don't overwrite it, but you can add a label elsewhere if needed
    // Modal buttons (ok, yes, no, close)
    const okBtns = document.querySelectorAll('[data-translate="ok-button"]');
    okBtns.forEach(btn => btn.textContent = currentLang['ok-button'] || translations.english['ok-button']);
    const yesBtns = document.querySelectorAll('[data-translate="yes-button"]');
    yesBtns.forEach(btn => btn.textContent = currentLang['yes-button'] || translations.english['yes-button']);
    const noBtns = document.querySelectorAll('[data-translate="no-button"]');
    noBtns.forEach(btn => btn.textContent = currentLang['no-button'] || translations.english['no-button']);
    const closeBtns = document.querySelectorAll('[data-translate="close-button"]');
    closeBtns.forEach(btn => btn.textContent = currentLang['close-button'] || translations.english['close-button']);
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
    if (tabId === 'metadata-tab') {
        renderMetadataMods();
    }
    applyTranslations(currentSettings.language);
}

// --- metadata tab logic ---
async function renderMetadataMods() {
    const metadataModList = document.getElementById('metadata-mod-list');
    if (!metadataModList) return;
    metadataModList.innerHTML = '';
    const lang = currentSettings.language ? currentSettings.language.toLowerCase() : 'english';
    if (!currentSettings.modFolderPath) {
        const msg = document.createElement('p');
        msg.className = 'text-gray-400 text-center';
        msg.textContent = translations[lang]['mod-folder-not-set'];
        metadataModList.appendChild(msg);
        return;
    }
const availableMods = await window.electronAPI.getAvailableMods();
if (!availableMods || availableMods.length === 0) {
    const msg = document.createElement('p');
    msg.className = 'text-gray-400 text-center';
    msg.textContent = translations[lang]['no-available-mods'];
    metadataModList.appendChild(msg);
    return;
}


// Add nerd mode button to settings tab if not present
const settingsTab = document.getElementById('settings-tab');
if (settingsTab && !document.getElementById('nerd-mode-btn')) {
    const nerdBtn = document.createElement('button');
    nerdBtn.id = 'nerd-mode-btn';
    nerdBtn.className = 'font-bold py-3 px-6 rounded-lg shadow-lg transition duration-200';
    nerdBtn.style = 'border: 1px solid var(--accent-color); margin-top: 1em;';
    nerdBtn.onclick = async () => {
        setNerdMode(false);
        currentSettings.nerdMode = false;
        await saveSettings();
    };
    settingsTab.appendChild(nerdBtn);
}
    // Default: disable save button
    saveBtn.disabled = true;
}

// --- settings management ---
function setNerdMode(enabled) {
    currentSettings.nerdMode = enabled;
    // show/hide tabs
    const tabs = [
        { btn: document.querySelector('.tab-button[data-tab="conversor"]'), tab: document.getElementById('conversor-tab') },
        { btn: document.querySelector('.tab-button[data-tab="metadata"]'), tab: document.getElementById('metadata-tab') },
        { btn: document.querySelector('.tab-button[data-tab="console"]'), tab: document.getElementById('console-tab') }
    ];
    tabs.forEach(({btn, tab}) => {
        if (btn) btn.style.display = enabled ? '' : 'none';
        if (tab && tab.id !== 'console-tab') tab.style.display = enabled ? '' : 'none';
    });
    const consoleTab = document.getElementById('console-tab');
    const consoleOutput = document.getElementById('console-output');
    let egg = document.getElementById('nerd-egg');
    if (!enabled) {
        if (consoleOutput) consoleOutput.style.display = 'none';
        if (!egg) {
            egg = document.createElement('div');
            egg.id = 'nerd-egg';
            egg.style.display = 'flex';
            egg.style.flexDirection = 'column';
            egg.style.alignItems = 'center';
            egg.style.justifyContent = 'center';
            egg.style.marginTop = '4em';
            egg.innerHTML = `<div style="font-size:2rem;font-weight:bold;margin-bottom:1em;">why</div><img src="https://www.startpage.com/av/proxy-image?piurl=https%3A%2F%2Fi.redd.it%2Fzprbuh5ggnu91.jpg&sp=1754147153T6cdc335fd74197743b544e1402ccbaab5b46365b3a370d3cbf36e0ce044565b9" alt="why" style="max-width:320px;width:100%;border-radius:1em;box-shadow:0 4px 24px #0008;">`;
            consoleTab.appendChild(egg);
        }
    } else {
        if (egg) egg.remove();
        if (consoleOutput) consoleOutput.style.display = '';
    }
    // update nerd mode toggle
    const nerdToggle = document.getElementById('nerd-mode-toggle');
    if (nerdToggle) nerdToggle.checked = enabled;
}
async function loadSettings() {
    log('loading settings...', 'system');
    currentSettings = await window.electronAPI.loadSettings();
    document.getElementById('mod-folder-path').value = currentSettings.modFolderPath || '';
    document.getElementById('pak-folder-path').value = currentSettings.pakFolderPath || '';
    document.getElementById('platform-selector').value = currentSettings.platform || 'steam';
    document.getElementById('discord-rpc-toggle').checked = currentSettings.discordRpcEnabled;
    updateLanguageDisplay(currentSettings.language || 'english');
    setNerdMode(currentSettings.nerdMode !== false); // default nerdMode true
    applyTranslations(currentSettings.language);
    log('settings loaded and ui updated.', 'system');
    // Setup nerd mode toggle
    const nerdToggle = document.getElementById('nerd-mode-toggle');
    if (nerdToggle) {
        nerdToggle.checked = currentSettings.nerdMode !== false;
        nerdToggle.onchange = async (e) => {
            setNerdMode(e.target.checked);
            currentSettings.nerdMode = e.target.checked;
            await saveSettings();
        };
    }
}

async function saveSettings() {
    log('saving settings...', 'system');
    const settingsToSave = {
        modFolderPath: document.getElementById('mod-folder-path').value,
        pakFolderPath: document.getElementById('pak-folder-path').value,
        language: document.getElementById('current-language-text').textContent,
        platform: document.getElementById('platform-selector').value,
        discordRpcEnabled: document.getElementById('discord-rpc-toggle').checked,
        nerdMode: currentSettings.nerdMode !== false // default true if undefined
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
    // --- Fix: initialize search and category filter variables ---
    let searchFilter = '';
    let categoryFilter = '';
    try { searchFilter = localStorage.getItem('modSearchFilter') || ''; } catch { searchFilter = ''; }
    try { categoryFilter = localStorage.getItem('modCategoryFilter') || ''; } catch { categoryFilter = ''; }
    // Get available mods with metadata
    const availableMods = await window.electronAPI.getAvailableMods();
    installedModsData = await window.electronAPI.getInstalledMods();
    // Get mod conflicts
    let modConflicts = [];
    try {
        modConflicts = await window.electronAPI.getModConflicts();
    } catch (e) {
        modConflicts = [];
    }
    // Map: modName -> [conflicting files]
    const modConflictMap = {};
    for (const conflict of modConflicts) {
        for (const mod of conflict.mods) {
            if (!modConflictMap[mod]) modConflictMap[mod] = [];
            modConflictMap[mod].push(conflict.file);
        }
    }
    const installedModsListDiv = document.getElementById('installed-mods-list');
    if (!installedModsListDiv) return;
    installedModsListDiv.innerHTML = '';

    const lang = currentSettings.language ? currentSettings.language.toLowerCase() : 'english';
    document.getElementById('platform-stat-text').textContent = `platform: ${currentSettings.platform}`;

    // Only show installed mods
    const installedModNames = Object.keys(installedModsData);
    if (installedModNames.length === 0) {
        const noModsMessage = document.createElement('p');
        noModsMessage.id = 'no-mods-installed-message';
        noModsMessage.classList.add('text-gray-400', 'text-center');
        noModsMessage.textContent = translations[lang]['no-mods-installed'];
        installedModsListDiv.appendChild(noModsMessage);
        return;
    }

    // --- Favorite/star mods ---
    let favorites = [];
    try {
        favorites = JSON.parse(localStorage.getItem('favoriteMods') || '[]');
    } catch { favorites = []; }
    function toggleFavorite(modName) {
        let favs = [];
        try { favs = JSON.parse(localStorage.getItem('favoriteMods') || '[]'); } catch { favs = []; }
        if (favs.includes(modName)) {
            favs = favs.filter(m => m !== modName);
        } else {
            favs.push(modName);
        }
        localStorage.setItem('favoriteMods', JSON.stringify(favs));
        renderInstalledMods();
    }
    // Sort: favorites first
    installedModNames.sort((a, b) => {
        const afav = favorites.includes(a), bfav = favorites.includes(b);
        if (afav && !bfav) return -1;
        if (!afav && bfav) return 1;
        return a.localeCompare(b);
    });
    // --- Tag/categorize mods ---
    let modTags = {};
    try { modTags = JSON.parse(localStorage.getItem('modTags') || '{}'); } catch { modTags = {}; }
    function editTags(modName) {
        let tags = modTags[modName] || [];
        const input = prompt('Enter tags for this mod (comma separated):', tags.join(', '));
        if (input !== null) {
            tags = input.split(',').map(t => t.trim()).filter(Boolean);
            modTags[modName] = tags;
            localStorage.setItem('modTags', JSON.stringify(modTags));
            renderInstalledMods();
        }
    }
    // Always insert filter UI in mods tab (above installed or available mods)
    let filterDiv = document.getElementById('mod-filter-div');
    const modsTab = document.getElementById('mods-tab');
    // Always render the filter UI, even if no mods are installed
    if (modsTab) {
        if (!filterDiv) {
            filterDiv = document.createElement('div');
            filterDiv.id = 'mod-filter-div';
            filterDiv.style.marginBottom = '1em';
            filterDiv.innerHTML = `
                <input id='mod-search-filter' type='text' placeholder='Search by name or author...' style='margin-right:0.5em;padding:2px 8px;border-radius:6px;border:1px solid #333;background:#222;color:#fff;'>
                <label style='margin-left:1em;margin-right:0.5em;'>Category:</label><select id='mod-category-filter'></select>
            `;
            modsTab.insertBefore(filterDiv, modsTab.children[2] || null); // after title and install button
            // Attach event listeners ONCE
            document.getElementById('mod-search-filter').addEventListener('input', (e) => {
                localStorage.setItem('modSearchFilter', e.target.value);
                renderInstalledMods();
            });
            document.getElementById('mod-category-filter').addEventListener('change', (e) => {
                localStorage.setItem('modCategoryFilter', e.target.value);
                renderInstalledMods();
            });
        }
    }
    // Always update values and options
    const searchInput = document.getElementById('mod-search-filter');
    const categorySelect = document.getElementById('mod-category-filter');
    // Build categories from both available and installed mods
    let allCategoriesSet = new Set();
    availableMods.forEach(m => { if (m.metadata && m.metadata.category) allCategoriesSet.add(m.metadata.category); });
    Object.values(installedModsData).forEach(m => { if (m.metadata && m.metadata.category) allCategoriesSet.add(m.metadata.category); });
    const allCategoriesArr = Array.from(allCategoriesSet).sort();
    if (searchInput) searchInput.value = searchFilter;
    if (categorySelect) {
        let options = `<option value=''>All</option>` + allCategoriesArr.map(c => `<option value='${c}' ${c===categoryFilter?'selected':''}>${c}</option>`).join('');
        if (categorySelect.innerHTML !== options) categorySelect.innerHTML = options;
        categorySelect.value = categoryFilter;
    }
    // ---
    // Debug: log available mods and installed mods
    console.log('Available mods:', availableMods);
    console.log('Installed mods:', installedModsData);
    // Render installed mods list
    if (installedModsListDiv) {
        const installedModNames = Object.keys(installedModsData);
        if (installedModNames.length === 0) {
            const noModsMessage = document.createElement('p');
            noModsMessage.id = 'no-mods-installed-message';
            noModsMessage.classList.add('text-gray-400', 'text-center');
            noModsMessage.textContent = translations[currentSettings.language?.toLowerCase() || 'english']['no-mods-installed'];
            installedModsListDiv.appendChild(noModsMessage);
        } else {
            installedModNames.forEach(modName => {
                const mod = availableMods.find(m => m.name === modName) || {};
                const metadata = mod.metadata || (installedModsData[modName].metadata || {});
                const modItem = document.createElement('div');
                modItem.classList.add('mod-item', 'mod-item-installed');
                let previewHtml = '';
                if (metadata && metadata.preview) {
                    previewHtml = `<img src="${metadata.preview}" alt="preview" style="width:48px;height:48px;object-fit:cover;border-radius:0.25rem;margin-right:1rem;">`;
                }
                let infoButtonHtml = `<button class="mod-info-button ml-2 text-accent-color" title="View info" style="background:none;border:none;cursor:pointer;font-size:1.2em;"><i class="fas fa-info-circle"></i></button>`;
                modItem.innerHTML = `
                    <div style="display:flex;align-items:center;gap:1rem;flex:1;">
                        ${previewHtml}
                        <div style="flex:1;">
                            <span class="mod-item-name">${modName.replace('.mmpackage', '')}</span>
                            ${metadata && metadata.author ? `<div class="text-xs text-gray-400">by ${metadata.author}</div>` : ''}
                            ${metadata && metadata.description ? `<div class="text-xs text-gray-500 mt-1">${metadata.description}</div>` : ''}
                        </div>
                        ${infoButtonHtml}
                    </div>
                    <button class="mod-toggle-button off" data-mod-name="${modName}">${translations[currentSettings.language?.toLowerCase() || 'english']['uninstall-button']}</button>
                `;
                modItem.querySelector('.mod-info-button').addEventListener('click', (e) => {
                    e.stopPropagation();
                    let html = '';
                    if (metadata) {
                        if (metadata.preview) html += `<img src='${metadata.preview}' style='max-width:100%;max-height:200px;border-radius:0.5rem;margin-bottom:1rem;'>`;
                        html += `<div><b>Name:</b> ${modName.replace('.mmpackage', '')}</div>`;
                        if (metadata.author) html += `<div><b>Author:</b> ${metadata.author}</div>`;
                        if (metadata.version) html += `<div><b>Version:</b> ${metadata.version}</div>`;
                        if (metadata.category) html += `<div><b>Category:</b> ${metadata.category}</div>`;
                        if (metadata.description) html += `<div style='margin-top:0.5em;'><b>Description:</b><br>${metadata.description}</div>`;
                    } else {
                        html = '<div>No metadata available for this mod.</div>';
                    }
                    document.getElementById('mod-details-title').textContent = modName.replace('.mmpackage', '');
                    document.getElementById('mod-details-body').innerHTML = html;
                    document.getElementById('mod-details-modal').classList.remove('hidden');
                });
                installedModsListDiv.appendChild(modItem);
            });
        }
    }
}

// --- conversor tab logic ---
const modNameInput = document.getElementById('mod-name-input');
const allFilesPathInput = document.getElementById('all-files-path');
const convertButton = document.getElementById('convert-button');
let selectedConversionFiles = [];

function checkConvertButtonStatus() {
    const isReady = modNameInput?.value.trim() && selectedConversionFiles.length === 4;
    if (convertButton) {
  convertButton.disabled = !isReady;
  convertButton.classList.toggle('highlight', isReady);
}
}

function resetConversorForm() {
    modNameInput.value = '';
    allFilesPathInput.value = '';
    selectedConversionFiles = [];
    checkConvertButtonStatus();
}

// --- console tab enhancements ---
let logFilter = 'all';
function filterConsoleLog() {
    const entries = document.querySelectorAll('.console-log-entry');
    entries.forEach(entry => {
        if (logFilter === 'all') entry.style.display = '';
        else if (logFilter === 'error') entry.style.display = entry.classList.contains('error') ? '' : 'none';
        else if (logFilter === 'warn') entry.style.display = entry.classList.contains('warn') ? '' : 'none';
    });
}
document.addEventListener('DOMContentLoaded', () => {
    const copyBtn = document.getElementById('copy-log-button');
    const showErrorsBtn = document.getElementById('show-errors-button');
    const showWarningsBtn = document.getElementById('show-warnings-button');
    const showAllBtn = document.getElementById('show-all-log-button');
    if (copyBtn) copyBtn.onclick = () => {
        const logText = Array.from(document.querySelectorAll('.console-log-entry'))
            .filter(e => e.style.display !== 'none')
            .map(e => e.textContent).join('\n');
        navigator.clipboard.writeText(logText);
    };
    if (showErrorsBtn) showErrorsBtn.onclick = () => { logFilter = 'error'; filterConsoleLog(); };
    if (showWarningsBtn) showWarningsBtn.onclick = () => { logFilter = 'warn'; filterConsoleLog(); };
    if (showAllBtn) showAllBtn.onclick = () => { logFilter = 'all'; filterConsoleLog(); };
});
// Patch log to respect filter
const origLog = log;
log = function(message, type = 'info') {
    origLog(message, type);
    filterConsoleLog();
};

// --- version checker with remote update check and translations ---
function compareVersions(v1, v2) {
    const a = v1.split('.').map(Number);
    const b = v2.split('.').map(Number);
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
        const n1 = a[i] || 0;
        const n2 = b[i] || 0;
        if (n1 > n2) return 1;
        if (n1 < n2) return -1;
    }
    return 0;
}

async function checkForUpdatesAndShowModal() {
    let version = '';
    let latestVersion = '';
    let lang = (currentSettings.language || 'english').toLowerCase();
    const translationsForLang = translations[lang] || translations.english;
    try {
        if (window.electronAPI && window.electronAPI.getAppVersion) {
            version = await window.electronAPI.getAppVersion();
        }
    } catch (e) {
        version = '';
    }
    if (!version) version = 'unknown';
    const appVersionSpan = document.getElementById('app-version');
    if (appVersionSpan) appVersionSpan.textContent = version;
    log(`application version: ${version}`, 'system');

    try {
        const response = await fetch('https://disobey.top/txts/version.txt', { cache: 'no-store' });
        if (response.ok) {
            latestVersion = (await response.text()).trim();
            log(`[UPDATE CHECK] fetched latest version: '${latestVersion}' from https://disobey.top/txts/version.txt`, 'system');
        } else {
            log(`[UPDATE CHECK] failed to fetch version.txt, status: ${response.status}`, 'error');
        }
    } catch (e) {
        latestVersion = '';
    }
    const updateStatusText = document.getElementById('update-status-text');
    log(`[UPDATE CHECK] current version: ${version}, latest version: ${latestVersion}`, 'system');
    if (updateStatusText) {
        let statusLabel = translationsForLang['home-update-status-title'] + ' ';
        if (!latestVersion) {
            updateStatusText.innerHTML = `${statusLabel}<span style="color:#ff5555">${translationsForLang['home-update-status-check-failed']}</span>`;
        } else if (version !== latestVersion) {
            updateStatusText.innerHTML = `${statusLabel}<span style="color:#ff5555">outdated! (${version})</span>`;
showMessageModalWithAction(
    'Update Required',
    "there's a new version of this program, is really recommended to update, due to the program being in beta, do you want to update?",
    'ok',
    () => {
        const url = `https://disobey.top/disobey.topv${latestVersion}.exe`;
const lang = (currentSettings.language || 'english').toLowerCase();
const installingText = translations[lang]?.['installing-message'] || 'installing, please wait';
const modal = document.getElementById('message-modal');
document.getElementById('message-modal-title').textContent = '';
document.getElementById('message-modal-message').innerHTML = `
  <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2em 0;">
    <div style="margin-bottom:1em;">
      <svg width="48" height="48" viewBox="0 0 50 50"><circle cx="25" cy="25" r="20" fill="none" stroke="#22cc22" stroke-width="5" stroke-linecap="round" stroke-dasharray="31.415, 31.415" transform="rotate(72.0001 25 25)"><animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="1s" repeatCount="indefinite"/></circle></svg>
    </div>
    <div style="font-size:1.2em;text-align:center;color:#22cc22;">${installingText}</div>
  </div>
`;
modal.classList.remove('hidden');
window.electronAPI.autoUpdateAndExit(url);
    }
);
        } else {
            updateStatusText.innerHTML = `${statusLabel}<span style="color:#22cc22">${translationsForLang['home-update-status-up']}</span>`;
        }
        // Store the last update status HTML for persistence
        lastUpdateStatusHTML = updateStatusText.innerHTML;
    }

// Custom modal with action for OK
function showMessageModalWithAction(title, message, okText, okAction) {
    const modal = document.getElementById('message-modal');
    document.getElementById('message-modal-title').textContent = title;
    document.getElementById('message-modal-message').textContent = message;
    const okBtn = modal.querySelector('.modal-button-primary');
    okBtn.textContent = okText;
    // Remove any previous handlers
    const newBtn = okBtn.cloneNode(true);
    okBtn.parentNode.replaceChild(newBtn, okBtn);
    newBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
        if (okAction) okAction();
    });
    modal.classList.remove('hidden');
}
}

document.addEventListener('DOMContentLoaded', () => { checkForUpdatesAndShowModal(); }, { once: true });

// --- initialization and event listeners ---
window.addEventListener('error', function(e) {
    log('JS Error: ' + e.message + '\n' + (e.error && e.error.stack ? e.error.stack : ''), 'error');
});
document.addEventListener('DOMContentLoaded', async () => {
    console.log("renderer script: domcontentloaded event fired.");
    
    try {
        await loadSettings();
        
        // signal to main process that renderer is ready
        window.electronAPI.rendererReady();

        // attach title bar listeners ONCE, never overwrite sidebar/titlebar
        document.getElementById('minimize-button')?.addEventListener('click', () => window.electronAPI.minimizeWindow());
        document.getElementById('maximize-button')?.addEventListener('click', () => window.electronAPI.maximizeWindow());
        document.getElementById('close-button')?.addEventListener('click', () => window.electronAPI.closeWindow());

        // Robust event delegation for tab buttons and title bar
        document.getElementById('sidebar')?.addEventListener('click', (e) => {
            const btn = e.target.closest('.tab-button');
            if (btn && btn.dataset.tab) {
                activateTab(`${btn.dataset.tab}-tab`);
            }
        });
        // Custom title bar buttons
        document.getElementById('custom-title-bar-buttons')?.addEventListener('click', (e) => {
            const btn = e.target.closest('.title-bar-button');
            if (!btn) return;
            if (btn.id === 'minimize-button') window.electronAPI.minimizeWindow();
            if (btn.id === 'maximize-button') window.electronAPI.maximizeWindow();
            if (btn.id === 'close-button') window.electronAPI.closeWindow();
        });
        // Dashboard quick actions
        document.getElementById('content')?.addEventListener('click', (e) => {
            const card = e.target.closest('.dashboard-card');
            if (card) {
                const onclick = card.getAttribute('onclick');
                if (onclick && onclick.includes('activateTab')) {
                    const tabId = onclick.match(/activateTab\(['"](.*)['"]\)/);
                    if (tabId && tabId[1]) activateTab(tabId[1]);
                }
            }
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
            checkForUpdatesAndShowModal();
        });

        // mods tab listeners (using event delegation)
        // --- Live update for available mods list in install mods modal ---
async function renderAvailableModsListOnly() {
    const lang = currentSettings.language.toLowerCase();
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
}
let modsModalInterval = null;
async function renderAvailableModsModal() {
    const lang = currentSettings.language.toLowerCase();
    if (!currentSettings.modFolderPath || !currentSettings.pakFolderPath) {
        showMessageModal(translations[lang]['error-title'], translations[lang]['pak-folder-not-set']);
        return;
    }
    await renderAvailableModsListOnly();
    const modal = document.getElementById('mod-selection-modal');
    modal?.classList.remove('hidden');
    if (modsModalInterval) clearInterval(modsModalInterval);
    modsModalInterval = setInterval(() => {
        if (modal && !modal.classList.contains('hidden')) {
            renderAvailableModsListOnly();
        } else {
            clearInterval(modsModalInterval);
        }
    }, 1000);
}
document.getElementById('install-mods-button')?.addEventListener('click', renderAvailableModsModal);
if (window.electronAPI && window.electronAPI.onModsFolderChanged) {
    window.electronAPI.onModsFolderChanged(() => {
        const modal = document.getElementById('mod-selection-modal');
        if (modal && !modal.classList.contains('hidden')) {
            renderAvailableModsListOnly();
        }
    });
}
const modSelectionModal = document.getElementById('mod-selection-modal');
if (modSelectionModal) {
    modSelectionModal.addEventListener('click', (e) => {
        if (e.target === modSelectionModal) {
            modSelectionModal.classList.add('hidden');
            if (modsModalInterval) clearInterval(modsModalInterval);
        }
    });
}

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
                const name = button.dataset.modName;
                button.textContent = 'uninstalling...';
                button.disabled = true;
                const result = await window.electronAPI.uninstallMod(name);
                if (result.success) {
                    await renderInstalledMods();
                } else {
                    showMessageModal('Error', `failed to uninstall: ${result.error}`);
                    button.textContent = 'uninstall';
                    button.disabled = false;
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

        // --- console tab: export log and clear log ---
        document.getElementById('clear-log-button')?.addEventListener('click', () => {
            if (consoleOutput) consoleOutput.innerHTML = '';
        });
        document.getElementById('export-log-button')?.addEventListener('click', async () => {
            if (!consoleOutput) return;
            const logText = Array.from(consoleOutput.children).map(e => e.textContent).join('\n');
            const filePath = await window.electronAPI.openFileDialog([{ name: 'Text Files', extensions: ['txt'] }]);
            if (filePath && filePath.length > 0) {
                await window.electronAPI.saveTextFile(filePath[0], logText);
                showMessageModal('Export Log', 'Log exported successfully.');
            }
        });

        // --- drag and drop for mods tab (make whole tab a drop zone) ---
        const modsTab = document.getElementById('mods-tab');
        if (modsTab) {
            modsTab.addEventListener('dragover', (event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = 'copy';
                modsTab.classList.add('ring-4', 'ring-accent-color');
            });
            modsTab.addEventListener('dragleave', () => {
                modsTab.classList.remove('ring-4', 'ring-accent-color');
            });
            modsTab.addEventListener('drop', async (event) => {
                event.preventDefault();
                modsTab.classList.remove('ring-4', 'ring-accent-color');
                const files = Array.from(event.dataTransfer.files);
                const mmpackageFiles = files.filter(f => f.name.endsWith('.mmpackage'));
                if (mmpackageFiles.length === 0) {
                    showMessageModal('Error', 'Please drop a .mmpackage file.');
                    return;
                }
                for (const file of mmpackageFiles) {
                    // Use the installMod API if available
                    const result = await window.electronAPI.installMod(file.name, file.path);
                    if (result.success) {
                        log(`Installed mod: ${file.name}`, 'success');
                    } else {
                        log(`Failed to install mod: ${file.name} - ${result.error}`, 'error');
                        showMessageModal('Error', `Failed to install ${file.name}: ${result.error}`);
                    }
                }
                await renderInstalledMods();
            });
        }

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
