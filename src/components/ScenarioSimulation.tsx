import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ScenarioConfig } from '../types';
import { getOutcomeData } from '../data/index';

interface Props {
  scenario: ScenarioConfig;
  optionId: string;
  onComplete: () => void;
}

type SimPhase = 'idle' | 'running' | 'done';

export default function ScenarioSimulation({ scenario, optionId, onComplete }: Props) {
  const [phase, setPhase] = useState<SimPhase>('idle');
  const [showResults, setShowResults] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const outcome = getOutcomeData(scenario.id, optionId);
  const selectedOption = scenario.options.find(o => o.id === optionId)!;

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('running'), 600);
    const t2 = setTimeout(() => {
      setPhase('done');
      setShowResults(true);
    }, 5000);
    timerRef.current = [t1, t2];
    return () => timerRef.current.forEach(clearTimeout);
  }, []);

  const phaseLabel = phase === 'idle' ? 'Starting…' : phase === 'running' ? 'Running simulation…' : 'Simulation complete';

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <motion.span
            animate={phase !== 'done' ? { rotate: 360 } : {}}
            transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
            className="text-violet-400"
          >
            ⚙️
          </motion.span>
          <span className="font-bold text-violet-300">{phaseLabel}</span>
        </div>
        <div className="text-gray-500 text-sm">
          Testing: {selectedOption.emoji} {selectedOption.name}
        </div>
      </div>

      {/* Phase bar */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-2">
        <div className="h-1 bg-gray-800 rounded-full overflow-hidden max-w-lg mx-auto">
          <motion.div
            className="h-full bg-violet-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: phase === 'idle' ? '5%' : phase === 'running' ? '80%' : '100%' }}
            transition={{ duration: phase === 'running' ? 4 : 0.4 }}
          />
        </div>
      </div>

      {/* Main sim area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left context */}
        <div className="w-52 shrink-0 border-r border-gray-800 p-5 flex flex-col gap-4">
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              {scenario.questEmoji} Scenario {scenario.id}
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">{scenario.problemContext}</p>
          </div>
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Your approach
            </h3>
            <div className="bg-gray-800 rounded-xl p-3 text-sm">
              <span className="text-lg">{selectedOption.emoji}</span>
              <div className="font-semibold text-white text-xs mt-1">{selectedOption.name}</div>
              <div className="text-xs text-gray-400 mt-0.5 leading-snug">{selectedOption.gameDescription}</div>
            </div>
          </div>
        </div>

        {/* Center — scenario-specific visual */}
        <div className="flex-1 flex items-center justify-center relative overflow-hidden">
          <ScenarioVisual
            scenarioId={scenario.id}
            optionId={optionId}
            phase={phase}
            outcome={outcome}
          />
        </div>

        {/* Right — results */}
        <div className="w-52 shrink-0 border-l border-gray-800 p-5 flex flex-col">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
            📊 Results
          </h3>

          <AnimatePresence>
            {showResults ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3 flex-1 flex flex-col"
              >
                <div className="bg-gray-800 rounded-2xl p-4 text-center">
                  <div className="text-4xl mb-2">{outcome.emoji}</div>
                  <div className="font-bold text-white text-sm leading-tight">{outcome.label}</div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center bg-gray-800/60 rounded-xl px-3 py-2">
                    <span className="text-gray-400 text-xs">✅ Success rate</span>
                    <span className="font-bold text-green-400">{Math.round(outcome.successRate * 100)}%</span>
                  </div>
                  <div className="flex justify-between items-center bg-gray-800/60 rounded-xl px-3 py-2">
                    <span className="text-gray-400 text-xs">❌ Failure rate</span>
                    <span className="font-bold text-red-400">{Math.round((1 - outcome.successRate) * 100)}%</span>
                  </div>
                </div>

                <div className="bg-violet-900/40 border border-violet-700/60 rounded-xl p-3">
                  <div className="text-xs text-violet-400 font-bold uppercase tracking-wider mb-1">
                    🔓 Concept
                  </div>
                  <div className="text-violet-200 font-bold text-sm">{outcome.conceptUnlocked}</div>
                </div>

                <div className="mt-auto pt-2">
                  <button
                    onClick={onComplete}
                    className="w-full bg-violet-600 hover:bg-violet-500 active:scale-95 text-white font-bold py-3 rounded-2xl transition-all cursor-pointer shadow-lg text-sm"
                  >
                    See full results →
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="space-y-3">
                {['Applying approach…', 'Measuring performance…', 'Collecting metrics…'].map((l, i) => (
                  <motion.div
                    key={l}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: phase !== 'idle' ? 1 : 0.3, x: 0 }}
                    transition={{ delay: i * 0.3 }}
                    className="flex items-center gap-2 text-xs text-gray-500"
                  >
                    <motion.div
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.3 }}
                      className="w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0"
                    />
                    {l}
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ── Scenario-specific visuals ──────────────────────────────────────────────────

function ScenarioVisual({
  scenarioId,
  optionId,
  phase,
  outcome,
}: {
  scenarioId: number;
  optionId: string;
  phase: SimPhase;
  outcome: ReturnType<typeof getOutcomeData>;
}) {
  switch (scenarioId) {
    case 2: return <CdnVisual optionId={optionId} phase={phase} />;
    case 3: return <SearchVisual optionId={optionId} phase={phase} isGood={outcome.isOptimal} />;
    case 4: return <DatabaseVisual optionId={optionId} phase={phase} isGood={outcome.isOptimal} />;
    case 5: return <TrafficVisual optionId={optionId} phase={phase} isGood={outcome.isOptimal} />;
    case 6: return <PipelineVisual optionId={optionId} phase={phase} isGood={outcome.isOptimal} />;
    default: return null;
  }
}

// ── Visual: CDN (Scenario 2) ───────────────────────────────────────────────────

function CdnVisual({ optionId, phase }: { optionId: string; phase: SimPhase }) {
  const isCdn = optionId === 'neighborhood-boxes';
  const isCompressed = optionId === 'compressed-songs';

  const zones = [
    { label: 'Nearby', x: 30, y: 30, kids: 3, distance: 'short' },
    { label: 'Midtown', x: 70, y: 25, kids: 4, distance: 'mid' },
    { label: 'East Side', x: 80, y: 70, kids: 3, distance: 'far' },
    { label: 'Westside', x: 20, y: 75, kids: 3, distance: 'far' },
  ];

  return (
    <div className="relative w-full h-full max-w-2xl max-h-96 mx-auto">
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Origin server */}
        <div className="absolute" style={{ left: '48%', top: '45%', transform: 'translate(-50%,-50%)' }}>
          <motion.div
            animate={phase === 'running' ? { scale: [1, 1.05, 1] } : {}}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="bg-gray-700 border-2 border-violet-500 rounded-2xl p-3 text-center w-28"
          >
            <div className="text-3xl mb-1">🏠</div>
            <div className="text-xs text-gray-300 font-bold">Your Backyard</div>
            <div className="text-xs text-gray-500">Origin Server</div>
          </motion.div>
        </div>

        {/* Zones with listeners */}
        {zones.map((zone, i) => {
          const isFar = zone.distance === 'far';
          const arrowColor = isFar && !isCdn
            ? 'text-red-400'
            : isCompressed && isFar
            ? 'text-yellow-400'
            : 'text-green-400';
          const latency = isCdn
            ? isFar ? '80ms ✅' : '40ms ✅'
            : isCompressed && isFar
            ? '600ms ⚠️'
            : isFar
            ? '1200ms 🔴'
            : '80ms ✅';

          return (
            <div
              key={zone.label}
              className="absolute"
              style={{ left: `${zone.x}%`, top: `${zone.y}%`, transform: 'translate(-50%,-50%)' }}
            >
              <div className="flex flex-col items-center gap-1">
                <div className="flex gap-0.5">
                  {Array.from({ length: zone.kids }).map((_, k) => (
                    <motion.span
                      key={k}
                      animate={phase === 'running' ? { y: [0, -3, 0] } : {}}
                      transition={{ repeat: Infinity, duration: 0.8, delay: k * 0.15 }}
                      className="text-base"
                    >
                      👦
                    </motion.span>
                  ))}
                </div>
                <div className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${isFar && !isCdn && phase === 'done' ? 'bg-red-900/60 text-red-300' : 'bg-gray-800/60 text-gray-300'}`}>
                  {zone.label}
                </div>
                {phase !== 'idle' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 + i * 0.2 }}
                    className={`text-xs font-bold ${arrowColor}`}
                  >
                    {latency}
                  </motion.div>
                )}
              </div>

              {/* CDN edge node */}
              {isCdn && phase !== 'idle' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.15, type: 'spring' }}
                  className="absolute -bottom-7 left-1/2 -translate-x-1/2 bg-green-800/80 border border-green-600 rounded-lg px-1.5 py-0.5 text-xs text-green-300 font-bold whitespace-nowrap"
                >
                  📦 Edge
                </motion.div>
              )}
            </div>
          );
        })}

        {/* Connection lines (simplified) */}
        {phase !== 'idle' && !isCdn && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
            {zones.filter(z => z.distance === 'far').map((zone, i) => (
              <motion.line
                key={i}
                x1={`${zone.x}%`} y1={`${zone.y}%`}
                x2="48%" y2="45%"
                stroke={isCompressed ? '#fbbf24' : '#ef4444'}
                strokeWidth="1.5"
                strokeDasharray="4 3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ delay: 0.4 + i * 0.1 }}
              />
            ))}
          </svg>
        )}
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3 text-xs">
        {isCdn ? (
          <span className="text-green-400 font-bold">📦 CDN edge nodes active — fast everywhere</span>
        ) : isCompressed ? (
          <span className="text-yellow-400 font-bold">🗜️ Smaller files, still slow at distance</span>
        ) : (
          <span className="text-red-400 font-bold">🔴 Far users experience high latency</span>
        )}
      </div>
    </div>
  );
}

// ── Visual: Search (Scenario 3) ────────────────────────────────────────────────

function SearchVisual({ optionId, phase }: { optionId: string; phase: SimPhase; isGood: boolean }) {
  const [scanIndex, setScanIndex] = useState(-1);
  const [found, setFound] = useState(false);
  const scanRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isWordSpotter = optionId === 'word-spotter';
  const isAz = optionId === 'az-catalog';
  const isScan = optionId === 'keep-scanning';

  const GRID = 40; // represent a portion of 50k songs
  const TARGET = 28;

  useEffect(() => {
    if (phase !== 'running') return;

    if (isScan) {
      let i = 0;
      scanRef.current = setInterval(() => {
        setScanIndex(i);
        if (i === TARGET) { setFound(true); clearInterval(scanRef.current!); }
        i++;
        if (i > GRID) clearInterval(scanRef.current!);
      }, 120);
    } else if (isAz) {
      setTimeout(() => { setScanIndex(Math.floor(GRID / 2)); }, 400);
      setTimeout(() => { setScanIndex(Math.floor(GRID * 0.7)); }, 700);
      setTimeout(() => { setScanIndex(TARGET); setFound(true); }, 1000);
    } else if (isWordSpotter) {
      setTimeout(() => { setScanIndex(TARGET); setFound(true); }, 300);
    }
    return () => { if (scanRef.current) clearInterval(scanRef.current); };
  }, [phase]);

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-xl px-8">
      {/* Search bar */}
      <div className="bg-gray-800 rounded-2xl px-4 py-3 flex items-center gap-3 w-full border border-gray-700">
        <span className="text-gray-400">🔍</span>
        <span className="text-gray-300 font-mono text-sm">
          &quot;Shape of You&quot;
          {phase === 'running' && !found && (
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ repeat: Infinity, duration: 0.6 }}
            >
              |
            </motion.span>
          )}
        </span>
        {found && (
          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-auto text-green-400 font-bold text-sm">
            ✓ Found!
          </motion.span>
        )}
      </div>

      {/* Song grid */}
      <div className="grid gap-1 w-full" style={{ gridTemplateColumns: 'repeat(8, 1fr)' }}>
        {Array.from({ length: GRID }).map((_, i) => {
          const isTarget = i === TARGET;
          const isScanning = !isWordSpotter && !isAz && i <= scanIndex && !isTarget;
          const isHighlighted = i === scanIndex && !isTarget;

          return (
            <motion.div
              key={i}
              animate={
                isTarget && found
                  ? { scale: [1, 1.3, 1], backgroundColor: '#10b981' }
                  : isHighlighted
                  ? { backgroundColor: '#7c3aed', scale: 1.1 }
                  : isScanning
                  ? { backgroundColor: '#374151' }
                  : {}
              }
              transition={{ duration: 0.15 }}
              className="rounded-md aspect-square text-xs flex items-center justify-center"
              style={{ backgroundColor: isTarget && found ? '#10b981' : '#1f2937', fontSize: '10px' }}
            >
              {isTarget && found ? '🎵' : '▪'}
            </motion.div>
          );
        })}
      </div>

      {/* Status */}
      <div className="text-center text-sm">
        {phase === 'idle' && <span className="text-gray-500">Ready to search 50,000 songs…</span>}
        {phase === 'running' && !found && isScan && (
          <span className="text-red-400">
            Scanning song #{scanIndex + 1} of 50,000…
          </span>
        )}
        {phase === 'running' && !found && (isAz || isWordSpotter) && (
          <span className="text-violet-300">
            {isWordSpotter ? 'Checking inverted index…' : 'Jumping to section S…'}
          </span>
        )}
        {found && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-green-400 font-bold"
          >
            {isWordSpotter ? 'Found instantly via word index! ⚡' : isAz ? 'Found via catalog — much faster!' : `Found after scanning ${TARGET + 1} records 🐌`}
          </motion.span>
        )}
      </div>

      <div className="text-xs text-gray-600 text-center">
        {isScan && 'Each square = ~1,250 songs. Full scan = 50,000 checks.'}
        {isAz && 'B-tree index jumps to the right section directly.'}
        {isWordSpotter && 'Inverted index maps every word to its songs — instant lookup.'}
      </div>
    </div>
  );
}

// ── Visual: Database (Scenario 4) ─────────────────────────────────────────────

function DatabaseVisual({ optionId, phase }: { optionId: string; phase: SimPhase; isGood: boolean }) {
  const isNotes = optionId === 'sticky-notes';
  const isRelational = optionId === 'filing-cabinet';
  const isDocument = optionId === 'personal-notebooks';

  const [cards, setCards] = useState<{ id: number; placed: boolean; broken: boolean }[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (phase !== 'running') return;
    let count = 0;
    timerRef.current = setInterval(() => {
      const broken = isNotes && Math.random() < 0.4;
      setCards(prev => [...prev.slice(-14), { id: count++, placed: true, broken }]);
    }, 300);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase]);

  return (
    <div className="flex gap-8 items-start w-full max-w-2xl px-6">
      {/* Incoming requests */}
      <div className="flex flex-col items-center gap-2 w-28 shrink-0">
        <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">
          Playlists In
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.div
            key={i}
            animate={phase === 'running' ? { x: [0, 6, 0] } : {}}
            transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.12 }}
            className="bg-gray-800 border border-gray-700 rounded-xl p-2 text-xs text-center w-full"
          >
            📝 Playlist {i + 1}
          </motion.div>
        ))}
      </div>

      {/* Arrow */}
      <div className="flex items-center self-center text-gray-600 text-2xl">→</div>

      {/* Storage visualization */}
      <div className="flex-1">
        <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2 text-center">
          {isNotes ? '📄 Flat File' : isRelational ? '🗂️ Relational DB' : '📓 Document DB'}
        </div>

        {isNotes && (
          <div className="relative h-40 bg-gray-900 border border-gray-700 rounded-2xl overflow-hidden p-2">
            <AnimatePresence>
              {cards.map(card => (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, scale: 0.5, x: -20 }}
                  animate={{
                    opacity: 1, scale: 1,
                    x: Math.random() * 200,
                    y: Math.random() * 100,
                    rotate: (Math.random() - 0.5) * 30,
                  }}
                  className={`absolute text-xs px-1.5 py-0.5 rounded text-xs font-bold ${card.broken ? 'bg-red-800 text-red-300' : 'bg-yellow-800 text-yellow-300'}`}
                >
                  {card.broken ? '✕ corrupt' : '📝'}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {isRelational && (
          <div className="bg-gray-900 border border-gray-700 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-3 gap-px bg-gray-700 text-xs">
              <div className="bg-gray-800 px-2 py-1.5 font-bold text-gray-400">user_id</div>
              <div className="bg-gray-800 px-2 py-1.5 font-bold text-gray-400">name</div>
              <div className="bg-gray-800 px-2 py-1.5 font-bold text-gray-400">song_count</div>
            </div>
            <div className="space-y-px bg-gray-700">
              <AnimatePresence>
                {cards.slice(-6).map(card => (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="grid grid-cols-3 gap-px bg-gray-900"
                  >
                    <div className="bg-gray-900 px-2 py-1 text-xs text-gray-400">u_{card.id}</div>
                    <div className="bg-gray-900 px-2 py-1 text-xs text-sky-300">Playlist {card.id}</div>
                    <div className="bg-gray-900 px-2 py-1 text-xs text-gray-400">{5 + card.id * 3}</div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {isDocument && (
          <div className="grid grid-cols-2 gap-2">
            <AnimatePresence>
              {cards.slice(-6).map(card => (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-violet-900/40 border border-violet-700/50 rounded-xl p-2.5 text-xs"
                >
                  <div className="text-violet-300 font-bold text-xs mb-1">📓 Playlist {card.id}</div>
                  <div className="text-gray-400 font-mono text-xs leading-tight">
                    {`{ name, songs[], cover, mood }`}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Visual: Traffic Spike (Scenario 5) ────────────────────────────────────────

function TrafficVisual({ optionId, phase }: { optionId: string; phase: SimPhase; isGood: boolean }) {
  const [tick, setTick] = useState(0);
  const isQueue = optionId === 'ticket-queue';
  const isCached = optionId === 'preload-album';
  const isBigger = optionId === 'bigger-servers';

  const [crashed, setCrashed] = useState(false);
  const [queueDepth, setQueueDepth] = useState(0);

  useEffect(() => {
    if (phase !== 'running') return;
    const interval = setInterval(() => setTick(t => t + 1), 400);
    return () => clearInterval(interval);
  }, [phase]);

  useEffect(() => {
    if (isBigger && phase === 'running' && tick > 8) setCrashed(true);
    if (isQueue && phase === 'running') {
      setQueueDepth(prev => Math.max(0, prev + (tick < 5 ? 12 : -3)));
    }
  }, [tick, phase]);

  // Spike height: ramps up then plateaus
  const bars = Array.from({ length: 12 }).map((_, i) => {
    if (i < tick) {
      const h = i < 4 ? (i / 4) * 0.9 : i < 8 ? 0.9 + Math.sin(i) * 0.1 : 0.85;
      return h;
    }
    return 0;
  });

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-xl px-6">
      {/* Traffic graph */}
      <div className="w-full">
        <div className="text-xs text-gray-500 mb-2 flex justify-between">
          <span>Traffic (req/sec)</span>
          <span className="text-red-400 font-bold">Midnight spike →</span>
        </div>
        <div className="flex items-end gap-0.5 h-20 bg-gray-900 border border-gray-800 rounded-xl p-2">
          {bars.map((h, i) => (
            <motion.div
              key={i}
              className={`flex-1 rounded-t ${
                crashed && i >= 8
                  ? 'bg-red-700'
                  : isCached
                  ? 'bg-green-600'
                  : isQueue && i >= 4
                  ? 'bg-yellow-500'
                  : 'bg-violet-600'
              }`}
              initial={{ height: 0 }}
              animate={{ height: `${h * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>
      </div>

      {/* System state */}
      <div className="flex gap-4 w-full">
        {/* Server */}
        <div className="flex-1 bg-gray-800 rounded-2xl p-4 text-center border-2 border-gray-700">
          {crashed ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-3xl"
            >
              💥
            </motion.div>
          ) : (
            <motion.div
              animate={phase === 'running' && !isCached ? { scale: [1, 1.04, 1] } : {}}
              transition={{ repeat: Infinity, duration: 0.7 }}
              className="text-3xl"
            >
              🖥️
            </motion.div>
          )}
          <div className="text-xs text-gray-300 font-bold mt-1">Origin Server</div>
          <div className={`text-xs mt-1 font-bold ${crashed ? 'text-red-400' : isCached ? 'text-green-400' : 'text-yellow-400'}`}>
            {crashed ? 'CRASHED' : isCached ? 'Idle ✅' : isQueue ? 'Steady' : 'Overloaded'}
          </div>
        </div>

        {/* Mechanism */}
        {isQueue && (
          <div className="flex-1 bg-sky-900/40 border border-sky-700/60 rounded-2xl p-3 text-center">
            <div className="text-3xl mb-1">🎟️</div>
            <div className="text-xs text-sky-300 font-bold">Queue</div>
            <div className="text-xs text-sky-400 mt-1">{queueDepth} waiting</div>
            <div className="mt-2 bg-gray-800 rounded-full h-1.5 overflow-hidden">
              <motion.div
                animate={{ width: `${Math.min(100, queueDepth * 3)}%` }}
                transition={{ duration: 0.3 }}
                className="h-full bg-sky-400 rounded-full"
              />
            </div>
          </div>
        )}

        {isCached && (
          <div className="flex-1 bg-violet-900/40 border border-violet-700/60 rounded-2xl p-3 text-center">
            <div className="text-3xl mb-1">📼</div>
            <div className="text-xs text-violet-300 font-bold">CDN Cache</div>
            <div className="text-xs text-green-400 mt-1">Pre-warmed ✅</div>
            <div className="text-xs text-gray-400 mt-1">800 kids → cache</div>
          </div>
        )}

        {isBigger && (
          <div className="flex-1 bg-amber-900/30 border border-amber-700/40 rounded-2xl p-3 text-center">
            <div className="text-3xl mb-1">💪</div>
            <div className="text-xs text-amber-300 font-bold">Bigger Server</div>
            <div className={`text-xs mt-1 font-bold ${crashed ? 'text-red-400' : 'text-amber-400'}`}>
              {crashed ? 'Still crashed' : 'Handling...'}
            </div>
          </div>
        )}
      </div>

      <div className="text-xs text-gray-500 text-center">
        {isCached && '✅ Album pre-loaded to CDN — origin server untouched'}
        {isQueue && '⏳ Queue absorbs the spike — no crashes, some wait time'}
        {isBigger && '💥 More power helps briefly — but 800x surge is still too much'}
      </div>
    </div>
  );
}

// ── Visual: Pipeline (Scenario 6) ─────────────────────────────────────────────

function PipelineVisual({ optionId, phase }: { optionId: string; phase: SimPhase; isGood: boolean }) {
  const isRandom = optionId === 'random-shuffle';
  const isPopular = optionId === 'popularity-chart';
  const isDiary = optionId === 'listening-diary';

  const [activeStage, setActiveStage] = useState(-1);
  const [recommendedSong, setRecommendedSong] = useState<string | null>(null);

  const pipelineStages = [
    { label: 'Collect Events', icon: '📡', desc: 'Log every listen' },
    { label: 'Store Data', icon: '🗄️', desc: 'Data warehouse' },
    { label: 'Analyze Patterns', icon: '🔬', desc: 'Find similarities' },
    { label: 'Serve Results', icon: '🚀', desc: 'Recommendations API' },
  ];

  useEffect(() => {
    if (phase !== 'running') return;
    if (isDiary) {
      pipelineStages.forEach((_, i) => {
        setTimeout(() => setActiveStage(i), 600 + i * 900);
      });
      setTimeout(() => setRecommendedSong('🎵 "Hey Jude" — because kids like you loved it'), 4200);
    } else if (isPopular) {
      setTimeout(() => setActiveStage(1), 600); // only aggregation
      setTimeout(() => setRecommendedSong('📊 "Neon Dreams" — most popular right now'), 2000);
    } else {
      setTimeout(() => setRecommendedSong('🎲 "Classical Symphony No. 5" — completely random'), 1200);
    }
  }, [phase]);

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-xl px-4">
      {/* User */}
      <div className="flex items-center gap-3 bg-gray-800 rounded-2xl px-4 py-2.5 border border-gray-700 self-start">
        <span className="text-xl">👦</span>
        <div className="text-xs">
          <div className="text-gray-300 font-bold">User finishes a song</div>
          <div className="text-gray-500">"What should I play next?"</div>
        </div>
      </div>

      {/* Pipeline stages */}
      {isDiary && (
        <div className="flex items-center gap-1 w-full">
          {pipelineStages.map((stage, i) => (
            <div key={stage.label} className="flex items-center flex-1">
              <motion.div
                animate={activeStage >= i ? { borderColor: '#8b5cf6', backgroundColor: 'rgba(109, 40, 217, 0.2)' } : {}}
                className="flex-1 bg-gray-800 border-2 border-gray-700 rounded-xl p-2.5 text-center transition-colors"
              >
                <motion.div
                  animate={activeStage === i ? { scale: [1, 1.3, 1] } : {}}
                  transition={{ duration: 0.4 }}
                  className="text-2xl mb-1"
                >
                  {stage.icon}
                </motion.div>
                <div className={`text-xs font-bold ${activeStage >= i ? 'text-violet-300' : 'text-gray-500'}`}>
                  {stage.label}
                </div>
                <div className="text-xs text-gray-600 mt-0.5">{stage.desc}</div>
                {activeStage === i && (
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 0.6 }}
                    className="text-xs text-violet-400 mt-1 font-bold"
                  >
                    ●
                  </motion.div>
                )}
              </motion.div>
              {i < pipelineStages.length - 1 && (
                <motion.div
                  animate={activeStage > i ? { color: '#8b5cf6' } : {}}
                  className="text-gray-600 text-lg px-0.5 shrink-0"
                >
                  →
                </motion.div>
              )}
            </div>
          ))}
        </div>
      )}

      {isPopular && (
        <div className="flex items-center gap-2 w-full justify-center">
          <div className="bg-sky-900/40 border border-sky-700 rounded-2xl p-3 text-center w-36">
            <div className="text-3xl mb-1">📊</div>
            <div className="text-xs text-sky-300 font-bold">Popularity Count</div>
            <div className="text-xs text-gray-500 mt-1">Global play counts</div>
          </div>
          <div className="text-xl text-gray-600">→</div>
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-3 text-center w-28">
            <div className="text-2xl mb-1">📋</div>
            <div className="text-xs text-gray-400 font-bold">Top 10 Chart</div>
            <div className="text-xs text-gray-600 mt-1">Same for everyone</div>
          </div>
        </div>
      )}

      {isRandom && (
        <div className="flex items-center gap-2 w-full justify-center">
          <div className="bg-red-900/30 border border-red-700/50 rounded-2xl p-3 text-center w-32">
            <motion.div
              animate={phase === 'running' ? { rotate: [0, 180, 360] } : {}}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="text-3xl mb-1"
            >
              🎲
            </motion.div>
            <div className="text-xs text-red-300 font-bold">Random</div>
            <div className="text-xs text-gray-500 mt-1">No data used</div>
          </div>
        </div>
      )}

      {/* Result */}
      <AnimatePresence>
        {recommendedSong && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl px-4 py-3 w-full text-center border ${
              isDiary
                ? 'bg-violet-900/40 border-violet-600 text-violet-200'
                : isPopular
                ? 'bg-sky-900/30 border-sky-700/60 text-sky-200'
                : 'bg-red-900/30 border-red-700/50 text-red-300'
            }`}
          >
            <div className="text-sm font-bold">{recommendedSong}</div>
            <div className={`text-xs mt-1 ${isDiary ? 'text-violet-400' : isPopular ? 'text-sky-500' : 'text-red-500'}`}>
              {isDiary ? '✅ Personalized to this user' : isPopular ? '⚠️ Same for every user' : '❌ Completely random'}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
