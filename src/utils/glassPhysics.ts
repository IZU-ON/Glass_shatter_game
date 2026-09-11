import {
  CrackImpact,
  CrackSegment,
  FractureStyle,
  GlassColorTheme,
  GlassShard,
  GlassType,
  GlassVoidHole,
  PatternType,
  Shockwave,
  SparkParticle,
} from '../types';

/**
 * Creates a jagged physical punch-through crater hole where glass has broken completely through
 */
export function createVoidHole(
  x: number,
  y: number,
  radius: number,
  glass: GlassType
): GlassVoidHole {
  const vertices: Array<{ x: number; y: number }> = [];
  const numPoints = 8 + Math.floor(Math.random() * 8);

  for (let i = 0; i < numPoints; i++) {
    const angle = (i / numPoints) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
    // Irregular jagged radius
    const r = radius * (0.6 + Math.random() * 0.7);
    vertices.push({
      x: x + Math.cos(angle) * r,
      y: y + Math.sin(angle) * r,
    });
  }

  return {
    id: `void-${Date.now()}-${Math.random()}`,
    x,
    y,
    radius,
    vertices,
    color: glass.colorTheme.crackColor,
  };
}

/**
 * Master generator for procedural fractures.
 * Picks completely distinct fracture physics & algorithms based on force, material, and random roll
 * so EVERY SINGLE BREAK IS UNMISTAKABLY UNIQUE.
 */
