import { useState, useEffect } from 'react';
import {
  Shield, Flame, X, Sparkles, Layers, Target, Sliders,
  ChevronLeft, Lock, Info
} from 'lucide-react';
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

import { GAME_STAGES, AI_LEVEL_MANAGERS } from './core/levelsData.js';
import { mentorAdaImg, heroImg, devilImg, getManagerAvatar } from './core/gameAssets.js';
import { aiSound } from './aiAudioEngine.js';

export default function TransformerGameApp({ onSwitchGame, initialStageIdx = 0 }) {
  // Progressive Level Unlocking State (Persisted in localStorage, modelled after System Saviour)
  const [unlockedStageIdx, setUnlockedStageIdx] = useState(() => {
    try {
      const saved = localStorage.getItem('transformer_unlocked_stage');
      return saved !== null
        ? Math.min(GAME_STAGES.length - 1, Math.max(0, parseInt(saved, 10)))
        : 0;
    } catch {
      return 0;
    }
  });

  const [gameMode, setGameMode] = useState('CAMPAIGN'); // 'CAMPAIGN' | 'SANDBOX'
  const [currentStageIdx, setCurrentStageIdx] = useState(() => {
    return Math.min(initialStageIdx, unlockedStageIdx);
  });
  const [score, setScore] = useState(() => {
    try {
      const s = localStorage.getItem('transformer_score');
      return s ? parseInt(s, 10) : 0;
    } catch {
      return 0;
    }
  });
  const [streak, setStreak] = useState(1);
  const [completedStages, setCompletedStages] = useState(() => {
    try {
      const raw = localStorage.getItem('transformer_completed_stages');
      return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Modals modelled after System Saviour: Welcome Screen, Level Briefing, Promotion Ceremony, Career Dossier
  const [showWelcomeModal, setShowWelcomeModal] = useState(true);
  const [briefingState, setBriefingState] = useState({ isOpen: false, fromWin: false });
  const [showVictory, setShowVictory] = useState(false);
  const [showDesignationModal, setShowDesignationModal] = useState(false);
  const [stageKey, setStageKey] = useState(0);

  useEffect(() => {
    if (typeof initialStageIdx === 'number' && initialStageIdx >= 0 && initialStageIdx < GAME_STAGES.length) {
      if (initialStageIdx <= unlockedStageIdx) {
        setCurrentStageIdx(initialStageIdx);
      }
    }
  }, [initialStageIdx, unlockedStageIdx]);

  const currentStage = GAME_STAGES[currentStageIdx] || GAME_STAGES[0];
  const currentManager = AI_LEVEL_MANAGERS[currentStageIdx] || AI_LEVEL_MANAGERS[0];

  // When a level is passed: unlock next level, persist in localStorage, and show Manager Promotion Modal
  const handleStageComplete = (points = 100) => {
    setScore((prev) => {
      const nextScore = prev + points * streak;
      try {
        localStorage.setItem('transformer_score', nextScore.toString());
      } catch {}
      return nextScore;
    });
    setStreak((prev) => prev + 1);
    setCompletedStages((prev) => {
      const next = new Set([...prev, currentStage.id]);
      try {
        localStorage.setItem('transformer_completed_stages', JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });

    setUnlockedStageIdx((prev) => {
      const updated = Math.min(GAME_STAGES.length - 1, Math.max(prev, currentStageIdx + 1));
      try {
        localStorage.setItem('transformer_unlocked_stage', updated.toString());
      } catch {}
      return updated;
    });

    setShowVictory(true);
  };

  // Accept Promotion -> Advance to Next Level & open its Problem & Targets Briefing Modal
  const handleNextStage = () => {
    setShowVictory(false);
    if (currentStageIdx < GAME_STAGES.length - 1) {
      const nextIdx = currentStageIdx + 1;
      setUnlockedStageIdx((prev) => Math.max(prev, nextIdx));
      setCurrentStageIdx(nextIdx);
      if (nextIdx === GAME_STAGES.length - 1) {
        setGameMode('SANDBOX');
      }
      setBriefingState({ isOpen: true, fromWin: true });
    }
  };

  // Select a stage from the stepper (only if unlocked or in Sandbox mode)
  const handleSelectStage = (idx, openBriefing = true) => {
    if (gameMode !== 'SANDBOX' && idx > unlockedStageIdx) return;
    setCurrentStageIdx(idx);
    setShowVictory(false);
    if (openBriefing) {
      setBriefingState({ isOpen: true, fromWin: false });
    }
  };

  // Switch between Campaign Mode (locked progression) and Sandbox Mode (Stage 7 Playground)
  const handleSwitchMode = (mode) => {
    setGameMode(mode);
    setShowVictory(false);
    if (mode === 'SANDBOX') {
      setCurrentStageIdx(GAME_STAGES.length - 1);
      setBriefingState({ isOpen: true, fromWin: false });
    } else {
      const targetIdx = Math.min(currentStageIdx, unlockedStageIdx, GAME_STAGES.length - 2);
      setCurrentStageIdx(targetIdx);
      setBriefingState({ isOpen: true, fromWin: false });
    }
  };

  const handleResetStage = () => {
    aiSound.playTokenSnap(500);
    setStageKey((prev) => prev + 1);
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
    <div className="h-screen w-screen max-h-screen overflow-hidden bg-[#070a13] text-[#e2e8f0] flex flex-col font-sans select-none fixed inset-0">
      {/* 1 & 2. Master Game HUD & Locked Level Stepper */}
      <GameHeader
        stages={GAME_STAGES}
        currentStageIdx={currentStageIdx}
        unlockedStageIdx={unlockedStageIdx}
        completedStages={completedStages}
        gameMode={gameMode}
        onSwitchMode={handleSwitchMode}
        onSelectStage={(idx) => handleSelectStage(idx, true)}
        onOpenBriefing={() => setBriefingState({ isOpen: true, fromWin: false })}
        onOpenWelcome={() => setShowWelcomeModal(true)}
        onOpenDesignation={() => setShowDesignationModal(true)}
        onResetStage={handleResetStage}
        onSwitchGame={onSwitchGame}
        score={score}
        streak={streak}
      />

      {/* 3. Scrollable Main Stage Viewport (Scrolls smoothly inside fixed h-screen shell) */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden cyber-grid-overlay">
        {/* Ada Tactical Mentor Comms Banner */}
        <div className="max-w-5xl mx-auto px-4 md:px-6 pt-4">
          <div className="p-3 rounded-2xl bg-slate-900/90 border border-cyan-500/30 flex flex-wrap items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={mentorAdaImg}
                alt="Ada Chief AI Scientist"
                className="w-9 h-9 rounded-xl object-cover ring-1 ring-cyan-400 shrink-0"
              />
              <div className="text-xs min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-black text-cyan-300 uppercase font-mono text-[10px]">
                    Ada AI Chief Scientist • Live Guidance
                  </span>
                  <span className="text-[10px] font-mono text-amber-300">
                    🎯 Target: {currentStage.slaTargetLabel}
                  </span>
                </div>
                <p className="text-slate-300 text-xs truncate max-w-2xl">
                  {currentStage.hints?.[0] || currentStage.missionBrief}
                </p>
              </div>
            </div>
            <button
              onClick={() => setBriefingState({ isOpen: true, fromWin: false })}
              className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-bold transition shrink-0 cursor-pointer"
            >
              View Hints &amp; Briefing &rarr;
            </button>
          </div>
        </div>

        {/* Active Stage Content */}
        <main className="py-2 px-2 pb-10">
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
      </div>

      {/* =================================================================== */}
      {/* 4. WELCOME & ORIENTATION MODAL (MODELLED AFTER SYSTEM SAVIOUR)      */}
      {/* =================================================================== */}
      {showWelcomeModal && (
        <div className="fixed inset-0 bg-[#070a13] flex items-center justify-center p-4 z-50 overflow-y-auto overflow-x-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-950/25 via-slate-950 to-red-950/25 pointer-events-none" />

          {/* BIG HERO IN BACKGROUND (LEFT) */}
          <div className="fixed -left-8 sm:-left-4 lg:left-0 2xl:left-6 top-1/2 -translate-y-1/2 z-20 pointer-events-none select-none flex flex-col items-start">
            <div className="relative">
              <div className="absolute -inset-14 bg-cyan-500/30 rounded-full blur-3xl animate-pulse pointer-events-none" />
              <img
                src={heroImg}
                alt="AI Architect Hero"
                className="w-72 sm:w-88 md:w-[440px] lg:w-[500px] xl:w-[580px] 2xl:w-[680px] max-h-[94vh] object-contain animate-hero-zoom drop-shadow-[0_0_60px_rgba(56,189,248,0.8)]"
              />
            </div>
          </div>

          <div className="fixed left-3 sm:left-6 md:left-8 xl:left-12 bottom-5 sm:bottom-7 z-40 pointer-events-auto select-none flex flex-col items-start">
            <div className="px-3 sm:px-4 py-1.5 rounded-full bg-slate-950/90 border border-cyan-400 text-cyan-300 font-black text-xs sm:text-sm uppercase tracking-wider backdrop-blur-md shadow-[0_0_30px_rgba(34,211,238,0.5)] flex items-center gap-2 ring-2 ring-cyan-500/50 whitespace-nowrap">
              <Shield className="w-4 h-4 text-cyan-400" />
              <span>AI Alignment Hero</span>
            </div>
            <span className="text-[10px] sm:text-xs font-mono text-cyan-300/90 mt-1 font-bold pl-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] whitespace-nowrap">
              Frontier Transformer Guardian
            </span>
          </div>

          {/* BIG DEVIL IN BACKGROUND (RIGHT) */}
          <div className="fixed -right-8 sm:-right-4 lg:right-0 2xl:right-6 top-1/2 -translate-y-1/2 z-20 pointer-events-none select-none flex flex-col items-end">
            <div className="relative">
              <div className="absolute -inset-14 bg-red-500/30 rounded-full blur-3xl animate-pulse pointer-events-none" />
              <img
                src={devilImg}
                alt="Hallucination & NaN Devil"
                className="w-72 sm:w-88 md:w-[440px] lg:w-[500px] xl:w-[580px] 2xl:w-[680px] max-h-[94vh] object-contain animate-devil-zoom drop-shadow-[0_0_60px_rgba(239,68,68,0.8)]"
              />
            </div>
          </div>

          <div className="fixed right-3 sm:right-6 md:right-8 xl:right-12 bottom-5 sm:bottom-7 z-40 pointer-events-auto select-none flex flex-col items-end">
            <div className="px-3 sm:px-4 py-1.5 rounded-full bg-slate-950/90 border border-red-500 text-red-300 font-black text-xs sm:text-sm uppercase tracking-wider backdrop-blur-md shadow-[0_0_30px_rgba(239,68,68,0.5)] flex items-center gap-2 ring-2 ring-red-500/50 whitespace-nowrap">
              <Flame className="w-4 h-4 text-red-400" />
              <span>Hallucination Devil</span>
            </div>
            <span className="text-[10px] sm:text-xs font-mono text-red-300/90 mt-1 font-bold pr-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] whitespace-nowrap">
              NaN Gradients &amp; Token Chaos
            </span>
          </div>

          {/* Center Glass Info Pane */}
          <div className="relative max-w-3xl xl:max-w-4xl w-full bg-slate-950/75 border border-cyan-400/40 rounded-3xl p-5 sm:p-7 shadow-[0_0_60px_rgba(0,0,0,0.75)] my-auto text-slate-100 max-h-[90vh] overflow-y-auto z-30 backdrop-blur-xl space-y-5">
            {/* Top Sticky Controls */}
            <div className="sticky top-0 z-50 flex justify-between items-center -mt-1 -mr-1 pointer-events-none">
              {onSwitchGame ? (
                <button
                  onClick={() => onSwitchGame('systemsaviour', { openGameSelect: true })}
                  className="pointer-events-auto px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-cyan-500/40 text-cyan-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xl backdrop-blur-md active:scale-95 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>🎮 Switch Game</span>
                </button>
              ) : <div />}
              <button
                onClick={() => setShowWelcomeModal(false)}
                className="pointer-events-auto p-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-400 hover:text-white transition shadow-xl backdrop-blur-md active:scale-95 cursor-pointer"
                title="Close Guide"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Ada Mentor Header */}
            <div className="flex items-start sm:items-center gap-4 p-4 rounded-2xl bg-indigo-950/35 border border-cyan-500/40 shadow-lg">
              <div className="relative shrink-0">
                <img
                  src={mentorAdaImg}
                  alt="Ada Chief AI Scientist"
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-2 ring-cyan-400 shadow-xl"
                />
                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-slate-900" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg sm:text-2xl font-black text-white tracking-wide font-display">
                    Welcome to ATTENTION! Inside The Transformer
                  </h2>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                    AI Architecture Simulator
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-cyan-100 mt-1 leading-snug">
                  &ldquo;Greetings, AI Architect! I&apos;m <strong>Ada</strong>, your Chief AI Scientist. Instead of treating Large Language Models like a black box, you will wire, tune, and train every layer of a real Transformer from scratch!&rdquo;
                </p>
              </div>
            </div>

            {/* What You Will Gain By Playing */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5 mb-2.5">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>What You Will Master By Playing</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800 space-y-1">
                  <div className="font-bold text-white">🔤 Embeddings &amp; Positional Geometry</div>
                  <p className="text-slate-400 leading-relaxed">
                    Feel how words become vectors where [King] - [Man] + [Woman] = [Queen], and how sinusoidal waves inject word-order timing into parallel layers.
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800 space-y-1">
                  <div className="font-bold text-white">⚡ Self-Attention &amp; Multi-Head Routing</div>
                  <p className="text-slate-400 leading-relaxed">
                    Tune Query and Key projection weights to resolve ambiguous pronouns via Q · Kᵀ dot-product beams and synchronize parallel attention heads.
                  </p>
                </div>
              </div>
            </div>

            {/* Game Modes Available */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5 mb-2.5">
                <Layers className="w-4 h-4 text-purple-400" />
                <span>Game Modes &amp; Level Progression</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Campaign Mode */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-cyan-500/40 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-cyan-300">🎓 1. Campaign Mode</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-200">
                        6 Progressive Levels
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Vector Harbor ➔ Positional Clockwork ➔ Q/K/V Spotlight ➔ Multi-Head ➔ Loss Canyon ➔ Generation Forge.
                    </p>
                    <div className="text-[11px] text-amber-300/90 pt-1 border-t border-slate-800">
                      🔒 <strong>Rule:</strong> Pass each stage&apos;s SLA target to unlock the next level &amp; earn salary promotions!
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      aiSound.playTokenSnap(950);
                      setGameMode('CAMPAIGN');
                      setShowWelcomeModal(false);
                      setBriefingState({ isOpen: true, fromWin: false });
                    }}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs transition shadow flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Target className="w-3.5 h-3.5" />
                    <span>Select Level &amp; View Briefing &rarr;</span>
                  </button>
                </div>

                {/* Sandbox Mode */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-emerald-500/40 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-emerald-300">🧪 2. Master LLM Sandbox</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-200">
                        Freeform Studio
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Full interactive client-side Tiny-GPT engine. Type custom prompts, inspect N×N attention heatmaps, and trace Q/K/V &amp; MLP vectors.
                    </p>
                    <div className="text-[11px] text-emerald-300/90 pt-1 border-t border-slate-800">
                      🛠️ <strong>Freedom:</strong> Live token sequence &amp; residual stream inspection.
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      aiSound.playTokenSnap(1000);
                      setGameMode('SANDBOX');
                      setCurrentStageIdx(GAME_STAGES.length - 1);
                      setShowWelcomeModal(false);
                    }}
                    className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition shadow flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Open Master Sandbox &rarr;</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Footer CTA */}
            <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Unlocked Progress: <strong>Level {unlockedStageIdx + 1} of {GAME_STAGES.length}</strong></span>
              </span>
              <button
                onClick={() => {
                  setShowWelcomeModal(false);
                  setBriefingState({ isOpen: true, fromWin: false });
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black text-xs transition cursor-pointer"
              >
                Inspect Level {currentStage.stageNumber} Briefing &rarr;
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 5. CAREER DOSSIER & AI MANAGER MODAL (MODELLED AFTER SYSTEM SAVIOUR)*/}
      {/* =================================================================== */}
      {showDesignationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl animate-in fade-in overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-3xl bg-slate-900/98 border border-amber-500/50 p-6 sm:p-7 shadow-[0_0_60px_rgba(245,158,11,0.3)] text-slate-100 space-y-4 z-10 my-auto max-h-[92vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-xl shadow-lg">
                  👔
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-wider text-amber-400 font-mono">
                    AI Architect Career Dossier • Level {currentStage.stageNumber}
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-white font-display">
                    Current Designation &amp; Standing
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setShowDesignationModal(false)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Active Role & Base Pay */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3">
              <div>
                <div className="text-[10px] font-mono uppercase text-slate-400">Active AI Designation</div>
                <h4 className="text-sm sm:text-base font-extrabold text-cyan-300 mt-0.5">
                  {currentManager.currentJobTitle}
                </h4>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[10px] font-mono uppercase text-slate-400">Base Compensation</div>
                <div className="text-base font-black font-mono text-amber-300 mt-0.5">
                  {currentManager.baseSalary}
                </div>
              </div>
            </div>

            {/* Reporting Manager */}
            <div className="p-4 rounded-2xl bg-slate-950/90 border border-amber-500/40 space-y-3">
              <div className="text-[10px] font-black uppercase tracking-wider text-amber-400 font-mono">
                Reporting AI Engineering Manager
              </div>
              <div className="flex items-center gap-3.5">
                <img
                  src={getManagerAvatar(currentManager.avatarKey)}
                  alt={currentManager.name}
                  className="w-14 h-14 rounded-2xl object-contain bg-slate-900 border-2 border-amber-400/60 shrink-0"
                />
                <div className="space-y-0.5 min-w-0">
                  <div className="font-extrabold text-sm text-white">{currentManager.name}</div>
                  <div className="text-xs text-amber-300 font-mono">{currentManager.roleTag} • {currentManager.title}</div>
                  <div className="text-[11px] text-slate-400">
                    Favorite Snack: <strong className="text-amber-200">{currentManager.snackEmoji} {currentManager.snackName}</strong>
                  </div>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-amber-200/90 italic">
                &ldquo;{currentManager.scoldQuote}&rdquo;
              </div>
            </div>

            {/* Next Promotion Criteria */}
            <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/40 space-y-2">
              <div className="flex items-center justify-between text-[10px] font-mono uppercase font-black text-indigo-300">
                <span>Next Promotion Track</span>
                <span className="flex items-center gap-1 text-amber-300">
                  <Lock className="w-3 h-3" />
                  <span>Pass Level {currentStage.stageNumber} SLA</span>
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div>
                  <div className="text-[10px] text-slate-400 font-mono">Promoted Role</div>
                  <div className="font-bold text-cyan-300">{currentManager.promotedJobTitle}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-emerald-400 font-mono font-bold">Salary Hike</div>
                  <div className="font-black text-emerald-300 font-mono">{currentManager.hikeAmount}</div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowDesignationModal(false)}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition cursor-pointer"
            >
              Got It • Return to Arena
            </button>
          </div>
        </div>
      )}

      {/* 6. Mission Briefing Modal */}
      <LevelBriefingModal
        stage={currentStage}
        isOpen={briefingState.isOpen}
        fromWin={briefingState.fromWin}
        onClose={() => setBriefingState({ isOpen: false, fromWin: false })}
      />

      {/* 7. Manager Promotion & Victory Celebration Modal */}
      {showVictory && (
        <VictoryCelebration
          stage={currentStage}
          stageIdx={currentStageIdx}
          onNextStage={handleNextStage}
          onClose={() => setShowVictory(false)}
        />
      )}
    </div>
  );
}

