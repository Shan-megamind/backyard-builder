import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface Props {
  onBuild: () => void;
}

interface RequestArrow {
  id: number;
  topPercent: number;
  delay: number;
}

export default function ProblemReveal({ onBuild }: Props) {
  const [arrows, setArrows] = useState<RequestArrow[]>([]);
  const [arrowTick, setArrowTick] = useState(0);

  // Spawn animated arrows periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setArrowTick(t => t + 1);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const newArrow: RequestArrow = {
      id: Date.now(),
      topPercent: 15 + Math.random() * 70,
      delay: 0,
    };
    setArrows(prev => [...prev.slice(-12), newArrow]);
  }, [arrowTick]);

  const listeners = Array.from({ length: 40 }, (_, i) => i);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-lg">🏗️</span>
          <span className="font-bold text-gray-800">Backyard Builder</span>
          <span className="text-gray-300 mx-1">·</span>
          <span className="text-sm text-gray-500">Today's Quest: Build Spotify</span>
        </div>
        <div className="flex items-center gap-2 bg-red-100 text-red-700 font-bold text-xs px-3 py-1.5 rounded-full border border-red-200">
          <motion.div
            className="w-2 h-2 rounded-full bg-red-500"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
          />
          System Overload
        </div>
      </div>

      {/* Main 3-panel layout */}
      <div className="flex flex-1 gap-4 p-5 overflow-hidden">
        {/* Left — listeners */}
        <div className="w-52 shrink-0 bg-white rounded-3xl p-4 shadow-md border border-gray-100 flex flex-col">
          <h3 className="font-bold text-gray-700 text-xs uppercase tracking-wider mb-3">
            👥 Listeners (40)
          </h3>
          <div className="grid grid-cols-5 gap-1 overflow-hidden flex-1">
            {listeners.map(i => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.02, type: 'spring', stiffness: 300 }}
                className="text-lg"
              >
                👦
              </motion.div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-1.5 text-xs text-red-600 font-semibold">
              <motion.div
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
                className="w-1.5 h-1.5 rounded-full bg-red-500"
              />
              40 waiting for songs…
            </div>
          </div>
        </div>

        {/* Center — overloaded machine + arrows */}
        <div className="flex-1 flex flex-col items-center justify-center relative">
          {/* Animated arrows */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {arrows.map(arrow => (
              <motion.div
                key={arrow.id}
                className="absolute text-red-400 font-bold text-sm flex items-center gap-0.5 whitespace-nowrap"
                style={{ top: `${arrow.topPercent}%`, left: '5%' }}
                initial={{ x: 0, opacity: 0 }}
                animate={{ x: '80%', opacity: [0, 1, 1, 0] }}
                transition={{ duration: 1.4, ease: 'easeInOut' }}
              >
                ▶▶▶
              </motion.div>
            ))}
          </div>

          {/* The overloaded machine */}
          <motion.div
            animate={{
              boxShadow: [
                '0 0 0 0 rgba(239,68,68,0)',
                '0 0 30px 12px rgba(239,68,68,0.25)',
                '0 0 0 0 rgba(239,68,68,0)',
              ],
            }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="bg-white border-4 border-red-400 rounded-3xl px-10 py-8 text-center shadow-xl relative"
          >
            {/* Smoke emoji */}
            <motion.div
              className="absolute -top-6 left-1/2 -translate-x-1/2 text-2xl"
              animate={{ y: [-4, -12, -4], opacity: [0.6, 1, 0.6] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
            >
              💨
            </motion.div>

            <div className="text-6xl mb-3">🔊</div>
            <div className="font-black text-gray-800 text-lg">Music Machine 1.0</div>
            <div className="text-red-600 font-bold text-sm mt-1.5">⚠️ OVERHEATING</div>

            {/* Load bar */}
            <div className="mt-4 bg-gray-200 rounded-full h-3 w-48 overflow-hidden">
              <motion.div
                animate={{ width: ['88%', '100%', '90%', '100%', '88%'] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="bg-red-500 h-3 rounded-full"
              />
            </div>
            <div className="text-xs text-gray-500 mt-1">Load: Critical 🔴</div>

            {/* Labels */}
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div className="bg-red-50 rounded-xl p-2 text-red-700 font-medium">
                🐌 Requests queuing
              </div>
              <div className="bg-orange-50 rounded-xl p-2 text-orange-700 font-medium">
                ❌ Songs failing
              </div>
            </div>
          </motion.div>

          {/* Mission text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-6 bg-white border-2 border-violet-200 rounded-2xl px-6 py-4 text-center shadow-lg max-w-md"
          >
            <p className="text-xs font-bold text-violet-400 uppercase tracking-wider mb-1">Mission</p>
            <p className="text-violet-900 font-bold text-base leading-snug">
              Your music machine can't handle the crowd. Upgrade your setup.
            </p>
          </motion.div>
        </div>

        {/* Right — status panel */}
        <div className="w-52 shrink-0 bg-white rounded-3xl p-4 shadow-md border border-gray-100">
          <h3 className="font-bold text-gray-700 text-xs uppercase tracking-wider mb-4">
            📊 Status
          </h3>
          <div className="space-y-3">
            <StatusRow label="Listeners" value="40" valueStyle="text-gray-900 font-bold" />
            <StatusRow label="Request Load" value="High 🔴" valueStyle="text-red-600 font-bold" />
            <StatusRow label="Failures" value="Rising ↑" valueStyle="text-red-600 font-bold" />
            <StatusRow label="Song Delay" value="Very High 🐌" valueStyle="text-orange-600 font-bold" />
          </div>

          <div className="mt-5 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-3">
              What's happening?
            </p>
            <div className="space-y-2 text-xs text-gray-600">
              <p className="bg-gray-50 rounded-xl p-2">
                🏠 <strong>Builder:</strong> Too many kids crowding one music machine.
              </p>
              <p className="bg-violet-50 rounded-xl p-2 text-violet-800">
                💻 <strong>System:</strong> Single server became a bottleneck under load.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="flex justify-center pb-8 pt-2">
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          onClick={onBuild}
          className="bg-violet-600 hover:bg-violet-700 active:scale-[0.98] text-white font-bold text-lg px-10 py-4 rounded-2xl shadow-xl shadow-violet-200 transition-all hover:scale-105 cursor-pointer"
        >
          Open Workshop 🔧
        </motion.button>
      </div>
    </div>
  );
}

function StatusRow({
  label,
  value,
  valueStyle,
}: {
  label: string;
  value: string;
  valueStyle: string;
}) {
  return (
    <div className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2">
      <span className="text-xs text-gray-500">{label}</span>
      <span className={`text-xs ${valueStyle}`}>{value}</span>
    </div>
  );
}
