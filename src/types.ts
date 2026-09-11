export type SoundType =
  | 'crisp'
  | 'stained'
  | 'ice'
  | 'tempered'
  | 'cyber'
  | 'wire'
  | 'obsidian'
  | 'crystal'
  | 'plasma'
  | 'cosmic';

export type PatternType =
  | 'plain'
  | 'stained'
  | 'ice'
  | 'tempered'
  | 'cyber'
  | 'wire'
  | 'obsidian'
  | 'crystal'
  | 'plasma'
  | 'cosmic';

export type PowerUpType = 'hammer' | 'resonator' | 'freeze' | 'laser' | 'vortex' | 'slowmo';

export interface GlassColorTheme {
  baseColor: string; // glass tint
  borderColor: string;
  crackColor: string;
  glowColor: string;
  accentGradient: string;
  specular: string;
  badgeBg: string;
}

export interface GlassType {
  id: string;
  name: string;
  level: number;
  subtitle: string;
  description: string;
  hp: number;
  toughness: number;
  brittleness: number;
  soundType: SoundType;
  patternType: PatternType;
  colorTheme: GlassColorTheme;
  powerUpGranted: PowerUpType;
  shatterThreshold: number; // percentage of destruction needed (e.g. 85%)
  targetTaps: number; // for 3-star rating
  parTimeSeconds: number;
}

export interface LevelConfig {
  level: number;
  targetGlassSmashes: number;
  maxWoodStrikes: number;
  baseFallSpeed: number;
  spawnInterval: number; // in ms
  woodChance: number; // 0.0 - 1.0
  hazardChance: number;
  description: string;
}

export type ItemKind = 'glass' | 'wood' | 'hazard';

export type GlassThickness = 'thin' | 'normal' | 'thick';
export type HazardType = 'bomb' | 'spike' | 'metal' | 'wood';

export interface FallingItem {
  id: string;
  kind: ItemKind;
  name: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  radius: number;
  shape: 'rectangle' | 'diamond' | 'circle' | 'hex' | 'triangle' | 'plank' | 'log' | 'crate' | 'barrel' | 'bomb' | 'spike' | 'hazard_crate';
  rotation: number;
  vRot: number;
  hp: number;
  maxHp: number;
  points: number;
  glassType?: GlassType;
  glassThickness?: GlassThickness;
  hazardType?: HazardType;
  colorTheme?: GlassColorTheme;
  woodTextureSeed: number;
  cracks: CrackSegment[];
  isShattered: boolean;
  struckTime?: number;
}

export interface WoodSplinter {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  width: number;
  rotation: number;
  vRot: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

export interface PowerUp {
  id: PowerUpType;
  name: string;
  description: string;
  iconName: string;
  color: string;
  cooldownSeconds: number;
  durationSeconds: number;
  maxCharges: number;
}

export type FractureStyle =
  | 'spiderweb'
  | 'conchoidal'
  | 'cleavage'
  | 'craquelure'
  | 'starburst'
  | 'bifurcation';

export interface CrackSegment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  width: number;
  alpha: number;
  cpx?: number; // optional bezier control point for curved conchoidal ripples
  cpy?: number;
  branches?: CrackSegment[];
}

export interface GlassVoidHole {
  id: string;
  x: number;
  y: number;
  radius: number;
  vertices: Array<{ x: number; y: number }>;
  color: string;
}

export interface FloatingHitMarker {
  id: string;
  x: number;
  y: number;
  text: string;
  subText?: string;
  color: string;
  alpha: number;
  scale: number;
  vy: number;
  life: number;
  maxLife: number;
}

export interface CrackImpact {
  id: string;
  x: number;
  y: number;
  force: number;
  style: FractureStyle;
  radials: CrackSegment[];
  rings: Array<{
    cx: number;
    cy: number;
    r: number;
    startAngle: number;
    endAngle: number;
    width: number;
    alpha?: number;
  }>;
  time: number;
  color: string;
  craterRadius?: number;
  hazeRadius?: number;
  hazeColor?: string;
}

export interface GlassShard {
  id: number;
  points: Array<{ x: number; y: number }>;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  vRot: number;
  color: string;
  borderColor: string;
  glowColor?: string;
  alpha: number;
  life: number;
  maxLife: number;
  size: number;
  isSpecial?: boolean;
}

export interface SparkParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

export interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  color: string;
  alpha: number;
  lineWidth: number;
}

export interface LevelProgress {
  level: number;
  unlocked: boolean;
  completed: boolean;
  highScore: number;
  stars: number; // 0-3
  bestTime: number; // seconds
  tapsUsed: number;
}

export interface RoundStats {
  totalSwings: number;
  successfulGlassBreaks: number;
  misses: number;
  incorrectHits: number;
}

export interface GameSliders {
  fallSpeedMultiplier: number; // 0.5 - 2.0, default 1.0
  glassCountMultiplier: number; // 0.6 - 2.0, default 1.0
  dangerLevelMultiplier: number; // 0.3 - 2.5, default 1.0
}

export interface PlayerStats {
  playerName: string;
  totalScore: number;
  totalShardsBroken: number;
  totalGlassesShattered: number;
  highestCombo: number;
  totalTaps: number;
  levelsCompleted: number;
  totalStars: number;
  totalSwings?: number;
  misses?: number;
  incorrectHits?: number;
}

export interface LeaderboardEntry {
  id: string;
  rank: number;
  playerName: string;
  country: string;
  flag: string;
  totalScore: number;
  highestCombo: number;
  stars: number;
  shardsBroken: number;
  rankTier: 'Grandmaster' | 'Diamond' | 'Platinum' | 'Gold' | 'Silver' | 'Bronze';
  date: string;
  isPlayer?: boolean;
}
