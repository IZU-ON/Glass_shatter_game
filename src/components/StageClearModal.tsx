import React, { useEffect } from 'react';
import { GlassType } from '../types';
import { GLASS_TYPES, POWER_UPS } from '../data/glassTypes';
import confetti from 'canvas-confetti';
import { soundEngine } from '../utils/audio';
import { Star, Trophy, ArrowRight, RotateCcw, Sparkles } from 'lucide-react';

interface StageClearModalProps {
  isOpen: boolean;
  glass: GlassType;
  level: number;
  stageScore: number;
  starsEarned: number;
  tapsUsed: number;
  timeTaken: number;
  woodStrikes?: number;
  glassesSmashed?: number;
  onNextStage: () => void;
  onReplayStage: () => void;
  onOpenLeaderboard: () => void;
}

export const StageClearModal: React.FC<StageClearModalProps> = ({
  isOpen,
  glass,
  level,
  stageScore,
  starsEarned,
  tapsUsed,
  timeTaken,
  woodStrikes = 0,
  glassesSmashed = 10,
  onNextStage,
  onReplayStage,
  onOpenLeaderboard,
}) => {
  useEffect(() => {
    if (isOpen) {
      soundEngine.playVictory();
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#38bdf8', '#eab308', '#ec4899', '#10b981', '#ffffff'],
        });
      } catch {
        // ignore confetti failures
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const nextLevel = level < 10 ? level + 1 : null;
  const nextGlass = nextLevel ? GLASS_TYPES[nextLevel - 1] : null;
  const powerUpUnlocked = POWER_UPS[glass.powerUpGranted];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 flex flex-col items-center text-center text-slate-100">
        {/* Glow halo */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30 mb-3 animate-bounce">
          <Trophy className="w-8 h-8 text-slate-950" />
        </div>

        <span className="text-xs uppercase font-bold tracking-widest text-amber-400 font-mono-tech">
          STAGE {level} COMPLETE
        </span>
        <h2 className="text-2xl font-black tracking-tight text-white mt-1">
          {glass.name} Shattered!
        </h2>

        {/* Stars */}
        <div className="flex items-center gap-2 my-4">
          {[1, 2, 3].map((star) => (
            <Star
              key={star}
              className={`w-8 h-8 transition-transform duration-300 ${
                star <= starsEarned
                  ? 'text-amber-400 fill-amber-400 scale-110 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                  : 'text-slate-700 fill-slate-800'
              }`}
            />
          ))}
        </div>

        {/* Breakdown Card */}
        <div className="w-full bg-slate-800/60 rounded-xl p-3 border border-slate-700/80 text-xs flex flex-col gap-2 mb-4">
          <div className="flex justify-between items-center text-slate-300">
            <span>Stage Score:</span>
            <span className="font-mono font-bold text-sky-400 text-sm">
              +{(stageScore ?? 0).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span>Glass Smashed:</span>
            <span className="font-mono text-sky-300 font-semibold">{glassesSmashed} panes</span>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span>Wood Strikes:</span>
            <span className={`font-mono font-semibold ${woodStrikes === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {woodStrikes === 0 ? '0 (Flawless Precision!)' : `${woodStrikes} strikes`}
            </span>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span>Duration:</span>
            <span className="font-mono text-slate-200">{timeTaken.toFixed(1)}s</span>
          </div>
        </div>

        {/* Unlocked Reward */}
        {nextGlass && (
          <div className="w-full mb-4 p-3 rounded-xl bg-sky-950/40 border border-sky-500/30 flex items-center gap-3 text-left">
            <div className="w-9 h-9 rounded-lg bg-sky-500/20 text-sky-300 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-sky-400">
                Unlocked Stage {nextLevel}:
              </div>
              <div className="font-bold text-xs text-white leading-tight">
                {nextGlass.name}
              </div>
            </div>
          </div>
        )}

        {/* Power-up Granted */}
        <div className="w-full mb-5 text-left text-xs bg-slate-800/40 p-2.5 rounded-lg border border-slate-800">
          <span className="text-slate-400">Power-Up Formula Acquired: </span>
          <span className="font-bold" style={{ color: powerUpUnlocked.color }}>
            {powerUpUnlocked.name}
          </span>
          <p className="text-[11px] text-slate-400 mt-0.5">{powerUpUnlocked.description}</p>
        </div>

        {/* Actions */}
        <div className="w-full flex flex-col gap-2">
          {nextLevel ? (
            <button
              onClick={onNextStage}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-sky-500/20 active:scale-98 transition flex items-center justify-center gap-2"
            >
              <span>Play Next Stage ({nextLevel}/10)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onOpenLeaderboard}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/20 active:scale-98 transition flex items-center justify-center gap-2"
            >
              <span>View Championship Podium</span>
              <Trophy className="w-4 h-4" />
            </button>
          )}

          <div className="flex gap-2 w-full">
            <button
              onClick={onReplayStage}
              className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition flex items-center justify-center gap-1.5 border border-slate-700"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Replay
            </button>
            <button
              onClick={onOpenLeaderboard}
              className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold text-xs transition flex items-center justify-center gap-1.5 border border-slate-700"
            >
              <Trophy className="w-3.5 h-3.5" />
              Rankings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
