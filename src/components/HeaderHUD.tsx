import React from 'react';
import { GlassType } from '../types';
import {
  Trophy,
  Volume2,
  VolumeX,
  Smartphone,
  Sparkles,
  Layers,
  Zap,
  Flame,
  Star,
  Lightbulb,
  ArrowRight,
  ShieldAlert,
  Target,
  Pause,
  Play,
} from 'lucide-react';

interface HeaderHUDProps {
  glass: GlassType;
  level: number;
  score: number;
  combo: number;
  comboMultiplier: number;
  starsEarned: number;
  totalStars: number;
  glassesSmashed: number;
  targetGlassSmashes: number;
  woodStrikes: number;
  maxWoodStrikes: number;
  isZenMode: boolean;
  isMuted: boolean;
  hapticsEnabled: boolean;
  isPaused: boolean;
  onTogglePause: () => void;
  onToggleMute: () => void;
  onToggleHaptics: () => void;
  onToggleZenMode: () => void;
  onOpenLevels: () => void;
  onOpenLeaderboard: () => void;
  onOpenHints: () => void;
  onAdvanceStage?: () => void;
  onResetStage: () => void;
}

export const HeaderHUD: React.FC<HeaderHUDProps> = ({
  glass,
  level,
  score,
  combo,
  comboMultiplier,
  totalStars,
  glassesSmashed,
  targetGlassSmashes,
  woodStrikes,
  maxWoodStrikes,
  isZenMode,
  isMuted,
  hapticsEnabled,
  isPaused,
  onTogglePause,
  onToggleMute,
  onToggleHaptics,
  onToggleZenMode,
  onOpenLevels,
  onOpenLeaderboard,
  onOpenHints,
  onAdvanceStage,
}) => {
  const smashProgressPct = Math.min(
    100,
    Math.round((glassesSmashed / Math.max(1, targetGlassSmashes)) * 100)
  );
  const isWoodDangerous = woodStrikes >= maxWoodStrikes - 1 && maxWoodStrikes > 0;

  return (
    <header className="w-full flex flex-col gap-1.5 sm:gap-2.5 px-2.5 sm:px-4 py-1.5 sm:py-3 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-slate-100 z-20 shrink-0">
      {/* Top Row: Brand, Stage Picker, Hints, Next Stage, Stars, Sound, Zen Mode */}
      <div className="flex items-center justify-between gap-1.5 sm:gap-2">
        {/* Brand & Stage */}
        <div className="flex items-center gap-1.5 sm:gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20 ring-1 ring-white/20 shrink-0">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-sky-400 via-indigo-300 to-purple-400 font-mono">
                  GLASS<span className="text-white">BREAKER</span>
                </span>
                <span className="text-[9px] sm:text-[10px] font-bold uppercase px-1.5 sm:px-2 py-0.2 sm:py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  ARCADE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Shatter Falling Glass • Avoid Wooden Planks
              </p>
            </div>
          </div>

          {/* Level Badge button */}
          <button
            id="btn-level-select"
            onClick={onOpenLevels}
            className="flex items-center gap-1 sm:gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 transition border border-slate-700 text-[11px] sm:text-xs font-semibold"
            title="Choose Stage"
          >
            <Layers className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-sky-400" />
            <span>{isZenMode ? 'Zen' : `Stage ${level}/10`}</span>
            <span className="text-slate-400 text-[9px] sm:text-[10px]">▼</span>
          </button>

          {/* Hints / Guide Button */}
          <button
            id="btn-open-hints"
            onClick={onOpenHints}
            className="flex items-center gap-1 sm:gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] sm:text-xs font-bold active:scale-95 transition shadow-sm"
            title="View Level Guide, Hints & Strategy"
          >
            <Lightbulb className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" />
            <span>Hints</span>
          </button>

          {/* Quick Advance to Next Level Button (Desktop only to conserve mobile height) */}
          {level < 10 && onAdvanceStage && (
            <button
              id="btn-advance-stage"
              onClick={onAdvanceStage}
              className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 text-xs font-semibold active:scale-95 transition"
              title={`Jump directly to Stage ${level + 1}`}
            >
              <span>Next Stage</span>
              <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
            </button>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Total Stars Counter Display */}
          <div
            className="flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl bg-amber-950/40 border border-amber-500/40 shadow-inner"
            title="Total Stars earned across all 10 Stages"
          >
            <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 fill-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]" />
            <span className="text-[11px] sm:text-xs font-black text-amber-300 font-mono">
              {totalStars}<span className="text-amber-500/70 font-normal">/30</span>
            </span>
          </div>

          {/* Pause / Resume Button */}
          <button
            id="btn-toggle-pause"
            onClick={onTogglePause}
            className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold border transition flex items-center gap-1.5 active:scale-95 shadow-sm ${
              isPaused
                ? 'bg-amber-500 text-slate-950 border-amber-400 animate-pulse'
                : 'bg-slate-800 text-sky-400 border-sky-500/40 hover:bg-slate-750 hover:border-sky-400'
            }`}
            title={isPaused ? 'Resume Game (Key P)' : 'Pause Game (Key P)'}
          >
            {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5 fill-current" />}
            <span className="hidden xs:inline">{isPaused ? 'Resume' : 'Pause'}</span>
          </button>

          {/* Zen vs Campaign Toggle */}
          <button
            id="btn-toggle-zen"
            onClick={onToggleZenMode}
            className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold border transition flex items-center gap-1 ${
              isZenMode
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
            }`}
            title="Toggle between Progression Campaign and Endless Zen"
          >
            <Zap className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${isZenMode ? 'text-emerald-400' : 'text-slate-400'}`} />
            <span className="hidden sm:inline">{isZenMode ? 'Zen Mode' : 'Campaign'}</span>
          </button>

          {/* Leaderboard Button */}
          <button
            id="btn-open-leaderboard"
            onClick={onOpenLeaderboard}
            className="flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] sm:text-xs font-semibold active:scale-95 transition shadow-sm"
          >
            <Trophy className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" />
            <span className="hidden xs:inline">Rank</span>
          </button>

          {/* Sound Mute */}
          <button
            id="btn-toggle-sound"
            onClick={onToggleMute}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 transition flex items-center justify-center border border-slate-700 text-slate-300"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />}
          </button>

          {/* Haptics */}
          <button
            id="btn-toggle-haptics"
            onClick={onToggleHaptics}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 transition flex items-center justify-center border border-slate-700 text-slate-300"
            title={hapticsEnabled ? 'Haptics Enabled' : 'Haptics Disabled'}
          >
            <Smartphone className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${hapticsEnabled ? 'text-sky-400' : 'text-slate-500'}`} />
          </button>
        </div>
      </div>

      {/* Bottom Row: Glass Goal Progress, Wood Strikes Alert, Combo & Score (Compact single row on mobile) */}
      <div className="flex flex-wrap md:grid md:grid-cols-12 gap-1.5 sm:gap-3 items-center pt-1.5 sm:pt-2 border-t border-slate-800/80">
        {/* Active Glass Type Name */}
        <div className="md:col-span-3 flex items-center gap-1.5">
          <div className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg border text-[11px] sm:text-xs font-semibold ${glass.colorTheme.badgeBg}`}>
            {glass.name}
          </div>
          <span className="text-[10px] sm:text-[11px] text-slate-400 truncate hidden lg:inline">
            Stage {level}
          </span>
        </div>

        {/* Target Glass Smashes Progress */}
        <div className="md:col-span-4 flex-1 min-w-[140px] flex flex-col gap-0.5 sm:gap-1">
          <div className="flex justify-between items-center text-[11px] sm:text-xs">
            <span className="text-slate-300 font-medium flex items-center gap-1">
              <Target className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-sky-400" />
              <span>Glass:</span>
              <span className="font-mono font-bold text-sky-300">
                {glassesSmashed}/{isZenMode ? '∞' : targetGlassSmashes}
              </span>
            </span>
            {!isZenMode && (
              <span className="text-slate-400 text-[10px] sm:text-[11px] font-mono">
                {smashProgressPct}%
              </span>
            )}
          </div>

          {!isZenMode && (
            <div className="w-full h-1.5 sm:h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/80">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-500 via-indigo-400 to-emerald-400 transition-all duration-200"
                style={{ width: `${smashProgressPct}%` }}
              />
            </div>
          )}
        </div>

        {/* Wood Strikes Danger Meter */}
        <div className="md:col-span-2 flex items-center gap-1.5">
          {!isZenMode && (
            <div
              className={`flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg border text-[11px] sm:text-xs font-semibold ${
                isWoodDangerous
                  ? 'bg-red-500/20 border-red-500/50 text-red-300 animate-pulse ring-1 ring-red-500/50'
                  : woodStrikes > 0
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300'
              }`}
              title="Avoid striking wooden planks! Exceeding the strike limit will fail the level."
            >
              <ShieldAlert className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${isWoodDangerous ? 'text-red-400' : 'text-amber-400'}`} />
              <span>Wood:</span>
              <span className="font-mono font-bold">
                {woodStrikes}/{maxWoodStrikes}
              </span>
            </div>
          )}
        </div>

        {/* Combo & Score */}
        <div className="md:col-span-3 flex items-center justify-end gap-2 sm:gap-3 ml-auto">
          {combo > 1 && (
            <div className="flex items-center gap-1 px-1.5 py-0.5 sm:px-2.5 sm:py-0.5 rounded-md sm:rounded-lg bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-300 animate-bounce">
              <Flame className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-400" />
              <span className="text-[10px] sm:text-xs font-black font-mono">
                {comboMultiplier}x
              </span>
            </div>
          )}

          <div className="text-right">
            <div className="text-[9px] sm:text-[10px] uppercase text-slate-400 font-bold tracking-wider leading-none">
              Score
            </div>
            <div className="text-xs sm:text-sm font-black text-sky-300 font-mono leading-tight">
              {(score ?? 0).toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
