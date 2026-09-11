import React, { useState } from 'react';
import { Sliders, ChevronDown, ChevronUp, RotateCcw, Zap, ShieldAlert, Sparkles } from 'lucide-react';
import { GameSliders } from '../types';

export interface GameControlPanelProps {
  sliders: GameSliders;
  onChangeSliders?: (newSliders: GameSliders) => void;
  onChange?: (key: keyof GameSliders, val: number) => void;
  onReset?: () => void;
  isControlPanelOpen?: boolean;
  onToggleOpen?: () => void;
}

export const GameControlPanel: React.FC<GameControlPanelProps> = ({
  sliders,
  onChangeSliders,
  onChange,
  onReset,
  isControlPanelOpen,
  onToggleOpen,
}) => {
  const [internalExpanded, setInternalExpanded] = useState<boolean>(false);
  const isExpanded = isControlPanelOpen !== undefined ? isControlPanelOpen : internalExpanded;

  const toggleExpanded = () => {
    if (onToggleOpen) {
      onToggleOpen();
    }
    setInternalExpanded((prev) => !prev);
  };

  const updateSliders = (newSliders: GameSliders) => {
    if (onChangeSliders) {
      onChangeSliders(newSliders);
    }
    if (onChange) {
      onChange('fallSpeedMultiplier', newSliders.fallSpeedMultiplier);
      onChange('glassCountMultiplier', newSliders.glassCountMultiplier);
      onChange('dangerLevelMultiplier', newSliders.dangerLevelMultiplier);
    }
  };

  const handleReset = () => {
    if (onReset) {
      onReset();
    } else {
      updateSliders({
        fallSpeedMultiplier: 1.0,
        glassCountMultiplier: 1.0,
        dangerLevelMultiplier: 1.0,
      });
    }
  };

  const fallSpeed = sliders?.fallSpeedMultiplier ?? 1.0;
  const glassCount = sliders?.glassCountMultiplier ?? 1.0;
  const dangerLevel = sliders?.dangerLevelMultiplier ?? 1.0;

  return (
    <div className="fixed bottom-14 sm:bottom-16 right-2 sm:right-4 z-30 flex flex-col items-end pointer-events-auto">
      {/* Collapsible Panel */}
      {isExpanded && (
        <div className="w-72 sm:w-80 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-2xl p-3.5 mb-2 text-slate-100 flex flex-col gap-3 animate-fade-in ring-1 ring-slate-700/50">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200 uppercase tracking-wider">
              <Sliders className="w-3.5 h-3.5 text-sky-400" />
              <span>Sim Controls</span>
            </div>
            <button
              onClick={handleReset}
              className="text-[10px] text-sky-400 hover:text-sky-300 flex items-center gap-1 hover:underline"
              title="Reset sliders to defaults"
            >
              <RotateCcw className="w-2.5 h-2.5" />
              <span>Reset (1.0×)</span>
            </button>
          </div>

          {/* 1. Fall Speed */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-300 font-semibold flex items-center gap-1">
                <Zap className="w-3 h-3 text-sky-400" />
                Fall Speed
              </span>
              <span className="font-mono text-sky-400 font-bold bg-sky-500/10 px-1.5 py-0.5 rounded text-[10px]">
                {fallSpeed.toFixed(1)}×
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={fallSpeed}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                if (onChange) {
                  onChange('fallSpeedMultiplier', val);
                } else {
                  updateSliders({
                    fallSpeedMultiplier: val,
                    glassCountMultiplier: glassCount,
                    dangerLevelMultiplier: dangerLevel,
                  });
                }
              }}
              className="w-full accent-sky-400 h-1.5 bg-slate-800 rounded cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-slate-400">
              <span>Slow (0.5×)</span>
              <span>Fast (2.0×)</span>
            </div>
          </div>

          {/* 2. Glass Count */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-300 font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                Glass Count
              </span>
              <span className="font-mono text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded text-[10px]">
                {glassCount.toFixed(1)}×
              </span>
            </div>
            <input
              type="range"
              min="0.6"
              max="2.0"
              step="0.1"
              value={glassCount}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                if (onChange) {
                  onChange('glassCountMultiplier', val);
                } else {
                  updateSliders({
                    fallSpeedMultiplier: fallSpeed,
                    glassCountMultiplier: val,
                    dangerLevelMultiplier: dangerLevel,
                  });
                }
              }}
              className="w-full accent-emerald-400 h-1.5 bg-slate-800 rounded cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-slate-400">
              <span>Few (0.6×)</span>
              <span>Many (2.0×)</span>
            </div>
          </div>

          {/* 3. Danger Level */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-300 font-semibold flex items-center gap-1">
                <ShieldAlert className="w-3 h-3 text-rose-400" />
                Danger Level
              </span>
              <span className="font-mono text-rose-400 font-bold bg-rose-500/10 px-1.5 py-0.5 rounded text-[10px]">
                {dangerLevel.toFixed(1)}×
              </span>
            </div>
            <input
              type="range"
              min="0.3"
              max="2.5"
              step="0.1"
              value={dangerLevel}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                if (onChange) {
                  onChange('dangerLevelMultiplier', val);
                } else {
                  updateSliders({
                    fallSpeedMultiplier: fallSpeed,
                    glassCountMultiplier: glassCount,
                    dangerLevelMultiplier: val,
                  });
                }
              }}
              className="w-full accent-rose-500 h-1.5 bg-slate-800 rounded cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-slate-400">
              <span>Low (0.3×)</span>
              <span>High (2.5×)</span>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        id="btn-toggle-sliders"
        onClick={toggleExpanded}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-700/80 shadow-lg text-[11px] font-semibold active:scale-95 transition backdrop-blur-md"
        title="Adjust Fall Speed, Glass Count, and Danger Level"
      >
        <Sliders className="w-3.5 h-3.5 text-sky-400" />
        <span className="hidden xs:inline">Controls</span>
        {isExpanded ? (
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        ) : (
          <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
        )}
      </button>
    </div>
  );
};
