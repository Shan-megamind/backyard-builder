import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ComponentId, OutcomeId } from '../types';
import { OUTCOMES } from '../data/scenario1';

interface Props {
  placed: ComponentId[];
  outcome: OutcomeId;
  onComplete: () => void;
}

type SimPhase = 'idle' | 'sending' | 'processing' | 'done';

interface FloatingRequest {
  id: number;
  fromY: number;
  toMachineIndex: number;
  success: boolean;
  delay: number;
}

export default function SimulationPhase({ placed, outcome, onComplete }: Props) {
  const [phase, setPhase] = useState<SimPhase>('idle');
  const [requests, setRequests] = useState<FloatingRequest[]>([]);
  const [machineLoads, setMachineLoads] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [requestCounter, setRequestCounter] = useState(0);
  const spawnRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const hasMega = placed.includes('mega-machine');
  const extraCount = placed.filter(id => id.startsWith('extra-machine')).length;
  const hasDirector = placed.includes('traffic-director');

  const machines = buildMachineConfig(hasMega, extraCount, hasDirector, outcome);
  const outcomeData = OUTCOMES[outcome];

  // Kick off simulation timeline
  useEffect(() => {
    const t1 = setTimeout(() => setPhase('sending'), 600);
    const t2 = setTimeout(() => setPhase('processing'), 2200);
    const t3 = setTimeout(() => {
      setPhase('done');
      setShowResults(true);
    }, 5000);

    return () => [t1, t2, t3].forEach(clearTimeout);
  }, []);

  // Spawn request particles during sending/processing phases
  useEffect(() => {
    if (phase === 'sending' || phase === 'processing') {
      spawnRef.current = setInterval(() => {
        const batchSize = 3 + Math.floor(Math.random() * 3);
        setRequests(prev => {
          const newOnes: FloatingRequest[] = Array.from({ length: batchSize }).map((_, i) => {
            const machineIndex = routeRequest(i, machines.length, hasDirector, outcome);
            const isSuccess = Math.random() < outcomeData.successRate;
            return {
              id: Date.now() + i,
              fromY: 10 + Math.random() * 80,
              toMachineIndex: machineIndex,
              success: isSuccess,
              delay: i * 0.12,
            };
          });
          return [...prev.slice(-30), ...newOnes];
        });
        setRequestCounter(c => c + batchSize);
      }, 500);
    } else {
      if (spawnRef.current) clearInterval(spawnRef.current);
    }
    return () => {
      if (spawnRef.current) clearInterval(spawnRef.current);
    };
  }, [phase]);

  // Animate machine load bars
  useEffect(() => {
    if (phase === 'processing' || phase === 'done') {
      setMachineLoads(machines.map(m => m.load));
    } else {
      setMachineLoads(machines.map(() => 0));
    }
  }, [phase]);

  const phaseSteps: SimPhase[] = ['idle', 'sending', 'processing', 'done'];
  const phaseLabels = ['Waiting', 'Sending requests', 'Processing', 'Results'];

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <motion.div
            animate={phase !== 'done' ? { rotate: 360 } : { rotate: 0 }}
            transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
            className="text-violet-400 text-lg"
          >
            ⚙️
          </motion.div>
          <span className="font-bold text-violet-300">
            {phase === 'done' ? 'Simulation Complete' : 'Running Simulation…'}
          </span>
        </div>
        <div className="text-gray-500 text-sm">Testing your build</div>
      </div>

      {/* Phase stepper */}
      <div className="flex justify-center gap-6 py-3 bg-gray-900 border-b border-gray-800">
        {phaseSteps.map((p, i) => {
          const currentIndex = phaseSteps.indexOf(phase);
          const isPast = i < currentIndex;
          const isCurrent = p === phase;
          return (
            <div key={p} className="flex items-center gap-1.5 text-xs">
              <div
                className={`w-2 h-2 rounded-full transition-colors ${
                  isCurrent
                    ? 'bg-violet-400 shadow-lg shadow-violet-400/50 animate-pulse'
                    : isPast
                    ? 'bg-green-400'
                    : 'bg-gray-700'
                }`}
              />
              <span
                className={`font-medium transition-colors ${
                  isCurrent ? 'text-violet-300' : isPast ? 'text-green-400' : 'text-gray-600'
                }`}
              >
                {phaseLabels[i]}
              </span>
            </div>
          );
        })}
      </div>

      {/* Main simulation canvas */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left — listeners */}
        <div className="w-52 shrink-0 border-r border-gray-800 p-5 flex flex-col">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
            👥 40 Listeners
          </h3>
          <div className="grid grid-cols-5 gap-1.5 flex-1">
            {Array.from({ length: 40 }).map((_, i) => (
              <motion.div
                key={i}
                animate={
                  phase === 'sending' || phase === 'processing'
                    ? { x: [0, 3, 0], opacity: [0.8, 1, 0.8] }
                    : phase === 'done'
                    ? {}
                    : {}
                }
                transition={{ delay: i * 0.04, repeat: phase !== 'done' ? Infinity : 0, duration: 0.8 }}
                className="text-base"
              >
                {phase === 'done'
                  ? i < Math.round(outcomeData.successRate * 40)
                    ? '😊'
                    : '😤'
                  : '👦'}
              </motion.div>
            ))}
          </div>
          <div className="pt-3 border-t border-gray-800 text-xs text-gray-500">
            <div>Requests sent: <span className="text-violet-300">{requestCounter}</span></div>
          </div>
        </div>

        {/* Center — machines + animation */}
        <div className="flex-1 relative flex items-center justify-center overflow-hidden">
          {/* Floating request particles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {requests.map(req => (
              <RequestParticle
                key={req.id}
                request={req}
                machineCount={machines.length}
                success={req.success}
              />
            ))}
          </div>

          {/* Machines */}
          <div className="flex flex-col gap-4 items-center z-10">
            {/* Traffic director (if present) */}
            {hasDirector && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-violet-900/60 border-2 border-violet-500 rounded-2xl px-5 py-3 text-center w-40 shadow-lg shadow-violet-900/30"
              >
                <div className="text-3xl mb-1">🤖</div>
                <div className="text-xs font-bold text-violet-300">Traffic Director</div>
                {(phase === 'processing' || phase === 'done') && (
                  <motion.div
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="text-xs text-green-400 mt-1 font-semibold"
                  >
                    ↔ Routing evenly
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Machines row */}
            <div className="flex gap-5">
              {machines.map((machine, idx) => (
                <MachineCard
                  key={idx}
                  machine={machine}
                  load={machineLoads[idx] ?? 0}
                  phase={phase}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right — results panel */}
        <div className="w-56 shrink-0 border-l border-gray-800 p-5 flex flex-col">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
            📊 Results
          </h3>

          <AnimatePresence>
            {showResults ? (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Verdict */}
                <div className="bg-gray-800 rounded-2xl p-4 text-center">
                  <div className="text-4xl mb-2">{outcomeData.emoji}</div>
                  <div className="font-bold text-white text-sm leading-tight">
                    {outcomeData.label}
                  </div>
                </div>

                {/* Stats */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center bg-gray-800/60 rounded-xl px-3 py-2">
                    <span className="text-gray-400">✅ Success</span>
                    <span className="font-bold text-green-400">
                      {Math.round(outcomeData.successRate * 100)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center bg-gray-800/60 rounded-xl px-3 py-2">
                    <span className="text-gray-400">❌ Failed</span>
                    <span className="font-bold text-red-400">
                      {Math.round((1 - outcomeData.successRate) * 100)}%
                    </span>
                  </div>
                </div>

                {/* Concept */}
                <div className="bg-violet-900/40 border border-violet-700 rounded-xl p-3">
                  <div className="text-xs text-violet-400 font-bold uppercase tracking-wider mb-1">
                    🔓 Unlocked
                  </div>
                  <div className="text-violet-200 font-bold text-sm">
                    {outcomeData.conceptUnlocked}
                  </div>
                </div>

                {/* CTA */}
                <button
                  onClick={onComplete}
                  className="w-full bg-violet-600 hover:bg-violet-500 active:scale-95 text-white font-bold py-3 rounded-2xl transition-all cursor-pointer shadow-lg shadow-violet-900/30 text-sm mt-2"
                >
                  See full results →
                </button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-3"
              >
                {['Warming up…', 'Sending traffic…', 'Measuring load…'].map((label, i) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: phase !== 'idle' ? 1 : 0.3, x: 0 }}
                    transition={{ delay: i * 0.4 }}
                    className="flex items-center gap-2 text-xs text-gray-500"
                  >
                    <motion.div
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ repeat: Infinity, duration: 1, delay: i * 0.3 }}
                      className="w-1.5 h-1.5 rounded-full bg-violet-500"
                    />
                    {label}
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

interface MachineConfig {
  label: string;
  emoji: string;
  load: number; // 0–1
  size: 'normal' | 'large';
}

function buildMachineConfig(
  hasMega: boolean,
  _extraCount: number,
  _hasDirector: boolean,
  outcome: OutcomeId
): MachineConfig[] {
  if (hasMega) {
    return [{ label: 'Mega Music Machine', emoji: '⚡', load: 0.62, size: 'large' }];
  }
  if (outcome === 'C') {
    return [
      { label: 'Music Machine A', emoji: '🎵', load: 0.48, size: 'normal' },
      { label: 'Music Machine B', emoji: '🎵', load: 0.5, size: 'normal' },
    ];
  }
  // Outcome B — uneven without director
  return [
    { label: 'Music Machine A', emoji: '🎵', load: 0.95, size: 'normal' },
    { label: 'Music Machine B', emoji: '🎵', load: 0.18, size: 'normal' },
  ];
}

function routeRequest(index: number, machineCount: number, hasDirector: boolean, outcome: OutcomeId): number {
  if (machineCount === 1) return 0;
  if (hasDirector || outcome === 'C') {
    // Round-robin
    return index % machineCount;
  }
  // Skewed — 80% goes to machine 0
  return Math.random() < 0.8 ? 0 : 1;
}

function MachineCard({
  machine,
  load,
  phase,
}: {
  machine: MachineConfig;
  load: number;
  phase: SimPhase;
}) {
  const loadColor =
    load > 0.8 ? 'bg-red-500' : load > 0.5 ? 'bg-yellow-400' : 'bg-green-400';
  const borderColor =
    load > 0.8 ? 'border-red-500' : load > 0.5 ? 'border-yellow-500' : 'border-green-500';
  const isHot = load > 0.8;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 200 }}
      className={`bg-gray-800 border-2 ${borderColor} rounded-3xl text-center shadow-xl ${
        machine.size === 'large' ? 'w-44 py-6 px-5' : 'w-36 py-5 px-4'
      }`}
    >
      <motion.div
        animate={isHot && (phase === 'processing' || phase === 'done')
          ? { scale: [1, 1.06, 1], y: [0, -2, 0] }
          : {}}
        transition={{ repeat: Infinity, duration: 0.9 }}
        className={`${machine.size === 'large' ? 'text-5xl' : 'text-4xl'} mb-2`}
      >
        {machine.emoji}
      </motion.div>

      <div className="text-xs font-bold text-gray-200 leading-tight mb-3">
        {machine.label}
      </div>

      {/* Load bar */}
      <div className="bg-gray-700 rounded-full h-2 overflow-hidden">
        <motion.div
          className={`h-2 rounded-full ${loadColor}`}
          initial={{ width: 0 }}
          animate={{ width: (phase === 'processing' || phase === 'done') ? `${load * 100}%` : 0 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </div>
      <div className="text-xs text-gray-500 mt-1.5">
        {phase === 'idle' || phase === 'sending'
          ? 'Idle'
          : `${Math.round(load * 100)}% load`}
      </div>

      {isHot && (phase === 'processing' || phase === 'done') && (
        <motion.div
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ repeat: Infinity, duration: 0.7 }}
          className="text-xs text-red-400 font-bold mt-1.5"
        >
          ⚠️ Overloaded
        </motion.div>
      )}
    </motion.div>
  );
}

function RequestParticle({
  request,
  machineCount,
  success,
}: {
  request: FloatingRequest;
  machineCount: number;
  success: boolean;
}) {
  // Calculate horizontal destination based on which machine it goes to
  const machineX = machineCount === 1 ? 50 : request.toMachineIndex === 0 ? 38 : 62;

  return (
    <motion.div
      className={`absolute text-xs font-bold pointer-events-none ${
        success ? 'text-green-400' : 'text-red-400'
      }`}
      style={{ left: '15%', top: `${request.fromY}%` }}
      initial={{ x: 0, opacity: 0, scale: 0.6 }}
      animate={{
        x: `${machineX * 4}px`,
        opacity: [0, 1, 1, 0],
        scale: [0.6, 1, 1, 0.8],
      }}
      transition={{ duration: 1.2, delay: request.delay, ease: 'easeInOut' }}
    >
      {success ? '♪' : '✕'}
    </motion.div>
  );
}
