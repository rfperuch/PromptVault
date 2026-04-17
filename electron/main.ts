import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import {
  readFileSync, writeFileSync, existsSync, mkdirSync,
  unlinkSync,
} from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const isDev = !app.isPackaged;

function getUserDataPath() {
  const p = app.getPath('userData');
  if (!existsSync(p)) mkdirSync(p, { recursive: true });
  return p;
}

function getStorePath() {
  return join(getUserDataPath(), 'promptvault-data.json');
}

function getFoldersDir() {
  const dir = join(getUserDataPath(), 'folders');
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  return dir;
}

function getFolderFilePath(folderId: string) {
  return join(getFoldersDir(), `${folderId}.json`);
}

function readStore() {
  const defaultData = {
    folders: [],
    prompts: [],
    categories: [
      { id: 'cat-1', name: 'Código', color: '#3b82f6', createdAt: new Date().toISOString() },
      { id: 'cat-2', name: 'Escrita', color: '#22c55e', createdAt: new Date().toISOString() },
      { id: 'cat-3', name: 'Imagem', color: '#a855f7', createdAt: new Date().toISOString() },
      { id: 'cat-4', name: 'Análise', color: '#f97316', createdAt: new Date().toISOString() },
    ],
    settings: { theme: 'dark', viewMode: 'grid' },
  };

  const storePath = getStorePath();
  if (!existsSync(storePath)) {
    writeFileSync(storePath, JSON.stringify(defaultData, null, 2));
    return defaultData;
  }
  try {
    return JSON.parse(readFileSync(storePath, 'utf-8'));
  } catch {
    return defaultData;
  }
}

function writeStore(data: unknown) {
  writeFileSync(getStorePath(), JSON.stringify(data, null, 2));
}

function readFolderFile(folderId: string) {
  const fp = getFolderFilePath(folderId);
  if (!existsSync(fp)) return { folderId, prompts: [] };
  return JSON.parse(readFileSync(fp, 'utf-8'));
}

function writeFolderFile(folderId: string, data: unknown) {
  writeFileSync(getFolderFilePath(folderId), JSON.stringify(data, null, 2));
}

function deleteFolderFile(folderId: string) {
  const fp = getFolderFilePath(folderId);
  if (existsSync(fp)) unlinkSync(fp);
}

function getIconPath() {
  if (process.platform === 'win32') {
    return isDev
      ? join(__dirname, '..', 'icon.ico')
      : join(process.resourcesPath, 'icon.ico');
  }
  if (process.platform === 'darwin') {
    return isDev
      ? join(__dirname, '..', 'icon.icns')
      : join(process.resourcesPath, 'icon.icns');
  }
  // Linux
  return isDev
    ? join(__dirname, '..', 'public', 'icon.png')
    : join(process.resourcesPath, 'icon.png');
}

function createWindow() {
  const iconPath = getIconPath();

  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: 'PromptVault',
    icon: iconPath,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    titleBarStyle: 'default',
    backgroundColor: '#09090b',
  });

  win.removeMenu();

  if (isDev) {
    win.loadURL('http://localhost:5173');
  } else {
    win.loadFile(join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  app.setName('PromptVault');

  // Main store IPCs
  ipcMain.handle('store:read', () => readStore());
  ipcMain.handle('store:write', (_event, data) => {
    writeStore(data);
    return true;
  });

  // Folder IPCs
  ipcMain.handle('folder:read', (_event, folderId: string) => {
    return readFolderFile(folderId);
  });
  ipcMain.handle('folder:write', (_event, folderId: string, data: unknown) => {
    writeFolderFile(folderId, data);
    return true;
  });
  ipcMain.handle('folder:create', (_event, folderId: string) => {
    writeFolderFile(folderId, { folderId, prompts: [] });
    return true;
  });
  ipcMain.handle('folder:delete', (_event, folderId: string) => {
    deleteFolderFile(folderId);
    return true;
  });

  // Dialog IPCs
  ipcMain.handle('dialog:export', async (_event, data) => {
    const result = await dialog.showSaveDialog({
      defaultPath: 'promptvault-backup.json',
      filters: [{ name: 'JSON', extensions: ['json'] }],
    });
    if (!result.canceled && result.filePath) {
      writeFileSync(result.filePath, JSON.stringify(data, null, 2));
      return true;
    }
    return false;
  });
  ipcMain.handle('dialog:import', async () => {
    const result = await dialog.showOpenDialog({
      filters: [{ name: 'JSON', extensions: ['json'] }],
      properties: ['openFile'],
    });
    if (!result.canceled && result.filePaths[0]) {
      try {
        return JSON.parse(readFileSync(result.filePaths[0], 'utf-8'));
      } catch {
        return null;
      }
    }
    return null;
  });

  createWindow();

});

app.on('window-all-closed', () => {
  app.quit();
});
