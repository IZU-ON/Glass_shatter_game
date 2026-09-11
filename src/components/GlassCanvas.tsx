import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  CrackImpact,
  CrackSegment,
  FloatingHitMarker,
  FallingItem,
  GlassColorTheme,
  GlassShard,
  GlassThickness,
  GlassType,
  HazardType,
  LevelConfig,
  PowerUpType,
  Shockwave,
  SparkParticle,
  WoodSplinter,
  GameSliders,
} from '../types';
import { soundEngine } from '../utils/audio';
import {
  createShardsFromImpact,
  createShockwave,
  createSparkParticles,
  createWoodSplinters,
} from '../utils/glassPhysics';
import { HammerCursor } from './HammerCursor';

interface GlassCanvasProps {
  glass: GlassType;
  level: number;
  levelConfig: LevelConfig;
  activePowerUp: PowerUpType | null;
  isSlowMo: boolean;
  isFrozen: boolean;
  isZenMode: boolean;
  isPaused: boolean;
  sliders: GameSliders;
  woodStrikes: number;
  maxWoodStrikes: number;
  glassesSmashed: number;
  targetGlassSmashes: number;
  combo: number;
  comboMultiplier: number;
  onGlassSmashed: (points: number, isCombo: boolean) => void;
  onWoodStruck: () => void;
  onDangerStruck?: (hazardName: string) => void;
  onSwing?: () => void;
  onMiss?: () => void;
}

