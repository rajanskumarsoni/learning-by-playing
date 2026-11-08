import { useState } from 'react';
import App from './App.jsx';
import TransformerGameApp from './transformerGame/TransformerGameApp.jsx';

export default function RootApp() {
  // Always start on 'systemsaviour' so the Login / Sign Up screen & Game Selection Hub appear first
  const [activeGame, setActiveGame] = useState('systemsaviour');

  const [transformerStageIdx, setTransformerStageIdx] = useState(0);
  const [openGameSelectCount, setOpenGameSelectCount] = useState(0);

  const switchGame = (gameKey, options = {}) => {
    if (typeof options === 'number') {
      options = { stageIdx: options };
    }
    if (gameKey === 'transformer') {
      if (typeof options.stageIdx === 'number') {
        setTransformerStageIdx(options.stageIdx);
      }
      setActiveGame('transformer');
    } else {
      setActiveGame('systemsaviour');
      if (options.openGameSelect) {
        setOpenGameSelectCount((c) => c + 1);
      }
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('learning_active_game', gameKey);
      const url = new URL(window.location.href);
      if (gameKey === 'transformer') {
        url.searchParams.set('game', 'transformer');
      } else {
        url.searchParams.delete('game');
      }
      window.history.replaceState({}, '', url.toString());
    }
  };

  return (
    <div className="relative w-full h-full min-h-screen">
      {activeGame === 'transformer' ? (
        <TransformerGameApp
          onSwitchGame={switchGame}
          initialStageIdx={transformerStageIdx}
        />
      ) : (
        <App
          onSwitchGame={switchGame}
          openGameSelectSignal={openGameSelectCount}
        />
      )}
    </div>
  );
}
