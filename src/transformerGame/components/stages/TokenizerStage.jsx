import { useState, useEffect, useRef } from 'react';
import { Sparkles, CheckCircle2, RotateCcw, ArrowRight, Zap, Target } from 'lucide-react';
import { cosineSimilarity, vectorMagnitude } from '../../core/vectorMath.js';
import { aiSound } from '../../aiAudioEngine.js';

export default function TokenizerStage({ stage, onStageComplete }) {
  // Vectors in 2D normalized space
  const kingVec = [0.75, 0.65];
  const manVec = [0.70, 0.20];
  const womanVec = [0.25, 0.20];
  const targetQueenVec = [0.30, 0.65];

  // User adjustable vector transformation [dx, dy]
  const [userDelta, setUserDelta] = useState({ x: -0.45, y: 0.45 });
  const [isCompleted, setIsCompleted] = useState(false);
  const [similarity, setSimilarity] = useState(0);

  // Compute resulting vector: King - Man + Woman (modified by user adjustments)
  // Baseline without adjustment: King - Man + Woman = [0.75 - 0.70 + 0.25, 0.65 - 0.20 + 0.20] = [0.30, 0.65]
  const currentResultVec = [
    kingVec[0] - manVec[0] + womanVec[0] + (userDelta.x + 0.45),
    kingVec[1] - manVec[1] + womanVec[1] + (userDelta.y - 0.45)
  ];

  useEffect(() => {
    const sim = cosineSimilarity(currentResultVec, targetQueenVec);
    setSimilarity(Math.max(0, Math.min(1, sim)));

    if (sim >= stage.targetSimilarity && !isCompleted) {
      setIsCompleted(true);
      aiSound.playVectorLock();
      onStageComplete(100);
    }
  }, [userDelta]);

  const handleSliderChange = (axis, val) => {
    aiSound.playTokenSnap(700 + Math.abs(val) * 300);
    setUserDelta(prev => ({ ...prev, [axis]: parseFloat(val) }));
  };

  const handleReset = () => {
    setUserDelta({ x: 0.1, y: -0.2 });
    setIsCompleted(false);
  };

  // Convert coordinate [-1, 1] to SVG viewBox [0, 400]
  const toSvgX = (x) => 200 + x * 150;
  const toSvgY = (y) => 200 - y * 150;

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      {/* Intro banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-2xl bg-cyan-950/30 border border-cyan-800/40">
        <div>
          <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
            Level 1: Semantic Vector Arithmetic
          </span>
          <h2 className="text-xl md:text-2xl font-bold font-mono text-white mt-0.5">
            Vector("King") - Vector("Man") + Vector("Woman") = ?
          </h2>
          <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-2xl">
            In Word2Vec & Transformer embedding layers, words with similar gender or semantic roles differ by a constant translation vector. Align your gender transformation vector until it lands on <strong>Queen</strong>.
          </p>
        </div>
        <div className="flex items-center gap-3 self-end md:self-auto">
          <div className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-center font-mono">
            <div className="text-[10px] uppercase text-slate-400">Cosine Similarity</div>
            <div className={`text-xl font-bold ${similarity >= 0.9 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {(similarity * 100).toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: 2D Vector Coordinate Plane (SVG) */}
        <div className="lg:col-span-2 bg-[#080d1a] border border-slate-800 rounded-2xl p-4 relative overflow-hidden shadow-2xl flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-2 px-2 text-xs font-mono text-slate-400">
            <span>2D Latent Embedding Space</span>
            <span className="text-cyan-400">Target Tolerance: &gt;90.0%</span>
          </div>

          <div className="relative w-full max-w-[440px] aspect-square bg-[#050811] rounded-xl border border-slate-800/80 p-2">
            <svg viewBox="0 0 400 400" className="w-full h-full select-none">
              {/* Grid lines */}
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                </pattern>
                <radialGradient id="queenTargetGlow">
                  <stop offset="0%" stopColor="rgba(234, 179, 8, 0.4)" />
                  <stop offset="100%" stopColor="rgba(234, 179, 8, 0)" />
                </radialGradient>
              </defs>
              <rect width="400" height="400" fill="url(#grid)" />

              {/* Axes */}
              <line x1="200" y1="0" x2="200" y2="400" stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="200" x2="400" y2="200" stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeDasharray="4 4" />

              {/* Vector Arrows from origin */}
              {/* King */}
              <line x1="200" y1="200" x2={toSvgX(kingVec[0])} y2={toSvgY(kingVec[1])} stroke="#38bdf8" strokeWidth="2" strokeOpacity="0.4" />
              {/* Man */}
              <line x1="200" y1="200" x2={toSvgX(manVec[0])} y2={toSvgY(manVec[1])} stroke="#64748b" strokeWidth="2" strokeOpacity="0.4" />
              {/* Woman */}
              <line x1="200" y1="200" x2={toSvgX(womanVec[0])} y2={toSvgY(womanVec[1])} stroke="#ec4899" strokeWidth="2" strokeOpacity="0.4" />

              {/* Target Queen Area */}
              <circle cx={toSvgX(targetQueenVec[0])} cy={toSvgY(targetQueenVec[1])} r="32" fill="url(#queenTargetGlow)" className="animate-pulse" />
              <circle cx={toSvgX(targetQueenVec[0])} cy={toSvgY(targetQueenVec[1])} r="18" fill="none" stroke="#eab308" strokeWidth="2" strokeDasharray="4 4" />

              {/* User Result Vector Point */}
              <line
                x1="200"
                y1="200"
                x2={toSvgX(currentResultVec[0])}
                y2={toSvgY(currentResultVec[1])}
                stroke={isCompleted ? '#10b981' : '#38bdf8'}
                strokeWidth="3"
                className="transition-all duration-75"
              />

              {/* Nodes */}
              {/* King Node */}
              <g transform={`translate(${toSvgX(kingVec[0])}, ${toSvgY(kingVec[1])})`}>
                <circle r="8" fill="#0284c7" stroke="#38bdf8" strokeWidth="2" />
                <text x="12" y="4" fill="#bae6fd" fontSize="11" fontFamily="monospace" fontWeight="bold">King</text>
              </g>

              {/* Man Node */}
              <g transform={`translate(${toSvgX(manVec[0])}, ${toSvgY(manVec[1])})`}>
                <circle r="7" fill="#475569" stroke="#94a3b8" strokeWidth="2" />
                <text x="12" y="4" fill="#cbd5e1" fontSize="11" fontFamily="monospace">Man</text>
              </g>

              {/* Woman Node */}
              <g transform={`translate(${toSvgX(womanVec[0])}, ${toSvgY(womanVec[1])})`}>
                <circle r="7" fill="#be185d" stroke="#f472b6" strokeWidth="2" />
                <text x="12" y="4" fill="#fbcfe8" fontSize="11" fontFamily="monospace">Woman</text>
              </g>

              {/* Queen Target Node */}
              <g transform={`translate(${toSvgX(targetQueenVec[0])}, ${toSvgY(targetQueenVec[1])})`}>
                <circle r="10" fill="#a16207" stroke="#facc15" strokeWidth="2.5" />
                <text x="14" y="5" fill="#fef08a" fontSize="12" fontFamily="monospace" fontWeight="bold">Target: Queen</text>
              </g>

              {/* Current Computed Node */}
              <g transform={`translate(${toSvgX(currentResultVec[0])}, ${toSvgY(currentResultVec[1])})`}>
                <circle
                  r="9"
                  fill={isCompleted ? '#059669' : '#0284c7'}
                  stroke={isCompleted ? '#34d399' : '#67e8f9'}
                  strokeWidth="3"
                  className="transition-all duration-75"
                />
                <text x="-35" y="-14" fill="#fff" fontSize="10" fontFamily="monospace" fontWeight="bold">
                  Result: [{currentResultVec[0].toFixed(2)}, {currentResultVec[1].toFixed(2)}]
                </text>
              </g>
            </svg>
          </div>
        </div>

        {/* Right: Controls & Vector Tuning */}
        <div className="bg-[#080d1a] border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-6">
          <div>
            <h3 className="text-sm font-mono font-bold text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              Gender Delta Weights
            </h3>

            {/* Slider X */}
            <div className="space-y-2 mb-5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">ΔX Dimension (Royalty/Power):</span>
                <span className="text-cyan-400 font-bold">{userDelta.x.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="-1.0"
                max="0.5"
                step="0.01"
                value={userDelta.x}
                onChange={(e) => handleSliderChange('x', e.target.value)}
                className="w-full accent-cyan-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
              />
            </div>

            {/* Slider Y */}
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">ΔY Dimension (Gender Subspace):</span>
                <span className="text-purple-400 font-bold">{userDelta.y.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.01"
                value={userDelta.y}
                onChange={(e) => handleSliderChange('y', e.target.value)}
                className="w-full accent-purple-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
              />
            </div>

            {/* Status card */}
            <div className={`p-4 rounded-xl border transition-all ${
              isCompleted
                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                : 'bg-slate-900 border-slate-800 text-slate-300'
            }`}>
              <div className="flex items-center gap-2 text-sm font-mono font-bold mb-1">
                {isCompleted ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>EMBEDDING ALIGNED! (+100 PTS)</span>
                  </>
                ) : (
                  <>
                    <Target className="w-4 h-4 text-amber-400" />
                    <span>Align vectors to ≥ 90%</span>
                  </>
                )}
              </div>
              <p className="text-xs text-slate-400">
                {isCompleted
                  ? 'Queen vector achieved! The model now understands that royal gender subtraction transfers between King/Queen and Prince/Princess.'
                  : 'Slide the ΔX and ΔY controls to compensate for the semantic shift from masculine to feminine royal coordinates.'}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleReset}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

