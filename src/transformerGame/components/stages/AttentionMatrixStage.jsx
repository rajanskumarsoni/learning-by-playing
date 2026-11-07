import { useState, useEffect } from 'react';
import { CheckCircle2, RotateCcw, Zap, Sparkles, AlertTriangle } from 'lucide-react';
import { softmax } from '../../core/vectorMath.js';
import { aiSound } from '../../aiAudioEngine.js';

export default function AttentionMatrixStage({ stage, onStageComplete }) {
  const sentence = stage.sentence; // ['The', 'server', 'crashed', 'because', 'it', 'ran', 'out', 'of', 'memory']
  const focusIdx = stage.focusTokenIndex; // 4 ("it")
  const targetIdx = stage.targetTokenIndex; // 1 ("server")

  // Query weight tuning parameters
  // qWeight: how much 'it' focuses on hardware/subject vs context/predicate
  const [qSubjectFocus, setQSubjectFocus] = useState(0.2);
  const [kRelevance, setKRelevance] = useState(0.3);
  const [isCompleted, setIsCompleted] = useState(false);

  // Compute raw logits for 'it' attending to each word in sentence
  // Base affinity:
  // 0: The (0.1), 1: server (scaled by subject focus), 2: crashed (0.3), 3: because (0.1),
  // 4: it (0.2), 5: ran (0.2), 6: out (0.1), 7: of (0.1), 8: memory (scaled inversely or rival)
  const rawLogits = [
    0.2,
    1.2 + (qSubjectFocus * 4.5) + (kRelevance * 2.5), // server
    1.0 + (1 - qSubjectFocus) * 1.5,                 // crashed
    0.4,                                             // because
    0.6,                                             // it
    0.5,                                             // ran
    0.2,                                             // out
    0.2,                                             // of
    1.5 + (1 - qSubjectFocus) * 3.0                  // memory (competing trap antecedent)
  ];

  const attentionProbs = softmax(rawLogits, 1.0);
  const serverAttention = attentionProbs[targetIdx];
  const memoryAttention = attentionProbs[8];

  useEffect(() => {
    aiSound.playAttentionBeam(serverAttention);
    if (serverAttention >= 0.75 && !isCompleted) {
      setIsCompleted(true);
      aiSound.playWinFanfare();
      onStageComplete(100);
    }
  }, [qSubjectFocus, kRelevance]);

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      {/* Intro banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-2xl bg-amber-950/30 border border-amber-800/40">
        <div>
          <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
            Level 3: Scaled Dot-Product Self-Attention
          </span>
          <h2 className="text-xl md:text-2xl font-bold font-mono text-white mt-0.5">
            Attention(Q, K, V) = Softmax((Q · Kᵀ) / √dₖ) · V
          </h2>
          <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-2xl">
            The pronoun <span className="text-amber-400 font-bold">"it"</span> is syntactically ambiguous. Did the <strong>server</strong> crash, or did the <strong>memory</strong> crash? Tune Query and Key projections so "it" binds its attention beam to the correct subject.
          </p>
        </div>
        <div className="flex items-center gap-3 self-end md:self-auto font-mono">
          <div className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-center">
            <div className="text-[10px] uppercase text-slate-400">Attention on "server"</div>
            <div className={`text-xl font-bold ${serverAttention >= 0.75 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {(serverAttention * 100).toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      {/* Main interactive area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Sentence Tokens & Attention Laser Arcs (SVG) */}
        <div className="lg:col-span-2 bg-[#080d1a] border border-slate-800 rounded-2xl p-5 space-y-6 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              Dynamic Attention Beams (Source: Token #4 "it")
            </span>
            <span className="text-amber-400">Target: ≥ 75.0% on "server"</span>
          </div>

          {/* SVG Attention Arc Visualizer */}
          <div className="w-full h-48 bg-[#050811] rounded-xl border border-slate-800/80 p-2 overflow-hidden relative select-none">
            <svg viewBox="0 0 720 180" className="w-full h-full">
              <defs>
                <linearGradient id="beamGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.9" />
                </linearGradient>
                <linearGradient id="dangerGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#f97316" stopOpacity="0.8" />
                </linearGradient>
              </defs>

              {/* Horizontal Token Line */}
              <line x1="20" y1="130" x2="700" y2="130" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

              {/* Attention Arcs from "it" (x = 360) to other tokens */}
              {sentence.map((tok, i) => {
                const startX = 40 + focusIdx * 72;
                const endX = 40 + i * 72;
                const score = attentionProbs[i];
                if (i === focusIdx || score < 0.05) return null;

                const midY = 130 - Math.min(100, Math.abs(endX - startX) * 0.45 * (score * 1.5));
                const isTarget = i === targetIdx;
                const isMemoryTrap = i === 8;

                return (
                  <path
                    key={i}
                    d={`M ${startX} 130 Q ${(startX + endX) / 2} ${midY} ${endX} 130`}
                    fill="none"
                    stroke={isTarget ? 'url(#beamGrad)' : (isMemoryTrap ? 'url(#dangerGrad)' : 'rgba(148, 163, 184, 0.25)')}
                    strokeWidth={Math.max(1, score * 9)}
                    strokeDasharray={isTarget ? 'none' : '4 4'}
                    className="transition-all duration-150"
                  />
                );
              })}

              {/* Token Node Points */}
              {sentence.map((word, i) => {
                const x = 40 + i * 72;
                const isFocus = i === focusIdx;
                const isTarget = i === targetIdx;
                const prob = attentionProbs[i];

                return (
                  <g key={i} transform={`translate(${x}, 130)`}>
                    {/* Circle Node */}
                    <circle
                      r={isFocus ? 12 : (isTarget ? 10 : 7)}
                      fill={isFocus ? '#f59e0b' : (isTarget ? '#06b6d4' : '#1e293b')}
                      stroke={isFocus ? '#fef08a' : (isTarget ? '#67e8f9' : '#475569')}
                      strokeWidth={isFocus || isTarget ? 2.5 : 1.5}
                      className="transition-all duration-150"
                    />

                    {/* Word Label */}
                    <text
                      y="26"
                      textAnchor="middle"
                      fill={isFocus ? '#fef08a' : (isTarget ? '#a5f3fc' : '#cbd5e1')}
                      fontSize={isFocus || isTarget ? '12' : '10'}
                      fontFamily="monospace"
                      fontWeight={isFocus || isTarget ? 'bold' : 'normal'}
                    >
                      {word}
                    </text>

                    {/* Attention percentage pill */}
                    <text
                      y="-18"
                      textAnchor="middle"
                      fill={prob >= 0.5 ? '#34d399' : '#94a3b8'}
                      fontSize="9"
                      fontFamily="monospace"
                    >
                      {(prob * 100).toFixed(0)}%
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Attention Heatmap Bar */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-mono text-slate-400 uppercase">
              Live Attention Heatmap (Softmax Distribution across Sequence):
            </div>
            <div className="grid grid-cols-9 gap-1 text-center font-mono text-[10px]">
              {sentence.map((w, idx) => {
                const p = attentionProbs[idx];
                const intensity = Math.min(1, p * 1.5);
                return (
                  <div
                    key={idx}
                    className="p-1 rounded-md border border-slate-800 transition-all"
                    style={{
                      backgroundColor: `rgba(234, 179, 8, ${0.1 + intensity * 0.7})`,
                      color: intensity > 0.4 ? '#fff' : '#94a3b8'
                    }}
                  >
                    <div className="font-bold truncate">{w}</div>
                    <div className="text-[9px]">{(p * 100).toFixed(0)}%</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Q / K Sliders */}
        <div className="bg-[#080d1a] border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-6">
          <div className="space-y-6">
            <h3 className="text-sm font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Q / K Projection Sliders
            </h3>

            {/* Slider 1: Query Subject Focus */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Query (W_Q) Subject Affinity:</span>
                <span className="text-amber-400 font-bold">{qSubjectFocus.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.02"
                value={qSubjectFocus}
                onChange={(e) => setQSubjectFocus(parseFloat(e.target.value))}
                className="w-full accent-amber-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
              />
              <span className="text-[10px] text-slate-500">
                Increases query weight matching noun subjects rather than predicates.
              </span>
            </div>

            {/* Slider 2: Key Relevance Filter */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Key (W_K) Hardware Relevance:</span>
                <span className="text-cyan-400 font-bold">{kRelevance.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.02"
                value={kRelevance}
                onChange={(e) => setKRelevance(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
              />
              <span className="text-[10px] text-slate-500">
                Boosts Keys of physical system entities over consumable resources.
              </span>
            </div>

            {/* Warning or Success box */}
            {memoryAttention > 0.4 && !isCompleted && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs font-mono flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>Coreference Trap: Too much attention on "memory". Increase Subject Affinity so "it" routes to "server".</span>
              </div>
            )}

            <div className={`p-4 rounded-xl border transition-all ${
              isCompleted
                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                : 'bg-slate-900 border-slate-800 text-slate-300'
            }`}>
              <div className="flex items-center gap-2 text-sm font-mono font-bold mb-1">
                {isCompleted ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>COREFERENCE RESOLVED! (+100 PTS)</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>Reach ≥ 75% on "server"</span>
                  </>
                )}
              </div>
              <p className="text-xs text-slate-400">
                {isCompleted
                  ? 'The attention mechanism has successfully mapped the ambiguous pronoun "it" directly to "server", allowing the Value vector to pass downstream!'
                  : 'Tune both sliders to elevate the Q · K product of ("it", "server") above all competing words.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setQSubjectFocus(0.1);
              setKRelevance(0.2);
              setIsCompleted(false);
            }}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono flex items-center gap-1.5 transition-colors self-start"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Weights
          </button>
        </div>
      </div>
    </div>
  );
}

