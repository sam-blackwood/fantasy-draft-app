import { useEffect, useState } from 'react';
import { ThemeToggle } from '../components/ThemeToggle';
import { CountdownPage } from './CountdownPage';
import { JoinPage } from './JoinPage';

type Tab = 'home' | 'join';

export function HomePage() {
  const [activeTab, setActiveTab] = useState<Tab>('home');

  useEffect(() => {
    document.title = 'Clubhouse Draft';
  }, []);

  return (
    <div className="h-dvh flex flex-col overflow-hidden bg-surface-base text-content-primary">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab('home')}
            className={`px-4 py-2 rounded font-medium transition-colors cursor-pointer ${activeTab === 'home'
              ? 'bg-surface text-accent-bright'
              : 'text-content-tertiary hover:text-content-secondary'
              }`}
          >
            Home
          </button>
          <button
            onClick={() => setActiveTab('join')}
            className={`px-4 py-2 rounded font-medium transition-colors cursor-pointer ${activeTab === 'join'
              ? 'bg-surface text-accent-bright'
              : 'text-content-tertiary hover:text-content-secondary'
              }`}
          >
            Join Draft
          </button>
        </div>
        <ThemeToggle />
      </div>

      {/* Tab content */}
      {activeTab === 'home' ? <CountdownPage /> : <JoinPage />}
    </div>
  );
}
