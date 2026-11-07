import { useState, useEffect } from 'react';
import GameHeader from './components/GameHeader.jsx';
import LevelBriefingModal from './components/LevelBriefingModal.jsx';
import VictoryCelebration from './components/VictoryCelebration.jsx';

import TokenizerStage from './components/stages/TokenizerStage.jsx';
import PositionalStage from './components/stages/PositionalStage.jsx';
import AttentionMatrixStage from './components/stages/AttentionMatrixStage.jsx';
import MultiHeadStage from './components/stages/MultiHeadStage.jsx';
import LossCanyonStage from './components/stages/LossCanyonStage.jsx';
import TemperatureStage from './components/stages/TemperatureStage.jsx';
import SandboxStage from './components/stages/SandboxStage.jsx';

import { GAME_STAGES } from './core/levelsData.js';
import { aiSound } from './aiAudioEngine.js';

export default function TransformerGameApp({ onSwitchGame, initialStageIdx = 0 }) {
  const [currentStageIdx, setCurrentStageIdx] = useState(initialStageIdx);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(1);
  const [completedStages, setCompletedStages] = useState(new Set());
  const [showBriefing, setShowBriefing] = useState(false);
  const [showVictory, setShowVictory] = useState(false);
  const [stageKey, setStageKey] = useState(0); // For clean re-mounting on reset

  useEffect(() => {
    if (typeof initialStageIdx === 'number' && initialStageIdx >= 0 && initialStageIdx < GAME_STAGES.length) {
      setCurrentStageIdx(initialStageIdx);
    }
  }, [initialStageIdx]);

  const currentStage = GAME_STAGES[currentStageIdx];

  const handleStageComplete = (points = 100) => {
    setScore(prev => prev + points * streak);
    setStreak(prev => prev + 1);
    setCompletedStages(prev => new Set([...prev, currentStage.id]));
    setShowVictory(true);
  };

  const handleNextStage = () => {
    setShowVictory(false);
    if (currentStageIdx < GAME_STAGES.length - 1) {
      setCurrentStageIdx(prev => prev + 1);
      setShowBriefing(true);
    }
  };

  const handleResetStage = () => {
    aiSound.playTokenSnap(500);
    setStageKey(prev => prev + 1);
  };

  const renderCurrentStage = () => {
    switch (currentStage.id) {
      case 'stage-1-vectors':
        return <TokenizerStage key={stageKey} stage={currentStage} onStageComplete={handleStageComplete} />;
      case 'stage-2-position':
        return <PositionalStage key={stageKey} stage={currentStage} onStageComplete={handleStageComplete} />;
      case 'stage-3-attention':
        return <AttentionMatrixStage key={stageKey} stage={currentStage} onStageComplete={handleStageComplete} />;
      case 'stage-4-multihead':
        return <MultiHeadStage key={stageKey} stage={currentStage} onStageComplete={handleStageComplete} />;
      case 'stage-5-losscanyon':
        return <LossCanyonStage key={stageKey} stage={currentStage} onStageComplete={handleStageComplete} />;
      case 'stage-6-temperature':
        return <TemperatureStage key={stageKey} stage={currentStage} onStageComplete={handleStageComplete} />;
      case 'stage-7-sandbox':
        return <SandboxStage key={stageKey} stage={currentStage} onStageComplete={handleStageComplete} />;
      default:
        return <TokenizerStage key={stageKey} stage={currentStage} onStageComplete={handleStageComplete} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#070a13] text-[#e2e8f0] flex flex-col font-sans select-none overflow-y-auto">
      {/* Top Header */}
      <GameHeader
        stages={GAME_STAGES}
        currentStageIdx={currentStageIdx}
        onSelectStage={(idx) => {
          setCurrentStageIdx(idx);
          setShowBriefing(false);
        }}
        onOpenBriefing={() => setShowBriefing(true)}
        onResetStage={handleResetStage}
        onSwitchGame={onSwitchGame}
        score={score}
        streak={streak}
      />

      {/* Main Stage Viewport */}
      <main className="flex-1 py-6 px-4">
        {renderCurrentStage()}
      </main>

      {/* Footer Info */}
      <footer className="w-full py-4 text-center text-xs font-mono text-slate-500 border-t border-slate-900 bg-[#090d19]/80">
        <span>ATTENTION! Inside The Transformer — Inspired by </span>
        <a
          href="https://github.com/codecrafters-io/build-your-own-x#build-your-own-ai-model"
          target="_blank"
          rel="noreferrer"
          className="text-cyan-400 hover:underline"
        >
          Build Your Own AI Model
        </a>
      </footer>

      {/* Modals */}
      <LevelBriefingModal
        stage={currentStage}
        isOpen={showBriefing}
        onClose={() => setShowBriefing(false)}
      />

      {showVictory && (
        <VictoryCelebration
          stage={currentStage}
          onNextStage={handleNextStage}
          onClose={() => setShowVictory(false)}
        />
      )}
    </div>
  );
}

