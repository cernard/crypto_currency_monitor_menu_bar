/* eslint global-require: off, no-console: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build:main`, this file is compiled to
 * `./src/main.prod.js` using webpack. This gives us some performance wins.
 */

import 'core-js/stable';
import 'regenerator-runtime/runtime';
import path from 'path';
import { app, BrowserWindow, shell, nativeImage, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MonitorCurrencyDTO from './entities/MonitorCurrencyDTO';
import { DataType } from './components/MonitorSetting/Editable';

const { menubar } = require('menubar');

const RESOURCES_PATH = app.isPackaged
  ? path.join(process.resourcesPath, 'assets')
  : path.join(__dirname, '../assets');

const getAssetPath = (...paths: string[]): string => {
  return path.join(RESOURCES_PATH, ...paths);
};
export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let ccxthread: BrowserWindow | null = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true'
) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions();
  }

  ccxthread = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      nodeIntegration: true,
    },
  });

  ccxthread.loadURL(`file://${__dirname}/components/CCXThread/index.html`);

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  ccxthread.webContents.on('did-finish-load', () => {
    if (!ccxthread) {
      throw new Error('"ccxthread" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      ccxthread.minimize();
    } else {
      ccxthread.show();
      ccxthread.focus();
    }
  });

  ccxthread.on('closed', () => {
    ccxthread = null;
  });

  // Open urls in the user's browser
  ccxthread.webContents.on('new-window', (event, url) => {
    event.preventDefault();
    shell.openExternal(url);
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (ccxthread === null) createWindow();
});

global.mb = null;

// MyCode
const createTray = () => {
  global.mb = menubar({
    index: `file://${__dirname}/index.html`,
    browserWindow: {
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        enableRemoteModule: true,
      },
      alwaysOnTop: true,
      width: 370,
    },
    icon: nativeImage
      .createFromPath(getAssetPath('icon.png'))
      .resize({ width: 24, height: 24 }),
  });
  global.mb.on('after-create-window', () => {
    global.mb.window.openDevTools();
    global.mb.window.show();
  });
};

app
  .whenReady()
  .then(() => {
    createWindow();
    createTray();
    return null;
  })
  .catch(console.log);

// 监听来自配置的消息，并将配置消息转发给CCXThread窗口
ipcMain.on('notifyFromConfig', (e, param: DataType[]) => {
  log.info('notifyFromConfig: ', param);
  ccxthread?.webContents.send('notifyFromMain', param);
});

// 监听来自CCXThread的价格信息，并将价格信息转发给监控器
ipcMain.on('notifyFromCCXThread', (e, param: MonitorCurrencyDTO[]) => {
  log.info('notifyFromCCXThread: ', param);
  global.mb.window.webContents.send('notifyFromMain', param);
});
