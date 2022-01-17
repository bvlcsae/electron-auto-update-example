const { app, BrowserWindow, ipcMain } = require('electron');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log')

console.log = log.log
log.transports.file.level = 'info';
autoUpdater.logger = log;

let mainWindow;

autoUpdater.setFeedURL('http://113.200.234.211:5050/update/windows_64/')
autoUpdater.on('checing-for')

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });
    mainWindow.loadFile('index.html');
    mainWindow.on('closed', function () {
        mainWindow = null;
    });
    autoUpdater.on('update-available', () => {
        mainWindow.webContents.send('update_available');
    });
    autoUpdater.on('update-downloaded', () => {
        mainWindow.webContents.send('update_downloaded');
    });
    mainWindow.once('ready-to-show', () => {
        autoUpdater.checkForUpdatesAndNotify();
    });
}

app.on('ready', () => {
    createWindow();
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow();
    }
});

ipcMain.on('app_version', (event) => {
    event.sender.send('app_version', { version: app.getVersion() });
});

ipcMain.on('restart_app', () => {
    autoUpdater.quitAndInstall();
});
