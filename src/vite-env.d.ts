/// <reference types="vite/client" />

interface Window {
  api: {
    store: {
      read: () => Promise<import('./types').AppData>;
      write: (data: import('./types').AppData) => Promise<boolean>;
    };
    folder: {
      read: (folderId: string) => Promise<import('./types').FolderData>;
      write: (folderId: string, data: import('./types').FolderData) => Promise<boolean>;
      create: (folderId: string) => Promise<boolean>;
      delete: (folderId: string) => Promise<boolean>;
    };
    dialog: {
      export: (data: import('./types').AppData) => Promise<boolean>;
      import: () => Promise<import('./types').AppData | null>;
    };
  };
}
