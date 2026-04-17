import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto scrollbar-thin p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
