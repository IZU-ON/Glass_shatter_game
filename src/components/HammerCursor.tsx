import React from 'react';
import { PowerUpType } from '../types';

interface HammerCursorProps {
  x: number;
  y: number;
  isSwinging: boolean;
  isVisible: boolean;
  activePowerUp: PowerUpType | null;
  swingAngle?: number; // animated angle in degrees
}

export const HammerCursor: React.FC<HammerCursorProps> = ({
  x,
  y,
  isSwinging,
  isVisible,
  activePowerUp,
  swingAngle = -28,
}) => {
  if (!isVisible) return null;

  const isHeavySledge = activePowerUp === 'hammer';
  const isCryo = activePowerUp === 'freeze';
  const isLaser = activePowerUp === 'laser';

  // Dynamic scale and glow depending on active power-up
  const scale = isHeavySledge ? 1.35 : 1.0;

  return (
    <div
      className="fixed pointer-events-none z-40 transition-transform duration-75 ease-out"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        transform: `translate(-28px, -48px) scale(${scale})`,
        willChange: 'transform, left, top',
      }}
    >
      {/* Laser pointer guide when laser powerup active */}
      {isLaser && (
        <div className="absolute left-[28px] top-[48px] -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border border-red-500/80 bg-red-500/20 animate-ping" />
      )}

      {/* Impact flash ring when swinging */}
      {isSwinging && (
        <div className="absolute left-[20px] top-[40px] w-12 h-12 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-amber-300 bg-amber-400/30 blur-xs animate-ping" />
      )}

      {/* Hammer SVG */}
      <svg
        width="76"
        height="76"
        viewBox="0 0 76 76"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)]"
        style={{
          transformOrigin: '54px 54px',
          transform: `rotate(${swingAngle}deg)`,
          transition: isSwinging ? 'transform 0.08s cubic-bezier(0.2, 0.9, 0.3, 1.2)' : 'transform 0.12s ease-out',
        }}
      >
        <defs>
          {/* Steel gradient */}
          <linearGradient id="hammerSteel" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="35%" stopColor="#94a3b8" />
            <stop offset="70%" stopColor="#475569" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>

          {/* Heavy Sledge Fire Gradient */}
          <linearGradient id="heavyFire" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="40%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#b91c1c" />
          </linearGradient>

          {/* Wood Handle Gradient */}
          <linearGradient id="hammerHandle" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#78350f" />
            <stop offset="50%" stopColor="#b45309" />
            <stop offset="100%" stopColor="#451a03" />
          </linearGradient>

          {/* Grip Wrap Gradient */}
          <linearGradient id="gripWrap" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#292524" />
            <stop offset="50%" stopColor="#44403c" />
            <stop offset="100%" stopColor="#1c1917" />
          </linearGradient>
        </defs>

        {/* Motion trail arc when swinging */}
        {isSwinging && (
          <path
            d="M 15 25 A 35 35 0 0 1 50 15"
            stroke={isHeavySledge ? '#f97316' : '#38bdf8'}
            strokeWidth="4"
            strokeLinecap="round"
            opacity="0.8"
            className="animate-pulse"
          />
        )}

        {/* Handle (Rotated diagonal down-right) */}
        <g transform="rotate(-45 38 38)">
          {/* Wooden Shaft */}
          <rect
            x="34"
            y="24"
            width="8"
            height="44"
            rx="3"
            fill="url(#hammerHandle)"
            stroke="#292524"
            strokeWidth="0.8"
          />

          {/* Leather Grip Wraps */}
          <rect x="33.5" y="44" width="9" height="22" rx="2" fill="url(#gripWrap)" />
          {/* Wrap stripes */}
          <line x1="33.5" y1="48" x2="42.5" y2="50" stroke="#78716c" strokeWidth="1" />
          <line x1="33.5" y1="53" x2="42.5" y2="55" stroke="#78716c" strokeWidth="1" />
          <line x1="33.5" y1="58" x2="42.5" y2="60" stroke="#78716c" strokeWidth="1" />

          {/* Pommel Cap */}
          <circle cx="38" cy="67" r="5" fill="#475569" stroke="#1e293b" strokeWidth="1" />
          <circle cx="38" cy="67" r="2.5" fill="#94a3b8" />

          {/* Metal Neck Collar */}
          <rect x="33" y="21" width="10" height="4.5" rx="1" fill="#64748b" stroke="#1e293b" strokeWidth="0.8" />

          {/* SLEDGE HAMMER HEAD */}
          <g>
            {/* Main Hammer Body */}
            <rect
              x="23"
              y="6"
              width="30"
              height="16"
              rx="2.5"
              fill={isHeavySledge ? 'url(#heavyFire)' : isCryo ? '#38bdf8' : 'url(#hammerSteel)'}
              stroke={isHeavySledge ? '#fdba74' : isCryo ? '#bae6fd' : '#0f172a'}
              strokeWidth="1.2"
            />

            {/* Striking Face Left (Beveled anvil face) */}
            <path
              d="M 23 7 L 18 9 L 18 19 L 23 21 Z"
              fill={isHeavySledge ? '#f97316' : '#cbd5e1'}
              stroke="#0f172a"
              strokeWidth="1"
            />
            <rect x="16.5" y="9.5" width="2" height="9" rx="0.5" fill="#f8fafc" />

            {/* Striking Face Right (Beveled anvil face) */}
            <path
              d="M 53 7 L 58 9 L 58 19 L 53 21 Z"
              fill={isHeavySledge ? '#ea580c' : '#64748b'}
              stroke="#0f172a"
              strokeWidth="1"
            />
            <rect x="57.5" y="9.5" width="2" height="9" rx="0.5" fill="#475569" />

            {/* Center Eye / Wedge Pin */}
            <circle cx="38" cy="14" r="3.2" fill="#0f172a" />
            <circle cx="38" cy="14" r="1.5" fill="#e2e8f0" />

            {/* Top Specular Glint */}
            <line x1="24" y1="8" x2="52" y2="8" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
          </g>
        </g>
      </svg>
    </div>
  );
};
