import { X, Play, BookOpen, Target, Sparkles, Lightbulb, Building2, CheckCircle2 } from 'lucide-react';
import { aiSound } from '../aiAudioEngine.js';
import mentorAdaImg from '../../assets/mentor_ada.jpg';

export default function LevelBriefingModal({ stage, isOpen, fromWin = false, onClose, onStart }) {
  if (!isOpen || !stage) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative max-w-3xl w-full bg-slate-900 border border-cyan-500/40 rounded-3xl p-6 sm:p-8 text-slate-100 shadow-[0_0_60px_rgba(6,182,212,0.2)] my-auto max-h-[92vh] overflow-y-auto space-y-5">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 transition cursor-pointer"
          title="Close Briefing"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Celebratory Banner when advancing after winning previous level */}
        {fromWin && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/90 via-slate-900 to-teal-950/90 border border-emerald-500/50 flex items-center justify-between text-xs text-emerald-300 shadow-xl">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🏆</span>
              <div>
                <div className="font-bold text-white text-xs sm:text-sm">
                  Level {stage.stageNumber - 1} Conquered! Incoming {stage.title} Challenge
                </div>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Examine the problem scenario, beginner analogy, and SLA targets below before entering the arena.
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-block text-[10px] uppercase font-mono font-black px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shrink-0">
              Problem &amp; Targets
            </span>
          </div>
        )}

        {/* Ada Mentor Header Card */}
        <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-gradient-to-r from-indigo-950/80 via-slate-900 to-cyan-950/80 border border-cyan-500/40 shadow-xl">
          <img
            src={mentorAdaImg}
            alt="Ada Chief AI Scientist"
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover ring-2 ring-cyan-400 shrink-0 shadow-lg"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 font-bold">
                Stage {stage.stageNumber} • {stage.badge}
              </span>
              {stage.concept && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                  {stage.concept}
                </span>
              )}
            </div>
            <h2 className="text-lg sm:text-2xl font-black text-white font-display mt-1">
              {stage.title}
            </h2>
            <p className="text-xs sm:text-sm text-cyan-300 font-mono">
              {stage.subtitle}
            </p>
          </div>
        </div>

        {/* Crisis Story & Mission Objective */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="text-[10px] font-mono uppercase tracking-wider text-rose-400 font-bold flex items-center gap-1.5">
              <span>🚨 The Neural Bottleneck Crisis</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {stage.story}
            </p>
            <div className="pt-2 border-t border-slate-800/80">
              <div className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold mb-1 flex items-center gap-1">
                <Target className="w-3.5 h-3.5" />
                <span>Your Mission Objective:</span>
              </div>
              <p className="text-xs text-amber-200/90 leading-relaxed">
                {stage.missionBrief}
              </p>
            </div>
          </div>

          {/* SLA Target Box */}
          <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/40 flex flex-col justify-between space-y-3">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
                🎯 SLA Target To Unlock Next Level
              </div>
              <div className="text-base sm:text-lg font-black font-mono text-white mt-2">
                {stage.slaTargetLabel || 'Complete Stage Objective'}
              </div>
              <p className="text-[11px] text-slate-300 mt-1.5 leading-snug">
                Meet this target in the simulator to earn your salary promotion and unlock Level {Math.min(7, stage.stageNumber + 1)}.
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-emerald-300 font-mono flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Reward: +100 XP &amp; Career Hike</span>
            </div>
          </div>
        </div>

        {/* Beginner Analogy & Industry Case Study */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {stage.beginnerAnalogy && (
            <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-1.5">
              <div className="text-[10px] font-mono uppercase tracking-wider text-amber-300 font-bold flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                <span>Real-World Beginner Analogy</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {stage.beginnerAnalogy}
              </p>
            </div>
          )}

          {stage.caseStudyStory && (
            <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 space-y-1.5">
              <div className="text-[10px] font-mono uppercase tracking-wider text-purple-300 font-bold flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-purple-400" />
                <span>Industry Case Study: {stage.caseStudyCompany}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {stage.caseStudyStory}
              </p>
            </div>
          )}
        </div>

        {/* Step-by-Step Hints */}
        {Array.isArray(stage.hints) && stage.hints.length > 0 && (
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 font-bold flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span>Ada&apos;s Tactical Walkthrough Hints</span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {stage.hints.map((h, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-cyan-400 font-mono font-bold">{i + 1}.</span>
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Button */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            onClick={() => {
              aiSound.playTokenSnap(980);
              onClose();
              if (onStart) onStart();
            }}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-400 via-teal-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black text-xs sm:text-sm shadow-[0_0_25px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2 transition-all active:scale-95 ring-2 ring-cyan-200 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>Enter {stage.title.split(':')[0]} Arena &rarr;</span>
          </button>
        </div>
      </div>
    </div>
  );
}
