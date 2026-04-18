import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '@/stores/appStore';
import { Button } from '@/components/ui/Button';
import { CategoryBadge } from '@/components/ui/Badge';
import {
  ArrowLeft, Copy, Pencil, Trash2, Star, Check, Variable, FolderOpen,
} from 'lucide-react';
import { extractVariables, fillVariables, formatDate, escapeHtml } from '@/lib/utils';

export function PromptDetail() {
  const { t } = useTranslation();
  const {
    selectedPromptId, prompts, categories, folders,
    toggleFavorite, deletePrompt, setCurrentView, setSelectedPrompt,
  } = useStore();

  const prompt = prompts.find((p) => p.id === selectedPromptId);
  const [copied, setCopied] = useState(false);
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});

  const variables = useMemo(
    () => (prompt ? extractVariables(prompt.content) : []),
    [prompt]
  );

  if (!prompt) {
    return (
      <div className="text-center text-muted-foreground py-12">
        Prompt não encontrado.
      </div>
    );
  }

  const promptCategories = categories.filter((c) => prompt.categoryIds.includes(c.id));
  const folder = prompt.folderId ? folders.find((f) => f.id === prompt.folderId) : null;

  const handleCopy = async () => {
    const finalContent = variables.length > 0 ? fillVariables(prompt.content, variableValues) : prompt.content;
    await navigator.clipboard.writeText(finalContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEdit = () => {
    setSelectedPrompt(prompt.id);
    setCurrentView('editor');
  };

  const handleDelete = () => {
    if (confirm(t('prompts.deleteConfirm'))) {
      deletePrompt(prompt.id);
      setCurrentView('home');
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => { setCurrentView('home'); setSelectedPrompt(null); }}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h2 className="text-xl font-semibold">{prompt.title}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t('detail.updatedAt', { date: formatDate(prompt.updatedAt) })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => toggleFavorite(prompt.id)}
            title={prompt.isFavorite ? t('prompts.removeFromFavorites') : t('prompts.addToFavorites')}
          >
            <Star className={`w-4 h-4 ${prompt.isFavorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
          </Button>
          <Button variant="outline" size="sm" onClick={handleCopy}>
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 mr-1 text-green-400" />
                {t('prompts.copied')}
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 mr-1" />
                {t('detail.copyPrompt')}
              </>
            )}
          </Button>
          <Button variant="outline" size="sm" onClick={handleEdit}>
            <Pencil className="w-3.5 h-3.5 mr-1" />
            {t('prompts.edit')}
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            <Trash2 className="w-3.5 h-3.5 mr-1" />
            {t('prompts.delete')}
          </Button>
        </div>
      </div>

      {prompt.description && (
        <p className="text-sm text-muted-foreground mb-4">{prompt.description}</p>
      )}

      <div className="flex items-center gap-3 mb-4">
        {folder && (
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-md">
            <FolderOpen className="w-3 h-3" />
            {folder.name}
          </span>
        )}
        {!folder && (
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-md">
            <FolderOpen className="w-3 h-3 opacity-50" />
            {t('detail.noFolder')}
          </span>
        )}
        {promptCategories.map((cat) => (
          <CategoryBadge key={cat.id} name={cat.name} color={cat.color} />
        ))}
      </div>

      {variables.length > 0 && (
        <div className="mb-4 p-4 bg-muted/50 rounded-lg border border-border">
          <div className="flex items-center gap-2 mb-3">
            <Variable className="w-4 h-4 text-violet-500" />
            <span className="text-sm font-medium">{t('detail.fillVariables')}</span>
          </div>
          <div className="grid gap-3">
            {variables.map((v) => (
              <div key={v} className="flex items-start gap-3">
                <label className="text-xs font-mono text-muted-foreground w-24 shrink-0 pt-1.5">
                  {`{{${v}}}`}
                </label>
                <textarea
                  rows={1}
                  placeholder={t('detail.valueFor', { name: v })}
                  value={variableValues[v] || ''}
                  onChange={(e) => setVariableValues((prev) => ({ ...prev, [v]: e.target.value }))}
                  onInput={(e) => {
                    const el = e.currentTarget;
                    el.style.height = 'auto';
                    el.style.height = `${el.scrollHeight}px`;
                  }}
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-1.5 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none overflow-hidden leading-5"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="relative bg-card border border-border rounded-lg p-4">
        <div className="prompt-content">
          {variables.length > 0 ? (
            <span
              dangerouslySetInnerHTML={{
                __html: escapeHtml(prompt.content).replace(
                  /\{\{(\w+)\}\}/g,
                  (_, v) =>
                    variableValues[v]
                      ? `<span class="text-green-500 font-semibold">${escapeHtml(variableValues[v])}</span>`
                      : `<span class="variable-highlight">{{${v}}}</span>`
                ),
              }}
            />
          ) : (
            prompt.content
          )}
        </div>
      </div>
    </div>
  );
}
