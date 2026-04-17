import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '@/stores/appStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { FolderSelect } from '@/components/folder/FolderSelect';
import { ArrowLeft, Save, X, Plus } from 'lucide-react';
import { extractVariables, cn, PRESET_COLORS } from '@/lib/utils';

export function PromptEditor() {
  const { t } = useTranslation();
  const {
    selectedPromptId, prompts, categories, selectedFolderId,
    addPrompt, updatePrompt, setCurrentView, setSelectedPrompt,
    addCategory,
  } = useStore();

  const existing = selectedPromptId ? prompts.find((p) => p.id === selectedPromptId) : null;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [folderId, setFolderId] = useState<string | null>(null);

  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState(PRESET_COLORS[5]);

  useEffect(() => {
    if (existing) {
      setTitle(existing.title);
      setDescription(existing.description);
      setContent(existing.content);
      setSelectedCategoryIds(existing.categoryIds);
      setFolderId(existing.folderId);
    } else {
      setFolderId(selectedFolderId === 'none' ? null : selectedFolderId);
    }
  }, [existing, selectedFolderId]);

  const variables = extractVariables(content);

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) return;

    if (existing) {
      await updatePrompt(existing.id, {
        title: title.trim(),
        description: description.trim(),
        content: content.trim(),
        categoryIds: selectedCategoryIds,
        folderId,
      });
    } else {
      await addPrompt({
        title: title.trim(),
        description: description.trim(),
        content: content.trim(),
        categoryIds: selectedCategoryIds,
        folderId,
        isFavorite: false,
      });
    }
    setCurrentView('home');
    setSelectedPrompt(null);
  };

  const handleCancel = () => {
    setCurrentView('home');
    setSelectedPrompt(null);
  };

  const toggleCategory = (id: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    const cat = addCategory(newCatName.trim(), newCatColor);
    setSelectedCategoryIds((prev) => [...prev, cat.id]);
    setNewCatName('');
    setShowNewCategory(false);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={handleCancel}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h2 className="text-xl font-semibold">
            {existing ? t('prompts.editPrompt') : t('prompts.newPrompt')}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleCancel}>
            <X className="w-4 h-4 mr-1" />
            {t('editor.cancel')}
          </Button>
          <Button onClick={handleSave} disabled={!title.trim() || !content.trim()}>
            <Save className="w-4 h-4 mr-1" />
            {t('editor.save')}
          </Button>
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <label className="text-sm font-medium mb-1.5 block">{t('editor.title')}</label>
          <Input
            placeholder={t('editor.titlePlaceholder')}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-base"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-1.5 block">{t('editor.description')}</label>
          <Input
            placeholder={t('editor.descriptionPlaceholder')}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">{t('editor.folder')}</label>
            <FolderSelect value={folderId} onChange={setFolderId} />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-1.5 block">{t('editor.categories')}</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => toggleCategory(cat.id)}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all cursor-pointer',
                  selectedCategoryIds.includes(cat.id)
                    ? 'border-white/50 text-white shadow-md'
                    : 'border-border text-muted-foreground hover:border-foreground/30'
                )}
                style={
                  selectedCategoryIds.includes(cat.id)
                    ? { backgroundColor: cat.color }
                    : undefined
                }
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: cat.color }}
                />
                {cat.name}
              </button>
            ))}
            <button
              onClick={() => setShowNewCategory(!showNewCategory)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border border-dashed border-muted-foreground/30 text-muted-foreground hover:border-foreground/50 hover:text-foreground transition-colors cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              {t('editor.newCategory')}
            </button>
          </div>

          {showNewCategory && (
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <Input
                placeholder={t('editor.categoryName')}
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="flex-1 h-8 text-sm"
                onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                autoFocus
              />
              <div className="flex gap-1">
                {PRESET_COLORS.slice(0, 8).map((color) => (
                  <button
                    key={color}
                    onClick={() => setNewCatColor(color)}
                    className={cn(
                      'w-6 h-6 rounded-full border-2 transition-all cursor-pointer',
                      newCatColor === color ? 'scale-150' : ''
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <Button size="sm" onClick={handleAddCategory} disabled={!newCatName.trim()}>
                {t('editor.add')}
              </Button>
            </div>
          )}
        </div>

        <div>
          <label className="text-sm font-medium mb-1.5 block">
            {t('editor.content')}
            <span className="text-muted-foreground font-normal ml-2">
              {t('editor.variablesHint')}
            </span>
          </label>
          <Textarea
            placeholder={t('editor.contentPlaceholder')}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[250px] font-mono text-sm leading-relaxed"
          />
        </div>

        {variables.length > 0 && (
          <div>
            <label className="text-sm font-medium mb-1.5 block">{t('editor.variablesDetected')}</label>
            <div className="flex flex-wrap gap-2">
              {variables.map((v) => (
                <span key={v} className="variable-highlight">
                  {`{{${v}}}`}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