export function generateCrackImpact(
  x: number,
  y: number,
  force: number,
  glass: GlassType,
  bounds: { width: number; height: number },
  forcedStyle?: FractureStyle
): CrackImpact {
  const brittleness = glass.brittleness;
  const toughness = glass.toughness;

  // Decide fracture style if not forced
  let style: FractureStyle = forcedStyle || 'spiderweb';
  if (!forcedStyle) {
    const roll = Math.random();
    if (glass.patternType === 'tempered') {
      style = roll < 0.6 ? 'craquelure' : 'spiderweb';
    } else if (glass.patternType === 'obsidian' || glass.patternType === 'crystal') {
      style = roll < 0.45 ? 'conchoidal' : roll < 0.75 ? 'cleavage' : 'bifurcation';
    } else if (force > 2.0) {
      style = roll < 0.35 ? 'cleavage' : roll < 0.7 ? 'starburst' : 'bifurcation';
    } else {
      if (roll < 0.25) style = 'spiderweb';
      else if (roll < 0.45) style = 'conchoidal';
      else if (roll < 0.65) style = 'bifurcation';
      else if (roll < 0.82) style = 'starburst';
      else style = 'cleavage';
    }
  }

  const radials: CrackSegment[] = [];
  const rings: CrackImpact['rings'] = [];
  const baseRadius = Math.min(bounds.width, bounds.height) * (0.12 + force * 0.14);

  // 1. STYLE: CONCHOIDAL SHELL FRACTURE (smooth scallop curves, wave arcs)
  if (style === 'conchoidal') {
    const numLobes = 4 + Math.floor(Math.random() * 5);
    for (let i = 0; i < numLobes; i++) {
      const angle = (i / numLobes) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
      const armLen = baseRadius * (0.7 + Math.random() * 0.9);
      const ex = x + Math.cos(angle) * armLen;
      const ey = y + Math.sin(angle) * armLen;
      // Perpendicular arc curve
      const midAngle = angle + (Math.random() > 0.5 ? 0.35 : -0.35);
      const cpx = x + Math.cos(midAngle) * (armLen * 0.55);
      const cpy = y + Math.sin(midAngle) * (armLen * 0.55);

      radials.push({
        x1: x,
        y1: y,
        x2: ex,
        y2: ey,
        cpx,
        cpy,
        width: Math.max(1.2, 3.2 * force),
        alpha: 0.95,
      });
    }

    // Scalloped concentric ripple shells
    const rippleCount = 3 + Math.floor(Math.random() * 4);
    for (let r = 1; r <= rippleCount; r++) {
      const rippleR = (baseRadius / (rippleCount + 1)) * r * (0.7 + Math.random() * 0.5);
      const startAngle = Math.random() * Math.PI;
      const arcSpan = Math.PI * (0.8 + Math.random() * 0.9);
      rings.push({
        cx: x + (Math.random() - 0.5) * 8,
        cy: y + (Math.random() - 0.5) * 8,
        r: rippleR,
        startAngle,
        endAngle: startAngle + arcSpan,
        width: Math.max(0.9, 2.2 - r * 0.25),
        alpha: 0.9,
      });
    }
  }

  // 2. STYLE: CLEAVAGE FAULT-LINE (massive tectonic split across the pane)
  else if (style === 'cleavage') {
    // 2-3 primary dominant shear fault lines running far across the pane
    const primaryFaults = 1 + (Math.random() > 0.4 ? 1 : 0);
    for (let f = 0; f < primaryFaults; f++) {
      // Primary angle direction
      const faultAngle = (Math.PI / 4) + (f * Math.PI / 2) + (Math.random() - 0.5) * 0.6;
      // Opposite ends
      for (const dir of [1, -1]) {
        let cx = x;
        let cy = y;
        const totalSteps = 6 + Math.floor(Math.random() * 6);
        const faultLen = Math.max(bounds.width, bounds.height) * (0.4 + Math.random() * 0.5);
        const stepDist = faultLen / totalSteps;
        let currentAngle = faultAngle + (dir === -1 ? Math.PI : 0);

        for (let s = 0; s < totalSteps; s++) {
          // Jagged zigzag micro-teeth
          const dev = (Math.random() - 0.5) * 0.55;
          currentAngle += dev;
          const nx = cx + Math.cos(currentAngle) * stepDist;
          const ny = cy + Math.sin(currentAngle) * stepDist;

          // Lateral spur branches
          const branches: CrackSegment[] = [];
          if (Math.random() < 0.55 && s > 0) {
            const spurAngle = currentAngle + (Math.random() > 0.5 ? 1.1 : -1.1) + (Math.random() - 0.5) * 0.3;
            const spurLen = stepDist * (0.7 + Math.random() * 0.9);
            branches.push({
              x1: nx,
              y1: ny,
              x2: nx + Math.cos(spurAngle) * spurLen,
              y2: ny + Math.sin(spurAngle) * spurLen,
              width: Math.max(1, 2.0 * (1 - s / totalSteps)),
              alpha: 0.85,
            });
          }

          radials.push({
            x1: cx,
            y1: cy,
            x2: nx,
            y2: ny,
            width: Math.max(1.5, (4.5 - s * 0.35) * Math.min(2.2, force)),
            alpha: 0.98,
            branches,
          });

          cx = nx;
          cy = ny;
        }
      }
    }

    // Minor stress arcs
    rings.push({
      cx: x,
      cy: y,
      r: baseRadius * 0.35,
      startAngle: 0,
      endAngle: Math.PI * 2,
      width: 1.8,
      alpha: 0.8,
    });
  }

  // 3. STYLE: CRAQUELURE MOSAIC (dense tempered miniature crackle lattice)
  else if (style === 'craquelure') {
    const numCells = 14 + Math.floor(Math.random() * 10);
    const cellRadius = baseRadius * 0.85;

    for (let i = 0; i < numCells; i++) {
      const ang = (i / numCells) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
      const d = (cellRadius * (0.3 + Math.random() * 0.7));
      const p1x = x + Math.cos(ang) * d;
      const p1y = y + Math.sin(ang) * d;

      // Connect to center
      radials.push({
        x1: x,
        y1: y,
        x2: p1x,
        y2: p1y,
        width: Math.max(1, 1.8 * force),
        alpha: 0.9,
      });

      // Cross stitch lines between adjacent points
      const nextAng = ((i + 1) / numCells) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
      const nextD = (cellRadius * (0.3 + Math.random() * 0.7));
      const p2x = x + Math.cos(nextAng) * nextD;
      const p2y = y + Math.sin(nextAng) * nextD;

      radials.push({
        x1: p1x,
        y1: p1y,
        x2: p2x,
        y2: p2y,
        width: Math.max(0.8, 1.3 * force),
        alpha: 0.85,
      });
    }

    // Concentric web tiers
    for (let r = 1; r <= 4; r++) {
      rings.push({
        cx: x,
        cy: y,
        r: (cellRadius / 4) * r,
        startAngle: 0,
        endAngle: Math.PI * 2,
        width: 1.2,
        alpha: 0.85,
      });
    }
  }

  // 4. STYLE: STARBURST SPLINTER (asymmetric razor needle bursts)
  else if (style === 'starburst') {
    const numBursts = 5 + Math.floor(Math.random() * 7);
    for (let i = 0; i < numBursts; i++) {
      // Clustered needles
      const clusterAngle = (i / numBursts) * Math.PI * 2 + (Math.random() - 0.5) * 0.6;
      const rayLen = baseRadius * (0.8 + Math.random() * 1.5) * brittleness;
      const needleCount = 2 + Math.floor(Math.random() * 3);

      for (let n = 0; n < needleCount; n++) {
        const nAngle = clusterAngle + (n - 1) * 0.08 + (Math.random() - 0.5) * 0.05;
        const nLen = rayLen * (0.7 + Math.random() * 0.5);
        radials.push({
          x1: x,
          y1: y,
          x2: x + Math.cos(nAngle) * nLen,
          y2: y + Math.sin(nAngle) * nLen,
          width: Math.max(1, (2.8 - n * 0.5) * force),
          alpha: 0.95,
        });
      }
    }

    // Impact core ring
    rings.push({
      cx: x,
      cy: y,
      r: baseRadius * 0.22,
      startAngle: 0,
      endAngle: Math.PI * 2,
      width: 2.0,
      alpha: 0.9,
    });
  }

  // 5. STYLE: BIFURCATION / LIGHTNING FORK (recursive branch cascading)
  else if (style === 'bifurcation') {
    const mainTrunks = 3 + Math.floor(Math.random() * 3);
    for (let t = 0; t < mainTrunks; t++) {
      const rootAngle = (t / mainTrunks) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
      const trunkLen = baseRadius * (0.6 + Math.random() * 0.6);
      const m1x = x + Math.cos(rootAngle) * trunkLen;
      const m1y = y + Math.sin(rootAngle) * trunkLen;

      // First fork: 2 branches
      const f1Angle = rootAngle + 0.45 + (Math.random() - 0.5) * 0.2;
      const f2Angle = rootAngle - 0.45 + (Math.random() - 0.5) * 0.2;
      const forkLen = trunkLen * 0.7;

      const f1x = m1x + Math.cos(f1Angle) * forkLen;
      const f1y = m1y + Math.sin(f1Angle) * forkLen;
      const f2x = m1x + Math.cos(f2Angle) * forkLen;
      const f2y = m1y + Math.sin(f2Angle) * forkLen;

      // Sub branches off fork 1
      const subBranches: CrackSegment[] = [
        {
          x1: m1x,
          y1: m1y,
          x2: f1x,
          y2: f1y,
          width: Math.max(1, 2.2 * force),
          alpha: 0.9,
          branches: [
            {
              x1: f1x,
              y1: f1y,
              x2: f1x + Math.cos(f1Angle + 0.35) * (forkLen * 0.6),
              y2: f1y + Math.sin(f1Angle + 0.35) * (forkLen * 0.6),
              width: 1.2,
              alpha: 0.8,
            },
          ],
        },
        {
          x1: m1x,
          y1: m1y,
          x2: f2x,
          y2: f2y,
          width: Math.max(1, 2.0 * force),
          alpha: 0.9,
        },
      ];

      radials.push({
        x1: x,
        y1: y,
        x2: m1x,
        y2: m1y,
        width: Math.max(1.8, 3.8 * force),
        alpha: 0.98,
        branches: subBranches,
      });
    }

    // Inner stress halo
    rings.push({
      cx: x,
      cy: y,
      r: baseRadius * 0.25,
      startAngle: 0,
      endAngle: Math.PI * 2,
      width: 2.2,
      alpha: 0.85,
    });
  }

  // 6. DEFAULT / SPIDERWEB WITH ORGANIC JITTER
  else {
    const numRays = Math.floor((7 + Math.random() * 6) * brittleness);
    for (let i = 0; i < numRays; i++) {
      const baseAngle = (i / numRays) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
      const rayLength = baseRadius * (0.6 + Math.random() * 0.9) * Math.min(2.5, brittleness);
      let currX = x;
      let currY = y;
      const segmentsCount = 3 + Math.floor(Math.random() * 3);
      const stepDist = rayLength / segmentsCount;

      let currentAngle = baseAngle;
      for (let s = 0; s < segmentsCount; s++) {
        const deviation = (Math.random() - 0.5) * 0.38;
        currentAngle += deviation;
        const nextX = currX + Math.cos(currentAngle) * stepDist;
        const nextY = currY + Math.sin(currentAngle) * stepDist;

        const branches: CrackSegment[] = [];
        if (Math.random() < 0.48 * brittleness && s > 0) {
          const branchAngle = currentAngle + (Math.random() > 0.5 ? 0.65 : -0.65) + (Math.random() - 0.5) * 0.2;
          const branchLen = stepDist * (0.6 + Math.random() * 0.6);
          branches.push({
            x1: nextX,
            y1: nextY,
            x2: nextX + Math.cos(branchAngle) * branchLen,
            y2: nextY + Math.sin(branchAngle) * branchLen,
            width: Math.max(1, 1.8 * (1 - s / segmentsCount)),
            alpha: 0.88,
          });
        }

        radials.push({
          x1: currX,
          y1: currY,
          x2: nextX,
          y2: nextY,
          width: Math.max(1, (2.6 - s * 0.4) * Math.min(2.2, force)),
          alpha: 0.95,
          branches,
        });

        currX = nextX;
        currY = nextY;
      }
    }

    // Concentric spiderweb rings
    const ringCount = Math.floor((2 + Math.random() * 3) * brittleness);
    for (let r = 1; r <= ringCount; r++) {
      const ringRadius = (baseRadius / (ringCount + 1)) * r * (0.8 + Math.random() * 0.4);
      const startAngle = Math.random() * Math.PI;
      const arcSpan = Math.PI * (1.2 + Math.random() * 0.8);
      rings.push({
        cx: x,
        cy: y,
        r: ringRadius,
        startAngle,
        endAngle: startAngle + arcSpan,
        width: Math.max(0.8, 2 - r * 0.3),
        alpha: 0.9,
      });
    }
  }

  // Crushed silica stress-cloud radius at the epicenter
  const hazeRadius = Math.max(16, Math.min(65, 22 * force * (1 / toughness)));

  return {
    id: `impact-${Date.now()}-${Math.random()}`,
    x,
    y,
    force,
    style,
    radials,
    rings,
    time: Date.now(),
    color: glass.colorTheme.crackColor,
    hazeRadius,
    hazeColor: glass.colorTheme.glowColor,
    craterRadius: force > 1.8 ? 14 + Math.random() * 18 : undefined,
  };
}

