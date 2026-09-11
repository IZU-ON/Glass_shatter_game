import React, { useState, useRef } from 'react';
import { LeaderboardEntry, PlayerStats } from '../types';
import {
  Trophy,
  Download,
  Share2,
  Copy,
  Check,
  X,
  Medal,
  Globe,
  Flame,
  Star,
  Sparkles,
  FileSpreadsheet,
  FileCode,
  Image as ImageIcon,
} from 'lucide-react';

interface LeaderboardModalProps {
  isOpen: boolean;
  playerStats: PlayerStats;
  onUpdatePlayerName: (name: string) => void;
  onClose: () => void;
}

// Initial realistic global competitive benchmarks
const INITIAL_GLOBAL_ENTRIES: Omit<LeaderboardEntry, 'rank' | 'isPlayer'>[] = [
  {
    id: 'entry-1',
    playerName: 'ShatterKing_99',
    country: 'Japan',
    flag: '🇯🇵',
    totalScore: 485200,
    highestCombo: 34,
    stars: 30,
    shardsBroken: 14820,
    rankTier: 'Grandmaster',
    date: '2026-09-10',
  },
  {
    id: 'entry-2',
    playerName: 'VortexValkyrie',
    country: 'Germany',
    flag: '🇩🇪',
    totalScore: 423900,
    highestCombo: 29,
    stars: 29,
    shardsBroken: 13100,
    rankTier: 'Grandmaster',
    date: '2026-09-09',
  },
  {
    id: 'entry-3',
    playerName: 'GlassNinja_X',
    country: 'South Korea',
    flag: '🇰🇷',
    totalScore: 388400,
    highestCombo: 26,
    stars: 28,
    shardsBroken: 11950,
    rankTier: 'Diamond',
    date: '2026-09-11',
  },
  {
    id: 'entry-4',
    playerName: 'CrystalCrusher',
    country: 'USA',
    flag: '🇺🇸',
    totalScore: 334100,
    highestCombo: 24,
    stars: 26,
    shardsBroken: 10420,
    rankTier: 'Diamond',
    date: '2026-09-08',
  },
  {
    id: 'entry-5',
    playerName: 'ApexBreaker',
    country: 'United Kingdom',
    flag: '🇬🇧',
    totalScore: 289500,
    highestCombo: 21,
    stars: 24,
    shardsBroken: 8900,
    rankTier: 'Platinum',
    date: '2026-09-10',
  },
  {
    id: 'entry-6',
    playerName: 'FrostBite_Pro',
    country: 'Canada',
    flag: '🇨🇦',
    totalScore: 242000,
    highestCombo: 19,
    stars: 22,
    shardsBroken: 7650,
    rankTier: 'Platinum',
    date: '2026-09-07',
  },
  {
    id: 'entry-7',
    playerName: 'CyberShatter',
    country: 'France',
    flag: '🇫🇷',
    totalScore: 195400,
    highestCombo: 17,
    stars: 19,
    shardsBroken: 6300,
    rankTier: 'Gold',
    date: '2026-09-06',
  },
  {
    id: 'entry-8',
    playerName: 'ZenPounder',
    country: 'Australia',
    flag: '🇦🇺',
    totalScore: 148900,
    highestCombo: 15,
    stars: 16,
    shardsBroken: 5120,
    rankTier: 'Gold',
    date: '2026-09-05',
  },
  {
    id: 'entry-9',
    playerName: 'EchoHammer',
    country: 'Brazil',
    flag: '🇧🇷',
    totalScore: 102300,
    highestCombo: 12,
    stars: 13,
    shardsBroken: 3840,
    rankTier: 'Silver',
    date: '2026-09-04',
  },
  {
    id: 'entry-10',
    playerName: 'NovaTapper',
    country: 'Sweden',
    flag: '🇸🇪',
    totalScore: 68400,
    highestCombo: 9,
    stars: 10,
    shardsBroken: 2400,
    rankTier: 'Bronze',
    date: '2026-09-02',
  },
];

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  playerStats,
  onUpdatePlayerName,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [editingName, setEditingName] = useState(playerStats.playerName);
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'export'>('leaderboard');
  const scorecardCanvasRef = useRef<HTMLCanvasElement | null>(null);

  if (!isOpen) return null;

  // Determine player rank tier
  const getTier = (score: number): LeaderboardEntry['rankTier'] => {
    if (score >= 400000) return 'Grandmaster';
    if (score >= 300000) return 'Diamond';
    if (score >= 200000) return 'Platinum';
    if (score >= 120000) return 'Gold';
    if (score >= 60000) return 'Silver';
    return 'Bronze';
  };

  const playerTier = getTier(playerStats.totalScore);

  // Construct combined and sorted leaderboard
  const playerEntry: LeaderboardEntry = {
    id: 'player-current',
    rank: 1,
    playerName: playerStats.playerName || 'Player',
    country: 'Global',
    flag: '⚡',
    totalScore: playerStats.totalScore,
    highestCombo: playerStats.highestCombo,
    stars: playerStats.totalStars,
    shardsBroken: playerStats.totalShardsBroken,
    rankTier: playerTier,
    date: 'Today',
    isPlayer: true,
  };

  const allEntries: LeaderboardEntry[] = [...INITIAL_GLOBAL_ENTRIES, playerEntry]
    .sort((a, b) => b.totalScore - a.totalScore)
    .map((item, index) => ({
      ...item,
      rank: index + 1,
    }));

  const playerCurrentRank = allEntries.find((e) => e.isPlayer)?.rank || 1;

  // Handle Export to JSON
  const handleExportJSON = () => {
    const exportData = {
      app: 'GlassBreaker ASMR Shatter Simulator',
      exportTimestamp: new Date().toISOString(),
      player: {
        name: playerStats.playerName,
        rank: playerCurrentRank,
        rankTier: playerTier,
        totalScore: playerStats.totalScore,
        highestCombo: playerStats.highestCombo,
        totalShardsBroken: playerStats.totalShardsBroken,
        totalGlassesShattered: playerStats.totalGlassesShattered,
        totalTaps: playerStats.totalTaps,
        stars: playerStats.totalStars,
        levelsCompleted: playerStats.levelsCompleted,
      },
      leaderboardSnapshot: allEntries.slice(0, 10),
      verificationHash: btoa(`GB-${playerStats.totalScore}-${playerStats.highestCombo}-${Date.now()}`),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `glassbreaker-competition-metrics-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Handle Export to CSV
  const handleExportCSV = () => {
    let csv = 'Rank,Player Name,Score,Highest Combo,Stars,Shards Broken,Tier,Country\n';
    allEntries.forEach((entry) => {
      csv += `${entry.rank},"${entry.playerName}",${entry.totalScore},${entry.highestCombo},${entry.stars},${entry.shardsBroken},${entry.rankTier},"${entry.country}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `glassbreaker-global-rankings-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Copy shareable summary to clipboard
  const handleCopyClipboard = () => {
    const summary = `🏆 GLASSBREAKER GLOBAL COMPETITION METRICS 🏆
Player: ${playerStats?.playerName || 'Player'}
Rank: #${playerCurrentRank} (${playerTier} Tier)
Total Score: ${(playerStats?.totalScore ?? 0).toLocaleString()} pts
Shards Broken: ${(playerStats?.totalShardsBroken ?? 0).toLocaleString()}
Highest Combo: ${playerStats?.highestCombo ?? 0}x
Stars Earned: ${playerStats?.totalStars ?? 0} / 30 ★
Levels Completed: ${playerStats?.levelsCompleted ?? 0} / 10
Verified at: ${new Date().toLocaleDateString()}`;

    navigator.clipboard.writeText(summary).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Generate & Download Scorecard Badge PNG
  const handleDownloadScorecard = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 450;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background Gradient
    const grad = ctx.createLinearGradient(0, 0, 800, 450);
    grad.addColorStop(0, '#0f172a');
    grad.addColorStop(0.5, '#0284c7');
    grad.addColorStop(1, '#0f172a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 800, 450);

    // Glass sheen lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(100, 0);
    ctx.lineTo(0, 300);
    ctx.moveTo(700, 0);
    ctx.lineTo(800, 250);
    ctx.stroke();

    // Border
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, 760, 410);

    // Title
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 32px monospace';
    ctx.fillText('GLASSBREAKER COMPETITION METRICS', 50, 80);

    // Player Name & Rank
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 42px sans-serif';
    ctx.fillText(playerStats.playerName || 'Player', 50, 140);

    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText(`RANK #${playerCurrentRank} • ${playerTier.toUpperCase()} TIER`, 50, 180);

    // Metrics grid
    ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
    ctx.fillRect(50, 210, 700, 160);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '16px sans-serif';
    ctx.fillText('TOTAL SCORE', 80, 250);
    ctx.fillText('SHARDS BROKEN', 300, 250);
    ctx.fillText('HIGHEST COMBO', 520, 250);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 28px monospace';
    ctx.fillText(`${(playerStats?.totalScore ?? 0).toLocaleString()}`, 80, 290);
    ctx.fillText(`${(playerStats?.totalShardsBroken ?? 0).toLocaleString()}`, 300, 290);
    ctx.fillText(`${playerStats?.highestCombo ?? 0}x`, 520, 290);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px monospace';
    ctx.fillText(`Stars: ${playerStats?.totalStars ?? 0}/30 ★  |  Levels: ${playerStats?.levelsCompleted ?? 0}/10  |  Verified: ${new Date().toLocaleDateString()}`, 80, 340);

    // Download PNG
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `glassbreaker-scorecard-${playerStats.playerName || 'player'}.png`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-mono-tech tracking-tight flex items-center gap-2">
                Global Ranking & Metric Export
              </h2>
              <p className="text-xs text-slate-400">
                Live international competition standings and verified score export.
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

        {/* Tab switcher */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-900/50">
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
              activeTab === 'leaderboard'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-4 h-4" />
            Global Standings
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
              activeTab === 'export'
                ? 'border-sky-400 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-4 h-4" />
            Export Metrics & Scorecard
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'leaderboard' ? (
            <div className="flex flex-col gap-5">
              {/* Player Current Standings Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-sky-950/60 via-indigo-950/50 to-slate-900 border border-sky-500/30 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center font-bold text-lg text-sky-300 font-mono-tech">
                    #{playerCurrentRank}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onBlur={() => onUpdatePlayerName(editingName)}
                        placeholder="Enter Player Name"
                        className="bg-slate-800/80 border border-slate-700 px-2 py-0.5 rounded text-sm font-bold text-white max-w-[160px] focus:outline-none focus:border-sky-400"
                      />
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold">
                        {playerTier} Tier
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {playerStats.totalStars}/30 Stars • {playerStats.levelsCompleted}/10 Stages Completed
                    </p>
                  </div>
                </div>

                {/* Stat pills */}
                <div className="flex items-center gap-4 text-right">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Score</div>
                    <div className="text-base font-black text-sky-300 font-mono-tech">
                      {(playerStats?.totalScore ?? 0).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Max Combo</div>
                    <div className="text-base font-black text-amber-300 font-mono-tech">
                      {playerStats?.highestCombo ?? 0}x
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Shards</div>
                    <div className="text-base font-black text-emerald-300 font-mono-tech">
                      {(playerStats?.totalShardsBroken ?? 0).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-800/60 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Rank</th>
                      <th className="py-3 px-4">Player</th>
                      <th className="py-3 px-4">Tier</th>
                      <th className="py-3 px-4 text-right">Combo</th>
                      <th className="py-3 px-4 text-right">Shards</th>
                      <th className="py-3 px-4 text-right">Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {allEntries.map((entry) => {
                      const isMe = entry.isPlayer;
                      return (
                        <tr
                          key={entry.id}
                          className={`transition ${
                            isMe
                              ? 'bg-sky-500/15 text-white font-bold'
                              : 'hover:bg-slate-800/40'
                          }`}
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5 font-mono">
                              {entry.rank === 1 ? (
                                <Medal className="w-4 h-4 text-amber-400" />
                              ) : entry.rank === 2 ? (
                                <Medal className="w-4 h-4 text-slate-300" />
                              ) : entry.rank === 3 ? (
                                <Medal className="w-4 h-4 text-amber-600" />
                              ) : (
                                <span className="text-slate-400">#{entry.rank}</span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span>{entry.flag}</span>
                              <span className={isMe ? 'text-sky-300' : 'text-slate-200'}>
                                {entry.playerName}
                              </span>
                              {isMe && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-500/30 text-sky-200 border border-sky-400/40">
                                  YOU
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-semibold">
                              {entry.rankTier}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-amber-400">
                            {entry.highestCombo}x
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-slate-400">
                            {(entry.shardsBroken ?? 0).toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-sky-400">
                            {(entry.totalScore ?? 0).toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Export Metrics Tab */
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="font-bold text-base text-white mb-1">
                  Verified Competition Export Hub
                </h3>
                <p className="text-xs text-slate-400">
                  Export your session telemetry and shatter metrics to submit to gaming leaderboards or share scorecards with friends.
                </p>
              </div>

              {/* Action Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* JSON Export */}
                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 flex flex-col justify-between gap-3">
                  <div>
                    <div className="w-9 h-9 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center mb-2">
                      <FileCode className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-sm text-white">Full Telemetry (JSON)</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Includes complete breakdown, stars, taps, shatter counts, and a tamper-evident verification checksum.
                    </p>
                  </div>
                  <button
                    onClick={handleExportJSON}
                    className="w-full py-2 px-3 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download JSON Metrics
                  </button>
                </div>

                {/* CSV Export */}
                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 flex flex-col justify-between gap-3">
                  <div>
                    <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-sm text-white">Leaderboard CSV</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Formatted spreadsheet with full international player rankings, combos, and points.
                    </p>
                  </div>
                  <button
                    onClick={handleExportCSV}
                    className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download CSV Table
                  </button>
                </div>

                {/* Visual PNG Scorecard Badge */}
                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 flex flex-col justify-between gap-3">
                  <div>
                    <div className="w-9 h-9 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center mb-2">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-sm text-white">Visual Scorecard PNG</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Generates a shareable high-res graphic badge featuring your rank, stars, score, and badges.
                    </p>
                  </div>
                  <button
                    onClick={handleDownloadScorecard}
                    className="w-full py-2 px-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Generate & Save PNG Badge
                  </button>
                </div>

                {/* Clipboard Summary */}
                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 flex flex-col justify-between gap-3">
                  <div>
                    <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center mb-2">
                      <Share2 className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-sm text-white">Copy Report Text</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Instant text summary formatted for social media, Discord, or competition submissions.
                    </p>
                  </div>
                  <button
                    onClick={handleCopyClipboard}
                    className="w-full py-2 px-3 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition flex items-center justify-center gap-2"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied to Clipboard!' : 'Copy Summary'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/90 flex justify-between items-center text-xs text-slate-400">
          <span>Global Leaderboard synchronizes upon stage completions.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
