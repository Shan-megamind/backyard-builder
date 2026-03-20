import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ScenarioConfig, QuestId, GenericOutcome } from '../types';

interface Props {
  scenario: ScenarioConfig;
  optionId: string;
  questId: QuestId;
  onComplete: () => void;
}

type SimPhase = 'idle' | 'running' | 'done';

export default function ScenarioSimulation({ scenario, optionId, questId, onComplete }: Props) {
  const [phase, setPhase] = useState<SimPhase>('idle');
  const [showResults, setShowResults] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const outcome = scenario.outcomes[optionId]!;
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
            questId={questId}
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
  questId,
  optionId,
  phase,
  outcome,
}: {
  scenarioId: number;
  questId: QuestId;
  optionId: string;
  phase: SimPhase;
  outcome: GenericOutcome;
}) {
  if (questId === 'amazon') {
    switch (scenarioId) {
      case 1: return <InventoryVisual optionId={optionId} phase={phase} isGood={outcome.isOptimal} />;
      case 2: return <ProductSearchVisual optionId={optionId} phase={phase} isGood={outcome.isOptimal} />;
      case 3: return <CheckoutVisual optionId={optionId} phase={phase} isGood={outcome.isOptimal} />;
      case 4: return <QueueDispatchVisual optionId={optionId} phase={phase} isGood={outcome.isOptimal} />;
      case 5: return <SaleTrafficVisual optionId={optionId} phase={phase} isGood={outcome.isOptimal} />;
      case 6: return <TrackingVisual optionId={optionId} phase={phase} isGood={outcome.isOptimal} />;
      default: return null;
    }
  }
  if (questId === 'photo-social') {
    switch (scenarioId) {
      case 1: return <FeedDeliveryVisual optionId={optionId} phase={phase} isGood={outcome.isOptimal} />;
      case 2: return <PhotoCdnVisual optionId={optionId} phase={phase} isGood={outcome.isOptimal} />;
      case 3: return <FeedRankingVisual optionId={optionId} phase={phase} isGood={outcome.isOptimal} />;
      case 4: return <NotificationVisual optionId={optionId} phase={phase} isGood={outcome.isOptimal} />;
      case 5: return <UploadPipelineVisual optionId={optionId} phase={phase} isGood={outcome.isOptimal} />;
      case 6: return <DiscoveryVisual optionId={optionId} phase={phase} isGood={outcome.isOptimal} />;
      default: return null;
    }
  }
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

// ── Visual: Inventory Race (Amazon Scenario 1) ────────────────────────────────

type BuyerStatus = 'idle' | 'buying' | 'confirmed' | 'rejected';

function InventoryVisual({ optionId, phase }: { optionId: string; phase: SimPhase; isGood: boolean }) {
  const [aliceStatus, setAliceStatus] = useState<BuyerStatus>('idle');
  const [bobStatus, setBobStatus] = useState<BuyerStatus>('idle');
  const [inventory, setInventory] = useState(1);
  const [locked, setLocked] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const isReserve = optionId === 'reserve-item';
  const isQueue = optionId === 'queue-orders';

  useEffect(() => {
    if (phase !== 'running') return;

    function t(ms: number, fn: () => void) {
      const id = setTimeout(fn, ms);
      timerRef.current.push(id);
    }

    // Both start buying simultaneously
    t(400, () => { setAliceStatus('buying'); setBobStatus('buying'); });

    if (isReserve) {
      // Alice wins the lock
      t(900, () => setLocked(true));
      t(1400, () => { setAliceStatus('confirmed'); setInventory(0); });
      t(1900, () => setBobStatus('rejected'));
    } else if (isQueue) {
      // Serialize: Alice first, then Bob gets rejected
      t(1000, () => setBobStatus('idle')); // Bob waits in queue
      t(1400, () => { setAliceStatus('confirmed'); setInventory(0); });
      t(2200, () => { setBobStatus('buying'); });
      t(2800, () => setBobStatus('rejected'));
    } else {
      // Race condition: both confirm, oversell
      t(1200, () => { setAliceStatus('confirmed'); setBobStatus('confirmed'); setInventory(-1); });
    }

    return () => timerRef.current.forEach(clearTimeout);
  }, [phase]);

  const statusColor = (s: BuyerStatus) => {
    if (s === 'confirmed') return 'border-green-500 bg-green-900/30';
    if (s === 'rejected') return 'border-red-500 bg-red-900/30';
    if (s === 'buying') return 'border-yellow-500 bg-yellow-900/20';
    return 'border-gray-700 bg-gray-800';
  };

  const statusLabel = (s: BuyerStatus, name: string) => {
    if (s === 'confirmed') return <span className="text-green-400 font-bold text-xs">✅ Order Confirmed!</span>;
    if (s === 'rejected') return <span className="text-red-400 font-bold text-xs">❌ Out of Stock</span>;
    if (s === 'buying') return <span className="text-yellow-300 font-bold text-xs">🖱️ Clicking Buy…</span>;
    return <span className="text-gray-500 text-xs">{name} waiting…</span>;
  };

  const inventoryColor = inventory < 0 ? 'text-red-400' : inventory === 0 ? 'text-yellow-400' : 'text-green-400';

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md px-6">
      {/* Inventory counter */}
      <div className="bg-gray-800 border-2 border-gray-700 rounded-2xl p-4 text-center w-48">
        <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">🛒 Shop Machine</div>
        <div className="text-xs text-gray-400 mb-2">Inventory</div>
        <motion.div
          animate={inventory < 0 ? { scale: [1, 1.3, 1] } : {}}
          transition={{ duration: 0.4 }}
          className={`text-4xl font-black ${inventoryColor}`}
        >
          {inventory}
        </motion.div>
        <div className="text-xs text-gray-500 mt-1">
          {inventory > 0 ? 'item left' : inventory === 0 ? 'sold out' : '⚠️ oversold!'}
        </div>
        {locked && isReserve && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="mt-2 text-xs font-bold text-amber-300 bg-amber-900/40 border border-amber-700/60 rounded-lg px-2 py-1"
          >
            🔒 Locked
          </motion.div>
        )}
        {isQueue && phase === 'running' && (
          <div className="mt-2 text-xs text-violet-300 font-bold">📋 Queue active</div>
        )}
      </div>

      {/* Two buyers */}
      <div className="flex gap-4 w-full justify-center">
        {([['👧', 'Alice', aliceStatus] as const, ['👦', 'Bob', bobStatus] as const]).map(([emoji, name, status]) => (
          <motion.div
            key={name}
            animate={status === 'buying' ? { y: [0, -4, 0] } : {}}
            transition={{ repeat: Infinity, duration: 0.5 }}
            className={`flex-1 border-2 rounded-2xl p-4 text-center transition-colors ${statusColor(status)}`}
          >
            <div className="text-3xl mb-2">{emoji}</div>
            <div className="text-sm font-bold text-white mb-1">{name}</div>
            {statusLabel(status, name)}
          </motion.div>
        ))}
      </div>

      {/* Legend */}
      <div className="text-xs text-center">
        {phase === 'idle' && <span className="text-gray-500">Both kids are about to click Buy at the same time…</span>}
        {phase === 'running' && aliceStatus === 'buying' && bobStatus === 'buying' && (
          <span className="text-yellow-300 font-bold">⚡ Both clicking at the exact same moment!</span>
        )}
        {aliceStatus === 'confirmed' && bobStatus === 'confirmed' && (
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 font-bold">
            🔴 Both confirmed — but only 1 item existed. Oversold!
          </motion.span>
        )}
        {isReserve && bobStatus === 'rejected' && (
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-green-400 font-bold">
            ✅ Lock prevented the race — only one order succeeded.
          </motion.span>
        )}
        {isQueue && bobStatus === 'rejected' && (
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-violet-300 font-bold">
            ✅ Queue serialized requests — no oversell, but slower.
          </motion.span>
        )}
      </div>
    </div>
  );
}

