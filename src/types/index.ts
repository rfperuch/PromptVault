export interface Folder {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface Prompt {
  id: string;
  title: string;
  content: string;
  description: string;
  folderId: string | null;
  categoryIds: string[];
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface AppData {
  folders: Folder[];
  prompts: Prompt[];
  categories: Category[];
  settings: AppSettings;
}

export interface FolderData {
  folderId: string;
  prompts: Prompt[];
}

export interface AppSettings {
  theme: 'light' | 'dark';
  viewMode: 'grid' | 'list';
}

export type ViewMode = 'home' | 'favorites' | 'folder' | 'category' | 'editor' | 'detail';
