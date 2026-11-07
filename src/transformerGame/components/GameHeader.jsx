import { useState } from 'react';
import {
  Brain, Zap, Volume2, VolumeX, HelpCircle,
  RotateCcw, Sparkles, ChevronRight, Server, Play
} from 'lucide-react';
import { aiSound } from '../aiAudioEngine.js';

export default function GameHeader({
  stages,
  currentStageIdx,
  onSelectStage,
  onOpenBriefing,
  onResetStage,
  onSwitchGame,
  score,
  streak
}) {
  const [muted, setMuted] = useState(aiSound.isMuted());

  const handleToggleSound = () => {
    const isMuted = aiSound.toggleMute();
    setMuted(isMuted);
    if (!isMuted) aiSound.playTokenSnap(1200);
  };

  const currentStage = stages[currentStageIdx];

  return (
    <header className="w-full bg-[#0d1224]/90 backdrop-blur-md border-b border-cyan-900/40 px-4 py-3 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Branding & Game Switcher */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-400/40 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
            <Brain className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-wider font-mono text-white flex items-center gap-2">
                ATTENTION!
                <span className="text-[10px] uppercase font-sans tracking-widest px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  AI Transformer
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              {currentStage.title} — <span className="text-slate-300">{currentStage.subtitle}</span>
            </p>
          </div>

          {/* Quick Switcher Buttons: All Games Hub & System Saviour */}
          {onSwitchGame && (
            <div className="flex items-center gap-1.5 ml-2">
              <button
                onClick={() => onSwitchGame('systemsaviour', { openGameSelect: true })}
                className="px-2.5 py-1 text-xs rounded-lg bg-gradient-to-r from-indigo-950/90 to-cyan-950/90 hover:from-indigo-900 hover:to-cyan-900 text-cyan-300 hover:text-white border border-cyan-500/40 flex items-center gap-1.5 transition-all shadow-sm font-bold"
                title="View All Games & Switch Simulator"
              >
                <span>🎮</span>
                <span className="hidden sm:inline">All Games</span>
              </button>
              <button
                onClick={() => onSwitchGame('systemsaviour')}
                className="px-2.5 py-1 text-xs rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 flex items-center gap-1.5 transition-all shadow-sm group"
                title="Switch to System Saviour (Distributed Systems Simulator)"
              >
                <Server className="w-3.5 h-3.5 text-indigo-400 group-hover:scale-110 transition-transform" />
                <span className="hidden md:inline">System Saviour</span>
              </button>
            </div>
          )}
        </div>

        {/* Center: Stage Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none max-w-full">
          {stages.map((stg, idx) => {
            const isActive = idx === currentStageIdx;
            return (
              <button
                key={stg.id}
                onClick={() => {
                  aiSound.playTokenSnap(600 + idx * 80);
                  onSelectStage(idx);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_12px_rgba(6,182,212,0.4)] font-bold scale-105'
                    : 'bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <span>#{stg.stageNumber}</span>
                <span className="hidden lg:inline">{stg.title}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Controls & Score */}
        <div className="flex items-center gap-2">
          {/* Telemetry pill */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-900/80 border border-slate-800 font-mono text-xs text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Score: <strong className="text-white">{score}</strong></span>
            {streak > 1 && (
              <span className="text-amber-400 font-bold ml-1">🔥 x{streak}</span>
            )}
          </div>

          {/* Reset Stage */}
          <button
            onClick={onResetStage}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            title="Reset current stage"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Mission Briefing Modal */}
          <button
            onClick={onOpenBriefing}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-cyan-950/60 text-cyan-400 border border-cyan-800/50 hover:border-cyan-500 transition-colors flex items-center gap-1 text-xs px-2.5 font-mono"
            title="Open Mission Briefing & Educational Guide"
          >
            <HelpCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Briefing</span>
          </button>

          {/* Audio Mute Toggle */}
          <button
            onClick={handleToggleSound}
            className={`p-1.5 rounded-lg border transition-colors ${
              muted
                ? 'bg-red-950/40 border-red-800/60 text-red-400'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white'
            }`}
            title={muted ? 'Unmute Procedural Audio' : 'Mute Audio'}
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
}