// ── Visual: Product Search (Amazon Scenario 2) ────────────────────────────────

function ProductSearchVisual({ optionId, phase }: { optionId: string; phase: SimPhase; isGood: boolean }) {
  const [scanIndex, setScanIndex] = useState(-1);
  const [found, setFound] = useState(false);
  const scanRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isScan = optionId === 'keep-scanning';
  const isCatalog = optionId === 'name-catalog';
  const isIndex = optionId === 'attribute-index';

  const GRID = 40;
  const TARGET = 26;

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
    } else if (isCatalog) {
      setTimeout(() => setScanIndex(Math.floor(GRID * 0.4)), 400);
      setTimeout(() => setScanIndex(Math.floor(GRID * 0.65)), 700);
      setTimeout(() => { setScanIndex(TARGET); setFound(true); }, 1100);
    } else {
      setTimeout(() => { setScanIndex(TARGET); setFound(true); }, 250);
    }
    return () => { if (scanRef.current) clearInterval(scanRef.current); };
  }, [phase]);

  const PRODUCT_ICONS = ['🚲','👟','🎮','📱','🧸','🎒','🖥️','🎸'];

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-xl px-8">
      <div className="bg-gray-800 rounded-2xl px-4 py-3 flex items-center gap-3 w-full border border-gray-700">
        <span className="text-gray-400">🔍</span>
        <span className="text-gray-300 font-mono text-sm">
          &quot;red bike under $50&quot;
          {phase === 'running' && !found && (
            <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ repeat: Infinity, duration: 0.6 }}>|</motion.span>
          )}
        </span>
        {found && (
          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-auto text-green-400 font-bold text-sm">
            ✓ Found!
          </motion.span>
        )}
      </div>

      <div className="grid gap-1 w-full" style={{ gridTemplateColumns: 'repeat(8, 1fr)' }}>
        {Array.from({ length: GRID }).map((_, i) => {
          const isTarget = i === TARGET;
          const isScanning = isScan && i <= scanIndex && !isTarget;
          const isHighlighted = i === scanIndex && !isTarget && !isScan;
          return (
            <motion.div
              key={i}
              animate={
                isTarget && found ? { scale: [1, 1.3, 1], backgroundColor: '#10b981' }
                : isHighlighted ? { backgroundColor: '#7c3aed', scale: 1.1 }
                : isScanning ? { backgroundColor: '#374151' }
                : {}
              }
              transition={{ duration: 0.15 }}
              className="rounded-md aspect-square flex items-center justify-center text-sm"
              style={{ backgroundColor: isTarget && found ? '#10b981' : '#1f2937' }}
            >
              {isTarget && found ? PRODUCT_ICONS[0] : '▪'}
            </motion.div>
          );
        })}
      </div>

      <div className="text-center text-sm">
        {phase === 'idle' && <span className="text-gray-500">Ready to search 100,000 products…</span>}
        {phase === 'running' && !found && isScan && (
          <span className="text-red-400">Checking product #{scanIndex + 1} of 100,000…</span>
        )}
        {phase === 'running' && !found && (isCatalog || isIndex) && (
          <span className="text-violet-300">{isIndex ? 'Looking up "red", "bike", "under $50" in index…' : 'Jumping to B section…'}</span>
        )}
        {found && (
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-green-400 font-bold">
            {isIndex ? '🤖 Found instantly via attribute index! ⚡' : isCatalog ? '📖 Found via catalog — but only exact names work' : `🐌 Found after scanning ${TARGET + 1} products`}
          </motion.span>
        )}
      </div>

      <div className="text-xs text-gray-600 text-center">
        {isScan && 'Each square = ~2,500 products. Full scan = 100,000 checks.'}
        {isCatalog && 'Alphabetical index — fast for exact name, slow for attributes.'}
        {isIndex && 'Inverted index maps "red", "bike", "$50" directly to matching products.'}
      </div>
    </div>
  );
}

// ── Visual: Checkout Orchestration (Amazon Scenario 3) ────────────────────────

type StepStatus = 'idle' | 'running' | 'done' | 'failed' | 'rolling-back' | 'rolled-back';

function CheckoutVisual({ optionId, phase }: { optionId: string; phase: SimPhase; isGood: boolean }) {
  const [steps, setSteps] = useState<StepStatus[]>(['idle', 'idle', 'idle']);
  const timerRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const isMonolith = optionId === 'single-machine';
  const isSplit = optionId === 'split-no-coord';
  const isSaga = optionId === 'checkout-saga';

  function t(ms: number, fn: () => void) {
    const id = setTimeout(fn, ms);
    timerRef.current.push(id);
  }

  useEffect(() => {
    if (phase !== 'running') return;

    if (isMonolith) {
      t(400, () => setSteps(['running', 'idle', 'idle']));
      t(900, () => setSteps(['done', 'running', 'idle']));
      t(1400, () => setSteps(['done', 'failed', 'idle']));
      t(1900, () => setSteps(['failed', 'failed', 'failed'])); // cascade
    } else if (isSplit) {
      // All start simultaneously (no coordination)
      t(400, () => setSteps(['running', 'running', 'running']));
      t(1000, () => setSteps(['done', 'failed', 'running']));
      t(1600, () => setSteps(['done', 'failed', 'done'])); // inconsistent state
    } else {
      // Saga: sequential with rollback on failure
      t(400, () => setSteps(['running', 'idle', 'idle']));
      t(900, () => setSteps(['done', 'running', 'idle']));
      t(1400, () => setSteps(['done', 'done', 'running']));
      t(1900, () => setSteps(['done', 'done', 'done']));
    }

    return () => timerRef.current.forEach(clearTimeout);
  }, [phase]);

  const STEP_LABELS = ['Reserve Inventory', 'Charge Card', 'Confirm Order'];
  const STEP_ICONS = ['📦', '💳', '✅'];

  const stepColor = (s: StepStatus) => {
    if (s === 'done') return 'border-green-500 bg-green-900/30 text-green-300';
    if (s === 'failed' || s === 'rolled-back') return 'border-red-500 bg-red-900/30 text-red-300';
    if (s === 'rolling-back') return 'border-yellow-500 bg-yellow-900/20 text-yellow-300';
    if (s === 'running') return 'border-violet-500 bg-violet-900/30 text-violet-300';
    return 'border-gray-700 bg-gray-800 text-gray-500';
  };

  const stepIcon = (s: StepStatus, icon: string) => {
    if (s === 'done') return '✓';
    if (s === 'failed') return '✗';
    if (s === 'rolling-back') return '↩';
    if (s === 'rolled-back') return '↩';
    if (s === 'running') return (
      <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>⚙</motion.span>
    );
    return icon;
  };

  const statusNote = () => {
    if (isMonolith && steps[1] === 'failed') return { text: '💥 Card failed — inventory already gone. No rollback.', color: 'text-red-400' };
    if (isSplit && steps[1] === 'failed' && steps[2] === 'done') return { text: '⚠️ Card failed but order still "confirmed". Broken state.', color: 'text-amber-400' };
    if (isSaga && steps[2] === 'done') return { text: '✅ All steps complete. Any failure would have triggered rollback.', color: 'text-green-400' };
    return null;
  };

  const note = statusNote();

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-lg px-4">
      {isSaga && (
        <div className="bg-violet-900/30 border border-violet-700/50 rounded-xl px-4 py-2 text-xs text-violet-300 font-bold">
          🎼 Checkout Conductor orchestrating…
        </div>
      )}

      <div className="flex items-center gap-2 w-full">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center flex-1">
            <motion.div
              animate={s === 'failed' ? { x: [0, -4, 4, -4, 0] } : {}}
              transition={{ duration: 0.3 }}
              className={`flex-1 border-2 rounded-2xl p-3 text-center transition-colors ${stepColor(s)}`}
            >
              <div className="text-2xl mb-1">{stepIcon(s, STEP_ICONS[i])}</div>
              <div className="text-xs font-bold leading-tight">{STEP_LABELS[i]}</div>
              <div className="text-xs mt-1 opacity-70">{s === 'idle' ? 'Waiting' : s === 'running' ? 'In progress' : s.charAt(0).toUpperCase() + s.slice(1)}</div>
            </motion.div>
            {i < 2 && (
              <div className={`text-lg px-1 shrink-0 ${isSaga ? 'text-violet-500' : 'text-gray-600'}`}>→</div>
            )}
          </div>
        ))}
      </div>

      {note && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={`text-sm font-bold text-center ${note.color}`}>
          {note.text}
        </motion.div>
      )}

      <div className="text-xs text-gray-600 text-center">
        {isMonolith && 'One system handles all steps — one failure corrupts everything.'}
        {isSplit && 'Three separate systems, no coordinator — each can succeed or fail independently.'}
        {isSaga && 'Conductor runs each step in order. Failure at any step triggers automatic rollback.'}
      </div>
    </div>
  );
}

