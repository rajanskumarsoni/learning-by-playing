import { useState, useEffect } from 'react';
import { Sparkles, Play, RotateCcw, CheckCircle2, Sliders, Dice5, AlertTriangle } from 'lucide-react';
import { softmax, filterTopP } from '../../core/vectorMath.js';
import { aiSound } from '../../aiAudioEngine.js';

export default function TemperatureStage({ stage, onStageComplete }) {
  const [temperature, setTemperature] = useState(0.7);
  const [topP, setTopP] = useState(0.9);
  const [generatedTokens, setGeneratedTokens] = useState(['The', 'future', 'of', 'AI', 'is']);
  const [consecutiveGoodTokens, setConsecutiveGoodTokens] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // Candidate pool with unnormalized logit values
  const candidates = [
    { word: 'brilliant', logit: 4.5, type: 'coherent' },
    { word: 'adaptive', logit: 4.1, type: 'coherent' },
    { word: 'unpredictable', logit: 3.5, type: 'coherent' },
    { word: 'transformative', logit: 3.8, type: 'coherent' },
    { word: 'is', logit: 2.2, type: 'repetitive' },
    { word: 'banana', logit: -0.5, type: 'hallucination' },
    { word: 'potato', logit: -1.2, type: 'hallucination' },
    { word: 'quantum-potato', logit: -2.8, type: 'hallucination' }
  ];

  const rawLogits = candidates.map(c => c.logit);
  const rawProbs = softmax(rawLogits, temperature);
  const finalProbs = filterTopP(rawProbs, topP);

  const sampleToken = () => {
    // Weighted random sampling
    let r = Math.random();
    let cumulative = 0;
    let selectedIdx = 0;

    for (let i = 0; i < finalProbs.length; i++) {
      cumulative += finalProbs[i];
      if (r <= cumulative) {
        selectedIdx = i;
        break;
      }
    }

    const chosen = candidates[selectedIdx];
    aiSound.playTokenSnap(800 + selectedIdx * 60);

    setGeneratedTokens(prev => [...prev, chosen.word]);

    if (chosen.type === 'coherent' && temperature >= 0.4 && temperature <= 1.0) {
      setConsecutiveGoodTokens(prev => {
        const next = prev + 1;
        if (next >= 3 && !isCompleted) {
          setIsCompleted(true);
          aiSound.playWinFanfare();
          onStageComplete(100);
        }
        return next;
      });
    } else {
      setConsecutiveGoodTokens(0);
    }
  };

  const handleReset = () => {
    setGeneratedTokens(['The', 'future', 'of', 'AI', 'is']);
    setConsecutiveGoodTokens(0);
    setIsCompleted(false);
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      {/* Intro banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-2xl bg-emerald-950/30 border border-emerald-800/40">
        <div>
          <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">
            Level 6: Softmax Logit Temperature & Nucleus Sampling
          </span>
          <h2 className="text-xl md:text-2xl font-bold font-mono text-white mt-0.5">
            P(wᵢ) = exp(zᵢ / T) / ∑ exp(zⱼ / T)
          </h2>
          <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-2xl">
            Raw logits must be transformed into next-token probabilities. Low temperature (T &lt; 0.3) creates robotic repetition. High temperature (T &gt; 1.5) unleashes chaotic hallucinations. Master the golden balance (T ≈ 0.70)!
          </p>
        </div>
        <div className="flex items-center gap-3 self-end md:self-auto font-mono">
          <div className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-center">
            <div className="text-[10px] uppercase text-slate-400">Coherent Streak</div>
            <div className={`text-xl font-bold ${consecutiveGoodTokens >= 3 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {consecutiveGoodTokens} / 3
            </div>
          </div>
        </div>
      </div>

      {/* Main interactive area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Probabilities Distribution & Generator */}
        <div className="lg:col-span-2 bg-[#080d1a] border border-slate-800 rounded-2xl p-5 space-y-5">
          {/* Output text stream */}
          <div className="p-4 rounded-xl bg-[#050811] border border-slate-800 font-mono text-sm leading-relaxed">
            <span className="text-slate-500 text-xs block mb-1">Generated Output Stream:</span>
            <span className="text-slate-300 font-bold">
              {generatedTokens.map((t, idx) => (
                <span
                  key={idx}
                  className={`inline-block mr-1.5 px-1 rounded ${
                    idx >= 5
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30'
                      : 'text-white'
                  }`}
                >
                  {t}
                </span>
              ))}
            </span>
          </div>

          {/* Probability Bars */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono text-slate-400">
              <span>Candidate Tokens & Probability Distribution:</span>
              <span className="text-emerald-400 font-bold">Active Temperature: {temperature.toFixed(2)}</span>
            </div>

            <div className="space-y-1.5">
              {candidates.map((cand, idx) => {
                const prob = finalProbs[idx];
                const isFilteredOut = prob === 0;

                return (
                  <div key={idx} className="flex items-center gap-2 text-xs font-mono">
                    <span className="w-28 truncate text-slate-300 flex items-center gap-1">
                      {cand.word}
                      {cand.type === 'hallucination' && <span className="text-[9px] text-red-400">⚠️</span>}
                    </span>
                    <div className="flex-1 h-5 bg-slate-900 rounded-md overflow-hidden relative border border-slate-800/80">
                      <div
                        className={`h-full transition-all duration-150 ${
                          isFilteredOut
                            ? 'bg-slate-700/20'
                            : cand.type === 'coherent'
                              ? 'bg-gradient-to-r from-emerald-500 to-cyan-500'
                              : cand.type === 'repetitive'
                                ? 'bg-amber-500'
                                : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.max(2, prob * 100)}%` }}
                      />
                      <span className="absolute right-2 top-0.5 text-[10px] text-slate-200">
                        {isFilteredOut ? 'Filtered (Top-P)' : `${(prob * 100).toFixed(1)}%`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={sampleToken}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-white font-mono font-bold text-xs flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
            >
              <Dice5 className="w-4 h-4" />
              Sample Next Token
            </button>
            <button
              onClick={handleReset}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Sentence
            </button>
          </div>
        </div>

        {/* Right: Controls & Dials */}
        <div className="bg-[#080d1a] border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-6">
          <div className="space-y-6">
            <h3 className="text-sm font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              Sampling Parameters
            </h3>

            {/* Temperature Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Temperature (T):</span>
                <span className={`font-bold ${
                  temperature < 0.3
                    ? 'text-cyan-400'
                    : temperature > 1.4
                      ? 'text-red-400'
                      : 'text-emerald-400'
                }`}>
                  {temperature.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min="0.05"
                max="2.20"
                step="0.05"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full accent-emerald-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0.1 (Robot)</span>
                <span>0.7 (Sweet spot)</span>
                <span>2.0 (Hallucinate)</span>
              </div>
            </div>

            {/* Top-P Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Top-P (Nucleus Cutoff):</span>
                <span className="text-cyan-400 font-bold">{(topP * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.30"
                max="1.00"
                step="0.05"
                value={topP}
                onChange={(e) => setTopP(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
              />
              <span className="text-[10px] text-slate-500">
                Truncates cumulative tail probabilities, completely blocking rare hallucination words.
              </span>
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
                    <span>ORACLE COHERENCE MASTERED! (+100 PTS)</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>Sample 3 balanced tokens</span>
                  </>
                )}
              </div>
              <p className="text-xs text-slate-400">
                {isCompleted
                  ? 'You have mastered temperature and nucleus filtering. The model generates fluid, hallucination-resistant prose!'
                  : 'Set temperature near 0.70 and Top-P to 0.90, then sample tokens to build a coherent completion.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

