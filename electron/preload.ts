import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  store: {
    read: () => ipcRenderer.invoke('store:read'),
    write: (data: unknown) => ipcRenderer.invoke('store:write', data),
  },
  folder: {
    read: (folderId: string) => ipcRenderer.invoke('folder:read', folderId),
    write: (folderId: string, data: unknown) => ipcRenderer.invoke('folder:write', folderId, data),
    create: (folderId: string) => ipcRenderer.invoke('folder:create', folderId),
    delete: (folderId: string) => ipcRenderer.invoke('folder:delete', folderId),
  },
  dialog: {
    export: (data: unknown) => ipcRenderer.invoke('dialog:export', data),
    import: () => ipcRenderer.invoke('dialog:import'),
  },
});
