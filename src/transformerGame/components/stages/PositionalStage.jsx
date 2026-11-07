import { useState, useEffect } from 'react';
import { CheckCircle2, RotateCcw, Clock, Sparkles, Activity } from 'lucide-react';
import { aiSound } from '../../aiAudioEngine.js';

export default function PositionalStage({ stage, onStageComplete }) {
  const targetSentence = ['The', 'firewall', 'blocked', 'the', 'malicious', 'exploit'];

  // Start with scrambled tokens
  const [frequency, setFrequency] = useState(0.25);
  const [phase, setPhase] = useState(1.4);
  const [isCompleted, setIsCompleted] = useState(false);
  const [alignedCount, setAlignedCount] = useState(0);

  // Compute token positions based on sinusoidal waves
  // Correct resonance is when frequency ~ 1.0 and phase ~ 0.0
  const freqDist = Math.abs(frequency - 1.0);
  const phaseDist = Math.abs(phase - 0.0);
  const accuracy = Math.max(0, 1 - (freqDist * 0.7 + phaseDist * 0.3));

  // Determine current ordering permutation based on accuracy
  const currentTokens = [...targetSentence];
  if (accuracy < 0.3) {
    // Heavily scrambled
    currentTokens[0] = 'blocked';
    currentTokens[1] = 'exploit';
    currentTokens[2] = 'The';
    currentTokens[3] = 'malicious';
    currentTokens[4] = 'the';
    currentTokens[5] = 'firewall';
  } else if (accuracy < 0.6) {
    // Partially scrambled
    currentTokens[0] = 'The';
    currentTokens[1] = 'blocked';
    currentTokens[2] = 'firewall';
    currentTokens[3] = 'the';
    currentTokens[4] = 'exploit';
    currentTokens[5] = 'malicious';
  } else if (accuracy < 0.88) {
    // Almost ordered
    currentTokens[0] = 'The';
    currentTokens[1] = 'firewall';
    currentTokens[2] = 'blocked';
    currentTokens[3] = 'the';
    currentTokens[4] = 'exploit';
    currentTokens[5] = 'malicious';
  }

  // Count correctly placed tokens
  const correct = currentTokens.filter((t, i) => t === targetSentence[i]).length;

  useEffect(() => {
    setAlignedCount(correct);
    if (accuracy >= 0.88 && !isCompleted) {
      setIsCompleted(true);
      aiSound.playWinFanfare();
      onStageComplete(100);
    }
  }, [frequency, phase]);

  const handleFreqChange = (val) => {
    aiSound.playTokenSnap(400 + val * 500);
    setFrequency(parseFloat(val));
  };

  const handlePhaseChange = (val) => {
    aiSound.playTokenSnap(500 + val * 200);
    setPhase(parseFloat(val));
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      {/* Intro banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-2xl bg-purple-950/30 border border-purple-800/40">
        <div>
          <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-widest">
            Level 2: Sinusoidal Positional Encoding
          </span>
          <h2 className="text-xl md:text-2xl font-bold font-mono text-white mt-0.5">
            PE(pos, 2i) = sin(pos / 10000^(2i/d))
          </h2>
          <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-2xl">
            Because Transformers process all words at the exact same millisecond, they have no concept of word order without continuous sinusoidal timestamps. Tune the wave frequency and phase to reassemble the sentence.
          </p>
        </div>
        <div className="flex items-center gap-3 self-end md:self-auto font-mono">
          <div className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-center">
            <div className="text-[10px] uppercase text-slate-400">Order Resonance</div>
            <div className={`text-xl font-bold ${isCompleted ? 'text-emerald-400' : 'text-purple-400'}`}>
              {(accuracy * 100).toFixed(0)}%
            </div>
          </div>
        </div>
      </div>

      {/* Main interactive area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Waveform & Token Stream */}
        <div className="lg:col-span-2 bg-[#080d1a] border border-slate-800 rounded-2xl p-5 space-y-6">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-purple-400" />
              Positional Phase Waveform
            </span>
            <span>Target Sequence: {correct} / 6 Locked</span>
          </div>

          {/* Canvas Wave Visualizer (SVG) */}
          <div className="w-full h-36 bg-[#050811] rounded-xl border border-slate-800/80 p-2 overflow-hidden relative">
            <svg viewBox="0 0 600 120" className="w-full h-full">
              <defs>
                <linearGradient id="waveGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#818cf8" />
                  <stop offset="50%" stopColor="#c084fc" />
                  <stop offset="100%" stopColor="#38bdf8" />
                </linearGradient>
              </defs>

              {/* Center Line */}
              <line x1="0" y1="60" x2="600" y2="60" stroke="rgba(255,255,255,0.1)" strokeDasharray="4 4" />

              {/* Sine Wave */}
              <path
                d={`M 0 ${60 + Math.sin(phase) * 40 * frequency} ` +
                  Array.from({ length: 60 }).map((_, i) => {
                    const x = i * 10;
                    const y = 60 + Math.sin((i * 0.15 * frequency) + phase) * 45;
                    return `L ${x} ${y}`;
                  }).join(' ')}
                fill="none"
                stroke="url(#waveGrad)"
                strokeWidth="2.5"
                className="transition-all duration-75"
              />

              {/* Target Resonance Markers */}
              {targetSentence.map((_, idx) => (
                <circle
                  key={idx}
                  cx={50 + idx * 95}
                  cy={60 + Math.sin((idx * 1.5 * frequency) + phase) * 45}
                  r="5"
                  fill="#c084fc"
                  stroke="#fff"
                  strokeWidth="1.5"
                />
              ))}
            </svg>
          </div>

          {/* Tokens display */}
          <div className="space-y-2">
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              Token Sequence Stream (Order of Execution):
            </div>
            <div className="flex flex-wrap gap-2.5">
              {currentTokens.map((tok, idx) => {
                const isCorrect = tok === targetSentence[idx];
                return (
                  <div
                    key={idx}
                    className={`px-4 py-3 rounded-xl border font-mono text-sm transition-all duration-300 flex flex-col items-center gap-1 shadow-lg ${
                      isCorrect
                        ? 'bg-purple-950/40 border-purple-500/60 text-purple-200 scale-105'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span className="text-[10px] text-slate-500 font-bold">POS #{idx}</span>
                    <span className="font-bold text-base text-white">{tok}</span>
                    <span className={`text-[10px] ${isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                      {isCorrect ? '✓ ALIGNED' : 'MISMATCH'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Wave Dials */}
        <div className="bg-[#080d1a] border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-6">
          <div className="space-y-6">
            <h3 className="text-sm font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-400" />
              Frequency & Phase Modulation
            </h3>

            {/* Frequency Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Harmonic Frequency (ω):</span>
                <span className="text-purple-400 font-bold">{frequency.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="2.0"
                step="0.05"
                value={frequency}
                onChange={(e) => handleFreqChange(e.target.value)}
                className="w-full accent-purple-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
              />
              <span className="text-[10px] text-slate-500">Target frequency resonance ~ 1.00x</span>
            </div>

            {/* Phase Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Phase Offset (θ):</span>
                <span className="text-cyan-400 font-bold">{phase.toFixed(2)} rad</span>
              </div>
              <input
                type="range"
                min="-2.0"
                max="2.0"
                step="0.05"
                value={phase}
                onChange={(e) => handlePhaseChange(e.target.value)}
                className="w-full accent-cyan-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
              />
              <span className="text-[10px] text-slate-500">Target phase alignment ~ 0.00 rad</span>
            </div>

            {/* Status Feedback */}
            <div className={`p-4 rounded-xl border transition-all ${
              isCompleted
                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                : 'bg-slate-900 border-slate-800 text-slate-300'
            }`}>
              <div className="flex items-center gap-2 text-sm font-mono font-bold mb-1">
                {isCompleted ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>POSITIONS STABILIZED! (+100 PTS)</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-4 h-4 text-purple-400" />
                    <span>Tune waves until all 6 lock</span>
                  </>
                )}
              </div>
              <p className="text-xs text-slate-400">
                {isCompleted
                  ? 'Sentence correctly sequenced! The parallel attention engine can now compute token distances accurately.'
                  : 'Adjust Frequency and Phase until the wave coordinates assign the tokens to their proper grammatical slots.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setFrequency(0.25);
              setPhase(1.4);
              setIsCompleted(false);
            }}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono flex items-center gap-1.5 transition-colors self-start"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Scramble Again
          </button>
        </div>
      </div>
    </div>
  );
}