export const GlassCanvas: React.FC<GlassCanvasProps> = ({
  glass,
  level,
  levelConfig,
  activePowerUp,
  isSlowMo,
  isFrozen,
  isZenMode,
  isPaused,
  sliders,
  woodStrikes,
  maxWoodStrikes,
  glassesSmashed,
  targetGlassSmashes,
  combo,
  comboMultiplier,
  onGlassSmashed,
  onWoodStruck,
  onDangerStruck,
  onSwing,
  onMiss,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Simulation state stored in refs for 60fps performance
  const fallingItemsRef = useRef<FallingItem[]>([]);
  const shardsRef = useRef<GlassShard[]>([]);
  const splintersRef = useRef<WoodSplinter[]>([]);
  const particlesRef = useRef<SparkParticle[]>([]);
  const shockwavesRef = useRef<Shockwave[]>([]);
  const floatingTextsRef = useRef<FloatingHitMarker[]>([]);
  const shakeRef = useRef<{ intensity: number }>({ intensity: 0 });
  const redFlashRef = useRef<number>(0);

  // Pointer & Hammer state
  const [pointerPos, setPointerPos] = useState<{ x: number; y: number }>({ x: -100, y: -100 });
  const [isPointerInside, setIsPointerInside] = useState<boolean>(false);
  const [isSwinging, setIsSwinging] = useState<boolean>(false);
  const [swingAngle, setSwingAngle] = useState<number>(-28);

  const isMouseDownRef = useRef<boolean>(false);
  const lastStrikeTimeRef = useRef<number>(0);
  const dimensionsRef = useRef<{ width: number; height: number }>({ width: 800, height: 600 });
  const animationFrameIdRef = useRef<number | null>(null);
  const lastSpawnTimeRef = useRef<number>(Date.now());

  // Reset falling items when stage changes
  useEffect(() => {
    fallingItemsRef.current = [];
    shardsRef.current = [];
    splintersRef.current = [];
    particlesRef.current = [];
    shockwavesRef.current = [];
    floatingTextsRef.current = [];
    shakeRef.current.intensity = 0;
    redFlashRef.current = 0;
    lastSpawnTimeRef.current = Date.now();
  }, [level]);

  // Handle Resize
  useEffect(() => {
    const updateSize = () => {
      if (!containerRef.current || !canvasRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(320, Math.floor(rect.width));
      const height = Math.max(320, Math.floor(rect.height));

      dimensionsRef.current = { width, height };
      canvasRef.current.width = width * dpr;
      canvasRef.current.height = height * dpr;
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    const observer = new ResizeObserver(updateSize);
    if (containerRef.current) observer.observe(containerRef.current);

    return () => {
      window.removeEventListener('resize', updateSize);
      observer.disconnect();
    };
  }, []);

  // Spawn falling items
  const spawnItem = useCallback(() => {
    const bounds = dimensionsRef.current;
    if (bounds.width <= 0) return;

    // Danger level multiplier from player slider
    const baseDangerChance = levelConfig.woodChance + levelConfig.hazardChance;
    const dangerChance = Math.min(0.7, baseDangerChance * sliders.dangerLevelMultiplier);
    const isDanger = Math.random() < dangerChance;

    const itemWidth = isDanger ? 70 + Math.random() * 40 : 65 + Math.random() * 40;
    const itemHeight = isDanger ? 50 + Math.random() * 35 : 65 + Math.random() * 35;

    // Random X bounded inside container
    const spawnX = Math.max(60, Math.min(bounds.width - 60, Math.random() * bounds.width));
    const spawnY = -itemHeight - 20;

    // Fall speed scaled live by slider
    const speedMult = (0.85 + Math.random() * 0.3) * sliders.fallSpeedMultiplier;
    const baseSpeed = levelConfig.baseFallSpeed * speedMult;
    const vx = (Math.random() - 0.5) * 40;
    const vy = baseSpeed;
    const vRot = (Math.random() - 0.5) * (isDanger ? 0.025 : 0.035);

    if (isDanger) {
      // DANGER / OBSTACLE OBJECT (Wood, Bomb, Spiked Mine, Industrial Hazard Crate)
      const hazardRoll = Math.random();
      let hazardType: HazardType = 'wood';
      let shape: FallingItem['shape'] = 'plank';
      let name = 'Wood Plank';

      if (level >= 2 && hazardRoll < 0.28) {
        // Ticking Hazard Bomb
        hazardType = 'bomb';
        shape = 'bomb';
        name = 'Hazard Bomb';
      } else if (level >= 3 && hazardRoll < 0.5) {
        // Spiked Hazard Mine
        hazardType = 'spike';
        shape = 'spike';
        name = 'Spiked Mine';
      } else if (level >= 2 && hazardRoll < 0.72) {
        // Industrial Hazard Crate
        hazardType = 'metal';
        shape = 'hazard_crate';
        name = 'Hazard Crate';
      } else {
        // Classic Wood (Plank, Log, Crate, Barrel)
        hazardType = 'wood';
        const woodShapes: FallingItem['shape'][] = ['plank', 'log', 'crate', 'barrel'];
        shape = woodShapes[Math.floor(Math.random() * woodShapes.length)];
        name = shape === 'plank' ? 'Wood Plank' : shape === 'log' ? 'Timber Log' : shape === 'crate' ? 'Wooden Crate' : 'Wood Barrel';
      }

      fallingItemsRef.current.push({
        id: `hazard-${Date.now()}-${Math.random()}`,
        kind: hazardType === 'wood' ? 'wood' : 'hazard',
        name,
        hazardType,
        x: spawnX,
        y: spawnY,
        vx,
        vy,
        width: itemWidth,
        height: itemHeight,
        radius: Math.max(itemWidth, itemHeight) * 0.5,
        shape,
        rotation: (Math.random() - 0.5) * 0.4,
        vRot,
        hp: 1,
        maxHp: 1,
        points: 0,
        woodTextureSeed: Math.random() * 1000,
        cracks: [],
        isShattered: false,
      });
    } else {
      // GLASS OBJECT (Thin, Normal, or Thick)
      const glassShapes: FallingItem['shape'][] = ['diamond', 'hex', 'rectangle', 'circle', 'triangle'];
      const shape = glassShapes[Math.floor(Math.random() * glassShapes.length)];

      // Roll glass thickness category based on progression stage
      let thickness: GlassThickness = 'normal';
      let maxHp = 1;
      const thickRoll = Math.random();

      if (level === 1) {
        thickness = thickRoll < 0.85 ? 'thin' : 'normal';
        maxHp = thickness === 'thin' ? 1 : 2;
      } else if (level <= 3) {
        if (thickRoll < 0.45) {
          thickness = 'thin';
          maxHp = 1;
        } else if (thickRoll < 0.85) {
          thickness = 'normal';
          maxHp = 2;
        } else {
          thickness = 'thick';
          maxHp = 3;
        }
      } else {
        // Level 4+
        if (thickRoll < 0.3) {
          thickness = 'thin';
          maxHp = 1;
        } else if (thickRoll < 0.65) {
          thickness = 'normal';
          maxHp = 2;
        } else {
          thickness = 'thick';
          maxHp = level >= 7 ? 3 : 2;
        }
      }

      const pointBase = thickness === 'thick' ? 250 : thickness === 'normal' ? 160 : 100;

      fallingItemsRef.current.push({
        id: `glass-${Date.now()}-${Math.random()}`,
        kind: 'glass',
        name: `${thickness.toUpperCase()} ${glass.name}`,
        x: spawnX,
        y: spawnY,
        vx,
        vy,
        width: itemWidth,
        height: itemHeight,
        radius: Math.max(itemWidth, itemHeight) * 0.5,
        shape,
        rotation: Math.random() * Math.PI * 2,
        vRot,
        hp: maxHp,
        maxHp,
        glassThickness: thickness,
        points: pointBase + level * 25,
        glassType: glass,
        colorTheme: glass.colorTheme,
        woodTextureSeed: 0,
        cracks: [],
        isShattered: false,
      });
    }
  }, [glass, level, levelConfig, sliders]);

  // Execute Hammer Strike at coordinates (x, y)
  const triggerStrike = useCallback(
    (x: number, y: number) => {
      if (isPaused) return;

      const now = Date.now();
      lastStrikeTimeRef.current = now;

      // Track player swing
      onSwing?.();

      // Animate hammer swing
      setIsSwinging(true);
      setSwingAngle(48); // Swing down hard
      setTimeout(() => {
        setSwingAngle(-28); // Return to ready position
        setIsSwinging(false);
      }, 110);

      // Play whoosh / swing sound
      soundEngine.playHammerSwing();

      // Power-up radius modifier
      const isHeavySledge = activePowerUp === 'hammer';
      const strikeRadius = isHeavySledge ? 105 : 56;

      const bounds = dimensionsRef.current;
      let hitAny = false;

      // Check hits against falling items
      const remainingItems: FallingItem[] = [];

      for (let i = 0; i < fallingItemsRef.current.length; i++) {
        const item = fallingItemsRef.current[i];
        if (item.isShattered) continue;

        // Approximate distance to item center
        const dx = x - item.x;
        const dy = y - item.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist <= strikeRadius + item.radius * 0.7) {
          hitAny = true;

          if (item.kind === 'glass') {
            // GLASS HIT
            const damage = isHeavySledge ? 4 : isFrozen ? 3 : 1;
            item.hp -= damage;

            if (item.hp <= 0) {
              // FULL SHATTER!
              item.isShattered = true;
              shakeRef.current.intensity = Math.min(22, 10 + (isHeavySledge ? 8 : 0));

              // Spawn realistic polygonal shards based on glass thickness
              const shardCount = item.glassThickness === 'thick' ? 32 : item.glassThickness === 'normal' ? 22 : 16;
              const shards = createShardsFromImpact(
                item.x,
                item.y,
                isHeavySledge ? shardCount * 1.4 : shardCount,
                glass,
                false,
                bounds
              );
              shardsRef.current.push(...shards);

              // Sparks & shockwave
              const sparks = createSparkParticles(
                item.x,
                item.y,
                24,
                glass.colorTheme.glowColor
              );
              particlesRef.current.push(...sparks);

              const shockwave = createShockwave(
                item.x,
                item.y,
                75,
                glass.colorTheme.borderColor
              );
              shockwavesRef.current.push(shockwave);

              // Tactile Audio based on glass thickness
              if (item.glassThickness === 'thin') {
                soundEngine.playThinGlassCrack();
                soundEngine.playCrack(glass.soundType, 1.1);
              } else if (item.glassThickness === 'thick') {
                soundEngine.playThickGlassCrack(3, 3);
                soundEngine.playShatter(glass.soundType);
              } else {
                soundEngine.playShatter(glass.soundType);
              }

              // Score calculation
              const earnedScore = item.points * comboMultiplier;
              const isCombo = combo > 1;

              // Floating hit text
              floatingTextsRef.current.push({
                id: `txt-${Date.now()}-${Math.random()}`,
                x: item.x,
                y: item.y - 20,
                text: `+${earnedScore}`,
                subText: isCombo ? `COMBO ×${comboMultiplier}!` : undefined,
                color: glass.colorTheme.crackColor,
                alpha: 1,
                scale: 1.2,
                vy: -2,
                life: 0,
                maxLife: 45,
              });

              onGlassSmashed(earnedScore, isCombo);
            } else {
              // PROGRESSIVE PHYSICAL CRACK!
              // Transform global strike coords to item local coords for physically pinned cracks
              const localAngle = -item.rotation;
              const lx = Math.cos(localAngle) * (x - item.x) - Math.sin(localAngle) * (y - item.y);
              const ly = Math.sin(localAngle) * (x - item.x) + Math.cos(localAngle) * (y - item.y);

              // Procedurally generate 5-8 radial crack segments from impact center
              const numRays = 5 + Math.floor(Math.random() * 3);
              for (let r = 0; r < numRays; r++) {
                const crAngle = (r / numRays) * Math.PI * 2 + (Math.random() - 0.5) * 0.6;
                const crLen = (item.width * 0.38) * (0.6 + Math.random() * 0.7);
                const p2x = lx + Math.cos(crAngle) * crLen;
                const p2y = ly + Math.sin(crAngle) * crLen;

                item.cracks.push({
                  x1: lx,
                  y1: ly,
                  x2: p2x,
                  y2: p2y,
                });

                // Fork branch
                if (Math.random() > 0.45) {
                  item.cracks.push({
                    x1: lx + Math.cos(crAngle) * (crLen * 0.55),
                    y1: ly + Math.sin(crAngle) * (crLen * 0.55),
                    x2: lx + Math.cos(crAngle + 0.45) * (crLen * 0.85),
                    y2: ly + Math.sin(crAngle + 0.45) * (crLen * 0.85),
                  });
                }
              }

              // Progressive crack acoustic feedback
              if (item.glassThickness === 'thick') {
                soundEngine.playThickGlassCrack(item.maxHp - item.hp, item.maxHp);
              } else {
                soundEngine.playCrack(glass.soundType, 0.85);
              }

              // Eject a few micro-shards around crack
              const microShards = createShardsFromImpact(
                item.x,
                item.y,
                7,
                glass,
                false,
                bounds
              );
              shardsRef.current.push(...microShards);

              floatingTextsRef.current.push({
                id: `txt-${Date.now()}-${Math.random()}`,
                x: item.x,
                y: item.y - 15,
                text: '⚡ FRACTURED!',
                subText: `${item.hp}/${item.maxHp} HP`,
                color: '#38bdf8',
                alpha: 1,
                scale: 1.05,
                vy: -1.5,
                life: 0,
                maxLife: 35,
              });

              remainingItems.push(item);
            }
          } else {
            // DANGER / OBSTACLE HIT -> CRITICAL PENALTY!
            item.isShattered = true;

            // Screen flashes red and shudders violently
            shakeRef.current.intensity = 26;
            redFlashRef.current = 0.95;

            // Danger feedback sound (clang + alarm buzz)
            soundEngine.playDangerHit();

            // Spawn debris: wood splinters or industrial metal sparks
            if (item.hazardType === 'bomb' || item.hazardType === 'spike' || item.hazardType === 'metal') {
              const sparks = createSparkParticles(item.x, item.y, 30, '#ef4444');
              particlesRef.current.push(...sparks);
              const shockwave = createShockwave(item.x, item.y, 80, '#ef4444');
              shockwavesRef.current.push(shockwave);
            } else {
              const splinters = createWoodSplinters(item.x, item.y, 22);
              splintersRef.current.push(...splinters);
            }

            // Floating error text
            floatingTextsRef.current.push({
              id: `txt-danger-${Date.now()}-${Math.random()}`,
              x: item.x,
              y: item.y - 25,
              text: `⚠️ WRONG HIT! (-150 PTS)`,
              subText: `Hit: ${item.name} (${woodStrikes + 1}/${maxWoodStrikes})`,
              color: '#ef4444',
              alpha: 1,
              scale: 1.35,
              vy: -2.4,
              life: 0,
              maxLife: 60,
            });

            onDangerStruck?.(item.name);
            onWoodStruck();
          }
        } else {
          remainingItems.push(item);
        }
      }

      fallingItemsRef.current = remainingItems;

      // If empty strike, trigger onMiss and spawn small spark
      if (!hitAny) {
        onMiss?.();
        const sparks = createSparkParticles(x, y, 6, '#94a3b8');
        particlesRef.current.push(...sparks);
      }
    },
    [
      isPaused,
      activePowerUp,
      glass,
      combo,
      comboMultiplier,
      woodStrikes,
      maxWoodStrikes,
      isFrozen,
      onGlassSmashed,
      onWoodStruck,
      onDangerStruck,
      onSwing,
      onMiss,
    ]
  );

  // Mouse & Touch events
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    isMouseDownRef.current = true;
    setPointerPos({ x: e.clientX, y: e.clientY });
    setIsPointerInside(true);

    triggerStrike(x, y);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    setPointerPos({ x: e.clientX, y: e.clientY });
    setIsPointerInside(true);

    // If thermal laser is active and user is dragging, strike continuously
    if (activePowerUp === 'laser' && isMouseDownRef.current && containerRef.current) {
      const now = Date.now();
      if (now - lastStrikeTimeRef.current > 90) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        triggerStrike(x, y);
      }
    }
  };

  const handlePointerUp = () => {
    isMouseDownRef.current = false;
  };

  const handlePointerLeave = () => {
    setIsPointerInside(false);
    isMouseDownRef.current = false;
  };

  // Main Render & Physics Simulation Loop
  useEffect(() => {
    let lastTime = performance.now();

    const renderLoop = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      const canvas = canvasRef.current;
      if (!canvas) {
        animationFrameIdRef.current = requestAnimationFrame(renderLoop);
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        animationFrameIdRef.current = requestAnimationFrame(renderLoop);
        return;
      }

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = dimensionsRef.current.width;
      const height = dimensionsRef.current.height;

      // Spawning clock (halts when paused)
      const now = Date.now();
      if (!isPaused) {
        const spawnInterval =
          (isSlowMo
            ? levelConfig.spawnInterval * 2
            : isFrozen
            ? 999999
            : levelConfig.spawnInterval) / (sliders.glassCountMultiplier || 1);

        if (now - lastSpawnTimeRef.current >= spawnInterval) {
          spawnItem();
          lastSpawnTimeRef.current = now;
        }
      } else {
        lastSpawnTimeRef.current = now;
      }

      // Physics time scale (0 when paused)
      const timeScale = isPaused ? 0 : isFrozen ? 0.05 : isSlowMo ? 0.25 : 1.0;

      // 1. CLEAR & CAMERA SHAKE
      ctx.save();
      ctx.scale(dpr, dpr);

      let shakeX = 0;
      let shakeY = 0;
      if (shakeRef.current.intensity > 0.1) {
        shakeX = (Math.random() - 0.5) * shakeRef.current.intensity;
        shakeY = (Math.random() - 0.5) * shakeRef.current.intensity;
        shakeRef.current.intensity *= 0.88;
      }

      ctx.translate(shakeX, shakeY);
      ctx.clearRect(-20, -20, width + 40, height + 40);

      // Deep atmospheric ASMR workshop background
      const bgGrad = ctx.createRadialGradient(
        width * 0.5,
        height * 0.45,
        50,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.85
      );
      bgGrad.addColorStop(0, '#0d1527');
      bgGrad.addColorStop(0.5, '#090d18');
      bgGrad.addColorStop(1, '#04070e');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(-20, -20, width + 40, height + 40);

      // Ambient perspective grid
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.04)';
      ctx.lineWidth = 1;
      const gridSize = 64;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 2. UPDATE & DRAW FALLING ITEMS
      const activeItems: FallingItem[] = [];

      for (let i = 0; i < fallingItemsRef.current.length; i++) {
        const item = fallingItemsRef.current[i];
        if (item.isShattered) continue;

        // Position update (frozen in place if paused)
        item.x += item.vx * dt * timeScale;
        item.y += item.vy * dt * timeScale;
        item.rotation += item.vRot * timeScale;

        // Bounce gently off left/right walls
        if (item.x < item.radius) {
          item.x = item.radius;
          item.vx = Math.abs(item.vx);
        } else if (item.x > width - item.radius) {
          item.x = width - item.radius;
          item.vx = -Math.abs(item.vx);
        }

        // Check if item fallen off the bottom screen
        if (item.y > height + item.height + 40) {
          continue; // item discarded safely
        }

        activeItems.push(item);

        // DRAW ITEM
        ctx.save();
        ctx.translate(item.x, item.y);
        ctx.rotate(item.rotation);

        if (item.kind === 'glass') {
          // ================= GLASS ITEM RENDERING =================
          const color = item.colorTheme || glass.colorTheme;
          const w = item.width;
          const h = item.height;
          const isThick = item.glassThickness === 'thick';
          const isThin = item.glassThickness === 'thin';

          // Outer Neon Glow
          ctx.shadowColor = isFrozen ? '#bae6fd' : color.glowColor;
          ctx.shadowBlur = isFrozen ? 22 : isThick ? 16 : 10;

          // Glass Body Shape
          ctx.beginPath();
          if (item.shape === 'diamond') {
            ctx.moveTo(0, -h * 0.5);
            ctx.lineTo(w * 0.5, 0);
            ctx.lineTo(0, h * 0.5);
            ctx.lineTo(-w * 0.5, 0);
            ctx.closePath();
          } else if (item.shape === 'hex') {
            for (let a = 0; a < 6; a++) {
              const angle = (a / 6) * Math.PI * 2;
              const px = Math.cos(angle) * (w * 0.5);
              const py = Math.sin(angle) * (h * 0.5);
              if (a === 0) ctx.moveTo(px, py);
              else ctx.lineTo(px, py);
            }
            ctx.closePath();
          } else if (item.shape === 'circle') {
            ctx.arc(0, 0, Math.min(w, h) * 0.48, 0, Math.PI * 2);
          } else if (item.shape === 'triangle') {
            ctx.moveTo(0, -h * 0.5);
            ctx.lineTo(w * 0.5, h * 0.5);
            ctx.lineTo(-w * 0.5, h * 0.5);
            ctx.closePath();
          } else {
            // Rounded Rectangle Pane
            const r = isThick ? 10 : 8;
            ctx.roundRect(-w * 0.5, -h * 0.5, w, h, r);
          }

          // Translucent Glass Fill
          ctx.fillStyle = isFrozen
            ? 'rgba(186, 230, 253, 0.45)'
            : isThick
            ? color.baseColor.replace('0.22', '0.36').replace('0.3', '0.45')
            : isThin
            ? color.baseColor.replace('0.22', '0.14').replace('0.3', '0.2')
            : color.baseColor;
          ctx.fill();

          // Luminous Glass Border
          ctx.strokeStyle = isFrozen ? '#bae6fd' : color.borderColor;
          ctx.lineWidth = isFrozen ? 3.5 : isThick ? 4.5 : isThin ? 2.0 : 3.0;
          ctx.stroke();

          // If thick glass, draw inner bevel rim
          if (isThick) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }

          // Reset shadow
          ctx.shadowBlur = 0;

          // Diagonal Specular Reflection Streak
          ctx.save();
          ctx.clip(); // clip to glass shape
          const specGrad = ctx.createLinearGradient(-w * 0.5, -h * 0.5, w * 0.5, h * 0.5);
          specGrad.addColorStop(0, 'rgba(255, 255, 255, 0.65)');
          specGrad.addColorStop(0.28, 'rgba(255, 255, 255, 0.18)');
          specGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.0)');
          specGrad.addColorStop(0.72, 'rgba(255, 255, 255, 0.22)');
          specGrad.addColorStop(1, 'rgba(255, 255, 255, 0.55)');
          ctx.fillStyle = specGrad;
          ctx.fillRect(-w, -h, w * 2, h * 2);

          // Subtle Facet / Refraction Cross lines
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
          ctx.lineWidth = 1.0;
          ctx.beginPath();
          ctx.moveTo(-w * 0.35, -h * 0.35);
          ctx.lineTo(w * 0.35, h * 0.35);
          ctx.moveTo(w * 0.35, -h * 0.35);
          ctx.lineTo(-w * 0.35, h * 0.35);
          ctx.stroke();

          // PROGRESSIVE CRACKS (Physically pinned to rotating glass body)
          if (item.cracks && item.cracks.length > 0) {
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = isThick ? 2.6 : 1.8;
            ctx.shadowColor = 'rgba(255, 255, 255, 0.95)';
            ctx.shadowBlur = 5;
            for (const crack of item.cracks) {
              ctx.beginPath();
              ctx.moveTo(crack.x1, crack.y1);
              ctx.lineTo(crack.x2, crack.y2);
              ctx.stroke();
            }
            ctx.shadowBlur = 0;
          }

          ctx.restore();

          // Multi-HP & Thickness Label Indicator
          const thickBadge = isThick ? 'THICK' : isThin ? 'THIN' : '';
          const hpLabel = item.maxHp > 1 ? `${item.hp}/${item.maxHp} HP` : thickBadge;
          if (hpLabel) {
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 9px monospace';
            ctx.textAlign = 'center';
            ctx.shadowColor = 'rgba(0,0,0,0.8)';
            ctx.shadowBlur = 4;
            ctx.fillText(hpLabel, 0, -h * 0.5 - 6);
            ctx.shadowBlur = 0;
          }
        } else {
          // ================= DANGER / OBSTACLE RENDERING =================
          const w = item.width;
          const h = item.height;

          if (item.hazardType === 'bomb' || item.shape === 'bomb') {
            // METALLIC DANGER BOMB
            ctx.shadowColor = 'rgba(239, 68, 68, 0.7)';
            ctx.shadowBlur = 12;

            // Bomb iron sphere
            ctx.beginPath();
            ctx.arc(0, 0, w * 0.42, 0, Math.PI * 2);
            const bGrad = ctx.createRadialGradient(-w * 0.1, -h * 0.1, 4, 0, 0, w * 0.45);
            bGrad.addColorStop(0, '#64748b');
            bGrad.addColorStop(0.5, '#1e293b');
            bGrad.addColorStop(1, '#090d16');
            ctx.fillStyle = bGrad;
            ctx.fill();
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 2.5;
            ctx.stroke();

            // Fuse cap
            ctx.fillStyle = '#f59e0b';
            ctx.fillRect(-w * 0.08, -h * 0.45, w * 0.16, h * 0.12);

            // Animated burning fuse spark
            const sparkRadius = 3.5 + Math.sin(Date.now() * 0.02) * 1.5;
            ctx.beginPath();
            ctx.arc(0, -h * 0.5, sparkRadius, 0, Math.PI * 2);
            ctx.fillStyle = '#f97316';
            ctx.fill();

            // Skull symbol
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#ef4444';
            ctx.font = '900 13px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('💣', 0, 0);

            // Warning Badge
            ctx.fillStyle = 'rgba(239, 68, 68, 0.95)';
            ctx.beginPath();
            ctx.roundRect(-w * 0.46, h * 0.42, w * 0.92, 14, 3);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.font = 'black 8px sans-serif';
            ctx.fillText('⚠️ BOMB - DANGER', 0, h * 0.42 + 7);
          } else if (item.hazardType === 'spike' || item.shape === 'spike') {
            // SPIKED HAZARD MINE
            ctx.shadowColor = 'rgba(245, 158, 11, 0.7)';
            ctx.shadowBlur = 12;

            // Spikes protruding outward
            ctx.fillStyle = '#334155';
            for (let s = 0; s < 8; s++) {
              const spAngle = (s / 8) * Math.PI * 2;
              ctx.beginPath();
              ctx.moveTo(Math.cos(spAngle - 0.22) * (w * 0.32), Math.sin(spAngle - 0.22) * (w * 0.32));
              ctx.lineTo(Math.cos(spAngle) * (w * 0.52), Math.sin(spAngle) * (w * 0.52));
              ctx.lineTo(Math.cos(spAngle + 0.22) * (w * 0.32), Math.sin(spAngle + 0.22) * (w * 0.32));
              ctx.closePath();
              ctx.fill();
            }

            // Central core
            ctx.beginPath();
            ctx.arc(0, 0, w * 0.34, 0, Math.PI * 2);
            ctx.fillStyle = '#0f172a';
            ctx.fill();
            ctx.strokeStyle = '#eab308';
            ctx.lineWidth = 3;
            ctx.stroke();

            // Label
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#eab308';
            ctx.font = 'bold 11px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('⚡ MINE', 0, 0);

            // Badge
            ctx.fillStyle = 'rgba(234, 179, 8, 0.95)';
            ctx.beginPath();
            ctx.roundRect(-w * 0.46, h * 0.42, w * 0.92, 14, 3);
            ctx.fill();
            ctx.fillStyle = '#090d16';
            ctx.font = 'black 8px sans-serif';
            ctx.fillText('🚫 DO NOT HIT', 0, h * 0.42 + 7);
          } else if (item.hazardType === 'metal' || item.shape === 'hazard_crate') {
            // INDUSTRIAL HAZARD CRATE
            ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.roundRect(-w * 0.5, -h * 0.5, w, h, 4);
            ctx.fillStyle = '#1e293b';
            ctx.fill();
            ctx.strokeStyle = '#eab308';
            ctx.lineWidth = 3;
            ctx.stroke();

            // Diagonal hazard zebra stripes
            ctx.save();
            ctx.clip();
            ctx.strokeStyle = '#eab308';
            ctx.lineWidth = 6;
            for (let z = -w - h; z < w + h; z += 16) {
              ctx.beginPath();
              ctx.moveTo(z, -h);
              ctx.lineTo(z + h * 1.5, h);
              ctx.stroke();
            }
            ctx.restore();

            // Center steel badge
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.roundRect(-w * 0.38, -9, w * 0.76, 18, 3);
            ctx.fill();
            ctx.fillStyle = '#eab308';
            ctx.font = 'black 9px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('⚠ HAZARD', 0, 0);
          } else {
            // CLASSIC WOOD (Log, Crate, Plank, Barrel)
            ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
            ctx.shadowBlur = 10;
            ctx.shadowOffsetY = 4;

            if (item.shape === 'log') {
              ctx.beginPath();
              ctx.roundRect(-w * 0.5, -h * 0.5, w, h, h * 0.4);
              ctx.fillStyle = '#78350f';
              ctx.fill();
              ctx.strokeStyle = '#451a03';
              ctx.lineWidth = 3;
              ctx.stroke();

              ctx.beginPath();
              ctx.arc(-w * 0.5 + h * 0.4, 0, h * 0.3, 0, Math.PI * 2);
              ctx.fillStyle = '#b45309';
              ctx.fill();
              ctx.strokeStyle = '#78350f';
              ctx.lineWidth = 1.5;
              ctx.stroke();
            } else if (item.shape === 'crate') {
              ctx.beginPath();
              ctx.roundRect(-w * 0.5, -h * 0.5, w, h, 4);
              ctx.fillStyle = '#92400e';
              ctx.fill();
              ctx.strokeStyle = '#451a03';
              ctx.lineWidth = 3;
              ctx.stroke();

              ctx.strokeStyle = '#78350f';
              ctx.lineWidth = 4;
              ctx.beginPath();
              ctx.moveTo(-w * 0.5, -h * 0.5);
              ctx.lineTo(w * 0.5, h * 0.5);
              ctx.moveTo(w * 0.5, -h * 0.5);
              ctx.lineTo(-w * 0.5, h * 0.5);
              ctx.stroke();
            } else {
              ctx.beginPath();
              ctx.roundRect(-w * 0.5, -h * 0.5, w, h, 4);
              ctx.fillStyle = '#b45309';
              ctx.fill();
              ctx.strokeStyle = '#451a03';
              ctx.lineWidth = 2.5;
              ctx.stroke();

              ctx.strokeStyle = '#92400e';
              ctx.lineWidth = 1.2;
              for (let g = -h * 0.3; g <= h * 0.3; g += 6) {
                ctx.beginPath();
                ctx.moveTo(-w * 0.45, g);
                ctx.lineTo(w * 0.45, g + Math.sin(g) * 2);
                ctx.stroke();
              }
            }

            ctx.shadowBlur = 0;

            // Warning Badge
            ctx.fillStyle = 'rgba(239, 68, 68, 0.95)';
            ctx.beginPath();
            ctx.roundRect(-w * 0.45, -8, w * 0.9, 16, 4);
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.fillStyle = '#ffffff';
            ctx.font = 'black 9px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('🚫 DO NOT HIT', 0, 0);
          }
        }

        ctx.restore();
      }

      fallingItemsRef.current = activeItems;

      // 3. DRAW GLASS SHARDS
      const activeShards: GlassShard[] = [];
      for (let i = 0; i < shardsRef.current.length; i++) {
        const s = shardsRef.current[i];
        s.life += dt * 60;
        if (s.life >= s.maxLife) continue;

        // Physics
        s.vy += 0.42 * dt * 60; // gravity
        s.x += s.vx * dt * 60;
        s.y += s.vy * dt * 60;
        s.rotation += s.vRot;

        s.alpha = Math.max(0, 1 - s.life / s.maxLife);
        activeShards.push(s);

        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(s.rotation);
        ctx.globalAlpha = s.alpha;

        ctx.fillStyle = s.color;
        ctx.strokeStyle = s.borderColor;
        ctx.lineWidth = 1.5;

        ctx.beginPath();
        if (s.points && s.points.length > 2) {
          ctx.moveTo(s.points[0].x, s.points[0].y);
          for (let p = 1; p < s.points.length; p++) {
            ctx.lineTo(s.points[p].x, s.points[p].y);
          }
          ctx.closePath();
        } else {
          ctx.rect(-s.size * 0.5, -s.size * 0.5, s.size, s.size);
        }
        ctx.fill();
        ctx.stroke();

        ctx.restore();
      }
      shardsRef.current = activeShards;

      // 4. DRAW WOOD SPLINTERS
      const activeSplinters: WoodSplinter[] = [];
      for (let i = 0; i < splintersRef.current.length; i++) {
        const sp = splintersRef.current[i];
        sp.life += dt * 60;
        if (sp.life >= sp.maxLife) continue;

        sp.vy += 0.38 * dt * 60; // gravity
        sp.x += sp.vx * dt * 60;
        sp.y += sp.vy * dt * 60;
        sp.rotation += sp.vRot;
        sp.alpha = Math.max(0, 1 - sp.life / sp.maxLife);

        activeSplinters.push(sp);

        ctx.save();
        ctx.translate(sp.x, sp.y);
        ctx.rotate(sp.rotation);
        ctx.globalAlpha = sp.alpha;

        ctx.fillStyle = sp.color;
        ctx.fillRect(-sp.length * 0.5, -sp.width * 0.5, sp.length, sp.width);

        ctx.restore();
      }
      splintersRef.current = activeSplinters;

      // 5. DRAW SPARK PARTICLES
      const activeParticles: SparkParticle[] = [];
      for (let i = 0; i < particlesRef.current.length; i++) {
        const p = particlesRef.current[i];
        p.life += dt * 60;
        if (p.life >= p.maxLife) continue;

        p.x += p.vx * dt * 60;
        p.y += p.vy * dt * 60;
        p.alpha = Math.max(0, 1 - p.life / p.maxLife);
        activeParticles.push(p);

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      particlesRef.current = activeParticles;

      // 6. DRAW SHOCKWAVES
      const activeShockwaves: Shockwave[] = [];
      for (let i = 0; i < shockwavesRef.current.length; i++) {
        const sw = shockwavesRef.current[i];
        sw.radius += (sw.maxRadius - sw.radius) * 0.18 + 1.5;
        sw.alpha *= 0.88;

        if (sw.alpha > 0.05 && sw.radius < sw.maxRadius) {
          activeShockwaves.push(sw);
          ctx.save();
          ctx.globalAlpha = sw.alpha;
          ctx.strokeStyle = sw.color;
          ctx.lineWidth = sw.lineWidth;
          ctx.beginPath();
          ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }
      }
      shockwavesRef.current = activeShockwaves;

      // 7. DRAW FLOATING HIT TEXT
      const activeTexts: FloatingHitMarker[] = [];
      for (let i = 0; i < floatingTextsRef.current.length; i++) {
        const ft = floatingTextsRef.current[i];
        ft.life += dt * 60;
        if (ft.life >= ft.maxLife) continue;

        ft.y += ft.vy;
        ft.alpha = Math.max(0, 1 - ft.life / ft.maxLife);
        activeTexts.push(ft);

        ctx.save();
        ctx.globalAlpha = ft.alpha;
        ctx.fillStyle = ft.color;
        ctx.font = '900 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
        ctx.shadowBlur = 6;
        ctx.fillText(ft.text, ft.x, ft.y);

        if (ft.subText) {
          ctx.font = 'bold 11px sans-serif';
          ctx.fillText(ft.subText, ft.x, ft.y + 14);
        }
        ctx.restore();
      }
      floatingTextsRef.current = activeTexts;

      // 8. RED SCREEN FLASH ON WOOD DAMAGE PENALTY
      if (redFlashRef.current > 0.02) {
        ctx.save();
        ctx.fillStyle = `rgba(239, 68, 68, ${redFlashRef.current * 0.35})`;
        ctx.fillRect(-20, -20, width + 40, height + 40);
        ctx.restore();
        redFlashRef.current *= 0.9;
      }

      ctx.restore();

      animationFrameIdRef.current = requestAnimationFrame(renderLoop);
    };

    animationFrameIdRef.current = requestAnimationFrame(renderLoop);
    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [glass, isFrozen, isSlowMo, isPaused, levelConfig, spawnItem, sliders]);

  return (
    <div
      ref={containerRef}
      id="glass-game-container"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      className="relative w-full h-full select-none overflow-hidden touch-none cursor-none bg-slate-950 flex items-center justify-center"
      style={{ cursor: 'none' }}
    >
      {/* Background visual Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

      {/* Hammer Cursor Component */}
      <HammerCursor
        x={pointerPos.x}
        y={pointerPos.y}
        isSwinging={isSwinging}
        isVisible={isPointerInside}
        activePowerUp={activePowerUp}
        swingAngle={swingAngle}
      />
    </div>
  );
};
