import { X, Play, BookOpen, Target, Sparkles, CheckCircle } from 'lucide-react';
import { aiSound } from '../aiAudioEngine.js';

export default function LevelBriefingModal({ stage, isOpen, onClose, onStart }) {
  if (!isOpen || !stage) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0b1021] border border-cyan-500/30 rounded-2xl max-w-2xl w-full p-6 text-slate-200 shadow-[0_0_50px_rgba(6,182,212,0.15)] relative overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Badge & Stage Number */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[11px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
            Stage {stage.stageNumber}: {stage.badge}
          </span>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold font-mono text-white mb-1">
          {stage.title}
        </h2>
        <p className="text-sm text-cyan-400/90 font-mono mb-4">
          {stage.subtitle}
        </p>

        {/* Story Section */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 mb-4 text-sm leading-relaxed text-slate-300">
          <p className="italic">"{stage.story}"</p>
        </div>

        {/* Mission Objectives */}
        <div className="mb-4">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
            <Target className="w-4 h-4 text-amber-400" /> Mission Objective
          </h3>
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200/90 text-sm font-sans">
            {stage.missionBrief}
          </div>
        </div>

        {/* Educational Takeaway */}
        <div className="mb-6">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-purple-400" /> Deep Learning Takeaway
          </h3>
          <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-200/90 text-sm">
            {stage.learningTakeaway}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
          <button
            onClick={() => {
              aiSound.playTokenSnap(980);
              onClose();
              if (onStart) onStart();
            }}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-mono font-bold text-sm shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Play className="w-4 h-4 fill-white" />
            INITIALIZE STAGE
          </button>
        </div>
      </div>
    </div>
  );
}

