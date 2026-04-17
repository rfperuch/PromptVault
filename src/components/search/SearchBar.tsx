import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '@/stores/appStore';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/Input';

export function SearchBar() {
  const { t } = useTranslation();
  const { searchQuery, setSearchQuery } = useStore();
  const [focused, setFocused] = useState(false);
  const [isNarrow, setIsNarrow] = useState(window.innerWidth < 835);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleResize = () => setIsNarrow(window.innerWidth < 835);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape' && focused) {
        inputRef.current?.blur();
        setSearchQuery('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focused, setSearchQuery]);

  return (
    <div className="relative max-w-md">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
      <Input
        ref={inputRef}
        placeholder={isNarrow ? '' : t('search.placeholder')}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="pl-9 pr-9"
      />
      {searchQuery ? (
        <button
          onClick={() => setSearchQuery('')}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-accent rounded cursor-pointer"
        >
          <X className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      ) : !isNarrow && (
        <kbd className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          Ctrl+K
        </kbd>
      )}
    </div>
  );
}
