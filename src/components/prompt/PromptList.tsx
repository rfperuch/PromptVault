import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '@/stores/appStore';
import { PromptCard } from './PromptCard';
import { FileText } from 'lucide-react';

export function PromptList() {
  const { t } = useTranslation();
  const {
    prompts, folders, currentView, selectedFolderId,
    selectedCategoryId, searchQuery, settings,
  } = useStore();

  const filteredPrompts = useMemo(() => {
    let result = prompts;

    if (currentView === 'favorites') {
      result = result.filter((p) => p.isFavorite);
    }

    if (currentView === 'folder' && selectedFolderId) {
      if (selectedFolderId === 'none') {
        result = result.filter((p) => p.folderId === null);
      } else {
        result = result.filter((p) => p.folderId === selectedFolderId);
      }
    }

    if (currentView === 'category' && selectedCategoryId) {
      result = result.filter((p) => p.categoryIds.includes(selectedCategoryId));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.content.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    return result;
  }, [prompts, currentView, selectedFolderId, selectedCategoryId, searchQuery]);

  const title = useMemo(() => {
    if (searchQuery) return t('prompts.resultsFor', { query: searchQuery });
    if (currentView === 'favorites') return t('nav.favorites');
    if (currentView === 'folder' && selectedFolderId) {
      if (selectedFolderId === 'none') return t('sidebar.noFolder');
      const folder = folders.find((f) => f.id === selectedFolderId);
      return folder?.name || t('sidebar.folders');
    }
    if (currentView === 'category' && selectedCategoryId) {
      const cat = useStore.getState().categories.find((c) => c.id === selectedCategoryId);
      return cat?.name || t('sidebar.categories');
    }
    return t('nav.allPrompts');
  }, [currentView, selectedFolderId, selectedCategoryId, searchQuery, folders, t]);

  if (filteredPrompts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <FileText className="w-12 h-12 text-muted-foreground/30 mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground">
          {searchQuery ? t('prompts.noResults') : t('prompts.noPromptsYet')}
        </h3>
        <p className="text-sm text-muted-foreground/60 mt-1">
          {searchQuery ? t('prompts.noResultsHint') : t('prompts.noPromptsHint')}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        <span className="text-sm text-muted-foreground">
          {filteredPrompts.length} {filteredPrompts.length === 1 ? t('prompts.promptCount', { count: 1 }).replace('1 ', '') : t('prompts.promptCount_plural', { count: filteredPrompts.length }).replace(/\d+ /, '')}
        </span>
      </div>

      <div
        className={
          settings.viewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
            : 'space-y-2'
        }
      >
        {filteredPrompts.map((prompt) => (
          <PromptCard key={prompt.id} prompt={prompt} mode={settings.viewMode} />
        ))}
      </div>
    </div>
  );
}
