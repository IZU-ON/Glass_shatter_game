import React from 'react';
import { GlassType, LevelProgress } from '../types';
import { GLASS_TYPES, POWER_UPS } from '../data/glassTypes';
import { X, Lock, Star, CheckCircle, Trophy, Shield, Sparkles } from 'lucide-react';

interface LevelSelectModalProps {
  isOpen: boolean;
  currentLevel: number;
  progress: Record<number, LevelProgress>;
  onSelectLevel: (level: number) => void;
  onClose: () => void;
}

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  isOpen,
  currentLevel,
  progress,
  onSelectLevel,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-mono-tech tracking-tight">
                Stages & Unlockable Glass Types
              </h2>
              <p className="text-xs text-slate-400">
                10 progressive glass materials with unique physics, acoustic tones, and power-ups.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Level Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {GLASS_TYPES.map((glass) => {
            const lvlProgress = progress[glass.level] || {
              level: glass.level,
              unlocked: glass.level === 1,
              completed: false,
              highScore: 0,
              stars: 0,
              bestTime: 0,
              tapsUsed: 0,
            };

            const isCurrent = currentLevel === glass.level;
            const powerUp = POWER_UPS[glass.powerUpGranted];

            return (
              <div
                key={glass.id}
                onClick={() => lvlProgress.unlocked && onSelectLevel(glass.level)}
                className={`relative flex flex-col p-4 rounded-xl border transition-all duration-200 ${
                  isCurrent
                    ? 'ring-2 ring-sky-400 bg-sky-950/40 border-sky-500/60 shadow-lg shadow-sky-500/10'
                    : lvlProgress.unlocked
                    ? 'bg-slate-800/60 hover:bg-slate-800 border-slate-700 cursor-pointer hover:border-slate-600 hover:scale-[1.01]'
                    : 'bg-slate-900/50 border-slate-800/80 opacity-60 cursor-not-allowed'
                }`}
              >
                {/* Level Tag & Status */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-sky-300 border border-slate-700">
                    STAGE {glass.level}
                  </span>

                  {/* Stars / Unlock button */}
                  {lvlProgress.unlocked ? (
                    <div className="flex items-center gap-1">
                      {[1, 2, 3].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= lvlProgress.stars
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-600'
                          }`}
                        />
                      ))}
                    </div>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectLevel(glass.level);
                      }}
                      className="flex items-center gap-1 px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 hover:bg-sky-500/30 border border-sky-500/30 text-[10px] font-bold"
                    >
                      <Lock className="w-3 h-3 text-sky-400" />
                      Unlock Now
                    </button>
                  )}
                </div>

                {/* Glass Title */}
                <h3 className="font-bold text-sm text-white leading-snug mb-1">
                  {glass.name}
                </h3>
                <p className="text-[11px] text-slate-400 line-clamp-2 mb-3">
                  {glass.description}
                </p>

                {/* Material Metrics */}
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 mb-3 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-3 h-3 text-sky-400" />
                    <span>HP: {glass.hp}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>Brittleness: {glass.brittleness}x</span>
                  </div>
                </div>

                {/* Power-up Unlock Note */}
                <div className="mt-auto pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Reward:</span>
                  <span
                    className="font-semibold text-[10px] px-1.5 py-0.5 rounded"
                    style={{
                      backgroundColor: `${powerUp.color}20`,
                      color: powerUp.color,
                    }}
                  >
                    +{powerUp.name}
                  </span>
                </div>

                {/* Best Score if completed */}
                {lvlProgress.completed && (
                  <div className="mt-2 text-right text-[10px] text-emerald-400 font-mono">
                    Best Score: {(lvlProgress.highScore ?? 0).toLocaleString()}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/90 flex justify-between items-center text-xs text-slate-400">
          <span>Complete stages to unlock rarer glass formulas and power-ups.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
