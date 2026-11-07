import { useState, useMemo } from 'react';
import { Terminal, Play, Sparkles, RefreshCw, Layers, Zap, Sliders, BookOpen } from 'lucide-react';
import { TinyTransformer } from '../../core/tinyTransformer.js';
import { tokenizeSentence } from '../../core/tokenizer.js';
import { aiSound } from '../../aiAudioEngine.js';

export default function SandboxStage() {
  const [promptText, setPromptText] = useState('Robot server crashed because memory overloaded');
  const [selectedTokenIdx, setSelectedTokenIdx] = useState(0);

  const presets = [
    'Robot server crashed because memory overloaded',
    'Ada trained neural net and deployed it',
    'The king and queen ruled the kingdom',
    'Fast cache avoids slow database queries'
  ];

  const model = useMemo(() => new TinyTransformer({ dModel: 4, numHeads: 2 }), []);

  const tokens = useMemo(() => {
    return tokenizeSentence(promptText);
  }, [promptText]);

  const forwardResult = useMemo(() => {
    return model.forward(tokens);
  }, [model, tokens]);

  const attentionMatrix = forwardResult.attentionScores; // seqLen x seqLen

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      {/* Intro banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-2xl bg-cyan-950/30 border border-cyan-800/40">
        <div>
          <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
            Level 7: The Master Transformer Studio
          </span>
          <h2 className="text-xl md:text-2xl font-bold font-mono text-white mt-0.5">
            Full Client-Side Transformer Engine
          </h2>
          <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-2xl">
            Type any prompt or choose a preset. Inspect the real forward pass, full N×N Self-Attention matrix, multi-head tensor projections, and feed-forward residual streams.
          </p>
        </div>
      </div>

      {/* Input Prompt & Presets */}
      <div className="bg-[#080d1a] border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            placeholder="Type any sentence to inspect..."
            className="flex-1 bg-[#050811] border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-cyan-400"
          />
          <button
            onClick={() => {
              aiSound.playTokenSnap(1100);
            }}
            className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <Play className="w-3.5 h-3.5 fill-white" /> Compute Forward Pass
          </button>
        </div>

        {/* Preset chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-mono text-slate-500">Presets:</span>
          {presets.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                aiSound.playTokenSnap(700 + idx * 80);
                setPromptText(p);
                setSelectedTokenIdx(0);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-mono border border-slate-800 transition-colors"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Tokens Pipeline */}
      <div className="bg-[#080d1a] border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-cyan-400" />
            Active Tokens in Sequence (Click to inspect attention source):
          </span>
          <span className="text-cyan-400">Length: {tokens.length} Tokens</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {tokens.map((t, idx) => {
            const isSelected = idx === selectedTokenIdx;
            return (
              <button
                key={idx}
                onClick={() => {
                  aiSound.playTokenSnap(850 + idx * 50);
                  setSelectedTokenIdx(idx);
                }}
                className={`px-3.5 py-2.5 rounded-xl border font-mono text-xs transition-all flex flex-col items-center gap-0.5 ${
                  isSelected
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold scale-105 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <span className="text-[9px] text-slate-500">#{idx}</span>
                <span className="text-sm text-white">{t.word}</span>
                <span className="text-[9px] text-cyan-400/80">ID: {t.id}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Attention Matrix & Residual Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: N x N Attention Matrix Heatmap */}
        <div className="bg-[#080d1a] border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              N×N Self-Attention Heatmap (Q × Kᵀ)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-center font-mono text-xs border-collapse">
              <thead>
                <tr>
                  <th className="p-1 text-[10px] text-slate-500">Q \ K</th>
                  {tokens.map((t, j) => (
                    <th key={j} className="p-1 text-[10px] text-slate-400 truncate max-w-[50px]">
                      {t.word}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tokens.map((qTok, i) => (
                  <tr key={i}>
                    <td className="p-1 text-[10px] text-slate-400 font-bold truncate max-w-[60px] text-right pr-2">
                      {qTok.word}
                    </td>
                    {tokens.map((kTok, j) => {
                      const score = attentionMatrix[i] ? attentionMatrix[i][j] : 0;
                      const isSelectedRow = i === selectedTokenIdx;
                      return (
                        <td
                          key={j}
                          className={`p-1.5 border border-slate-900 transition-colors ${
                            isSelectedRow ? 'ring-1 ring-cyan-400/40' : ''
                          }`}
                          style={{
                            backgroundColor: `rgba(6, 182, 212, ${Math.max(0.05, score * 0.9)})`,
                            color: score > 0.35 ? '#fff' : '#94a3b8'
                          }}
                          title={`Query "${qTok.word}" attends to Key "${kTok.word}": ${(score * 100).toFixed(1)}%`}
                        >
                          {(score * 100).toFixed(0)}%
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-slate-500 font-mono">
            Highlighted row shows how token <strong className="text-cyan-400 font-bold">"{tokens[selectedTokenIdx]?.word}"</strong> distributes its attention across every other word.
          </p>
        </div>

        {/* Right: Activations & Residual Stream */}
        <div className="bg-[#080d1a] border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-purple-400" />
              Intermediate Layer Activations (Token #{selectedTokenIdx})
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {/* 1. Embedding + PE */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="text-[10px] text-cyan-400 uppercase font-bold mb-1">
                1. Embedding + Positional Encoding Vector:
              </div>
              <div className="text-slate-300 truncate">
                [{forwardResult.embeddingsWithPE[selectedTokenIdx]
                  ? Array.from(forwardResult.embeddingsWithPE[selectedTokenIdx]).map(v => v.toFixed(3)).join(', ')
                  : ''}]
              </div>
            </div>

            {/* 2. Query, Key, Value vectors */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="text-[10px] text-amber-400 uppercase font-bold mb-1">
                2. Projected Q, K, V Vectors:
              </div>
              <div className="text-slate-400 text-[11px]">
                Q: [{Array.from(forwardResult.Q[selectedTokenIdx] || []).map(v => v.toFixed(2)).join(', ')}]
              </div>
              <div className="text-slate-400 text-[11px]">
                K: [{Array.from(forwardResult.K[selectedTokenIdx] || []).map(v => v.toFixed(2)).join(', ')}]
              </div>
              <div className="text-slate-400 text-[11px]">
                V: [{Array.from(forwardResult.V[selectedTokenIdx] || []).map(v => v.toFixed(2)).join(', ')}]
              </div>
            </div>

            {/* 3. Post-Attention MLP Output */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="text-[10px] text-emerald-400 uppercase font-bold mb-1">
                3. Feed-Forward MLP & LayerNorm Output:
              </div>
              <div className="text-slate-300 truncate">
                [{forwardResult.mlpOutput[selectedTokenIdx]
                  ? Array.from(forwardResult.mlpOutput[selectedTokenIdx]).map(v => v.toFixed(3)).join(', ')
                  : ''}]
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

