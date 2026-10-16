const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const https = require('https');

// ⚙️ ВКАЖИТЕ ВАШИ ДАННЫЕ С GITHUB:
const GITHUB_USERNAME = alex46region;
const GITHUB_REPO = code-generator-desktop;
const BRANCH = 'main'; // или master

// Ссылка на сырой файл в репозитории
const REMOTE_INDEX_URL = `https://raw.githubusercontent.com/${GITHUB_USERNAME}/${GITHUB_REPO}/${BRANCH}/src/index.html`;

let mainWindow;

function getLocalCachedIndexPath() {
  const userDataPath = app.getPath('userData');
  return path.join(userDataPath, 'cached_index.html');
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 920,
    height: 960,
    minWidth: 640,
    minHeight: 700,
    title: 'CODE GENERATOR // Terminal Suite',
    backgroundColor: '#0a0d14',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      sandbox: false
    }
  });

  mainWindow.setMenuBarVisibility(false);

  // Разрешаем дочерние окна для печати PDF и термоэтикеток
  mainWindow.webContents.setWindowOpenHandler(() => {
    return {
      action: 'allow',
      overrideBrowserWindowOptions: {
        autoHideMenuBar: true,
        backgroundColor: '#ffffff'
      }
    };
  });

  // Определяем, откуда запускать интерфейс
  const cachedFile = getLocalCachedIndexPath();
  const bundledFile = path.join(__dirname, 'src', 'index.html');

  // Если есть ранее скачанная свежая версия — открываем её, иначе встроенную
  if (fs.existsSync(cachedFile)) {
    mainWindow.loadFile(cachedFile);
  } else {
    mainWindow.loadFile(bundledFile);
  }

  // Проверяем наличие обновлений на GitHub сразу после запуска
  mainWindow.webContents.once('did-finish-load', () => {
    checkForUpdates();
  });
}

// Загрузка файла по HTTPS
function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Electron-AutoUpdater' } }, (res) => {
      if (res.statusCode !== 200) {
        return reject(new Error(`GitHub вернул статус: ${res.statusCode}`));
      }
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', (err) => reject(err));
  });
}

// Проверка обновлений
async function checkForUpdates() {
  try {
    const remoteContent = await fetchUrl(REMOTE_INDEX_URL);
    const cachedPath = getLocalCachedIndexPath();

    let currentContent = '';
    if (fs.existsSync(cachedPath)) {
      currentContent = fs.readFileSync(cachedPath, 'utf8');
    } else {
      currentContent = fs.readFileSync(path.join(__dirname, 'src', 'index.html'), 'utf8');
    }

    // Сравниваем контент на GitHub с текущим
    if (remoteContent && remoteContent.trim() !== currentContent.trim()) {
      // Сохраняем новую версию локально
      fs.writeFileSync(cachedPath, remoteContent, 'utf8');

      // Отправляем сигнал в интерфейс, что скачана новая версия
      if (mainWindow && mainWindow.webContents) {
        mainWindow.webContents.executeJavaScript(`
          if (typeof showNotification === 'function') {
            showNotification('Обнаружено и установлено обновление! Перезапуск интерфейса...');
          }
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        `);
      }
    }
  } catch (err) {
    console.log('Проверка обновлений пропущена (нет связи с GitHub или оффлайн-режим):', err.message);
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
