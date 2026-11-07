import { useState, useEffect } from 'react';
import { CheckCircle2, RotateCcw, Cpu, Sparkles, Layers } from 'lucide-react';
import { aiSound } from '../../aiAudioEngine.js';

export default function MultiHeadStage({ stage, onStageComplete }) {
  // Head states
  const [head1Sync, setHead1Sync] = useState(40); // Head 1: Syntax Linker
  const [head2Coreference, setHead2Coreference] = useState(30); // Head 2: Coreference
  const [head3Induction, setHead3Induction] = useState(50); // Head 3: Induction Pattern

  const [isCompleted, setIsCompleted] = useState(false);

  const avgCohesion = Math.round((head1Sync + head2Coreference + head3Induction) / 3);

  useEffect(() => {
    if (avgCohesion >= 85 && !isCompleted) {
      setIsCompleted(true);
      aiSound.playWinFanfare();
      onStageComplete(100);
    }
  }, [head1Sync, head2Coreference, head3Induction]);

  const handleHeadChange = (head, val) => {
    aiSound.playTokenSnap(500 + val * 4);
    if (head === 1) setHead1Sync(val);
    if (head === 2) setHead2Coreference(val);
    if (head === 3) setHead3Induction(val);
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      {/* Intro banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-2xl bg-pink-950/30 border border-pink-800/40">
        <div>
          <span className="text-xs font-mono font-bold text-pink-400 uppercase tracking-widest">
            Level 4: Multi-Head Subspace Attention
          </span>
          <h2 className="text-xl md:text-2xl font-bold font-mono text-white mt-0.5">
            MultiHead(Q, K, V) = Concat(head₁, head₂, head₃) · Wᴼ
          </h2>
          <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-2xl">
            A single head cannot simultaneously track who did what, resolve pronoun antecedents, and predict the next token sequence. Configure 3 parallel attention heads to divide and conquer the sentence.
          </p>
        </div>
        <div className="flex items-center gap-3 self-end md:self-auto font-mono">
          <div className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-center">
            <div className="text-[10px] uppercase text-slate-400">Network Cohesion</div>
            <div className={`text-xl font-bold ${avgCohesion >= 85 ? 'text-emerald-400' : 'text-pink-400'}`}>
              {avgCohesion}%
            </div>
          </div>
        </div>
      </div>

      {/* 3 Specialized Heads Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Head 1: Syntax Linker */}
        <div className="bg-[#080d1a] border border-cyan-800/50 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold border border-cyan-500/30">
              HEAD 1: SYNTAX
            </span>
            <span className="text-xs font-mono font-bold text-cyan-400">{head1Sync}%</span>
          </div>
          <div>
            <h4 className="text-sm font-bold text-white font-mono">Subject-Verb Linker</h4>
            <p className="text-xs text-slate-400 mt-1">
              Links verbs ("trained", "deployed") directly back to the active agent ("Ada").
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 font-mono text-xs text-cyan-200">
            Ada ←-- [trained] ... she ←-- [deployed]
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono text-slate-400">
              <span>Subspace Bandwidth:</span>
              <span className="text-cyan-400">{head1Sync}%</span>
            </div>
            <input
              type="range"
              min="20"
              max="100"
              value={head1Sync}
              onChange={(e) => handleHeadChange(1, parseInt(e.target.value))}
              className="w-full accent-cyan-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Head 2: Coreference Resolver */}
        <div className="bg-[#080d1a] border border-pink-800/50 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 text-[10px] font-mono font-bold border border-pink-500/30">
              HEAD 2: COREFERENCE
            </span>
            <span className="text-xs font-mono font-bold text-pink-400">{head2Coreference}%</span>
          </div>
          <div>
            <h4 className="text-sm font-bold text-white font-mono">Pronoun Resolver</h4>
            <p className="text-xs text-slate-400 mt-1">
              Binds ambiguous pronouns: "she" → "Ada", and "it" → "neural net".
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 font-mono text-xs text-pink-200">
            "she" → Ada | "it" → net
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono text-slate-400">
              <span>Subspace Bandwidth:</span>
              <span className="text-pink-400">{head2Coreference}%</span>
            </div>
            <input
              type="range"
              min="20"
              max="100"
              value={head2Coreference}
              onChange={(e) => handleHeadChange(2, parseInt(e.target.value))}
              className="w-full accent-pink-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Head 3: Induction Head */}
        <div className="bg-[#080d1a] border border-emerald-800/50 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold border border-emerald-500/30">
              HEAD 3: INDUCTION
            </span>
            <span className="text-xs font-mono font-bold text-emerald-400">{head3Induction}%</span>
          </div>
          <div>
            <h4 className="text-sm font-bold text-white font-mono">Sequence In-Context Head</h4>
            <p className="text-xs text-slate-400 mt-1">
              Detects patterns [A][B] ... [A] → predicts [B]. The backbone of in-context learning!
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 font-mono text-xs text-emerald-200">
            [trained] ... and ... → [deployed]
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono text-slate-400">
              <span>Subspace Bandwidth:</span>
              <span className="text-emerald-400">{head3Induction}%</span>
            </div>
            <input
              type="range"
              min="20"
              max="100"
              value={head3Induction}
              onChange={(e) => handleHeadChange(3, parseInt(e.target.value))}
              className="w-full accent-emerald-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Completion Banner */}
      <div className={`p-4 rounded-2xl border transition-all ${
        isCompleted
          ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
          : 'bg-slate-900 border-slate-800 text-slate-300'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-mono font-bold">
            {isCompleted ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>MULTI-HEAD ATTENTION SYNCHRONIZED! (+100 PTS)</span>
              </>
            ) : (
              <>
                <Cpu className="w-5 h-5 text-pink-400" />
                <span>Synchronize all 3 heads to achieve ≥ 85% average cohesion</span>
              </>
            )}
          </div>
          <button
            onClick={() => {
              setHead1Sync(35);
              setHead2Coreference(30);
              setHead3Induction(40);
              setIsCompleted(false);
            }}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
        </div>
      </div>
    </div>
  );
}

