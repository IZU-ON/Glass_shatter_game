import React from 'react';
import { GlassType } from '../types';
import { RotateCcw, AlertTriangle, ArrowRight, ShieldAlert, Sparkles } from 'lucide-react';

interface StageFailedModalProps {
  isOpen: boolean;
  glass: GlassType;
  level: number;
  woodStrikes: number;
  maxWoodStrikes: number;
  glassesSmashed: number;
  targetGlasses: number;
  onRetry: () => void;
  onSkip?: () => void;
}

export const StageFailedModal: React.FC<StageFailedModalProps> = ({
  isOpen,
  glass,
  level,
  woodStrikes,
  maxWoodStrikes,
  glassesSmashed,
  targetGlasses,
  onRetry,
  onSkip,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-red-500/50 rounded-2xl shadow-2xl p-6 flex flex-col items-center text-center text-slate-100 ring-2 ring-red-500/30">
        {/* Warning Icon Badge */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-700 flex items-center justify-center shadow-lg shadow-red-500/40 mb-3 animate-pulse">
          <ShieldAlert className="w-9 h-9 text-white" />
        </div>

        <span className="text-xs font-bold uppercase tracking-widest text-red-400 mb-1">
          Stage {level} Failed
        </span>
        <h2 className="text-2xl font-black text-white mb-2">
          Too Many Wood Strikes!
        </h2>
        <p className="text-sm text-slate-300 mb-5 max-w-xs leading-relaxed">
          You hit <span className="text-red-400 font-bold">{woodStrikes}</span> wooden obstacles, exceeding the maximum allowed limit of <span className="text-amber-400 font-bold">{maxWoodStrikes}</span>.
        </p>

        {/* Breakdown Card */}
        <div className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 mb-5 text-left grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-slate-400 block mb-0.5">Glass Target:</span>
            <span className="font-semibold text-sky-300 text-sm">
              {glassesSmashed} / {targetGlasses} Smashed
            </span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Wood Penalty:</span>
            <span className="font-bold text-red-400 text-sm">
              {woodStrikes} / {maxWoodStrikes} Strikes (Exceeded)
            </span>
          </div>
          <div className="col-span-2 pt-2 border-t border-slate-700/60 flex items-start gap-2 text-amber-300/90 text-[11px]">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
            <span>
              <strong>Smashing Tip:</strong> Only aim for the glittering <strong>{glass.name}</strong>. Let wooden logs, crates, and planks fall off the screen safely!
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="w-full flex flex-col sm:flex-row gap-2.5">
          <button
            id="btn-retry-stage-fail"
            onClick={onRetry}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm shadow-lg shadow-red-600/30 active:scale-95 transition flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Try Again</span>
          </button>

          {onSkip && level < 10 && (
            <button
              id="btn-skip-stage-fail"
              onClick={onSkip}
              className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 active:scale-95 transition flex items-center justify-center gap-1.5"
            >
              <span>Skip Stage</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
