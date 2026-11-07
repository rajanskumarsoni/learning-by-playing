import { Trophy, ArrowRight, Sparkles, Award } from 'lucide-react';
import { aiSound } from '../aiAudioEngine.js';

export default function VictoryCelebration({ stage, onNextStage, onClose }) {
  if (!stage) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0b1021] border border-emerald-500/40 rounded-2xl max-w-md w-full p-6 text-center text-slate-200 shadow-[0_0_50px_rgba(16,185,129,0.25)] relative overflow-hidden">
        {/* Confetti / Glow effects */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-slate-950 shadow-[0_0_30px_rgba(16,185,129,0.5)]">
          <Trophy className="w-9 h-9" />
        </div>

        <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
          STAGE {stage.stageNumber} MASTERED
        </span>

        <h3 className="text-2xl font-bold font-mono text-white mt-2 mb-1">
          {stage.title} Complete!
        </h3>

        <div className="flex items-center justify-center gap-1.5 text-xs font-mono text-emerald-400 mb-4">
          <Award className="w-4 h-4" />
          <span>Badge Unlocked: <strong>{stage.badge}</strong></span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed mb-6 px-4">
          {stage.learningTakeaway}
        </p>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors"
          >
            Review Stage
          </button>
          <button
            onClick={() => {
              aiSound.playTokenSnap(1000);
              onNextStage();
            }}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-white font-mono font-bold text-xs shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
          >
            <span>Proceed to Next Stage</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