/**
 * Creates rich polygonal shards: sharp dagger blades, geometric pebbles, needle slivers, and motes
 */
export function createShardsFromImpact(
  x: number,
  y: number,
  count: number,
  glass: GlassType,
  isCataclysm: boolean = false,
  bounds: { width: number; height: number }
): GlassShard[] {
  const shards: GlassShard[] = [];
  const palette = [
    glass.colorTheme.baseColor,
    glass.colorTheme.specular,
    glass.colorTheme.borderColor,
    'rgba(255, 255, 255, 0.75)',
  ];

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.6;
    const speed = (isCataclysm ? 4 : 2.2) + Math.random() * (isCataclysm ? 12 : 7);
    const vx = Math.cos(angle) * speed + (Math.random() - 0.5) * 2;
    const vy = Math.sin(angle) * speed - (isCataclysm ? 3.5 + Math.random() * 5.5 : 1.2);

    // Shard archetype: needle, triangle dagger, or multi-vertex crystal
    const shardTypeRoll = Math.random();
    const points: Array<{ x: number; y: number }> = [];
    let shardSize = isCataclysm
      ? 14 + Math.random() * 28
      : 8 + Math.random() * 20;

    if (shardTypeRoll < 0.35) {
      // Needle dagger: elongated sliver
      const w = shardSize * 0.3;
      const len = shardSize * (1.4 + Math.random() * 0.8);
      points.push({ x: 0, y: -len * 0.5 });
      points.push({ x: w * 0.5, y: 0 });
      points.push({ x: 0, y: len * 0.5 });
      points.push({ x: -w * 0.5, y: 0 });
    } else if (shardTypeRoll < 0.7) {
      // Triangular razor wedge
      const numVerts = 3;
      for (let v = 0; v < numVerts; v++) {
        const vAngle = (v / numVerts) * Math.PI * 2 + (Math.random() - 0.5) * 0.7;
        const vRadius = shardSize * (0.6 + Math.random() * 0.7);
        points.push({
          x: Math.cos(vAngle) * vRadius,
          y: Math.sin(vAngle) * vRadius,
        });
      }
    } else {
      // Multi-facet crystal polygon
      const numVerts = 4 + Math.floor(Math.random() * 3);
      for (let v = 0; v < numVerts; v++) {
        const vAngle = (v / numVerts) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
        const vRadius = shardSize * (0.4 + Math.random() * 0.8);
        points.push({
          x: Math.cos(vAngle) * vRadius,
          y: Math.sin(vAngle) * vRadius,
        });
      }
    }

    const spawnX = isCataclysm ? Math.random() * bounds.width : x + (Math.random() - 0.5) * 35;
    const spawnY = isCataclysm ? Math.random() * bounds.height : y + (Math.random() - 0.5) * 35;

    shards.push({
      id: Math.floor(Math.random() * 10000000),
      points,
      x: spawnX,
      y: spawnY,
      vx,
      vy,
      rotation: Math.random() * Math.PI * 2,
      vRot: (Math.random() - 0.5) * 0.35,
      color: palette[Math.floor(Math.random() * palette.length)],
      borderColor: glass.colorTheme.crackColor,
      glowColor: glass.colorTheme.glowColor,
      alpha: 1,
      life: 0,
      maxLife: 90 + Math.floor(Math.random() * 60),
      size: shardSize,
      isSpecial: Math.random() < 0.25,
    });
  }

  return shards;
}

