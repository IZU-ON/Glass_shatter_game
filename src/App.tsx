import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GlassType, LevelProgress, PlayerStats, PowerUpType, GameSliders } from './types';
import { GLASS_TYPES, POWER_UPS, getLevelConfig } from './data/glassTypes';
import { GlassCanvas } from './components/GlassCanvas';
import { HeaderHUD } from './components/HeaderHUD';
import { PowerUpBar } from './components/PowerUpBar';
import { LevelSelectModal } from './components/LevelSelectModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { StageClearModal } from './components/StageClearModal';
import { StageFailedModal } from './components/StageFailedModal';
import { HintsModal } from './components/HintsModal';
import { PauseModal } from './components/PauseModal';
import { GameControlPanel } from './components/GameControlPanel';
import { soundEngine } from './utils/audio';
import { ArrowRight } from 'lucide-react';

// Local storage keys
const STORAGE_KEY_PROGRESS = 'glassbreaker_progress_v1';
const STORAGE_KEY_STATS = 'glassbreaker_stats_v1';

export default function App() {
  // Current Level State (1 to 10)
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [isZenMode, setIsZenMode] = useState<boolean>(false);

  // Active Glass Type & Level Configuration
  const currentGlass: GlassType = GLASS_TYPES[currentLevel - 1] || GLASS_TYPES[0];
  const levelConfig = getLevelConfig(currentLevel);

  // Stage Gameplay Progress
  const [glassesSmashed, setGlassesSmashed] = useState<number>(0);
  const [woodStrikes, setWoodStrikes] = useState<number>(0);
  const [stageScore, setStageScore] = useState<number>(0);
  const [stageStartTime, setStageStartTime] = useState<number>(Date.now());

  // Combo system
  const [combo, setCombo] = useState<number>(0);
  const [comboMultiplier, setComboMultiplier] = useState<number>(1);
  const comboTimerRef = useRef<number | null>(null);

  // Audio and Haptics settings
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [hapticsEnabled, setHapticsEnabled] = useState<boolean>(true);

  // Pause & Simulation Control Sliders State
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isControlPanelOpen, setIsControlPanelOpen] = useState<boolean>(false);
  const [sliders, setSliders] = useState<GameSliders>({
    fallSpeedMultiplier: 1.0,
    glassCountMultiplier: 1.0,
    dangerLevelMultiplier: 1.0,
  });

  // Hit & Accuracy Stats for current round
  const [roundSwings, setRoundSwings] = useState<number>(0);
  const [roundHits, setRoundHits] = useState<number>(0);
  const [roundMisses, setRoundMisses] = useState<number>(0);
  const [roundDangerHits, setRoundDangerHits] = useState<number>(0);

  // Modals
  const [isLevelsOpen, setIsLevelsOpen] = useState<boolean>(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(false);
  const [isStageClearOpen, setIsStageClearOpen] = useState<boolean>(false);
  const [isStageFailedOpen, setIsStageFailedOpen] = useState<boolean>(false);
  const [isHintsOpen, setIsHintsOpen] = useState<boolean>(false);

  // Victory metrics for modal
  const [completedStars, setCompletedStars] = useState<number>(3);
  const [completedTime, setCompletedTime] = useState<number>(0);

  // Power-Ups System
  const [unlockedPowerUps, setUnlockedPowerUps] = useState<PowerUpType[]>(['hammer']);
  const [activePowerUp, setActivePowerUp] = useState<PowerUpType | null>(null);
  const [charges, setCharges] = useState<Record<PowerUpType, number>>({
    hammer: 3,
    freeze: 2,
    resonator: 2,
    laser: 2,
    vortex: 2,
    slowmo: 3,
  });
  const [cooldowns, setCooldowns] = useState<Record<PowerUpType, number>>({
    hammer: 0,
    freeze: 0,
    resonator: 0,
    laser: 0,
    vortex: 0,
    slowmo: 0,
  });

  // Level Progression Storage
  const [progress, setProgress] = useState<Record<number, LevelProgress>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROGRESS);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    const initial: Record<number, LevelProgress> = {};
    GLASS_TYPES.forEach((g) => {
      initial[g.level] = {
        level: g.level,
        unlocked: g.level === 1,
        completed: false,
        highScore: 0,
        stars: 0,
        bestTime: 0,
        tapsUsed: 0,
      };
    });
    return initial;
  });

  // Overall Player Statistics
  const [playerStats, setPlayerStats] = useState<PlayerStats>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_STATS);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return {
      playerName: 'ShatterAce',
      totalScore: 0,
      totalShardsBroken: 0,
      totalGlassesShattered: 0,
      highestCombo: 0,
      totalTaps: 0,
      levelsCompleted: 0,
      totalStars: 0,
    };
  });

  // Save Progress to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(progress));
    } catch {
      // ignore
    }
  }, [progress]);

  // Save Stats to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(playerStats));
    } catch {
      // ignore
    }
  }, [playerStats]);

  // Reset Stage state on level change
  useEffect(() => {
    setGlassesSmashed(0);
    setWoodStrikes(0);
    setStageScore(0);
    setCombo(0);
    setComboMultiplier(1);
    setStageStartTime(Date.now());
    setActivePowerUp(null);
    setIsStageFailedOpen(false);
    setIsStageClearOpen(false);
    setIsPaused(false);
    setRoundSwings(0);
    setRoundHits(0);
    setRoundMisses(0);
    setRoundDangerHits(0);

    // Replenish charges for current stage
    setCharges({
      hammer: POWER_UPS.hammer.maxCharges,
      freeze: POWER_UPS.freeze.maxCharges,
      resonator: POWER_UPS.resonator.maxCharges,
      laser: POWER_UPS.laser.maxCharges,
      vortex: POWER_UPS.vortex.maxCharges,
      slowmo: POWER_UPS.slowmo.maxCharges,
    });
  }, [currentLevel, currentGlass]);

  // Update unlocked power-ups according to completed levels
  useEffect(() => {
    if (isZenMode) {
      setUnlockedPowerUps(['hammer', 'freeze', 'resonator', 'laser', 'vortex', 'slowmo']);
      return;
    }
    const unlocked: PowerUpType[] = ['hammer'];
    GLASS_TYPES.forEach((g) => {
      if (progress[g.level]?.completed && !unlocked.includes(g.powerUpGranted)) {
        unlocked.push(g.powerUpGranted);
      }
    });
    setUnlockedPowerUps(unlocked);
  }, [progress, isZenMode]);

  // Handle Stage Clear
  const handleStageClear = useCallback(
    (finalSmashes: number) => {
      const elapsedSeconds = (Date.now() - stageStartTime) / 1000;

      // Stars calculation:
      // 3 Stars: 0 wood strikes
      // 2 Stars: 1 wood strike
      // 1 Star: 2+ wood strikes
      let stars = 3;
      if (woodStrikes >= 2) {
        stars = 1;
      } else if (woodStrikes === 1) {
        stars = 2;
      }

      // Bonus points for completing with zero wood strikes (Flawless)
      const flawlessBonus = woodStrikes === 0 ? 5000 : 0;
      const stageCompletionBonus = 4000 * currentLevel * stars + flawlessBonus;
      const totalStagePoints = stageScore + stageCompletionBonus;

      setCompletedStars(stars);
      setCompletedTime(elapsedSeconds);

      // Update level progress
      setProgress((prev) => {
        const existing = prev[currentLevel] || {
          level: currentLevel,
          unlocked: true,
          completed: false,
          highScore: 0,
          stars: 0,
          bestTime: 9999,
          tapsUsed: 9999,
        };

        const updated = {
          ...prev,
          [currentLevel]: {
            level: currentLevel,
            unlocked: true,
            completed: true,
            highScore: Math.max(existing.highScore, totalStagePoints),
            stars: Math.max(existing.stars, stars),
            bestTime: Math.min(existing.bestTime || 9999, elapsedSeconds),
            tapsUsed: Math.min(existing.tapsUsed || 9999, finalSmashes),
          },
        };

        // Unlock next level if available
        if (currentLevel < 10) {
          updated[currentLevel + 1] = {
            ...(updated[currentLevel + 1] || {
              level: currentLevel + 1,
              completed: false,
              highScore: 0,
              stars: 0,
              bestTime: 0,
              tapsUsed: 0,
            }),
            unlocked: true,
          };
        }

        return updated;
      });

      // Update player totals
      setPlayerStats((prev) => {
        const allLevels = Object.values(progress) as LevelProgress[];
        const totalStars = allLevels.reduce(
          (acc, lvl) =>
            acc + (lvl.level === currentLevel ? Math.max(lvl.stars, stars) : lvl.stars),
          0
        );
        const completedCount = allLevels.filter(
          (lvl) => lvl.completed || lvl.level === currentLevel
        ).length;

        return {
          ...prev,
          totalScore: prev.totalScore + stageCompletionBonus,
          totalGlassesShattered: prev.totalGlassesShattered + finalSmashes,
          totalStars,
          levelsCompleted: completedCount,
        };
      });

      if (!isZenMode) {
        setIsStageClearOpen(true);
      }
    },
    [currentLevel, stageScore, stageStartTime, isZenMode, progress, woodStrikes]
  );

  // Handle Glass Smashed from Canvas
  const handleGlassSmashed = useCallback(
    (points: number, _isCombo: boolean) => {
      // Advance combo
      setCombo((prev) => {
        const nextCombo = prev + 1;
        const nextMultiplier = Math.min(8, 1 + Math.floor(nextCombo / 3));
        setComboMultiplier(nextMultiplier);

        if (nextCombo > 2 && nextCombo % 3 === 0) {
          soundEngine.playCombo(nextCombo);
        }

        setPlayerStats((s) => ({
          ...s,
          highestCombo: Math.max(s.highestCombo, nextCombo),
          totalTaps: s.totalTaps + 1,
          totalShardsBroken: s.totalShardsBroken + 20,
        }));

        return nextCombo;
      });

      // Reset combo decay timer (2.2 seconds)
      if (comboTimerRef.current) {
        window.clearTimeout(comboTimerRef.current);
      }
      comboTimerRef.current = window.setTimeout(() => {
        setCombo(0);
        setComboMultiplier(1);
      }, 2200);

      // Add points
      setStageScore((prev) => prev + points);
      setPlayerStats((prev) => ({ ...prev, totalScore: prev.totalScore + points }));
      setRoundHits((prev) => prev + 1);

      // Increment glass count & check stage victory
      setGlassesSmashed((prev) => {
        const next = prev + 1;
        if (!isZenMode && next >= levelConfig.targetGlassSmashes && !isStageClearOpen) {
          handleStageClear(next);
        }
        return next;
      });
    },
    [handleStageClear, isStageClearOpen, isZenMode, levelConfig.targetGlassSmashes]
  );

  // Handle Wood Strike Penalty
  const handleWoodStruck = useCallback(() => {
    // Drop combo
    setCombo(0);
    setComboMultiplier(1);
    setRoundDangerHits((prev) => prev + 1);

    setWoodStrikes((prev) => {
      const nextStrikes = prev + 1;
      if (!isZenMode && nextStrikes >= levelConfig.maxWoodStrikes) {
        // LEVEL FAILED!
        soundEngine.playLevelFail();
        setIsStageFailedOpen(true);
      }
      return nextStrikes;
    });
  }, [isZenMode, levelConfig.maxWoodStrikes]);

  // Handle Hazard Struck (Bomb, Spike, Metal)
  const handleDangerStruck = useCallback((_hazardName: string) => {
    setCombo(0);
    setComboMultiplier(1);
    setRoundDangerHits((prev) => prev + 1);
    setStageScore((prev) => Math.max(0, prev - 150));
  }, []);

  const handleSwing = useCallback(() => {
    setRoundSwings((prev) => prev + 1);
  }, []);

  const handleMiss = useCallback(() => {
    setRoundMisses((prev) => prev + 1);
  }, []);

  // Retry failed stage
  const handleRetryStage = () => {
    setIsStageFailedOpen(false);
    setIsPaused(false);
    setGlassesSmashed(0);
    setWoodStrikes(0);
    setStageScore(0);
    setCombo(0);
    setComboMultiplier(1);
    setStageStartTime(Date.now());
    setRoundSwings(0);
    setRoundHits(0);
    setRoundMisses(0);
    setRoundDangerHits(0);
  };

  // Trigger Power-Up
  const handleTriggerPowerUp = (type: PowerUpType) => {
    if (charges[type] <= 0 || cooldowns[type] > 0) return;

    soundEngine.playPowerUp(type);

    // Consume charge
    setCharges((c) => ({ ...c, [type]: Math.max(0, c[type] - 1) }));
    setActivePowerUp(type);

    const powerUp = POWER_UPS[type];

    // Reset active powerup after duration
    setTimeout(() => {
      setActivePowerUp((current) => (current === type ? null : current));
    }, powerUp.durationSeconds * 1000);

    // Start cooldown timer
    setCooldowns((cd) => ({ ...cd, [type]: powerUp.cooldownSeconds }));
    const cdInterval = setInterval(() => {
      setCooldowns((cd) => {
        const remaining = (cd[type] || 1) - 1;
        if (remaining <= 0) {
          clearInterval(cdInterval);
          return { ...cd, [type]: 0 };
        }
        return { ...cd, [type]: remaining };
      });
    }, 1000);
  };

  // Keyboard Shortcuts (1-6 for power-ups, P/Escape for pause, Space for reset)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['input', 'textarea'].includes((e.target as HTMLElement).tagName.toLowerCase())) {
        return;
      }
      if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        e.preventDefault();
        setIsPaused((prev) => !prev);
        return;
      }
      const powerUpKeys: PowerUpType[] = [
        'hammer',
        'freeze',
        'resonator',
        'laser',
        'vortex',
        'slowmo',
      ];
      const keyNum = parseInt(e.key);
      if (keyNum >= 1 && keyNum <= 6) {
        const pType = powerUpKeys[keyNum - 1];
        if (unlockedPowerUps.includes(pType)) {
          handleTriggerPowerUp(pType);
        }
      }
      if (e.code === 'Space') {
        e.preventDefault();
        handleRetryStage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [unlockedPowerUps, charges, cooldowns]);

  // Audio and Haptics Toggles
  const handleToggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    soundEngine.setMuted(newMuted);
  };

  const handleToggleHaptics = () => {
    const newHaptics = !hapticsEnabled;
    setHapticsEnabled(newHaptics);
    soundEngine.setHapticsEnabled(newHaptics);
  };

  // Mode and Stage Switchers
  const handleToggleZenMode = () => {
    setIsZenMode((z) => !z);
  };

  const handleSelectLevel = (lvl: number) => {
    setCurrentLevel(lvl);
    setIsLevelsOpen(false);
  };

  // Explicit advance to level
  const handleAdvanceToLevel = (lvl: number) => {
    setProgress((prev) => ({
      ...prev,
      [lvl]: {
        ...(prev[lvl] || {
          level: lvl,
          completed: false,
          highScore: 0,
          stars: 0,
          bestTime: 0,
          tapsUsed: 0,
        }),
        unlocked: true,
      },
    }));
    setCurrentLevel(lvl);
    setIsHintsOpen(false);
    setIsLevelsOpen(false);
    setIsStageClearOpen(false);
    setIsStageFailedOpen(false);
  };

  const handleNextStage = () => {
    setIsStageClearOpen(false);
    if (currentLevel < 10) {
      handleAdvanceToLevel(currentLevel + 1);
    }
  };

  return (
    <div className="flex flex-col w-screen h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans select-none">
      {/* Top HUD Header */}
      <HeaderHUD
        glass={currentGlass}
        level={currentLevel}
        score={playerStats.totalScore + stageScore}
        combo={combo}
        comboMultiplier={comboMultiplier}
        starsEarned={progress[currentLevel]?.stars || 0}
        totalStars={playerStats.totalStars}
        glassesSmashed={glassesSmashed}
        targetGlassSmashes={levelConfig.targetGlassSmashes}
        woodStrikes={woodStrikes}
        maxWoodStrikes={levelConfig.maxWoodStrikes}
        isZenMode={isZenMode}
        isMuted={isMuted}
        hapticsEnabled={hapticsEnabled}
        isPaused={isPaused}
        onTogglePause={() => setIsPaused((p) => !p)}
        onToggleMute={handleToggleMute}
        onToggleHaptics={handleToggleHaptics}
        onToggleZenMode={handleToggleZenMode}
        onOpenLevels={() => setIsLevelsOpen(true)}
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
        onOpenHints={() => setIsHintsOpen(true)}
        onAdvanceStage={
          currentLevel < 10 ? () => handleAdvanceToLevel(currentLevel + 1) : undefined
        }
        onResetStage={handleRetryStage}
      />

      {/* Main Falling Objects Arena */}
      <main className="flex-1 relative w-full h-full p-0 sm:p-2 md:p-4 flex items-center justify-center overflow-hidden">
        <GlassCanvas
          glass={currentGlass}
          level={currentLevel}
          levelConfig={levelConfig}
          activePowerUp={activePowerUp}
          isSlowMo={activePowerUp === 'slowmo'}
          isFrozen={activePowerUp === 'freeze'}
          isZenMode={isZenMode}
          isPaused={isPaused}
          sliders={sliders}
          woodStrikes={woodStrikes}
          maxWoodStrikes={levelConfig.maxWoodStrikes}
          glassesSmashed={glassesSmashed}
          targetGlassSmashes={levelConfig.targetGlassSmashes}
          combo={combo}
          comboMultiplier={comboMultiplier}
          onGlassSmashed={handleGlassSmashed}
          onWoodStruck={handleWoodStruck}
          onDangerStruck={handleDangerStruck}
          onSwing={handleSwing}
          onMiss={handleMiss}
        />

        {/* Dynamic Interactive Hint Banner at top of canvas - Restructured for Mobile */}
        <div className="absolute top-2 sm:top-4 left-1/2 -translate-x-1/2 flex items-center justify-center max-w-[96vw] sm:max-w-none pointer-events-auto z-30">
          <div className="px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 backdrop-blur-md text-[11px] sm:text-xs text-slate-200 flex items-center gap-1.5 sm:gap-2 shadow-xl whitespace-nowrap">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-sky-400 shrink-0 animate-ping" />
            <span className="hidden sm:inline">
              <strong>Stage {currentLevel}:</strong> Smash{' '}
              <strong className="text-sky-300">
                {levelConfig.targetGlassSmashes} {currentGlass.name}
              </strong>
              . Avoid <strong className="text-red-400">Wood</strong> (max{' '}
              {levelConfig.maxWoodStrikes} strikes)!
            </span>
            <span className="sm:hidden font-medium text-[11px]">
              Stage {currentLevel}: Smash <strong className="text-sky-300">{levelConfig.targetGlassSmashes}</strong> • Avoid <strong className="text-red-400">Wood</strong>
            </span>
            <button
              onClick={() => setIsHintsOpen(true)}
              className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-[10px] sm:text-xs font-bold transition flex items-center gap-1 shrink-0 ml-0.5 border border-amber-500/30"
            >
              Tips
            </button>
            {currentLevel < 10 && (
              <span className="hidden sm:inline-flex items-center gap-1.5">
                <span className="text-slate-600">|</span>
                <button
                  onClick={() => handleAdvanceToLevel(currentLevel + 1)}
                  className="px-2 py-0.5 rounded-lg bg-sky-500/20 text-sky-300 hover:bg-sky-500/30 border border-sky-500/40 font-bold transition flex items-center gap-1 text-[11px]"
                >
                  <span>Stage {currentLevel + 1}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      </main>

      {/* Bottom Power-Ups Selector */}
      <PowerUpBar
        unlockedPowerUps={unlockedPowerUps}
        activePowerUp={activePowerUp}
        charges={charges}
        cooldowns={cooldowns}
        onTriggerPowerUp={handleTriggerPowerUp}
      />

      {/* Modals */}
      <LevelSelectModal
        isOpen={isLevelsOpen}
        currentLevel={currentLevel}
        progress={progress}
        onSelectLevel={handleSelectLevel}
        onClose={() => setIsLevelsOpen(false)}
      />

      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        playerStats={playerStats}
        onUpdatePlayerName={(name) =>
          setPlayerStats((s) => ({ ...s, playerName: name }))
        }
        onClose={() => setIsLeaderboardOpen(false)}
      />

      <HintsModal
        isOpen={isHintsOpen}
        currentLevel={currentLevel}
        glass={currentGlass}
        onClose={() => setIsHintsOpen(false)}
        onAdvanceToLevel={handleAdvanceToLevel}
      />

      <StageClearModal
        isOpen={isStageClearOpen}
        glass={currentGlass}
        level={currentLevel}
        stageScore={stageScore}
        starsEarned={completedStars}
        tapsUsed={glassesSmashed}
        timeTaken={completedTime}
        woodStrikes={woodStrikes}
        glassesSmashed={glassesSmashed}
        onNextStage={handleNextStage}
        onReplayStage={handleRetryStage}
        onOpenLeaderboard={() => {
          setIsStageClearOpen(false);
          setIsLeaderboardOpen(true);
        }}
      />

      <StageFailedModal
        isOpen={isStageFailedOpen}
        glass={currentGlass}
        level={currentLevel}
        woodStrikes={woodStrikes}
        maxWoodStrikes={levelConfig.maxWoodStrikes}
        glassesSmashed={glassesSmashed}
        targetGlasses={levelConfig.targetGlassSmashes}
        onRetry={handleRetryStage}
        onSkip={
          currentLevel < 10
            ? () => handleAdvanceToLevel(currentLevel + 1)
            : undefined
        }
      />

      {/* Floating Simulation Tuning Control Panel */}
      <GameControlPanel
        sliders={sliders}
        onChangeSliders={(newSliders) => setSliders(newSliders)}
        onChange={(key, val) => setSliders((prev) => ({ ...prev, [key]: val }))}
        onReset={() =>
          setSliders({
            fallSpeedMultiplier: 1.0,
            glassCountMultiplier: 1.0,
            dangerLevelMultiplier: 1.0,
          })
        }
        isControlPanelOpen={isControlPanelOpen}
        onToggleOpen={() => setIsControlPanelOpen((o) => !o)}
      />

      {/* Pause & Settings Modal */}
      <PauseModal
        isOpen={isPaused}
        level={currentLevel}
        glass={currentGlass}
        glassName={currentGlass.name}
        glassesSmashed={glassesSmashed}
        targetGlasses={levelConfig.targetGlassSmashes}
        targetGlassSmashes={levelConfig.targetGlassSmashes}
        woodStrikes={woodStrikes}
        maxWoodStrikes={levelConfig.maxWoodStrikes}
        score={stageScore}
        stageScore={stageScore}
        sliders={sliders}
        onChangeSliders={(newSliders) => setSliders(newSliders)}
        onSliderChange={(key, val) => setSliders((prev) => ({ ...prev, [key]: val }))}
        onResetSliders={() =>
          setSliders({
            fallSpeedMultiplier: 1.0,
            glassCountMultiplier: 1.0,
            dangerLevelMultiplier: 1.0,
          })
        }
        onResume={() => setIsPaused(false)}
        onRestart={handleRetryStage}
        onRestartRound={handleRetryStage}
        onOpenLevelSelect={() => {
          setIsPaused(false);
          setIsLevelsOpen(true);
        }}
        onSelectLevel={() => {
          setIsPaused(false);
          setIsLevelsOpen(true);
        }}
      />
    </div>
  );
}
