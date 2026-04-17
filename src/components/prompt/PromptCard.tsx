import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '@/stores/appStore';
import { Star, Copy, Pencil, Trash2, MoreHorizontal, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CategoryBadge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import type { Prompt } from '@/types';

interface PromptCardProps {
  prompt: Prompt;
  mode: 'grid' | 'list';
}

export function PromptCard({ prompt, mode }: PromptCardProps) {
  const { t } = useTranslation();
  const { folders, categories, toggleFavorite, deletePrompt, setSelectedPrompt, setCurrentView } = useStore();
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const promptCategories = categories.filter((c) => prompt.categoryIds.includes(c.id));
  const folder = prompt.folderId ? folders.find((f) => f.id === prompt.folderId) : null;

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(prompt.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedPrompt(prompt.id);
    setCurrentView('editor');
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(t('prompts.deleteConfirm'))) {
      deletePrompt(prompt.id);
    }
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(prompt.id);
  };

  const handleClick = () => {
    setSelectedPrompt(prompt.id);
    setCurrentView('detail');
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  if (mode === 'list') {
    return (
      <div
        onClick={handleClick}
        className="flex items-center gap-4 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer group"
      >
        <button onClick={handleFavorite} className="shrink-0 cursor-pointer">
          <Star
            className={`w-4 h-4 transition-colors ${
              prompt.isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground hover:text-yellow-400'
            }`}
          />
        </button>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium truncate">{prompt.title}</h3>
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {prompt.description || prompt.content.slice(0, 80)}
          </p>
        </div>
        {folder && (
          <div className="flex items-center gap-1 shrink-0 text-xs text-muted-foreground">
            <FolderOpen className="w-3 h-3" />
            <span className="truncate max-w-[80px]">{folder.name}</span>
          </div>
        )}
        <div className="flex items-center gap-1 shrink-0">
          {promptCategories.slice(0, 2).map((cat) => (
            <CategoryBadge key={cat.id} name={cat.name} color={cat.color} />
          ))}
        </div>
        <span className="text-xs text-muted-foreground shrink-0">{formatDate(prompt.updatedAt)}</span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" onClick={handleCopy} title={t('prompts.copy')}>
            <Copy className={`w-3.5 h-3.5 ${copied ? 'text-green-500' : ''}`} />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleEdit} title={t('prompts.edit')}>
            <Pencil className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      className="group relative bg-card border border-border rounded-xl p-4 hover:shadow-lg hover:border-border/80 transition-all cursor-pointer flex flex-col"
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-sm font-semibold truncate flex-1 pr-2">{prompt.title}</h3>
        <button onClick={handleFavorite} className="shrink-0 cursor-pointer">
          <Star
            className={`w-4 h-4 transition-colors ${
              prompt.isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground hover:text-yellow-400'
            }`}
          />
        </button>
      </div>

      {prompt.description && (
        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{prompt.description}</p>
      )}

      <div className="flex-1 mb-3">
        <p className="text-xs text-muted-foreground/80 line-clamp-3 font-mono leading-relaxed">
          {prompt.content}
        </p>
      </div>

      <div className="flex items-center justify-between mt-auto">
        <div className="flex items-center gap-1 flex-wrap">
          {folder && (
            <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground mr-1">
              <FolderOpen className="w-3 h-3" />
              {folder.name}
            </span>
          )}
          {promptCategories.map((cat) => (
            <CategoryBadge key={cat.id} name={cat.name} color={cat.color} />
          ))}
        </div>
        <span className="text-[10px] text-muted-foreground">{formatDate(prompt.updatedAt)}</span>
      </div>

      <div className="absolute top-2 right-2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopy} title={copied ? t('prompts.copied') : t('prompts.copy')}>
          <Copy className={`w-3.5 h-3.5 ${copied ? 'text-green-500' : ''}`} />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleEdit} title={t('prompts.edit')}>
          <Pencil className="w-3.5 h-3.5" />
        </Button>
        <div ref={menuRef} className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
          >
            <MoreHorizontal className="w-3.5 h-3.5" />
          </Button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 bg-popover border border-border rounded-md shadow-lg py-1 z-50 min-w-[120px]">
              <button
                onClick={handleDelete}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-destructive hover:bg-accent transition-colors cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                {t('prompts.delete')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
