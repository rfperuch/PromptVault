import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '@/stores/appStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Trash2, Pencil, Check, X } from 'lucide-react';
import { PRESET_COLORS, cn } from '@/lib/utils';

export function CategoryManager({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const { categories, addCategory, deleteCategory, renameCategory, updateCategoryColor } = useStore();
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleAdd = () => {
    if (!newName.trim()) return;
    addCategory(newName.trim(), newColor);
    setNewName('');
  };

  const handleRename = (id: string) => {
    if (editName.trim()) {
      renameCategory(id, editName.trim());
    }
    setEditingId(null);
  };

  const startEdit = (id: string, currentName: string) => {
    setEditingId(id);
    setEditName(currentName);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'hsl(var(--card))',
          border: '1px solid hsl(var(--border))',
          zIndex: 101,
        }}
        className="rounded-xl shadow-2xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{t('categories.manageCategories')}</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-accent rounded cursor-pointer"
          >
            <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
          </button>
        </div>

        <div className="space-y-1 mb-4 max-h-60 overflow-auto">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/50 group"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div
                  className="w-4 h-4 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                {editingId === cat.id ? (
                  <div className="flex items-center gap-2 flex-1">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="h-7 text-sm flex-1"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRename(cat.id);
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      autoFocus
                    />
                    <div className="flex gap-0.5">
                      {PRESET_COLORS.slice(0, 6).map((color) => (
                        <button
                          key={color}
                          onClick={() => updateCategoryColor(cat.id, color)}
                          className={cn(
                            'w-4 h-4 rounded-full border cursor-pointer',
                            cat.color === color ? 'scale-150' : ''
                          )}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <span className="text-sm truncate">{cat.name}</span>
                )}
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {editingId === cat.id ? (
                  <>
                    <button
                      onClick={() => handleRename(cat.id)}
                      className="p-1 hover:bg-accent rounded cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5 text-green-500" />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-1 hover:bg-accent rounded cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => startEdit(cat.id, cat.name)}
                      className="p-1 hover:bg-accent rounded cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(t('categories.deleteConfirm', { name: cat.name }))) {
                          deleteCategory(cat.id);
                        }
                      }}
                      className="p-1 hover:bg-destructive/20 rounded cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-destructive" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
          {categories.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">{t('categories.noCategories')}</p>
          )}
        </div>

        <div className="flex items-center gap-2 pt-3 border-t border-border">
          <Input
            placeholder={t('categories.newCategory')}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            className="flex-1 h-8 text-sm"
          />
          <div className="flex gap-0.5">
            {PRESET_COLORS.slice(0, 6).map((color) => (
              <button
                key={color}
                onClick={() => setNewColor(color)}
                className={cn(
                  'w-5 h-5 rounded-full border-2 cursor-pointer transition-all',
                  newColor === color ? 'scale-150' : ''
                )}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <Button size="sm" onClick={handleAdd} disabled={!newName.trim()}>
            {t('categories.create')}
          </Button>
        </div>
      </div>
    </div>
  );
}
