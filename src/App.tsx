import { useEffect } from 'react';
import { useStore } from '@/stores/appStore';
import { Layout } from '@/components/layout/Layout';
import { PromptList } from '@/components/prompt/PromptList';
import { PromptEditor } from '@/components/prompt/PromptEditor';
import { PromptDetail } from '@/components/prompt/PromptDetail';

export default function App() {
  const { currentView, loaded, init } = useStore();

  useEffect(() => {
    init();
  }, [init]);

  if (!loaded) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center animate-pulse">
            <span className="text-white font-bold">PV</span>
          </div>
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      {currentView === 'editor' ? (
        <PromptEditor />
      ) : currentView === 'detail' ? (
        <PromptDetail />
      ) : (
        <PromptList />
      )}
    </Layout>
  );
}
