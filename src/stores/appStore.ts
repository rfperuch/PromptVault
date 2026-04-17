import { create } from 'zustand';
import { v4 as uuid } from 'uuid';
import { Prompt, Folder, Category, AppSettings, ViewMode } from '../types';
import {
  loadData, saveData, loadFolder, saveFolder,
  createFolderFile, deleteFolderFile,
} from '../lib/api';

interface Store {
  folders: Folder[];
  prompts: Prompt[];
  categories: Category[];
  settings: AppSettings;
  currentView: ViewMode;
  selectedPromptId: string | null;
  selectedFolderId: string | null;
  selectedCategoryId: string | null;
  searchQuery: string;
  loaded: boolean;

  init: () => Promise<void>;
  persist: () => Promise<void>;

  setCurrentView: (view: ViewMode) => void;
  setSelectedPrompt: (id: string | null) => void;
  setSelectedFolder: (id: string | null) => void;
  setSelectedCategory: (id: string | null) => void;
  setSearchQuery: (query: string) => void;

  addPrompt: (prompt: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Prompt>;
  updatePrompt: (id: string, updates: Partial<Prompt>) => Promise<void>;
  deletePrompt: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => void;
  movePromptToFolder: (promptId: string, folderId: string | null) => Promise<void>;

  addFolder: (name: string, color: string) => Promise<Folder>;
  deleteFolder: (id: string) => Promise<void>;
  renameFolder: (id: string, name: string) => void;

  addCategory: (name: string, color: string) => Category;
  deleteCategory: (id: string) => void;
  renameCategory: (id: string, name: string) => void;
  updateCategoryColor: (id: string, color: string) => void;

  toggleTheme: () => void;
  setViewMode: (mode: 'grid' | 'list') => void;
}

export const useStore = create<Store>((set, get) => ({
  folders: [],
  prompts: [],
  categories: [],
  settings: { theme: 'dark', viewMode: 'grid' },
  currentView: 'home',
  selectedPromptId: null,
  selectedFolderId: null,
  selectedCategoryId: null,
  searchQuery: '',
  loaded: false,

  init: async () => {
    const data = await loadData();
    set({
      folders: data.folders || [],
      prompts: data.prompts || [],
      categories: data.categories || [],
      settings: data.settings || { theme: 'dark', viewMode: 'grid' },
      loaded: true,
    });
    if ((data.settings?.theme || 'dark') === 'dark') {
      document.documentElement.classList.add('dark');
    }
  },

  persist: async () => {
    const { folders, prompts, categories, settings } = get();
    await saveData({ folders, prompts, categories, settings });
  },

  setCurrentView: (view) => set({ currentView: view }),
  setSelectedPrompt: (id) => set({ selectedPromptId: id }),
  setSelectedFolder: (id) => set({ selectedFolderId: id, currentView: 'folder' }),
  setSelectedCategory: (id) => set({ selectedCategoryId: id, currentView: 'category' }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  // ─── Prompts ───

  addPrompt: async (data) => {
    const prompt: Prompt = {
      ...data,
      id: uuid(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Update index
    set((s) => ({ prompts: [prompt, ...s.prompts] }));
    await get().persist();

    // Save to folder file if prompt is in a folder
    if (prompt.folderId) {
      const folderData = await loadFolder(prompt.folderId);
      folderData.prompts.push(prompt);
      await saveFolder(prompt.folderId, folderData);
    }

    return prompt;
  },

  updatePrompt: async (id, updates) => {
    const state = get();
    const oldPrompt = state.prompts.find((p) => p.id === id);
    if (!oldPrompt) return;

    const updatedPrompt: Prompt = {
      ...oldPrompt,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    const folderChanged = updates.folderId !== undefined && oldPrompt.folderId !== updates.folderId;

    // Update index
    set((s) => ({
      prompts: s.prompts.map((p) => (p.id === id ? updatedPrompt : p)),
    }));
    await get().persist();

    if (folderChanged) {
      // Remove from old folder file
      if (oldPrompt.folderId) {
        const oldData = await loadFolder(oldPrompt.folderId);
        oldData.prompts = oldData.prompts.filter((p) => p.id !== id);
        await saveFolder(oldPrompt.folderId, oldData);
      }
      // Add to new folder file
      if (updatedPrompt.folderId) {
        const newData = await loadFolder(updatedPrompt.folderId);
        newData.prompts.push(updatedPrompt);
        await saveFolder(updatedPrompt.folderId, newData);
      }
    } else if (oldPrompt.folderId) {
      // Same folder — update the prompt in place
      const folderData = await loadFolder(oldPrompt.folderId);
      folderData.prompts = folderData.prompts.map((p) => (p.id === id ? updatedPrompt : p));
      await saveFolder(oldPrompt.folderId, folderData);
    }
  },

  deletePrompt: async (id) => {
    const prompt = get().prompts.find((p) => p.id === id);

    // Update index
    set((s) => ({ prompts: s.prompts.filter((p) => p.id !== id) }));
    await get().persist();

    // Remove from folder file
    if (prompt?.folderId) {
      const folderData = await loadFolder(prompt.folderId);
      folderData.prompts = folderData.prompts.filter((p) => p.id !== id);
      await saveFolder(prompt.folderId, folderData);
    }
  },

  toggleFavorite: async (id) => {
    const prompt = get().prompts.find((p) => p.id === id);
    if (!prompt) return;

    const newFav = !prompt.isFavorite;

    set((s) => ({
      prompts: s.prompts.map((p) =>
        p.id === id ? { ...p, isFavorite: newFav } : p
      ),
    }));
    await get().persist();

    // Update folder file
    if (prompt.folderId) {
      const folderData = await loadFolder(prompt.folderId);
      folderData.prompts = folderData.prompts.map((p) =>
        p.id === id ? { ...p, isFavorite: newFav } : p
      );
      await saveFolder(prompt.folderId, folderData);
    }
  },

  movePromptToFolder: async (promptId, newFolderId) => {
    const prompt = get().prompts.find((p) => p.id === promptId);
    if (!prompt) return;

    const oldFolderId = prompt.folderId;

    // Remove from old folder
    if (oldFolderId) {
      const oldData = await loadFolder(oldFolderId);
      oldData.prompts = oldData.prompts.filter((p) => p.id !== promptId);
      await saveFolder(oldFolderId, oldData);
    }

    // Add to new folder
    if (newFolderId) {
      const newData = await loadFolder(newFolderId);
      const movedPrompt = { ...prompt, folderId: newFolderId };
      newData.prompts.push(movedPrompt);
      await saveFolder(newFolderId, newData);
    }

    // Update index
    set((s) => ({
      prompts: s.prompts.map((p) =>
        p.id === promptId ? { ...p, folderId: newFolderId } : p
      ),
    }));
    await get().persist();
  },

  // ─── Folders ───

  addFolder: async (name, color = '#6366f1') => {
    const folder: Folder = {
      id: uuid(),
      name,
      color,
      createdAt: new Date().toISOString(),
    };

    set((s) => ({ folders: [...s.folders, folder] }));
    await get().persist();
    await createFolderFile(folder.id);

    return folder;
  },

  deleteFolder: async (id) => {
    // Move all prompts in this folder to "no folder"
    set((s) => ({
      prompts: s.prompts.map((p) =>
        p.folderId === id ? { ...p, folderId: null } : p
      ),
      folders: s.folders.filter((f) => f.id !== id),
    }));
    await get().persist();
    await deleteFolderFile(id);
  },

  renameFolder: (id, name) => {
    set((s) => ({
      folders: s.folders.map((f) =>
        f.id === id ? { ...f, name } : f
      ),
    }));
    get().persist();
  },

  // ─── Categories ───

  addCategory: (name, color) => {
    const category: Category = {
      id: uuid(),
      name,
      color,
      createdAt: new Date().toISOString(),
    };
    set((s) => ({ categories: [...s.categories, category] }));
    get().persist();
    return category;
  },

  deleteCategory: (id) => {
    set((s) => ({
      categories: s.categories.filter((c) => c.id !== id),
      prompts: s.prompts.map((p) => ({
        ...p,
        categoryIds: p.categoryIds.filter((cid) => cid !== id),
      })),
    }));
    get().persist();
  },

  renameCategory: (id, name) => {
    set((s) => ({
      categories: s.categories.map((c) => (c.id === id ? { ...c, name } : c)),
    }));
    get().persist();
  },

  updateCategoryColor: (id, color) => {
    set((s) => ({
      categories: s.categories.map((c) => (c.id === id ? { ...c, color } : c)),
    }));
    get().persist();
  },

  // ─── Settings ───

  toggleTheme: () => {
    const newTheme = get().settings.theme === 'dark' ? 'light' : 'dark';
    set((s) => ({ settings: { ...s.settings, theme: newTheme } }));
    document.documentElement.classList.toggle('dark');
    get().persist();
  },

  setViewMode: (mode) => {
    set((s) => ({ settings: { ...s.settings, viewMode: mode } }));
    get().persist();
  },
}));
