import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, CheckCircle2, Flame, AlertOctagon, TrendingDown, Sparkles } from 'lucide-react';
import { aiSound } from '../../aiAudioEngine.js';

export default function LossCanyonStage({ stage, onStageComplete }) {
  const [learningRate, setLearningRate] = useState(0.12);
  const [momentum, setMomentum] = useState(0.6);
  const [weight, setWeight] = useState(-2.5);
  const [velocity, setVelocity] = useState(0);
  const [epoch, setEpoch] = useState(0);
  const [lossHistory, setLossHistory] = useState([4.8]);
  const [isRunning, setIsRunning] = useState(false);
  const [isExploded, setIsExploded] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const timerRef = useRef(null);

  // Non-convex loss function with local minima and global minimum at w ~ 1.85
  const computeLoss = (w) => {
    return Math.pow(w - 1.85, 2) * 0.4 + 0.3 * Math.sin(w * 3.5) + 0.3;
  };

  // Derivative (gradient dL/dw)
  const computeGradient = (w) => {
    return (w - 1.85) * 0.8 + 0.3 * 3.5 * Math.cos(w * 3.5);
  };

  const currentLoss = computeLoss(weight);

  const stepTraining = () => {
    if (isCompleted || isExploded) return;

    if (learningRate > 1.25) {
      // Exploding gradient!
      setIsExploded(true);
      setIsRunning(false);
      aiSound.playGradientExplosion();
      return;
    }

    const grad = computeGradient(weight);
    const newVel = momentum * velocity - learningRate * grad;
    const newW = weight + newVel;
    const newLoss = computeLoss(newW);

    setWeight(newW);
    setVelocity(newVel);
    setEpoch(prev => prev + 1);
    setLossHistory(prev => [...prev.slice(-30), newLoss]);
    aiSound.playLossDrop();

    if (newLoss < 0.08 && Math.abs(newW - 1.85) < 0.25 && !isCompleted) {
      setIsCompleted(true);
      setIsRunning(false);
      aiSound.playWinFanfare();
      onStageComplete(100);
    }
  };

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(stepTraining, 120);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning, weight, velocity, learningRate, momentum, isCompleted, isExploded]);

  const handleReset = () => {
    setIsRunning(false);
    setIsExploded(false);
    setIsCompleted(false);
    setWeight(-2.5);
    setVelocity(0);
    setEpoch(0);
    setLossHistory([4.8]);
  };

  // Convert w [-3, 3] to SVG X [40, 560]
  const toX = (w) => 300 + w * 85;
  // Convert loss [0, 5] to SVG Y [200, 20]
  const toY = (l) => 210 - l * 38;

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      {/* Intro banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-2xl bg-orange-950/30 border border-orange-800/40">
        <div>
          <span className="text-xs font-mono font-bold text-orange-400 uppercase tracking-widest">
            Level 5: Loss Landscape & Backpropagation
          </span>
          <h2 className="text-xl md:text-2xl font-bold font-mono text-white mt-0.5">
            w ← w - η ∇L(w) + β v
          </h2>
          <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-2xl">
            Navigate the non-convex loss canyon. If your learning rate (η) is too high, gradients blow up into NaN. If too low without momentum (β), the weights get trapped in a suboptimal local ditch.
          </p>
        </div>
        <div className="flex items-center gap-3 self-end md:self-auto font-mono">
          <div className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-center">
            <div className="text-[10px] uppercase text-slate-400">Current Loss</div>
            <div className={`text-xl font-bold ${
              isExploded
                ? 'text-red-500'
                : isCompleted
                  ? 'text-emerald-400'
                  : 'text-orange-400'
            }`}>
              {isExploded ? 'NaN (EXPLODED)' : currentLoss.toFixed(4)}
            </div>
          </div>
        </div>
      </div>

      {/* Main interactive area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Loss Surface Visualization (SVG) */}
        <div className="lg:col-span-2 bg-[#080d1a] border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <TrendingDown className="w-4 h-4 text-orange-400" />
              Loss Function Valley L(w)
            </span>
            <span>Epoch: {epoch} / 50</span>
          </div>

          <div className="w-full h-56 bg-[#050811] rounded-xl border border-slate-800/80 p-2 overflow-hidden relative select-none">
            <svg viewBox="0 0 600 240" className="w-full h-full">
              <defs>
                <linearGradient id="curveGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#f97316" />
                  <stop offset="60%" stopColor="#eab308" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>

              {/* Grid / Zero axis */}
              <line x1="40" y1="210" x2="560" y2="210" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

              {/* Loss Curve path */}
              <path
                d={
                  Array.from({ length: 65 }).map((_, i) => {
                    const w = -3.2 + i * 0.1;
                    const x = toX(w);
                    const y = toY(computeLoss(w));
                    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                  }).join(' ')
                }
                fill="none"
                stroke="url(#curveGrad)"
                strokeWidth="3"
              />

              {/* Global Minimum Target Zone */}
              <circle cx={toX(1.85)} cy={toY(computeLoss(1.85))} r="12" fill="rgba(16, 185, 129, 0.2)" />
              <circle cx={toX(1.85)} cy={toY(computeLoss(1.85))} r="6" fill="#10b981" />
              <text x={toX(1.85)} y={toY(computeLoss(1.85)) + 24} fill="#6ee7b7" fontSize="10" fontFamily="monospace" textAnchor="middle">
                Global Min
              </text>

              {/* Current Weight Ball (Model Parameter) */}
              {!isExploded ? (
                <g transform={`translate(${toX(weight)}, ${toY(currentLoss)})`}>
                  <circle r="9" fill={isCompleted ? '#10b981' : '#f97316'} stroke="#fff" strokeWidth="2" className="animate-pulse" />
                  <text y="-14" fill="#fff" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                    w = {weight.toFixed(2)}
                  </text>
                </g>
              ) : (
                <g transform={`translate(300, 70)`}>
                  <text fill="#ef4444" fontSize="16" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                    💥 GRADIENT EXPLODED (NaN)! REDUCE LEARNING RATE
                  </text>
                </g>
              )}
            </svg>
          </div>

          {/* Loss Epoch Strip */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsRunning(!isRunning)}
              disabled={isCompleted || isExploded}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all ${
                isRunning
                  ? 'bg-amber-600 text-white'
                  : 'bg-gradient-to-r from-orange-500 to-amber-600 text-white hover:scale-105'
              }`}
            >
              {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {isRunning ? 'Pause Descent' : 'Run Gradient Descent'}
            </button>

            <button
              onClick={stepTraining}
              disabled={isRunning || isCompleted || isExploded}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors"
            >
              Step 1 Epoch
            </button>

            <button
              onClick={handleReset}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono flex items-center gap-1.5 transition-colors ml-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
          </div>
        </div>

        {/* Right: Hyperparameter Tuning */}
        <div className="bg-[#080d1a] border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-6">
          <div className="space-y-6">
            <h3 className="text-sm font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-400" />
              Optimizer Hyperparameters
            </h3>

            {/* Learning Rate (η) */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Learning Rate (η):</span>
                <span className={`font-bold ${learningRate > 1.2 ? 'text-red-400' : 'text-orange-400'}`}>
                  {learningRate.toFixed(2)} {learningRate > 1.2 && '(HAZARD)'}
                </span>
              </div>
              <input
                type="range"
                min="0.02"
                max="1.50"
                step="0.02"
                value={learningRate}
                onChange={(e) => setLearningRate(parseFloat(e.target.value))}
                className="w-full accent-orange-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
              />
              <span className="text-[10px] text-slate-500">
                Recommended: 0.10 - 0.20. Above 1.25 causes numerical overflow (Loss = NaN).
              </span>
            </div>

            {/* Momentum (β) */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Momentum Coefficient (β):</span>
                <span className="text-amber-400 font-bold">{momentum.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.00"
                max="0.95"
                step="0.05"
                value={momentum}
                onChange={(e) => setMomentum(parseFloat(e.target.value))}
                className="w-full accent-amber-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
              />
              <span className="text-[10px] text-slate-500">
                Accumulates historical velocity to roll out of local ditches.
              </span>
            </div>

            {/* Status card */}
            <div className={`p-4 rounded-xl border transition-all ${
              isExploded
                ? 'bg-red-950/40 border-red-500/50 text-red-300'
                : isCompleted
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                  : 'bg-slate-900 border-slate-800 text-slate-300'
            }`}>
              <div className="flex items-center gap-2 text-sm font-mono font-bold mb-1">
                {isExploded ? (
                  <>
                    <AlertOctagon className="w-4 h-4 text-red-400" />
                    <span>GRADIENT EXPLOSION!</span>
                  </>
                ) : isCompleted ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>GLOBAL MINIMUM REACHED! (+100 PTS)</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="w-4 h-4 text-orange-400" />
                    <span>Lower Loss &lt; 0.08</span>
                  </>
                )}
              </div>
              <p className="text-xs text-slate-400">
                {isExploded
                  ? 'The gradient step was too large and the model jumped into infinity. Lower learning rate and click Reset!'
                  : isCompleted
                    ? 'Superb convergence! The model parameters have stabilized at optimal weights with minimal training loss.'
                    : 'Set η around 0.14 and β around 0.60, then click "Run Gradient Descent" to roll into the valley.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

