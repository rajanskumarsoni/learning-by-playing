import { useState, useEffect } from 'react';
import App from './App.jsx';
import TransformerGameApp from './transformerGame/TransformerGameApp.jsx';
import { Brain } from 'lucide-react';

export default function RootApp() {
  const [activeGame, setActiveGame] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const gameParam = params.get('game');
      if (gameParam === 'transformer' || gameParam === 'ai') return 'transformer';
      return localStorage.getItem('learning_active_game') || 'systemsaviour';
    }
    return 'systemsaviour';
  });

  const switchGame = (gameKey) => {
    setActiveGame(gameKey);
    if (typeof window !== 'undefined') {
      localStorage.setItem('learning_active_game', gameKey);
      const url = new URL(window.location.href);
      url.searchParams.set('game', gameKey);
      window.history.replaceState({}, '', url.toString());
    }
  };

  return (
    <div className="relative w-full h-full min-h-screen">
      {activeGame === 'transformer' ? (
        <TransformerGameApp onSwitchGame={switchGame} />
      ) : (
        <>
          {/* Top floating pill inside System Saviour to easily switch to Transformer Game */}
          <div className="fixed top-2.5 right-48 z-[9999] hidden lg:flex items-center pointer-events-auto">
            <button
              onClick={() => switchGame('transformer')}
              className="px-3 py-1.5 rounded-full bg-gradient-to-r from-cyan-950/90 to-blue-950/90 hover:from-cyan-900 hover:to-blue-900 border border-cyan-400/60 text-cyan-300 text-xs font-mono font-bold shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
              title="Play ATTENTION! Inside The Transformer Game"
            >
              <Brain className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
              <span>⚡ PLAY AI TRANSFORMER GAME</span>
            </button>
          </div>
          <App />
        </>
      )}
    </div>
  );
}

