import { useTranslation } from 'react-i18next';
import { useStore } from '@/stores/appStore';
import { SearchBar } from '@/components/search/SearchBar';
import { Button } from '@/components/ui/Button';
import { Plus, Download, Upload } from 'lucide-react';
import { exportData, importData, saveData } from '@/lib/api';

export function Header() {
  const { t } = useTranslation();
  const { prompts, categories, settings, setCurrentView, init } = useStore();

  const handleExport = async () => {
    await exportData({ folders: useStore.getState().folders, prompts, categories, settings });
  };

  const handleImport = async () => {
    const data = await importData();
    if (data) {
      await saveData(data);
      await init();
    }
  };

  return (
    <header className="h-14 border-b border-border flex items-center gap-4 px-6 app-drag">
      <div className="flex-1 app-no-drag">
        <SearchBar />
      </div>
      <div className="flex items-center gap-2 app-no-drag">
        <Button variant="ghost" size="sm" onClick={handleExport} title={t('header.export')}>
          <Download className="w-4 h-4 mr-1" />
          {t('header.export')}
        </Button>
        <Button variant="ghost" size="sm" onClick={handleImport} title={t('header.import')}>
          <Upload className="w-4 h-4 mr-1" />
          {t('header.import')}
        </Button>
        <Button onClick={() => { setCurrentView('editor'); useStore.getState().setSelectedPrompt(null); }}>
          <Plus className="w-4 h-4 mr-1" />
          {t('prompts.newPrompt')}
        </Button>
      </div>
    </header>
  );
}
