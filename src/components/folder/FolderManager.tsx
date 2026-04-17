import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '@/stores/appStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Trash2, Pencil, Check, X, FolderOpen } from 'lucide-react';

export function FolderManager({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const { folders, addFolder, deleteFolder, renameFolder } = useStore();
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleAdd = async () => {
    if (!newName.trim()) return;
    await addFolder(newName.trim());
    setNewName('');
  };

  const handleRename = (id: string) => {
    if (editName.trim()) {
      renameFolder(id, editName.trim());
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
          <h3 className="text-lg font-semibold">{t('folders.manageFolders')}</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-accent rounded cursor-pointer"
          >
            <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
          </button>
        </div>

        <div className="space-y-1 mb-4 max-h-60 overflow-auto">
          {folders.map((folder) => (
            <div
              key={folder.id}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/50 group"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <FolderOpen className="w-4 h-4 shrink-0 text-muted-foreground" />
                {editingId === folder.id ? (
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="h-7 text-sm flex-1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRename(folder.id);
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                    autoFocus
                  />
                ) : (
                  <span className="text-sm truncate">{folder.name}</span>
                )}
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {editingId === folder.id ? (
                  <>
                    <button
                      onClick={() => handleRename(folder.id)}
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
                      onClick={() => startEdit(folder.id, folder.name)}
                      className="p-1 hover:bg-accent rounded cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(t('folders.deleteConfirm', { name: folder.name }))) {
                          deleteFolder(folder.id);
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
          {folders.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">{t('folders.noFoldersCreated')}</p>
          )}
        </div>

        <div className="flex items-center gap-2 pt-3 border-t border-border">
          <Input
            placeholder={t('folders.newFolder')}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            className="flex-1 h-8 text-sm"
          />
          <Button size="sm" onClick={handleAdd} disabled={!newName.trim()}>
            {t('folders.create')}
          </Button>
        </div>
      </div>
    </div>
  );
}
