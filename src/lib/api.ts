import { AppData, FolderData, Prompt } from '../types';

const isElectron = typeof window !== 'undefined' && window.api;

// ─── Main Store ───

export async function loadData(): Promise<AppData> {
  if (isElectron) {
    return await window.api.store.read();
  }
  const stored = localStorage.getItem('promptvault-data');
  if (stored) return JSON.parse(stored);
  return {
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
}

export async function saveData(data: AppData): Promise<boolean> {
  if (isElectron) {
    return await window.api.store.write(data);
  }
  localStorage.setItem('promptvault-data', JSON.stringify(data));
  return true;
}

// ─── Folders ───

export async function loadFolder(folderId: string): Promise<FolderData> {
  if (isElectron) {
    return await window.api.folder.read(folderId);
  }
  const stored = localStorage.getItem(`promptvault-folder-${folderId}`);
  if (stored) return JSON.parse(stored);
  return { folderId, prompts: [] };
}

export async function saveFolder(folderId: string, data: FolderData): Promise<boolean> {
  if (isElectron) {
    return await window.api.folder.write(folderId, data);
  }
  localStorage.setItem(`promptvault-folder-${folderId}`, JSON.stringify(data));
  return true;
}

export async function createFolderFile(folderId: string): Promise<boolean> {
  if (isElectron) {
    return await window.api.folder.create(folderId);
  }
  localStorage.setItem(
    `promptvault-folder-${folderId}`,
    JSON.stringify({ folderId, prompts: [] })
  );
  return true;
}

export async function deleteFolderFile(folderId: string): Promise<boolean> {
  if (isElectron) {
    return await window.api.folder.delete(folderId);
  }
  localStorage.removeItem(`promptvault-folder-${folderId}`);
  return true;
}

// ─── Export / Import ───

export async function exportData(data: AppData): Promise<boolean> {
  if (isElectron) {
    return await window.api.dialog.export(data);
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'promptvault-backup.json';
  a.click();
  URL.revokeObjectURL(url);
  return true;
}

export async function importData(): Promise<AppData | null> {
  if (isElectron) {
    return await window.api.dialog.import();
  }
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) { resolve(null); return; }
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          resolve(JSON.parse(ev.target?.result as string));
        } catch {
          resolve(null);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  });
}
