import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useStore } from '@/stores/appStore';
import {
  Home, Star, FolderOpen, Sun, Moon, Pencil,
  LayoutGrid, List, Globe,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FolderManager } from '@/components/folder/FolderManager';
import { CategoryManager } from '@/components/category/CategoryManager';
import { cn } from '@/lib/utils';

const LANGS = [
  { code: 'en', label: 'English' },
  { code: 'pt', label: 'Português' },
  { code: 'es', label: 'Español' },
];

export function Sidebar() {
  const { t, i18n } = useTranslation();
  const {
    folders, categories, currentView, settings,
    selectedCategoryId, selectedFolderId,
    setCurrentView, setSelectedFolder, setSelectedCategory, toggleTheme,
    setViewMode, prompts,
  } = useStore();

  const [showFolderManager, setShowFolderManager] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  const folderPromptCount = (folderId: string) =>
    prompts.filter((p) => p.folderId === folderId).length;
  const categoryPromptCount = (categoryId: string) =>
    prompts.filter((p) => p.categoryIds.includes(categoryId)).length;
  const noFolderCount = prompts.filter((p) => p.folderId === null).length;

  const navItems = [
    { id: 'home' as const, icon: Home, label: t('nav.allPrompts'), count: prompts.length },
    { id: 'favorites' as const, icon: Star, label: t('nav.favorites'), count: prompts.filter((p) => p.isFavorite).length },
  ];

  return (
    <aside className="w-64 h-screen bg-card border-r border-border flex flex-col select-none">
      <div className="p-4 flex items-center gap-2">
        <img
          src="./icon.png"
          alt="PromptVault"
          className="w-8 h-8 rounded-lg object-contain"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        <h1 className="text-lg font-semibold">{t('app.name')}</h1>
      </div>

      <nav className="flex-1 px-2 space-y-1 overflow-auto scrollbar-thin">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setCurrentView(item.id);
              useStore.setState({ selectedFolderId: null, selectedCategoryId: null });
            }}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer',
              currentView === item.id && selectedFolderId === null && selectedCategoryId === null
                ? 'bg-accent text-accent-foreground font-medium'
                : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground'
            )}
          >
            <item.icon className="w-4 h-4 shrink-0" />
            <span className="flex-1 text-left truncate">{item.label}</span>
            <span className="text-xs text-muted-foreground w-5 text-right tabular-nums shrink-0">{item.count}</span>
          </button>
        ))}

        {/* ─── Pastas ─── */}
        <div className="pt-4">
          <div className="flex items-center justify-between px-3 mb-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {t('sidebar.folders')}
            </span>
            <button
              onClick={() => setShowFolderManager(true)}
              className="p-0.5 hover:bg-accent rounded cursor-pointer"
              title={t('sidebar.manageFolders')}
            >
              <Pencil className="w-3 h-3 text-muted-foreground hover:text-foreground" />
            </button>
          </div>

          {folders.map((folder) => (
            <div key={folder.id} className="group relative">
              <button
                onClick={() => setSelectedFolder(folder.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer',
                  currentView === 'folder' && selectedFolderId === folder.id
                    ? 'bg-accent text-accent-foreground font-medium'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground'
                )}
              >
                <FolderOpen className="w-4 h-4 shrink-0" />
                <span className="flex-1 text-left truncate">{folder.name}</span>
                <span className="text-xs text-muted-foreground w-5 text-right tabular-nums shrink-0">
                  {folderPromptCount(folder.id)}
                </span>
              </button>
            </div>
          ))}

          {/* Prompts sem pasta */}
          {noFolderCount > 0 && (
            <button
              onClick={() => useStore.setState({ selectedFolderId: 'none', currentView: 'folder', selectedCategoryId: null })}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer',
                currentView === 'folder' && selectedFolderId === 'none'
                  ? 'bg-accent text-accent-foreground font-medium'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground'
              )}
            >
              <FolderOpen className="w-4 h-4 shrink-0 opacity-50" />
              <span className="flex-1 text-left truncate">{t('sidebar.noFolder')}</span>
              <span className="text-xs text-muted-foreground w-5 text-right tabular-nums shrink-0">{noFolderCount}</span>
            </button>
          )}

          {folders.length === 0 && noFolderCount === 0 && (
            <p className="text-xs text-muted-foreground/50 px-3 py-2">
              {t('sidebar.noFoldersYet')}
            </p>
          )}
        </div>

        {/* ─── Categorias ─── */}
        <div className="pt-4">
          <div className="flex items-center justify-between px-3 mb-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {t('sidebar.categories')}
            </span>
            <button
              onClick={() => setShowCategoryManager(true)}
              className="p-0.5 hover:bg-accent rounded cursor-pointer"
              title={t('categories.manageCategories')}
            >
              <Pencil className="w-3 h-3 text-muted-foreground hover:text-foreground" />
            </button>
          </div>

          {categories.map((cat) => (
            <div key={cat.id}>
              <button
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all cursor-pointer border',
                  currentView === 'category' && selectedCategoryId === cat.id
                    ? 'font-medium'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground border-transparent'
                )}
                style={
                  currentView === 'category' && selectedCategoryId === cat.id
                    ? {
                        backgroundColor: `${cat.color}20`,
                        color: cat.color,
                        borderColor: `${cat.color}60`,
                      }
                    : undefined
                }
              >
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="flex-1 text-left truncate">{cat.name}</span>
                <span className="text-xs text-muted-foreground w-5 text-right tabular-nums shrink-0">
                  {categoryPromptCount(cat.id)}
                </span>
              </button>
            </div>
          ))}
        </div>
      </nav>

      <div className="p-3 border-t border-border space-y-2">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setViewMode('grid')}
            className={cn(settings.viewMode === 'grid' && 'bg-accent')}
          >
            <LayoutGrid className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setViewMode('list')}
            className={cn(settings.viewMode === 'list' && 'bg-accent')}
          >
            <List className="w-4 h-4" />
          </Button>
          <div className="relative ml-auto">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowLangMenu(!showLangMenu)}
              title="Language"
            >
              <Globe className="w-4 h-4" />
            </Button>
            {showLangMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowLangMenu(false)} />
                <div
                  style={{
                    position: 'absolute',
                    bottom: '100%',
                    right: 0,
                    marginBottom: 4,
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    zIndex: 50,
                  }}
                  className="rounded-md shadow-lg py-1 min-w-[120px]"
                >
                  {LANGS.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        i18n.changeLanguage(lang.code);
                        setShowLangMenu(false);
                      }}
                      className={cn(
                        'w-full text-left px-3 py-1.5 text-sm hover:bg-accent transition-colors cursor-pointer',
                        i18n.language.startsWith(lang.code) ? 'text-foreground font-medium' : 'text-muted-foreground'
                      )}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {settings.theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {showFolderManager && createPortal(
        <FolderManager onClose={() => setShowFolderManager(false)} />,
        document.body
      )}
      {showCategoryManager && createPortal(
        <CategoryManager onClose={() => setShowCategoryManager(false)} />,
        document.body
      )}
    </aside>
  );
}
