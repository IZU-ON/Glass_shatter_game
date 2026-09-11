import React from 'react';
import { Play, RotateCcw, Layers, Sliders } from 'lucide-react';
import { GameSliders, GlassType } from '../types';

export interface PauseModalProps {
  isOpen: boolean;
  level: number;
  glass?: GlassType;
  glassName?: string;
  glassesSmashed: number;
  targetGlasses?: number;
  targetGlassSmashes?: number;
  woodStrikes: number;
  maxWoodStrikes: number;
  score?: number;
  stageScore?: number;
  sliders: GameSliders;
  onChangeSliders?: (newSliders: GameSliders) => void;
  onSliderChange?: (key: keyof GameSliders, val: number) => void;
  onResetSliders?: () => void;
  onResume: () => void;
  onRestart?: () => void;
  onRestartRound?: () => void;
  onSelectLevel?: () => void;
  onOpenLevelSelect?: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  isOpen,
  level,
  glass,
  glassName,
  glassesSmashed,
  targetGlasses,
  targetGlassSmashes,
  woodStrikes,
  maxWoodStrikes,
  score,
  stageScore,
  sliders,
  onChangeSliders,
  onSliderChange,
  onResetSliders,
  onResume,
  onRestart,
  onRestartRound,
  onSelectLevel,
  onOpenLevelSelect,
}) => {
  if (!isOpen) return null;

  const currentGlassName = glassName || glass?.name || 'Glass';
  const targetCount = targetGlassSmashes ?? targetGlasses ?? 10;
  const currentScore = score ?? stageScore ?? 0;
  const handleRestart = onRestartRound || onRestart || (() => {});
  const handleLevelSelect = onSelectLevel || onOpenLevelSelect || (() => {});

  const updateSliders = (newSliders: GameSliders) => {
    if (onChangeSliders) {
      onChangeSliders(newSliders);
    } else if (onSliderChange) {
      onSliderChange('fallSpeedMultiplier', newSliders.fallSpeedMultiplier);
      onSliderChange('glassCountMultiplier', newSliders.glassCountMultiplier);
      onSliderChange('dangerLevelMultiplier', newSliders.dangerLevelMultiplier);
    }
  };

  const handleReset = () => {
    if (onResetSliders) {
      onResetSliders();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-5 sm:p-6 text-slate-100 flex flex-col items-center text-center">
        {/* Top Header Badge */}
        <div className="w-14 h-14 rounded-2xl bg-slate-800/90 border border-slate-700 flex items-center justify-center shadow-lg shadow-sky-500/10 mb-3 text-sky-400">
          <Play className="w-7 h-7 fill-sky-400 translate-x-0.5" />
        </div>

        <span className="text-[11px] font-mono tracking-widest text-sky-400 uppercase font-bold">
          PAUSED
        </span>
        <h2 className="text-2xl font-black tracking-tight text-white mb-1">
          Stage {level}: {currentGlassName}
        </h2>

        {/* Progress Snapshot Card */}
        <div className="w-full bg-slate-800/70 border border-slate-700/80 rounded-xl p-3 my-3 text-xs grid grid-cols-3 gap-2 text-center">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Glass Smashed</span>
            <span className="text-sky-300 font-mono font-bold text-sm">
              {glassesSmashed} / {targetCount}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Wood Strikes</span>
            <span className={`font-mono font-bold text-sm ${woodStrikes >= maxWoodStrikes - 1 ? 'text-rose-400' : 'text-amber-300'}`}>
              {woodStrikes} / {maxWoodStrikes}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Score</span>
            <span className="text-emerald-400 font-mono font-bold text-sm">
              {currentScore.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Sliders inside Pause Menu */}
        <div className="w-full bg-slate-800/50 border border-slate-750 rounded-xl p-3 mb-4 text-left flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-xs text-slate-300 font-semibold border-b border-slate-700/60 pb-1.5">
            <span className="flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-sky-400" />
              <span>Live Control Tuning</span>
            </span>
            <button
              onClick={handleReset}
              className="text-[10px] text-sky-400 hover:text-sky-300 hover:underline"
            >
              Reset to 1.0×
            </button>
          </div>

          {/* Slider 1: Fall Speed */}
          <div>
            <div className="flex justify-between items-center text-[11px] mb-1">
              <span className="text-slate-300 font-medium">Fall Speed</span>
              <span className="font-mono text-sky-400 font-bold">
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
                if (onSliderChange) {
                  onSliderChange('fallSpeedMultiplier', val);
                } else {
                  updateSliders({
                    fallSpeedMultiplier: val,
                    glassCountMultiplier: glassCount,
                    dangerLevelMultiplier: dangerLevel,
                  });
                }
              }}
              className="w-full accent-sky-400 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-slate-500 mt-0.5">
              <span>0.5× (Slow)</span>
              <span>1.0× (Normal)</span>
              <span>2.0× (Fast)</span>
            </div>
          </div>

          {/* Slider 2: Glass Count */}
          <div>
            <div className="flex justify-between items-center text-[11px] mb-1">
              <span className="text-slate-300 font-medium">Glass Count (Density)</span>
              <span className="font-mono text-emerald-400 font-bold">
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
                if (onSliderChange) {
                  onSliderChange('glassCountMultiplier', val);
                } else {
                  updateSliders({
                    fallSpeedMultiplier: fallSpeed,
                    glassCountMultiplier: val,
                    dangerLevelMultiplier: dangerLevel,
                  });
                }
              }}
              className="w-full accent-emerald-400 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-slate-500 mt-0.5">
              <span>0.6× (Few)</span>
              <span>1.0× (Standard)</span>
              <span>2.0× (Many)</span>
            </div>
          </div>

          {/* Slider 3: Danger Level */}
          <div>
            <div className="flex justify-between items-center text-[11px] mb-1">
              <span className="text-slate-300 font-medium">Danger Level (Hazards)</span>
              <span className="font-mono text-rose-400 font-bold">
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
                if (onSliderChange) {
                  onSliderChange('dangerLevelMultiplier', val);
                } else {
                  updateSliders({
                    fallSpeedMultiplier: fallSpeed,
                    glassCountMultiplier: glassCount,
                    dangerLevelMultiplier: val,
                  });
                }
              }}
              className="w-full accent-rose-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-slate-500 mt-0.5">
              <span>0.3× (Calm)</span>
              <span>1.0× (Default)</span>
              <span>2.5× (Intense)</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2">
          <button
            id="btn-resume-game"
            onClick={onResume}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-sky-500/25 active:scale-95 transition flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Resume Game</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              id="btn-restart-round"
              onClick={handleRestart}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 active:scale-95 transition flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restart Stage</span>
            </button>

            <button
              id="btn-select-stage"
              onClick={handleLevelSelect}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 active:scale-95 transition flex items-center justify-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5 text-sky-400" />
              <span>Stages</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
