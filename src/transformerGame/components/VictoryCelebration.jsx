import { useEffect, useRef } from 'react';
import { Trophy, ArrowRight, Award, X } from 'lucide-react';
import { aiSound } from '../aiAudioEngine.js';
import { AI_LEVEL_MANAGERS } from '../core/levelsData.js';
import { getManagerAvatar } from '../core/gameAssets.js';

function ConfettiCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const colors = ['#f59e0b', '#10b981', '#38bdf8', '#fbbf24', '#ec4899', '#8b5cf6', '#ffffff'];
    const particles = Array.from({ length: 85 }).map(() => ({
      x: width * 0.5 + (Math.random() - 0.5) * 140,
      y: height * 0.35,
      vx: (Math.random() - 0.5) * 18,
      vy: -Math.random() * 16 - 4,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 14,
      wobble: Math.random() * 10,
      opacity: 1
    }));

    let animId;
    const start = Date.now();
    const render = () => {
      const elapsed = Date.now() - start;
      ctx.clearRect(0, 0, width, height);
      let alive = false;
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.38;
        p.vx *= 0.98;
        p.rotation += p.rotationSpeed;
        p.wobble += 0.12;
        if (elapsed > 2000) p.opacity = Math.max(0, 1 - (elapsed - 2000) / 1600);
        if (p.opacity > 0 && p.y < height + 40) {
          alive = true;
          ctx.save();
          ctx.translate(p.x + Math.sin(p.wobble) * 5, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.globalAlpha = p.opacity;
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
          ctx.restore();
        }
      }
      if (alive && elapsed < 3800) animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 z-50 pointer-events-none w-full h-full" />;
}

export default function VictoryCelebration({ stage, stageIdx = 0, onNextStage, onClose }) {
  if (!stage) return null;

  const manager = AI_LEVEL_MANAGERS[stageIdx] || AI_LEVEL_MANAGERS[0];
  const nextManager = AI_LEVEL_MANAGERS[stageIdx + 1] || null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl animate-in fade-in duration-200 overflow-y-auto">
      <ConfettiCanvas />
      <div className="relative w-full max-w-xl rounded-3xl bg-slate-900/98 border-2 border-emerald-400 p-6 sm:p-7 shadow-[0_0_80px_rgba(16,185,129,0.5)] text-slate-100 space-y-5 z-10 overflow-hidden my-auto max-h-[92vh] overflow-y-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏆</span>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                Official Promotion &amp; Compensation Hike
              </span>
              <h2 className="text-base sm:text-lg font-black text-white font-display mt-0.5">
                {stage.title} Conquered!
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Manager Speech Callout Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 to-indigo-950/50 border border-indigo-500/30 flex items-start gap-4">
          <div className="relative shrink-0">
            <img
              src={getManagerAvatar(manager.avatarKey)}
              alt={manager.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-contain bg-slate-900/80 border-2 border-emerald-400 shadow-xl"
            />
            <span className="absolute -bottom-1 -right-1 text-sm bg-slate-900 rounded-full p-0.5 shadow">
              {manager.snackEmoji}
            </span>
          </div>
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-black text-white uppercase font-display">{manager.name}</span>
              <span className="text-[10px] text-indigo-300 font-semibold font-mono">({manager.roleTag})</span>
            </div>
            <div className="text-xs font-black text-emerald-300 leading-tight">
              &ldquo;{manager.congratsTitle}&rdquo;
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed italic">
              &ldquo;{manager.congratsSpeech}&rdquo;
            </p>
          </div>
        </div>

        {/* Official Promotion Notice & Salary Hike Box */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border-2 border-emerald-500/50 space-y-3">
          <div className="text-[10px] font-black uppercase tracking-wider text-emerald-400 font-mono flex items-center justify-between">
            <span>OFFICIAL NOTICE OF PROMOTION &amp; SALARY INCREASE</span>
            <span className="flex items-center gap-1 text-amber-300">
              <Award className="w-3.5 h-3.5" />
              <span>{stage.badge}</span>
            </span>
          </div>

          {/* Job Title Transition */}
          <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-mono">Previous Role</div>
              <div className="font-semibold text-slate-300 line-through text-[11px]">{manager.currentJobTitle}</div>
            </div>
            <div className="text-emerald-400 text-lg font-black">➔</div>
            <div className="text-right">
              <div className="text-[10px] text-emerald-400 uppercase font-mono font-bold">PROMOTED TITLE</div>
              <div className="font-extrabold text-cyan-300 text-xs sm:text-sm">{manager.promotedJobTitle}</div>
            </div>
          </div>

          {/* Salary Hike Breakdown */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="text-[9px] text-slate-400 uppercase font-mono">Old Salary</div>
              <div className="text-xs font-bold text-slate-300 mt-0.5">{manager.baseSalary}</div>
            </div>
            <div className="p-2 rounded-xl bg-emerald-950/80 border border-emerald-500/60 ring-1 ring-emerald-400/40">
              <div className="text-[9px] text-emerald-400 uppercase font-mono font-bold">SALARY HIKE</div>
              <div className="text-xs font-black text-emerald-300 mt-0.5">{manager.hikeAmount}</div>
            </div>
            <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-500/50">
              <div className="text-[9px] text-cyan-400 uppercase font-mono font-bold">New Base Pay</div>
              <div className="text-xs font-black text-white mt-0.5">{manager.promotedSalary}</div>
            </div>
          </div>
        </div>

        {/* Next Level & Next Manager Intel Warning */}
        {nextManager && stageIdx < 5 ? (
          <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-amber-500/40 flex items-center gap-3">
            <img
              src={getManagerAvatar(nextManager.avatarKey)}
              alt={nextManager.name}
              className="w-12 h-12 rounded-xl object-contain bg-slate-900 border border-amber-400/50 shrink-0"
            />
            <div className="space-y-0.5 text-xs min-w-0">
              <div className="text-[10px] font-black uppercase tracking-wider text-amber-400 font-mono">
                Unlocked Next: Level {stageIdx + 2} • {nextManager.name} ({nextManager.roleTag})
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">
                {manager.nextManagerWarning}
              </p>
            </div>
          </div>
        ) : (
          <div className="p-3.5 rounded-2xl bg-amber-950/60 border border-amber-400 text-xs text-amber-200">
            👑 <strong>Chief Frontier AI Architect Status Attained!</strong> You have conquered all 6 Transformer training stages and unlocked the Master LLM Sandbox Studio!
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={onClose}
            className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
          >
            Replay Level
          </button>
          <button
            onClick={() => {
              aiSound.playTokenSnap(1000);
              onNextStage();
            }}
            className="flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-2 active:scale-95 transition ring-2 ring-emerald-200 cursor-pointer"
          >
            <span>
              {stageIdx < 5
                ? `Accept Promotion & View Level ${stageIdx + 2} Problem & Targets →`
                : 'Enter Master LLM Sandbox Studio →'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
