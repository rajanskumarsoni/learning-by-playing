import { useState } from 'react';
import {
  Brain, Volume2, VolumeX, HelpCircle,
  RotateCcw, Sparkles, Server, Lock, CheckCircle2,
  Target, ChevronDown, Briefcase, Award
} from 'lucide-react';
import { aiSound } from '../aiAudioEngine.js';
import { AI_LEVEL_MANAGERS } from '../core/levelsData.js';
import mentorAdaImg from '../../assets/mentor_ada.jpg';

export default function GameHeader({
  stages,
  currentStageIdx,
  unlockedStageIdx,
  completedStages,
  gameMode,
  onSwitchMode,
  onSelectStage,
  onOpenBriefing,
  onOpenWelcome,
  onOpenDesignation,
  onResetStage,
  onSwitchGame,
  score,
  streak
}) {
  const [muted, setMuted] = useState(aiSound.isMuted());
  const [isModeMenuOpen, setIsModeMenuOpen] = useState(false);

  const handleToggleSound = () => {
    const isMuted = aiSound.toggleMute();
    setMuted(isMuted);
    if (!isMuted) aiSound.playTokenSnap(1200);
  };

  const currentStage = stages[currentStageIdx] || stages[0];
  const currentManager = AI_LEVEL_MANAGERS[currentStageIdx] || AI_LEVEL_MANAGERS[0];
  const isCurrentPassed = completedStages?.has(currentStage.id) || currentStageIdx < unlockedStageIdx;

  const ranks = [
    { badge: '🔰', title: 'Cadet AI Engineer' },
    { badge: '🥉', title: 'Embeddings Specialist' },
    { badge: '🥈', title: 'Attention Architect' },
    { badge: '🥇', title: 'Staff Transformer Lead' },
    { badge: '💎', title: 'Principal Pre-Trainer' },
    { badge: '👑', title: 'Frontier AI Fellow' }
  ];
  const playerRank = ranks[Math.min(unlockedStageIdx, ranks.length - 1)];

  return (
    <div className="shrink-0 z-40 shadow-xl">
      {/* =================================================================== */}
      {/* 1. MASTER GAME HUD (PROFILE, MODE, TELEMETRY, AUDIO & GUIDE)        */}
      {/* =================================================================== */}
      <header className="glass-header px-3 sm:px-4 py-2 flex flex-nowrap items-center justify-between gap-2 border-b border-indigo-500/20">
        {/* Left: Profile Dossier, Mode Dropdown & Games Hub Switcher */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Player Profile & Career Designation Button */}
          <button
            onClick={() => {
              aiSound.playTokenSnap(900);
              if (onOpenDesignation) onOpenDesignation();
            }}
            className="flex items-center gap-2 p-1 -m-1 sm:px-2 rounded-2xl hover:bg-slate-900/90 border border-transparent hover:border-cyan-500/40 transition active:scale-95 cursor-pointer text-left group"
            title="Click to inspect AI Architect Career Dossier & Promotion SLA"
          >
            <div className="relative shrink-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-base font-black text-white shrink-0 group-hover:scale-105 transition">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <span className="absolute -bottom-1 -right-1 text-[11px] leading-none" title={playerRank.title}>
                {playerRank.badge}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-xs sm:text-sm tracking-wide text-white truncate font-display">
                  ATTENTION!
                </span>
                <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 hidden sm:inline">
                  AI Lab
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                <span className="text-cyan-300 font-bold truncate max-w-[125px] sm:max-w-[165px]">
                  {currentManager.currentJobTitle}
                </span>
                <span className="text-slate-600 hidden sm:inline">•</span>
                <span className="text-amber-300 font-bold hidden sm:inline">
                  {currentManager.baseSalary}
                </span>
              </div>
            </div>
          </button>

          {/* Compact Mode Selector Dropdown */}
          <div className="relative ml-1">
            <button
              onClick={() => {
                aiSound.playTokenSnap(800);
                setIsModeMenuOpen(!isModeMenuOpen);
              }}
              className="px-2.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-cyan-500/40 text-xs font-bold text-white shadow-md flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
              title="Switch AI Game Mode (Campaign vs Master Sandbox)"
            >
              <span className="text-sm">{gameMode === 'SANDBOX' ? '🧪' : '🎓'}</span>
              <div className="flex flex-col text-left leading-none">
                <span className="text-white text-xs font-black">
                  {gameMode === 'SANDBOX' ? 'Sandbox' : 'Campaign'}
                </span>
                <span className="text-[9px] text-cyan-300 font-mono mt-0.5">
                  {gameMode === 'SANDBOX' ? 'Freeform' : `Lvl ${currentStage.stageNumber}/6`}
                </span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-cyan-400 transition-transform ${isModeMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isModeMenuOpen && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-slate-900/98 backdrop-blur-2xl border border-cyan-500/40 rounded-2xl p-2 shadow-2xl z-50">
                <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                  Select AI Game Mode
                </div>
                <button
                  onClick={() => {
                    aiSound.playTokenSnap(900);
                    setIsModeMenuOpen(false);
                    if (onSwitchMode) onSwitchMode('CAMPAIGN');
                  }}
                  className={`w-full text-left p-2.5 rounded-xl transition flex items-start gap-2.5 my-0.5 ${
                    gameMode === 'CAMPAIGN'
                      ? 'bg-cyan-600/30 border border-cyan-500/50 text-white'
                      : 'hover:bg-slate-800/80 text-slate-300 hover:text-white'
                  }`}
                >
                  <span className="text-xl shrink-0 mt-0.5">🎓</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">Campaign Progression</span>
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-slate-800 text-cyan-300 border border-cyan-500/20">
                        6 Levels
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                      Pass each neural stage SLA to unlock the next level &amp; earn salary hikes
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    aiSound.playTokenSnap(950);
                    setIsModeMenuOpen(false);
                    if (onSwitchMode) onSwitchMode('SANDBOX');
                  }}
                  className={`w-full text-left p-2.5 rounded-xl transition flex items-start gap-2.5 my-0.5 ${
                    gameMode === 'SANDBOX'
                      ? 'bg-emerald-600/30 border border-emerald-500/50 text-white'
                      : 'hover:bg-slate-800/80 text-slate-300 hover:text-white'
                  }`}
                >
                  <span className="text-xl shrink-0 mt-0.5">🧪</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">Master LLM Sandbox</span>
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-slate-800 text-emerald-300 border border-emerald-500/20">
                        Freeform
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                      Type custom prompts and inspect live N×N attention heatmaps
                    </p>
                  </div>
                </button>

                {onSwitchGame && (
                  <div className="mt-2 pt-2 border-t border-slate-800">
                    <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-400 font-mono">
                      Switch Game Simulator
                    </div>
                    <button
                      onClick={() => {
                        setIsModeMenuOpen(false);
                        onSwitchGame('systemsaviour');
                      }}
                      className="w-full text-left p-2.5 rounded-xl transition flex items-start gap-2.5 my-0.5 bg-gradient-to-r from-indigo-950/60 to-purple-950/60 hover:from-indigo-900/80 hover:to-purple-900/80 border border-indigo-500/40 text-indigo-200 hover:text-white"
                    >
                      <span className="text-xl shrink-0 mt-0.5">⚡</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-indigo-300">System Saviour</span>
                          <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                            Cloud Sim
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-300 leading-tight mt-0.5">
                          Cloud Architecture &amp; Wave-Defense Simulator
                        </p>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* All Games Switcher Button */}
          {onSwitchGame && (
            <button
              onClick={() => onSwitchGame('systemsaviour', { openGameSelect: true })}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-950/80 to-cyan-950/80 hover:from-indigo-900 hover:to-cyan-900 border border-cyan-500/40 text-cyan-300 hover:text-white text-xs font-bold shadow-md transition active:scale-95 cursor-pointer"
              title="Open Standalone Game Selection Screen"
            >
              <span>🎮</span>
              <span>Games</span>
            </button>
          )}
        </div>

        {/* Center: Live Telemetry & SLA Target HUD */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto max-w-full pb-0.5 scrollbar-none shrink min-w-0">
          {/* SLA Target Pill */}
          <div className="glass-subpanel px-2.5 py-1 rounded-xl flex items-center gap-1.5 shrink-0">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shrink-0" />
            <span className="text-[11px] text-slate-400 whitespace-nowrap">SLA Target:</span>
            <span className="text-xs font-mono font-bold text-cyan-300 whitespace-nowrap">
              {currentStage.slaTargetLabel || 'Pass Objective'}
            </span>
          </div>

          {/* Score Pill */}
          <div className="glass-subpanel px-2.5 py-1 rounded-xl flex items-center gap-1.5 shrink-0 font-mono text-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-[11px] text-slate-400">XP:</span>
            <strong className="text-white">{score}</strong>
            {streak > 1 && <span className="text-amber-400 font-bold ml-1">🔥x{streak}</span>}
          </div>

          {/* Level Status Pill */}
          <div
            className={`hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-xl border text-[11px] font-bold shrink-0 ${
              isCurrentPassed
                ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                : 'bg-amber-950/50 border-amber-500/40 text-amber-300'
            }`}
          >
            <span>{isCurrentPassed ? '✅ SLA Cleared' : '🎯 In Progress'}</span>
          </div>
        </div>

        {/* Right: Audio, Reset & Ada Guide */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={onResetStage}
            className="p-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer"
            title="Reset current stage weights"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={handleToggleSound}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1 transition cursor-pointer ${
              muted
                ? 'bg-red-950/40 border-red-800/60 text-red-400'
                : 'bg-slate-900/90 border-slate-700 text-cyan-300 hover:text-white'
            }`}
            title={muted ? 'Unmute Procedural Audio' : 'Mute Audio'}
          >
            {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
            <span className="hidden sm:inline text-[10px]">{muted ? 'Muted' : 'Sound'}</span>
          </button>

          {/* Ada Guide Button */}
          <button
            onClick={() => {
              aiSound.playTokenSnap(950);
              if (onOpenWelcome) onOpenWelcome();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-cyan-500/40 text-cyan-300 hover:text-white text-xs font-bold transition active:scale-95 cursor-pointer"
            title="Open Ada's AI Transformer Guide & Modes"
          >
            <img
              src={mentorAdaImg}
              alt="Ada"
              className="w-6 h-6 rounded-full object-cover ring-1 ring-cyan-400"
            />
            <span className="hidden sm:inline text-[11px]">Guide</span>
          </button>
        </div>
      </header>

      {/* =================================================================== */}
      {/* 2. MISSION COMMAND DECK (PROGRESSIVE LOCKED LEVEL STEPPER & BRIEFING)*/}
      {/* =================================================================== */}
      <div className="glass-header px-3 sm:px-4 py-1.5 flex items-center justify-between text-xs overflow-x-auto gap-3 border-b border-indigo-500/20">
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {stages.map((stg, idx) => {
            const isUnlocked = gameMode === 'SANDBOX' || idx <= unlockedStageIdx;
            const isPassed = idx < unlockedStageIdx || completedStages?.has(stg.id);
            const isCurrent = idx === currentStageIdx;

            return (
              <button
                key={stg.id}
                disabled={!isUnlocked}
                onClick={() => {
                  if (!isUnlocked) return;
                  aiSound.playTokenSnap(600 + idx * 80);
                  onSelectStage(idx);
                }}
                title={
                  isUnlocked
                    ? `${stg.title}: ${stg.subtitle}`
                    : `🔒 Pass Level ${idx} to unlock this scenario`
                }
                className={`px-2.5 py-1 rounded-lg font-bold font-display tracking-wide text-xs transition flex items-center gap-1.5 shrink-0 ${
                  isCurrent
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-600/30 ring-1 ring-cyan-300/50'
                    : isPassed
                    ? 'bg-emerald-950/60 backdrop-blur text-emerald-300 border border-emerald-500/30 hover:bg-emerald-900/50 cursor-pointer'
                    : isUnlocked
                    ? 'glass-subpanel text-slate-300 hover:text-white cursor-pointer'
                    : 'bg-slate-950/30 text-slate-600 border border-slate-900/40 cursor-not-allowed opacity-50'
                }`}
              >
                {isPassed ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : isUnlocked ? (
                  <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                )}
                <span>{stg.title.split(':')[0]}</span>
                <span className="hidden xl:inline text-[10px] opacity-85">
                  • {stg.title.split(':')[1]?.trim()}
                </span>
              </button>
            );
          })}

          <button
            onClick={onOpenBriefing}
            className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-[11px] font-bold flex items-center gap-1.5 transition shrink-0 shadow-sm active:scale-95 cursor-pointer"
            title="Inspect mission objectives, beginner analogy, and SLA targets"
          >
            <Target className="w-3.5 h-3.5 text-cyan-400" />
            <span>Briefing</span>
          </button>
        </div>

        {/* Right: Career Dossier Quick Trigger */}
        <div className="flex items-center gap-2 shrink-0 ml-auto">
          <button
            onClick={onOpenDesignation}
            className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-[11px] font-bold flex items-center gap-1.5 transition shrink-0 cursor-pointer"
            title="Inspect Current AI Manager Dossier & Next Salary Hike"
          >
            <Briefcase className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Career &amp; Manager</span>
          </button>
        </div>
      </div>
    </div>
  );
}
