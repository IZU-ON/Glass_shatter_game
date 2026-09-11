import React from 'react';
import { PowerUp, PowerUpType } from '../types';
import { POWER_UPS } from '../data/glassTypes';
import { Hammer, Snowflake, Radio, Flame, Disc, Clock } from 'lucide-react';

interface PowerUpBarProps {
  unlockedPowerUps: PowerUpType[];
  activePowerUp: PowerUpType | null;
  charges: Record<PowerUpType, number>;
  cooldowns: Record<PowerUpType, number>;
  onTriggerPowerUp: (type: PowerUpType) => void;
}

const ICON_MAP: Record<PowerUpType, React.FC<{ className?: string }>> = {
  hammer: Hammer,
  freeze: Snowflake,
  resonator: Radio,
  laser: Flame,
  vortex: Disc,
  slowmo: Clock,
};

export const PowerUpBar: React.FC<PowerUpBarProps> = ({
  unlockedPowerUps,
  activePowerUp,
  charges,
  cooldowns,
  onTriggerPowerUp,
}) => {
  return (
    <div className="w-full px-2 sm:px-4 py-1.5 sm:py-2 bg-slate-900/90 backdrop-blur-md border-t border-slate-800 flex items-center justify-between gap-1 sm:gap-2 overflow-x-auto shrink-0">
      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold uppercase tracking-wider shrink-0 hidden lg:flex">
        <span>Power-Ups</span>
        <span className="text-[10px] text-slate-500">(Keys 1-6)</span>
      </div>

      <div className="flex items-center gap-1 sm:gap-2 mx-auto overflow-x-auto py-0.5 justify-start sm:justify-center w-full sm:w-auto">
        {Object.keys(POWER_UPS).map((key, index) => {
          const type = key as PowerUpType;
          const powerUp = POWER_UPS[type];
          const isUnlocked = unlockedPowerUps.includes(type);
          const isActive = activePowerUp === type;
          const currentCharges = charges[type] || 0;
          const currentCooldown = cooldowns[type] || 0;
          const IconComponent = ICON_MAP[type] || Hammer;

          return (
            <button
              key={type}
              id={`powerup-${type}`}
              onClick={() => isUnlocked && currentCharges > 0 && currentCooldown === 0 && onTriggerPowerUp(type)}
              disabled={!isUnlocked || currentCharges <= 0 || currentCooldown > 0}
              className={`relative group flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold transition-all duration-150 border shrink-0 ${
                isActive
                  ? 'bg-amber-500/25 border-amber-400 text-white shadow-lg shadow-amber-500/20 scale-105'
                  : isUnlocked && currentCharges > 0 && currentCooldown === 0
                  ? 'bg-slate-800/90 border-slate-700 text-slate-200 hover:bg-slate-700 hover:border-slate-600 active:scale-95'
                  : 'bg-slate-800/40 border-slate-800 text-slate-500 cursor-not-allowed opacity-60'
              }`}
              title={`${powerUp.name}: ${powerUp.description} (Key ${index + 1})`}
            >
              {/* Hotkey Tag (desktop only) */}
              <span className="hidden sm:inline-block absolute -top-2 -left-1 text-[9px] font-mono px-1 py-0.2 rounded bg-slate-800 border border-slate-700 text-slate-400">
                {index + 1}
              </span>

              <div
                className="w-5 h-5 sm:w-6 sm:h-6 rounded-md sm:rounded-lg flex items-center justify-center transition shrink-0"
                style={{
                  backgroundColor: isUnlocked ? `${powerUp.color}25` : 'rgba(100, 116, 139, 0.1)',
                  color: isUnlocked ? powerUp.color : '#64748b',
                }}
              >
                <IconComponent className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${isActive ? 'animate-spin' : ''}`} />
              </div>

              <div className="flex flex-col text-left leading-tight">
                <span className="font-bold text-[10px] sm:text-[11px] flex items-center gap-1">
                  {powerUp.name}
                  {isActive && (
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  )}
                </span>
                <span className="text-[9px] sm:text-[10px] text-slate-400">
                  {isUnlocked ? (
                    currentCooldown > 0 ? (
                      <span className="text-amber-400 font-mono font-bold">{currentCooldown}s</span>
                    ) : (
                      `×${currentCharges}`
                    )
                  ) : (
                    'Locked'
                  )}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
