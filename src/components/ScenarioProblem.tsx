import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import type { ScenarioConfig } from '../types';

interface Props {
  scenario: ScenarioConfig;
  onBuild: () => void;
}

export default function ScenarioProblem({ scenario, onBuild }: Props) {
  const [arrowTick, setArrowTick] = useState(0);
  const [arrows, setArrows] = useState<{ id: number; y: number }[]>([]);

  useEffect(() => {
    const interval = setInterval(() => setArrowTick(t => t + 1), 700);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setArrows(prev => [
      ...prev.slice(-10),
      { id: Date.now(), y: 15 + Math.random() * 70 },
    ]);
  }, [arrowTick]);

  const badStats = scenario.problemStats.filter(s => s.isWarning);
  const okStats = scenario.problemStats.filter(s => !s.isWarning);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3.5 bg-white/80 backdrop-blur border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-xl">{scenario.questEmoji}</span>
          <span className="font-bold text-gray-900 text-sm">
            Build Spotify — Scenario {scenario.id} of 6
          </span>
        </div>
        <div className="flex items-center gap-1.5 bg-red-100 text-red-700 text-xs font-bold px-3 py-1.5 rounded-full border border-red-200">
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-red-500"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ repeat: Infinity, duration: 0.9 }}
          />
          New Problem
        </div>
      </div>

      {/* Main layout */}
      <div className="flex flex-1 gap-4 p-5 overflow-hidden">
        {/* Left — context panel */}
        <div className="w-56 shrink-0 bg-white rounded-3xl p-5 shadow-md border border-gray-100 flex flex-col gap-4">
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              The Situation
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed">{scenario.problemContext}</p>
          </div>

          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              💡 Concept Area
            </h3>
            <div className="bg-violet-50 rounded-xl px-3 py-2 text-sm font-semibold text-violet-700 border border-violet-100">
              {scenario.conceptHint}
            </div>
          </div>

          {/* Stats */}
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              📊 Status
            </h3>
            <div className="space-y-2">
              {[...okStats, ...badStats].map(stat => (
                <div
                  key={stat.label}
                  className="flex justify-between items-center bg-gray-50 rounded-xl px-2.5 py-1.5"
                >
                  <span className="text-xs text-gray-500">{stat.label}</span>
                  <span
                    className={`text-xs font-bold ${stat.isWarning ? 'text-red-600' : 'text-gray-800'}`}
                  >
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center — problem visual */}
        <div className="flex-1 flex flex-col items-center justify-center relative">
          {/* Animated stress arrows */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {arrows.map(a => (
              <motion.div
                key={a.id}
                className="absolute text-red-400 font-bold text-sm"
                style={{ top: `${a.y}%`, left: '8%' }}
                initial={{ x: 0, opacity: 0 }}
                animate={{ x: '75%', opacity: [0, 1, 1, 0] }}
                transition={{ duration: 1.5, ease: 'easeInOut' }}
              >
                ▶▶▶
              </motion.div>
            ))}
          </div>

          {/* Stressed machine */}
          <motion.div
            animate={{
              boxShadow: [
                '0 0 0 0 rgba(239,68,68,0)',
                '0 0 28px 10px rgba(239,68,68,0.2)',
                '0 0 0 0 rgba(239,68,68,0)',
              ],
            }}
            transition={{ repeat: Infinity, duration: 1.8 }}
            className="bg-white border-4 border-red-400 rounded-3xl px-10 py-8 text-center shadow-xl relative z-10"
          >
            <motion.div
              className="absolute -top-6 left-1/2 -translate-x-1/2 text-2xl"
              animate={{ y: [-3, -10, -3], opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.4 }}
            >
              💨
            </motion.div>

            <div className="text-6xl mb-3">{scenario.centralMachine.emoji}</div>
            <div className="font-black text-gray-800 text-base">
              {scenario.centralMachine.label}
            </div>
            <div className="text-red-600 font-bold text-sm mt-1.5">
              ⚠️ {scenario.centralMachine.status}
            </div>

            {/* Stress bar */}
            <div className="mt-4 bg-gray-200 rounded-full h-2.5 w-44 overflow-hidden mx-auto">
              <motion.div
                animate={{ width: ['80%', '100%', '82%', '100%', '80%'] }}
                transition={{ repeat: Infinity, duration: 2.2 }}
                className="h-full bg-red-500 rounded-full"
              />
            </div>
            <div className="text-xs text-gray-500 mt-1">Load: Critical</div>
          </motion.div>

          {/* Mission card */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-6 bg-white border-2 border-violet-200 rounded-2xl px-6 py-4 text-center shadow-lg max-w-sm z-10"
          >
            <p className="text-xs font-bold uppercase tracking-wider text-violet-400 mb-1">
              Mission
            </p>
            <p className="text-violet-900 font-bold leading-snug">{scenario.missionText}</p>
          </motion.div>
        </div>

        {/* Right — narrative */}
        <div className="w-56 shrink-0 bg-white rounded-3xl p-5 shadow-md border border-gray-100 flex flex-col">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
            📖 What Happened
          </h3>
          <p className="text-sm text-gray-700 leading-relaxed flex-1">
            {scenario.problemNarrative}
          </p>

          <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Two explanations:
            </p>
            <div className="bg-amber-50 rounded-xl p-2.5 border border-amber-100">
              <p className="text-xs font-bold text-amber-600 mb-0.5">🏠 Builder</p>
              <p className="text-xs text-amber-800 leading-snug">
                {getBuilderContext(scenario.id)}
              </p>
            </div>
            <div className="bg-violet-50 rounded-xl p-2.5 border border-violet-100">
              <p className="text-xs font-bold text-violet-600 mb-0.5">💻 System</p>
              <p className="text-xs text-violet-800 leading-snug">
                {getSystemContext(scenario.id)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="flex justify-center pb-8 pt-2">
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          onClick={onBuild}
          className="bg-violet-600 hover:bg-violet-700 active:scale-[0.98] text-white font-bold text-lg px-10 py-4 rounded-2xl shadow-xl shadow-violet-200 transition-all hover:scale-105 cursor-pointer"
        >
          Open Workshop 🔧
        </motion.button>
      </div>
    </div>
  );
}

function getBuilderContext(id: number): string {
  const map: Record<number, string> = {
    2: 'Kids far from your backyard wait forever because songs travel a long distance.',
    3: 'Searching 50,000 songs by hand takes forever.',
    4: 'Saving playlists to random scraps of paper keeps losing data.',
    5: 'Too many kids showing up at once crashes your machines.',
    6: 'Your machine plays random songs because it has no idea what each kid likes.',
  };
  return map[id] ?? '';
}

function getSystemContext(id: number): string {
  const map: Record<number, string> = {
    2: 'Geographic latency: physical distance between user and origin server causes delay.',
    3: 'Unindexed search has O(n) complexity — it grows linearly with data size.',
    4: 'Unstructured storage lacks schema enforcement, query support, and data integrity.',
    5: 'Traffic spikes exceed server capacity, causing queue overflow and request drops.',
    6: 'Without behavioral data collection, no personalization algorithm can function.',
  };
  return map[id] ?? '';
}