// ── Visual: Queue Dispatch (Amazon Scenario 4) ────────────────────────────────

const DOWNSTREAM = [
  { label: 'Warehouse', icon: '🏭' },
  { label: 'Inventory', icon: '📦' },
  { label: 'Email', icon: '📧' },
  { label: 'Analytics', icon: '📊' },
  { label: 'Fulfillment', icon: '🚚' },
];

type DeliveryStatus = 'pending' | 'sent' | 'delivered' | 'lost' | 'retrying' | 'queued';

function QueueDispatchVisual({ optionId, phase }: { optionId: string; phase: SimPhase; isGood: boolean }) {
  const [orderDone, setOrderDone] = useState(false);
  const [statuses, setStatuses] = useState<DeliveryStatus[]>(DOWNSTREAM.map(() => 'pending'));
  const timerRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const isSync = optionId === 'sync-all';
  const isFireForget = optionId === 'fire-forget';
  const isQueue = optionId === 'reliable-queue';

  function t(ms: number, fn: () => void) {
    const id = setTimeout(fn, ms);
    timerRef.current.push(id);
  }
  function setStatus(i: number, s: DeliveryStatus) {
    setStatuses(prev => { const n = [...prev]; n[i] = s; return n; });
  }

  useEffect(() => {
    if (phase !== 'running') return;

    if (isSync) {
      // Order waits for all — slow, one fails
      DOWNSTREAM.forEach((_, i) => {
        t(600 + i * 700, () => setStatus(i, 'sent'));
        const fail = i === 2; // email fails
        t(1000 + i * 700, () => setStatus(i, fail ? 'lost' : 'delivered'));
      });
      t(600 + 4 * 700 + 400, () => setOrderDone(false)); // never completes
    } else if (isFireForget) {
      // Confirm immediately, fire messages
      t(400, () => setOrderDone(true));
      DOWNSTREAM.forEach((_, i) => {
        t(500 + i * 200, () => setStatus(i, 'sent'));
        const lost = i === 0 || i === 3; // warehouse and analytics lost
        t(900 + i * 200, () => setStatus(i, lost ? 'lost' : 'delivered'));
      });
    } else {
      // Confirm immediately, queue everything
      t(400, () => setOrderDone(true));
      DOWNSTREAM.forEach((_, i) => {
        t(500 + i * 150, () => setStatus(i, 'queued'));
        const slow = i === 0; // warehouse is slow → retries
        t(900 + i * 350, () => setStatus(i, slow ? 'retrying' : 'delivered'));
        if (slow) t(1800, () => setStatus(i, 'delivered'));
      });
    }

    return () => timerRef.current.forEach(clearTimeout);
  }, [phase]);

  const statusStyle = (s: DeliveryStatus) => {
    if (s === 'delivered') return 'bg-green-900/40 border-green-600 text-green-300';
    if (s === 'lost') return 'bg-red-900/40 border-red-600 text-red-300';
    if (s === 'retrying') return 'bg-yellow-900/30 border-yellow-600 text-yellow-300';
    if (s === 'queued') return 'bg-violet-900/30 border-violet-600 text-violet-300';
    if (s === 'sent') return 'bg-sky-900/30 border-sky-600 text-sky-300';
    return 'bg-gray-800 border-gray-700 text-gray-500';
  };

  const statusLabel = (s: DeliveryStatus) => {
    if (s === 'delivered') return '✓ Delivered';
    if (s === 'lost') return '✗ Lost';
    if (s === 'retrying') return '↻ Retrying…';
    if (s === 'queued') return '⏳ Queued';
    if (s === 'sent') return '→ Sent';
    return '…';
  };

  return (
    <div className="flex items-start gap-4 w-full max-w-2xl px-4">
      {/* Order */}
      <div className="shrink-0 flex flex-col items-center gap-2">
        <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Order</div>
        <div className="bg-gray-800 border-2 border-gray-600 rounded-2xl p-3 text-center w-20">
          <div className="text-2xl mb-1">🛒</div>
          <div className="text-xs text-gray-300 font-bold">Order #42</div>
          {orderDone ? (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-xs text-green-400 font-bold mt-1">✅ Done</motion.div>
          ) : isSync && phase === 'running' ? (
            <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 0.7 }} className="text-xs text-yellow-400 mt-1">Waiting…</motion.div>
          ) : (
            <div className="text-xs text-gray-600 mt-1">Pending</div>
          )}
        </div>
      </div>

      {/* Arrow + optional queue */}
      <div className="flex flex-col items-center justify-center self-center gap-1">
        <div className="text-gray-600 text-xl">→</div>
        {isQueue && (
          <div className="bg-violet-900/40 border border-violet-700 rounded-xl px-2 py-1 text-xs text-violet-300 font-bold text-center">
            📮 Queue
          </div>
        )}
        <div className="text-gray-600 text-xl">→</div>
      </div>

      {/* Downstream systems */}
      <div className="flex-1 flex flex-col gap-1.5">
        <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-0.5">Downstream Systems</div>
        {DOWNSTREAM.map((sys, i) => (
          <motion.div
            key={sys.label}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            className={`flex items-center gap-2 border rounded-xl px-2.5 py-1.5 text-xs transition-colors ${statusStyle(statuses[i])}`}
          >
            <span>{sys.icon}</span>
            <span className="font-bold flex-1">{sys.label}</span>
            <span className="font-bold">{statusLabel(statuses[i])}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ── Visual: Sale Traffic (Amazon Scenario 5) ──────────────────────────────────

function SaleTrafficVisual({ optionId, phase }: { optionId: string; phase: SimPhase; isGood: boolean }) {
  const [tick, setTick] = useState(0);
  const [crashed, setCrashed] = useState(false);
  const [serverCount, setServerCount] = useState(1);

  const isBigger = optionId === 'bigger-servers';
  const isCache = optionId === 'hot-cache';
  const isProtect = optionId === 'full-protection';

  useEffect(() => {
    if (phase !== 'running') return;
    const interval = setInterval(() => setTick(t => t + 1), 400);
    return () => clearInterval(interval);
  }, [phase]);

  useEffect(() => {
    if (isBigger && phase === 'running' && tick > 7) setCrashed(true);
    if (isProtect && phase === 'running' && tick > 4) setServerCount(Math.min(4, 1 + Math.floor((tick - 4) / 2)));
  }, [tick, phase]);

  const bars = Array.from({ length: 12 }).map((_, i) => {
    if (i >= tick) return 0;
    return i < 3 ? (i + 1) / 3 * 0.2 : Math.min(1, 0.2 + ((i - 3) / 9) * 0.85);
  });

  const cacheHit = isCache || isProtect;
  const circuitOpen = isProtect && tick > 5;

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-xl px-6">
      <div className="w-full">
        <div className="text-xs text-gray-500 mb-2 flex justify-between">
          <span>Requests/sec</span>
          <span className="text-red-400 font-bold">Sale starts →</span>
        </div>
        <div className="flex items-end gap-0.5 h-20 bg-gray-900 border border-gray-800 rounded-xl p-2">
          {bars.map((h, i) => (
            <motion.div
              key={i}
              className={`flex-1 rounded-t ${
                crashed && i >= 7 ? 'bg-red-700'
                : cacheHit ? 'bg-green-600'
                : 'bg-violet-600'
              }`}
              initial={{ height: 0 }}
              animate={{ height: `${h * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>
      </div>

      <div className="flex gap-3 w-full">
        {/* Servers */}
        <div className="flex-1 bg-gray-800 border-2 border-gray-700 rounded-2xl p-3 text-center">
          {crashed ? (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-3xl">💥</motion.div>
          ) : (
            <div className="flex justify-center gap-1">
              {Array.from({ length: isProtect ? serverCount : 1 }).map((_, i) => (
                <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-2xl">🖥️</motion.div>
              ))}
            </div>
          )}
          <div className="text-xs text-gray-400 font-bold mt-1">{isProtect ? `${serverCount} Server${serverCount > 1 ? 's' : ''}` : 'Origin Server'}</div>
          <div className={`text-xs mt-0.5 font-bold ${crashed ? 'text-red-400' : isBigger ? 'text-amber-400' : 'text-green-400'}`}>
            {crashed ? 'CRASHED' : isProtect ? 'Autoscaling ✅' : isCache ? 'Protected ✅' : 'Under pressure'}
          </div>
        </div>

        {/* Cache panel */}
        {cacheHit && (
          <div className="flex-1 bg-emerald-900/30 border border-emerald-700/60 rounded-2xl p-3 text-center">
            <div className="text-3xl mb-1">🗄️</div>
            <div className="text-xs text-emerald-300 font-bold">Hot Cache</div>
            <div className="text-xs text-green-400 mt-1">{tick > 3 ? '90% hit rate ✅' : 'Pre-warming…'}</div>
          </div>
        )}

        {/* Circuit breaker */}
        {isProtect && (
          <div className={`flex-1 rounded-2xl p-3 text-center border ${circuitOpen ? 'bg-amber-900/30 border-amber-700/60' : 'bg-gray-800 border-gray-700'}`}>
            <div className="text-3xl mb-1">🛡️</div>
            <div className={`text-xs font-bold ${circuitOpen ? 'text-amber-300' : 'text-gray-400'}`}>Circuit Breaker</div>
            <div className={`text-xs mt-1 font-bold ${circuitOpen ? 'text-amber-400' : 'text-gray-500'}`}>{circuitOpen ? 'Shedding analytics' : 'Monitoring'}</div>
          </div>
        )}

        {isBigger && (
          <div className="flex-1 bg-amber-900/30 border border-amber-700/40 rounded-2xl p-3 text-center">
            <div className="text-3xl mb-1">💪</div>
            <div className="text-xs text-amber-300 font-bold">Bigger Server</div>
            <div className={`text-xs mt-1 font-bold ${crashed ? 'text-red-400' : 'text-amber-400'}`}>{crashed ? 'Still crashed' : 'Handling…'}</div>
          </div>
        )}
      </div>

      <div className="text-xs text-gray-500 text-center">
        {isBigger && '💥 More power helps briefly — 50× surge is still too much'}
        {isCache && '✅ Cache absorbs 90% of reads — DB stays protected'}
        {isProtect && '✅ Cache + autoscale + circuit breaker — all orders protected'}
      </div>
    </div>
  );
}

// ── Visual: Order Tracking (Amazon Scenario 6) ────────────────────────────────

const ORDER_STAGES = [
  { label: 'Order Confirmed', icon: '✅' },
  { label: 'Processing', icon: '⚙️' },
  { label: 'Shipped', icon: '🚚' },
  { label: 'Out for Delivery', icon: '📦' },
  { label: 'Delivered', icon: '🏠' },
];

function TrackingVisual({ optionId, phase }: { optionId: string; phase: SimPhase; isGood: boolean }) {
  const [activeStage, setActiveStage] = useState(-1);
  const [staleness, setStaleness] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const isManual = optionId === 'manual-checks';
  const isBatch = optionId === 'hourly-batch';
  const isEvent = optionId === 'event-stream';

  function t(ms: number, fn: () => void) {
    const id = setTimeout(fn, ms);
    timerRef.current.push(id);
  }

  useEffect(() => {
    if (phase !== 'running') return;

    if (isEvent) {
      ORDER_STAGES.forEach((_, i) => {
        t(300 + i * 700, () => setActiveStage(i));
      });
    } else if (isBatch) {
      // Updates come in batches, some stages missed
      t(400, () => setActiveStage(0));
      t(1200, () => { setActiveStage(2); setStaleness('~58 min gap'); }); // skipped stage 1
      t(2400, () => { setActiveStage(4); setStaleness('~61 min gap'); }); // skipped stages 3
    } else {
      // Manual: very slow updates
      t(600, () => setActiveStage(0));
      t(2000, () => setActiveStage(1));
      // stages 2-4 never arrive in time
    }

    return () => timerRef.current.forEach(clearTimeout);
  }, [phase]);

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-sm px-4">
      <div className="text-xs text-gray-500 font-bold uppercase tracking-wider self-start">Order #42 Status</div>

      {ORDER_STAGES.map((stage, i) => {
        const isActive = i <= activeStage;
        const isCurrent = i === activeStage;
        const isMissed = isBatch && activeStage > i + 1 && (i === 1 || i === 3);

        return (
          <div key={stage.label} className="flex items-center gap-3 w-full">
            {/* Line above */}
            {i > 0 && (
              <div className="w-4 shrink-0 flex justify-center">
                <motion.div
                  animate={{ backgroundColor: isActive ? '#8b5cf6' : '#374151' }}
                  className="w-0.5 h-4 -mt-4"
                  style={{ backgroundColor: '#374151' }}
                />
              </div>
            )}
            {i === 0 && <div className="w-4 shrink-0" />}

            <motion.div
              animate={
                isActive
                  ? { borderColor: '#8b5cf6', backgroundColor: 'rgba(109, 40, 217, 0.2)' }
                  : {}
              }
              className={`flex-1 flex items-center gap-2 border-2 rounded-xl px-3 py-2 transition-colors ${
                isActive ? 'border-violet-500' : 'border-gray-700 bg-gray-800/40'
              }`}
            >
              <motion.span
                animate={isCurrent && isEvent ? { scale: [1, 1.3, 1] } : {}}
                transition={{ duration: 0.4 }}
                className="text-lg"
              >
                {stage.icon}
              </motion.span>
              <div className="flex-1">
                <div className={`text-xs font-bold ${isActive ? 'text-violet-200' : 'text-gray-600'}`}>
                  {stage.label}
                </div>
                {isBatch && isMissed && isActive && (
                  <div className="text-xs text-amber-400">⚠️ Skipped in batch</div>
                )}
              </div>
              {isCurrent && (
                <motion.div
                  animate={isEvent ? { opacity: [0.5, 1, 0.5] } : {}}
                  transition={{ repeat: Infinity, duration: 0.8 }}
                  className={`text-xs font-bold ${isEvent ? 'text-violet-400' : 'text-yellow-400'}`}
                >
                  {isEvent ? '⚡ Live' : isManual ? '👤 Manual' : '⏱ Batch'}
                </motion.div>
              )}
            </motion.div>
          </div>
        );
      })}

      {staleness && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-amber-400 font-bold self-center">
          ⚠️ {staleness} — status page was wrong the whole time
        </motion.div>
      )}

      {isManual && activeStage === 1 && phase === 'done' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-red-400 font-bold text-center">
          ❌ Package delivered but tracking still shows "Processing"
        </motion.div>
      )}

      <div className="text-xs text-gray-600 text-center mt-1">
        {isManual && 'Support team manually checks each system — cannot keep up at scale.'}
        {isBatch && 'Batch sync runs hourly — rapid state changes are missed entirely.'}
        {isEvent && 'Each system publishes an event the moment status changes — instant updates.'}
      </div>
    </div>
  );
}

// ── Photo Social Visuals ──────────────────────────────────────────────────────

// ── Visual: Feed Delivery (Photo Social S1) ───────────────────────────────────

function FeedDeliveryVisual({ optionId, phase }: { optionId: string; phase: SimPhase; isGood: boolean }) {
  const isFanOutWrite = optionId === 'fan-out-write';
  const isFanOutRead = optionId === 'fan-out-read';
  const isGlobal = optionId === 'global-feed';

  const [feedPosts, setFeedPosts] = useState<{ label: string; sub: string; color: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const FRIEND_POSTS = [
    { label: '🏖️  Maya posted', sub: 'Beach day!', color: 'bg-violet-900/40 border-violet-700' },
    { label: '🎮  Sam posted', sub: 'New high score', color: 'bg-violet-900/40 border-violet-700' },
    { label: '🐕  Zoe posted', sub: 'Meet Biscuit', color: 'bg-violet-900/40 border-violet-700' },
  ];
  const GLOBAL_POSTS = [
    { label: '🎤  @pop_star posted', sub: 'Concert tonight!', color: 'bg-red-900/30 border-red-700' },
    { label: '🏟️  @sports_fan posted', sub: 'Final score 3-2', color: 'bg-red-900/30 border-red-700' },
    { label: '🚀  @tech_bro posted', sub: 'Just shipped!', color: 'bg-red-900/30 border-red-700' },
  ];

  useEffect(() => {
    if (phase !== 'running') return;
    if (isFanOutWrite) {
      setTimeout(() => setFeedPosts(FRIEND_POSTS), 350);
    } else if (isFanOutRead) {
      setLoading(true);
      setTimeout(() => { setLoading(false); setFeedPosts([FRIEND_POSTS[0]]); }, 1700);
      setTimeout(() => setFeedPosts([FRIEND_POSTS[0], FRIEND_POSTS[1]]), 2400);
      setTimeout(() => setFeedPosts(FRIEND_POSTS), 3100);
    } else {
      setTimeout(() => setFeedPosts(GLOBAL_POSTS), 350);
    }
  }, [phase]);

  const statusText = () => {
    if (phase === 'idle') return <span className="text-gray-500">Alex opens the app…</span>;
    if (loading) return <span className="text-yellow-400 font-bold">⏳ Fetching from 12 followed accounts…</span>;
    if (feedPosts.length > 0 && isGlobal) return <span className="text-red-400 font-bold">🌍 Fast — but these aren't her friends</span>;
    if (feedPosts.length > 0 && isFanOutWrite) return <span className="text-green-400 font-bold">⚡ Feed loaded instantly — pre-built!</span>;
    if (feedPosts.length === FRIEND_POSTS.length && isFanOutRead) return <span className="text-amber-400 font-bold">✓ Correct content — but took 3+ seconds</span>;
    return null;
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md px-6">
      {/* Phone frame */}
      <div className="bg-gray-800 border-2 border-gray-600 rounded-3xl p-3 w-56 min-h-48">
        <div className="bg-gray-900 rounded-2xl px-3 py-2 mb-2 flex items-center gap-2 border border-gray-700">
          <span className="text-lg">📸</span>
          <span className="text-xs font-bold text-gray-300">Alex's Feed</span>
        </div>
        <div className="space-y-1.5 min-h-28 flex flex-col justify-center">
          {loading && (
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="text-center text-xs text-yellow-400 font-bold py-4"
            >
              ⏳ Loading…
            </motion.div>
          )}
          <AnimatePresence>
            {feedPosts.map((post, i) => (
              <motion.div
                key={post.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`border rounded-xl px-2.5 py-2 text-xs ${post.color}`}
              >
                <div className="font-bold text-white leading-tight">{post.label}</div>
                <div className="text-gray-400 text-xs">{post.sub}</div>
              </motion.div>
            ))}
          </AnimatePresence>
          {!loading && feedPosts.length === 0 && phase !== 'idle' && (
            <div className="text-center text-gray-600 text-xs py-4">📭 No posts to show</div>
          )}
          {phase === 'idle' && (
            <div className="text-center text-gray-600 text-xs py-4">…</div>
          )}
        </div>
      </div>

      <div className="text-sm text-center min-h-5">{statusText()}</div>

      <div className="text-xs text-gray-600 text-center">
        {isFanOutWrite && 'Feed pre-built when friends post — O(1) read, no wait.'}
        {isFanOutRead && 'Feed assembled at open time — O(following_count) per request.'}
        {isGlobal && 'Global timeline — fast, but shows strangers instead of friends.'}
      </div>
    </div>
  );
}

// ── Visual: Photo CDN (Photo Social S2) ───────────────────────────────────────

function PhotoCdnVisual({ optionId, phase }: { optionId: string; phase: SimPhase; isGood: boolean }) {
  const isCdn = optionId === 'object-cdn';
  const isBigger = optionId === 'bigger-server';
  const isCompress = optionId === 'compress-photos';

  const USERS = [
    { label: 'Nearby', icon: '👦', dist: 'short' },
    { label: 'Midtown', icon: '👧', dist: 'mid' },
    { label: 'Far Side', icon: '👱', dist: 'far' },
  ];

  const loadTime = (dist: string) => {
    if (isCdn) return { text: '120ms ✅', color: 'text-green-400' };
    if (isBigger) return dist === 'far' ? { text: '4.2s ⚠️', color: 'text-yellow-400' } : { text: '1.1s ✅', color: 'text-green-400' };
    if (isCompress) return { text: dist === 'far' ? '1.8s 🤢' : '0.8s', color: dist === 'far' ? 'text-amber-400' : 'text-gray-400' };
    return { text: '…', color: 'text-gray-500' };
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg px-6">
      {/* Photo + server */}
      <div className="flex items-center gap-4 justify-center">
        <div className="bg-gray-800 border-2 border-gray-600 rounded-2xl p-3 text-center w-28">
          <div className="text-3xl mb-1">🖼️</div>
          <div className="text-xs text-gray-400 font-bold">Photo Server</div>
          {isBigger && <div className="text-xs text-green-400 mt-0.5">Upgraded</div>}
        </div>
        {isCdn && (
          <>
            <div className="text-gray-500">→</div>
            <motion.div
              initial={{ scale: 0 }}
              animate={phase !== 'idle' ? { scale: 1 } : {}}
              transition={{ type: 'spring', stiffness: 200 }}
              className="bg-emerald-900/40 border border-emerald-600 rounded-2xl p-3 text-center w-28"
            >
              <div className="text-3xl mb-1">🌐</div>
              <div className="text-xs text-emerald-300 font-bold">CDN Edge</div>
              <div className="text-xs text-green-400 mt-0.5">Cached locally</div>
            </motion.div>
          </>
        )}
      </div>

      {/* Users with load times */}
      <div className="flex gap-4 justify-center w-full">
        {USERS.map((u, i) => {
          const lt = loadTime(u.dist);
          return (
            <motion.div
              key={u.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.15 }}
              className="flex flex-col items-center gap-1.5 bg-gray-800 border border-gray-700 rounded-2xl p-3 flex-1 text-center"
            >
              <span className="text-2xl">{u.icon}</span>
              <div className="text-xs text-gray-400 font-bold">{u.label}</div>
              {phase !== 'idle' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 + i * 0.2 }}
                  className={`text-xs font-bold ${lt.color}`}
                >
                  {lt.text}
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {isCompress && phase === 'done' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-amber-400 font-bold text-center">
          🤢 Faster delivery, but photos look blurry — users notice on a photo product
        </motion.div>
      )}
      <div className="text-xs text-gray-600 text-center">
        {isCdn && '✅ CDN edge nodes cache photos near every user — origin never touched on reads.'}
        {isBigger && '💪 Bigger server helps nearby users but distant latency remains high.'}
        {isCompress && '🗜️ Smaller files transfer faster but quality degrades — wrong trade for a photo product.'}
      </div>
    </div>
  );
}

// ── Visual: Feed Ranking (Photo Social S3) ────────────────────────────────────

function FeedRankingVisual({ optionId, phase }: { optionId: string; phase: SimPhase; isGood: boolean }) {
  const isChronological = optionId === 'chronological';
  const isPopularity = optionId === 'popularity-sort';
  const isRelevance = optionId === 'relevance-rank';

  type Post = { id: number; author: string; emoji: string; score: number; relevant: boolean };

  const ALL_POSTS: Post[] = [
    { id: 1, author: 'Maya (close friend)', emoji: '🏖️', score: 62, relevant: true },
    { id: 2, author: 'PowerPoster 🔥 ×40/day', emoji: '📣', score: 91, relevant: false },
    { id: 3, author: 'Sam (close friend)', emoji: '🎮', score: 58, relevant: true },
    { id: 4, author: 'PowerPoster 🔥 ×40/day', emoji: '📢', score: 88, relevant: false },
    { id: 5, author: 'Zoe (close friend)', emoji: '🐕', score: 55, relevant: true },
    { id: 6, author: 'PowerPoster 🔥 ×40/day', emoji: '📯', score: 85, relevant: false },
  ];

  const getSorted = (): Post[] => {
    if (isPopularity) return [...ALL_POSTS].sort((a, b) => b.score - a.score);
    if (isRelevance) return [...ALL_POSTS].sort((a, b) => (b.relevant ? 1 : -1) - (a.relevant ? 1 : -1));
    return ALL_POSTS; // chronological = original order
  };

  const sorted = phase !== 'idle' ? getSorted() : ALL_POSTS;

  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-md px-4">
      <div className="text-xs text-gray-500 font-bold uppercase tracking-wider self-start">
        {isChronological ? '🕐 Chronological' : isPopularity ? '🔥 By Global Popularity' : '🤖 Personalized Relevance'}
      </div>

      <div className="w-full space-y-1.5">
        {sorted.slice(0, 4).map((post, i) => (
          <motion.div
            key={post.id}
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.12 }}
            className={`flex items-center gap-2.5 border rounded-xl px-3 py-2 text-xs ${
              isRelevance && post.relevant
                ? 'bg-violet-900/30 border-violet-600'
                : isRelevance && !post.relevant
                ? 'bg-gray-800/40 border-gray-700 opacity-60'
                : isPopularity && !post.relevant
                ? 'bg-sky-900/30 border-sky-700'
                : 'bg-gray-800 border-gray-700'
            }`}
          >
            <span className="text-lg">{post.emoji}</span>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-white text-xs truncate">{post.author}</div>
            </div>
            {isPopularity && (
              <span className="text-sky-400 font-bold shrink-0">{post.score} ❤️</span>
            )}
            {isRelevance && post.relevant && (
              <span className="text-violet-400 font-bold shrink-0">✓ close friend</span>
            )}
            {i === 0 && <span className="text-yellow-500 font-bold shrink-0 text-xs">#1</span>}
          </motion.div>
        ))}
      </div>

      <div className="text-xs text-gray-600 text-center mt-1">
        {isChronological && '⚠️ Power users flood the top — 3 close friends buried below 40 posts.'}
        {isPopularity && '⚠️ Globally popular posts dominate — same feed for every user.'}
        {isRelevance && '✅ Close friends surface first — based on your personal engagement history.'}
      </div>
    </div>
  );
}

// ── Visual: Notifications (Photo Social S4) ───────────────────────────────────

function NotificationVisual({ optionId, phase }: { optionId: string; phase: SimPhase; isGood: boolean }) {
  const isPush = optionId === 'push-notifications';
  const isPolling = optionId === 'polling-30s';
  const isEmail = optionId === 'email-digest';

  const [notifArrived, setNotifArrived] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [pollCount, setPollCount] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  function t(ms: number, fn: () => void) {
    const id = setTimeout(fn, ms);
    timerRef.current.push(id);
  }

  useEffect(() => {
    if (phase !== 'running') return;
    if (isPush) {
      t(600, () => setNotifArrived(true));
    } else if (isPolling) {
      // Simulate countdown then poll
      let c = 30;
      const iv = setInterval(() => {
        c = Math.max(0, c - 4);
        setCountdown(c);
        setPollCount(p => p + 1);
        if (c === 0) { setNotifArrived(true); clearInterval(iv); }
      }, 400);
      timerRef.current.push(iv as unknown as ReturnType<typeof setTimeout>);
    } else {
      // Email arrives "next day"
      t(3500, () => setNotifArrived(true));
    }
    return () => timerRef.current.forEach(clearTimeout);
  }, [phase]);

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-sm px-6">
      {/* Event: someone liked your photo */}
      <div className="bg-gray-800 border border-gray-700 rounded-2xl px-4 py-3 w-full flex items-center gap-3">
        <span className="text-2xl">❤️</span>
        <div>
          <div className="text-xs font-bold text-white">Sam liked your photo</div>
          <div className="text-xs text-gray-500">Just now</div>
        </div>
      </div>

      <div className="text-lg text-gray-600">↓ How does it reach you?</div>

      {/* Delivery mechanism */}
      <div className="bg-gray-800 border-2 border-gray-700 rounded-2xl p-4 w-full text-center">
        {isPush && (
          <>
            <div className="text-3xl mb-2">📱</div>
            <div className="text-xs text-gray-400 font-bold mb-2">Push Service</div>
            <AnimatePresence>
              {notifArrived ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="bg-violet-900/50 border border-violet-500 rounded-xl px-3 py-2 text-sm font-bold text-violet-200"
                >
                  ⚡ Sam liked your photo — <span className="text-green-400">instantly!</span>
                </motion.div>
              ) : (
                <div className="text-xs text-gray-500">Waiting for event…</div>
              )}
            </AnimatePresence>
          </>
        )}
        {isPolling && (
          <>
            <div className="text-3xl mb-1">🔄</div>
            <div className="text-xs text-gray-400 font-bold mb-1">Polling server</div>
            <div className="text-xs text-amber-400 mb-2">Poll #{pollCount} — next in {countdown}s</div>
            <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                animate={{ width: `${((30 - countdown) / 30) * 100}%` }}
                className="h-full bg-amber-500 rounded-full"
                transition={{ duration: 0.3 }}
              />
            </div>
            {notifArrived && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 text-xs text-amber-300 font-bold">
                Found after {pollCount} polls — {30 - countdown}s delay
              </motion.div>
            )}
          </>
        )}
        {isEmail && (
          <>
            <div className="text-3xl mb-2">📧</div>
            <div className="text-xs text-gray-400 font-bold mb-1">Daily digest</div>
            {notifArrived ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-sky-300 font-bold">
                "12 people liked your photos" <span className="text-gray-500">(sent 18h later)</span>
              </motion.div>
            ) : (
              <div className="text-xs text-gray-500">Waiting for tonight's batch…</div>
            )}
          </>
        )}
      </div>

      <div className="text-xs text-gray-600 text-center">
        {isPush && '✅ Server-initiated delivery — phone buzzes the moment the like happens.'}
        {isPolling && '⚠️ Client asks "any news?" every 30s — works but wastes resources.'}
        {isEmail && '❌ Batch delivery — by the time it arrives, the moment has passed.'}
      </div>
    </div>
  );
}

// ── Visual: Upload Pipeline (Photo Social S5) ─────────────────────────────────

function UploadPipelineVisual({ optionId, phase }: { optionId: string; phase: SimPhase; isGood: boolean }) {
  const isSync = optionId === 'sync-process';
  const isAsync = optionId === 'async-pipeline';
  const isClient = optionId === 'client-resize';

  const [stepsDone, setStepsDone] = useState<number>(-1);
  const [uploadConfirmed, setUploadConfirmed] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  function t(ms: number, fn: () => void) {
    const id = setTimeout(fn, ms);
    timerRef.current.push(id);
  }

  const STEPS = ['Receive file', 'Resize (4 sizes)', 'Generate thumbnail', 'Run content check', 'Push to CDN'];

  useEffect(() => {
    if (phase !== 'running') return;
    if (isSync) {
      STEPS.forEach((_, i) => t(600 + i * 700, () => setStepsDone(i)));
      t(600 + 3 * 700, () => setTimedOut(true)); // times out mid-pipeline
    } else if (isAsync) {
      t(400, () => { setStepsDone(0); setUploadConfirmed(true); });
      STEPS.slice(1).forEach((_, i) => t(1000 + i * 600, () => setStepsDone(i + 1)));
    } else {
      // client-resize: client-side processing first, then upload
      t(500, () => setStepsDone(0)); // "Resize on device"
      t(1200, () => setStepsDone(1)); // "Upload compressed file"
      t(2000, () => { setStepsDone(2); setUploadConfirmed(true); });
    }
    return () => timerRef.current.forEach(clearTimeout);
  }, [phase]);

  const clientSteps = ['Resize on device (CPU)', 'Upload compressed file', 'Server confirms'];

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md px-4">
      {/* User action */}
      <div className="flex items-center gap-3 bg-gray-800 border border-gray-700 rounded-2xl px-4 py-2.5 w-full">
        <span className="text-xl">📸</span>
        <div className="flex-1">
          <div className="text-xs font-bold text-white">User taps "Post"</div>
          <div className="text-xs text-gray-500">On 3G connection</div>
        </div>
        {uploadConfirmed && !timedOut && (
          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-xs font-bold text-green-400">✅ Confirmed</motion.span>
        )}
        {timedOut && (
          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-xs font-bold text-red-400">⏱ Timed out</motion.span>
        )}
      </div>

      {/* Pipeline steps */}
      <div className="w-full space-y-1.5">
        {(isClient ? clientSteps : STEPS).map((step, i) => {
          const isDone = stepsDone >= i;
          const isCurrent = stepsDone === i - 1 && !timedOut;
          const isFailed = timedOut && stepsDone === i - 1;
          const isBackground = isAsync && i > 0 && uploadConfirmed;
          return (
            <motion.div
              key={step}
              animate={isDone ? { borderColor: isBackground ? '#8b5cf6' : '#10b981' } : {}}
              className={`flex items-center gap-2.5 border rounded-xl px-3 py-2 text-xs transition-colors ${
                isFailed ? 'border-red-600 bg-red-900/20'
                : isDone && isBackground ? 'border-violet-600 bg-violet-900/20'
                : isDone ? 'border-green-600 bg-green-900/20'
                : 'border-gray-700 bg-gray-800'
              }`}
            >
              <span className={`text-sm ${isFailed ? 'text-red-400' : isDone ? 'text-green-400' : 'text-gray-600'}`}>
                {isFailed ? '✗' : isDone ? '✓' : isCurrent ? '⚙' : '○'}
              </span>
              <span className={`flex-1 ${isDone ? 'text-white' : 'text-gray-500'}`}>{step}</span>
              {isBackground && i > 0 && isDone && (
                <span className="text-violet-400 text-xs font-bold">background</span>
              )}
              {i === 0 && isAsync && isDone && (
                <span className="text-green-400 text-xs font-bold">user notified ✅</span>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="text-xs text-gray-600 text-center">
        {isSync && '❌ User waits for every step — timeout on slow connections.'}
        {isAsync && '✅ User gets instant confirmation — processing continues in background.'}
        {isClient && '⚠️ Faster upload, but device CPU does the work — inconsistent on old phones.'}
      </div>
    </div>
  );
}

// ── Visual: Discovery (Photo Social S6) ──────────────────────────────────────

function DiscoveryVisual({ optionId, phase }: { optionId: string; phase: SimPhase; isGood: boolean }) {
  const isGraph = optionId === 'graph-traversal';
  const isSearch = optionId === 'search-bar';
  const isPopular = optionId === 'popularity-rank';

  const [revealedNodes, setRevealedNodes] = useState<number[]>([]);
  const [searchText, setSearchText] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  function t(ms: number, fn: () => void) {
    const id = setTimeout(fn, ms);
    timerRef.current.push(id);
  }

  const GRAPH_NODES = [
    { id: 0, label: 'New User', emoji: '👤', x: 50, y: 80, type: 'self' },
    { id: 1, label: 'Contact A', emoji: '👧', x: 20, y: 50, type: 'friend' },
    { id: 2, label: 'Contact B', emoji: '👦', x: 80, y: 50, type: 'friend' },
    { id: 3, label: 'Maya', emoji: '🧑', x: 10, y: 20, type: 'fof' },
    { id: 4, label: 'Sam', emoji: '👩', x: 35, y: 15, type: 'fof' },
    { id: 5, label: 'Zoe', emoji: '👱', x: 65, y: 20, type: 'fof' },
    { id: 6, label: 'Alex', emoji: '🧔', x: 90, y: 20, type: 'fof' },
  ];

  const TRENDING = [
    { title: 'Sunset at the pier 🌅', likes: '24K', emoji: '📸', trend: '+2.1K/hr' },
    { title: 'Street food festival 🍜', likes: '18K', emoji: '🎉', trend: '+1.7K/hr' },
    { title: 'Mountain trail at dawn 🏔️', likes: '12K', emoji: '🌄', trend: '+940/hr' },
  ];

  useEffect(() => {
    if (phase !== 'running') return;
    if (isGraph) {
      t(300, () => setRevealedNodes([0]));
      t(700, () => setRevealedNodes([0, 1, 2]));
      t(1200, () => setRevealedNodes([0, 1, 2, 3, 4]));
      t(1800, () => setRevealedNodes([0, 1, 2, 3, 4, 5, 6]));
    } else if (isSearch) {
      const name = '@sam_j';
      name.split('').forEach((_, i) => {
        t(300 + i * 200, () => setSearchText(name.slice(0, i + 1)));
      });
    } else {
      setRevealedNodes([0, 1, 2]);
    }
    return () => timerRef.current.forEach(clearTimeout);
  }, [phase]);

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-lg px-4">
      {isGraph && (
        <>
          <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">
            🕸️ Explore — friends-of-friends content
          </div>
          <div className="relative w-full" style={{ height: '180px' }}>
            {/* Edges */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {[[0,1],[0,2],[1,3],[1,4],[2,5],[2,6]].map(([a,b], i) => {
                const na = GRAPH_NODES[a];
                const nb = GRAPH_NODES[b];
                const revealed = revealedNodes.includes(nb.id);
                return (
                  <motion.line
                    key={i}
                    x1={`${na.x}%`} y1={`${na.y}%`}
                    x2={`${nb.x}%`} y2={`${nb.y}%`}
                    stroke={nb.type === 'fof' ? '#0ea5e9' : '#4b5563'}
                    strokeWidth="1.5"
                    strokeDasharray="3 2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: revealed ? 0.7 : 0 }}
                    transition={{ duration: 0.3 }}
                  />
                );
              })}
            </svg>
            {/* Nodes */}
            {GRAPH_NODES.map(node => (
              <motion.div
                key={node.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={revealedNodes.includes(node.id) ? { scale: 1, opacity: 1 } : {}}
                transition={{ type: 'spring', stiffness: 300 }}
                className="absolute flex flex-col items-center"
                style={{ left: `${node.x}%`, top: `${node.y}%`, transform: 'translate(-50%,-50%)' }}
              >
                <div className={`text-xl rounded-full border-2 p-0.5 ${
                  node.type === 'self' ? 'border-white bg-gray-700'
                  : node.type === 'friend' ? 'border-sky-400 bg-sky-900/40'
                  : 'border-sky-400 bg-sky-900/30'
                }`}>
                  {node.emoji}
                </div>
                <div className="text-xs text-gray-400 mt-0.5 whitespace-nowrap">{node.label}</div>
                {node.type === 'fof' && revealedNodes.includes(node.id) && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-xs text-sky-400 font-bold">
                    Shown
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
          <div className="text-xs text-sky-400 font-bold text-center">
            {revealedNodes.length >= 7 ? `✓ Showing content from friends' networks — familiar but not surprising` : '…surfacing friends-of-friends content…'}
          </div>
        </>
      )}

      {isSearch && (
        <div className="w-full space-y-3">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl px-4 py-3 flex items-center gap-2 w-full">
            <span className="text-gray-400">🔍</span>
            <span className="text-gray-300 font-mono text-sm">
              {searchText}
              {phase === 'running' && (
                <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ repeat: Infinity, duration: 0.6 }}>|</motion.span>
              )}
            </span>
          </div>
          {searchText.length >= 5 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-xs">
              <div className="text-white font-bold">👦 @sam_jones</div>
              <div className="text-gray-500 mt-0.5">Works if you already know the exact username</div>
            </motion.div>
          ) : (
            <div className="text-xs text-gray-600 text-center">New users have to know who to search for…</div>
          )}
          <div className="text-xs text-amber-400 text-center">
            ⚠️ Can't discover people you don't already know exist
          </div>
        </div>
      )}

      {isPopular && (
        <div className="w-full space-y-2">
          <div className="text-xs text-gray-500 font-bold uppercase tracking-wider text-center mb-2">
            🔥 Explore — Trending Right Now
          </div>
          {TRENDING.map((post, i) => (
            <motion.div
              key={post.title}
              initial={{ opacity: 0, x: -8 }}
              animate={revealedNodes.length > 0 ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: i * 0.15 }}
              className="flex items-center gap-3 bg-emerald-900/20 border border-emerald-700/50 rounded-xl px-3 py-2"
            >
              <span className="text-2xl">{post.emoji}</span>
              <div className="flex-1">
                <div className="text-xs font-bold text-white">{post.title}</div>
                <div className="text-xs text-emerald-400">❤️ {post.likes} likes</div>
              </div>
              <span className="text-xs text-emerald-300 font-bold">{post.trend}</span>
            </motion.div>
          ))}
          <div className="text-xs text-emerald-400 font-bold text-center">
            ✅ Explore shows what's catching fire — users keep scrolling
          </div>
        </div>
      )}
    </div>
  );
}
