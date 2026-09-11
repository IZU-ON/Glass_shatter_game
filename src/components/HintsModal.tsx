import React from 'react';
import { GlassType } from '../types';
import { GLASS_TYPES, LEVEL_CONFIGS } from '../data/glassTypes';
import { Lightbulb, ArrowRight, Star, Zap, ShieldAlert, Sparkles, X, Target } from 'lucide-react';

interface HintsModalProps {
  isOpen: boolean;
  currentLevel: number;
  glass: GlassType;
  onClose: () => void;
  onAdvanceToLevel: (level: number) => void;
}

export const HintsModal: React.FC<HintsModalProps> = ({
  isOpen,
  currentLevel,
  glass,
  onClose,
  onAdvanceToLevel,
}) => {
  if (!isOpen) return null;

  const nextLevel = currentLevel < 10 ? currentLevel + 1 : null;
  const nextGlass = nextLevel ? GLASS_TYPES[nextLevel - 1] : null;
  const levelConfig = LEVEL_CONFIGS[currentLevel];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-amber-500/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center shadow-md">
              <Lightbulb className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold font-mono tracking-tight text-white flex items-center gap-2">
                Stage {currentLevel} Strategy & Rules
              </h2>
              <p className="text-xs text-amber-300/80">
                Smash falling glass • Avoid wood obstacles
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

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {/* Main Objective */}
          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
            <div className="font-bold text-sm text-sky-300 flex items-center gap-1.5 mb-1.5">
              <Target className="w-4 h-4 text-sky-400" />
              Stage {currentLevel} Mission Goal:
            </div>
            <p className="text-slate-300 leading-relaxed mb-2">
              Objects fall from the top of the arena. Your mouse cursor turns into an authentic <strong>Sledge Hammer</strong>.
            </p>
            <ul className="list-disc pl-4 space-y-1.5 text-slate-300">
              <li>
                <strong className="text-sky-300">Smash {levelConfig?.targetGlassSmashes || 10} Glass Panes:</strong> Click or tap to swing your hammer at falling glass crystals, panes, and gems.
              </li>
              <li>
                <strong className="text-red-400">Avoid Wooden Planks & Crates:</strong> Striking wood causes severe splinter penalties! You can only make <strong className="text-amber-400">{levelConfig?.maxWoodStrikes || 3} wood mistakes</strong> before the level fails.
              </li>
              <li>
                <strong className="text-white">Let Wood Fall Safely:</strong> If you don't hit the wood, it safely drops off the bottom of the screen with no penalty!
              </li>
            </ul>
          </div>

          {/* Hammer & Power-Up Strategy */}
          <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/30 space-y-2">
            <div className="font-bold text-amber-300 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              Pro Smashing Tips:
            </div>
            <ul className="list-disc pl-4 space-y-1 text-slate-300">
              <li>
                <strong className="text-white">Heavy Sledge:</strong> Press 1 or click the hammer power-up to increase your strike radius and smash multi-hit tempered glass instantly!
              </li>
              <li>
                <strong className="text-white">Cryo-Freeze:</strong> Press 2 to freeze all falling items in mid-air for 5 seconds. Makes precision glass shattering effortless!
              </li>
              <li>
                <strong className="text-white">Bullet Time (Slow-Mo):</strong> Slows fall speed by 75%, perfect when swarms of wood are falling.
              </li>
              <li>
                <strong className="text-white">Combo Multipliers:</strong> Smash glasses in quick succession without missing or striking wood to build up to an 8x score multiplier!
              </li>
            </ul>
          </div>

          {/* Next Stage Jump Option */}
          {nextGlass && (
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-sky-950/40 to-indigo-950/40 border border-sky-500/30 flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-sky-400 tracking-wider">
                  Upcoming Stage {nextLevel}
                </span>
                <div className="font-bold text-white text-sm mt-0.5">
                  {nextGlass.name}
                </div>
                <div className="text-[11px] text-slate-400">
                  {nextGlass.subtitle}
                </div>
              </div>
              <button
                onClick={() => {
                  onAdvanceToLevel(nextLevel);
                  onClose();
                }}
                className="shrink-0 px-3 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-sky-500/20 active:scale-95 transition flex items-center gap-1.5"
              >
                <span>Jump to Stage {nextLevel}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-xs text-slate-200 transition"
          >
            Understood, Start Smashing!
          </button>
        </div>
      </div>
    </div>
  );
};
