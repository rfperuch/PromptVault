import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useStore } from '@/stores/appStore';
import { ChevronDown, FolderOpen, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FolderSelectProps {
  value: string | null;
  onChange: (folderId: string | null) => void;
}

export function FolderSelect({ value, onChange }: FolderSelectProps) {
  const { t } = useTranslation();
  const { folders } = useStore();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });

  const selected = value ? folders.find((f) => f.id === value) : null;

  useEffect(() => {
    if (open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      });
    }
  }, [open]);

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          'flex items-center gap-2 w-full h-9 px-3 rounded-md border border-input bg-transparent text-sm',
          'hover:bg-accent/50 transition-colors cursor-pointer text-left',
          !value && 'text-muted-foreground'
        )}
      >
        {selected ? (
          <>
            <FolderOpen className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate flex-1">{selected.name}</span>
          </>
        ) : (
          <>
            <FolderOpen className="w-3.5 h-3.5 shrink-0" />
            <span className="flex-1">{t('sidebar.noFolder')}</span>
          </>
        )}
        <ChevronDown className="w-3.5 h-3.5 shrink-0 opacity-50" />
      </button>

      {open && createPortal(
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 90 }}
            onClick={() => setOpen(false)}
          />
          <div
            style={{
              position: 'fixed',
              top: position.top,
              left: position.left,
              width: position.width,
              zIndex: 91,
              backgroundColor: 'hsl(var(--popover))',
              border: '1px solid hsl(var(--border))',
            }}
            className="rounded-md shadow-lg py-1 max-h-48 overflow-auto"
          >
            <button
              type="button"
              onClick={() => { onChange(null); setOpen(false); }}
              className={cn(
                'w-full flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-accent transition-colors cursor-pointer text-left',
                !value ? 'text-foreground font-medium' : 'text-muted-foreground'
              )}
            >
              <FolderOpen className="w-3.5 h-3.5" />
              {t('sidebar.noFolder')}
              {!value && <X className="w-3 h-3 ml-auto" />}
            </button>
            {folders.map((folder) => (
              <button
                key={folder.id}
                type="button"
                onClick={() => { onChange(folder.id); setOpen(false); }}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-accent transition-colors cursor-pointer text-left',
                  value === folder.id ? 'text-foreground font-medium' : 'text-muted-foreground'
                )}
              >
                <FolderOpen className="w-3.5 h-3.5" />
                <span className="truncate">{folder.name}</span>
                {value === folder.id && <X className="w-3 h-3 ml-auto" />}
              </button>
            ))}
          </div>
        </>,
        document.body
      )}
    </div>
  );
}