/**
 * Creates shimmering glass spark particles and dust motes
 */
export function createSparkParticles(
  x: number,
  y: number,
  count: number,
  color: string
): SparkParticle[] {
  const particles: SparkParticle[] = [];
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1.5 + Math.random() * 8;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1.8,
      size: 1.5 + Math.random() * 4,
      color,
      alpha: 1,
      life: 0,
      maxLife: 35 + Math.floor(Math.random() * 40),
    });
  }
  return particles;
}

/**
 * Creates an expanding shockwave ripple
 */
export function createShockwave(
  x: number,
  y: number,
  maxRadius: number,
  color: string
): Shockwave {
  return {
    x,
    y,
    radius: 6,
    maxRadius,
    color,
    alpha: 0.9,
    lineWidth: 3.5,
  };
}

/**
 * Draws background glass texture and pattern (e.g. stained glass lead lines, wire mesh, frost)
 */
export function drawGlassTexture(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  pattern: PatternType,
  theme: GlassColorTheme,
  isFrozen: boolean = false
) {
  // Base glass fill with gradient
  const grad = ctx.createLinearGradient(0, 0, width, height);
  if (isFrozen) {
    grad.addColorStop(0, 'rgba(186, 230, 253, 0.4)');
    grad.addColorStop(1, 'rgba(224, 242, 254, 0.55)');
  } else {
    grad.addColorStop(0, theme.baseColor);
    grad.addColorStop(1, 'rgba(15, 23, 42, 0.35)');
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Specular sheen diagonal highlight
  ctx.save();
  const sheenGrad = ctx.createLinearGradient(0, 0, width * 0.7, height);
  sheenGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
  sheenGrad.addColorStop(0.35, theme.specular);
  sheenGrad.addColorStop(0.45, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = sheenGrad;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();

  // Pattern specific overlays
  if (pattern === 'stained') {
    ctx.save();
    ctx.strokeStyle = 'rgba(30, 41, 59, 0.75)';
    ctx.lineWidth = 3.5;

    const cx = width / 2;
    const cy = height / 2;
    const r = Math.min(width, height) * 0.38;

    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    for (let a = 0; a < 8; a++) {
      const angle = (a / 8) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * r * 1.5, cy + Math.sin(angle) * r * 1.5);
      ctx.stroke();
    }
    ctx.restore();
  } else if (pattern === 'wire') {
    ctx.save();
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
    ctx.lineWidth = 1;
    const step = 28;
    for (let x = 0; x < width; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    ctx.restore();
  } else if (pattern === 'cyber') {
    ctx.save();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
    ctx.lineWidth = 1.2;
    const step = 40;
    for (let x = 0; x < width; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(232, 121, 249, 0.3)';
    ctx.fillRect(20, 20, 10, 10);
    ctx.fillRect(width - 30, 20, 10, 10);
    ctx.fillRect(20, height - 30, 10, 10);
    ctx.fillRect(width - 30, height - 30, 10, 10);
    ctx.restore();
  } else if (pattern === 'crystal') {
    ctx.save();
    ctx.strokeStyle = 'rgba(253, 224, 71, 0.22)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(0, height * 0.2);
    ctx.lineTo(width * 0.5, 0);
    ctx.lineTo(width, height * 0.3);
    ctx.lineTo(width * 0.5, height);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  } else if (pattern === 'plasma' || pattern === 'cosmic') {
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    for (let i = 0; i < 30; i++) {
      const px = (Math.sin(i * 99) * 0.5 + 0.5) * width;
      const py = (Math.cos(i * 33) * 0.5 + 0.5) * height;
      const sz = (i % 3) + 1;
      ctx.beginPath();
      ctx.arc(px, py, sz, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

/**
 * Generates flying wood splinters and sawdust when hitting wooden obstacles
 */
export function createWoodSplinters(x: number, y: number, count: number = 14) {
  const splinters = [];
  const woodColors = ['#78350f', '#92400e', '#b45309', '#d97706', '#451a03', '#fef3c7'];

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 6;
    splinters.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2.5,
      length: 6 + Math.random() * 14,
      width: 1.5 + Math.random() * 2.5,
      rotation: Math.random() * Math.PI * 2,
      vRot: (Math.random() - 0.5) * 0.4,
      color: woodColors[Math.floor(Math.random() * woodColors.length)],
      alpha: 1,
      life: 0,
      maxLife: 45 + Math.floor(Math.random() * 30),
    });
  }
  return splinters;
}

