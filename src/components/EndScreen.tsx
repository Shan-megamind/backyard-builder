import { motion } from 'framer-motion';
import { SCENARIO_CONCEPTS, SCENARIO_EMOJIS } from '../data/index';

interface Props {
  onRestart: () => void;
}

const CONCEPT_DETAILS: Record<number, { tagline: string; example: string }> = {
  1: {
    tagline: 'Spread load across multiple servers',
    example: 'Used by: Netflix, AWS ELB, Cloudflare',
  },
  2: {
    tagline: 'Serve content from locations near users',
    example: 'Used by: Spotify, YouTube, Cloudflare CDN',
  },
  3: {
    tagline: 'Speed up queries with smart data structures',
    example: 'Used by: PostgreSQL, Elasticsearch, MySQL',
  },
  4: {
    tagline: 'Choose storage that fits your data shape',
    example: 'Used by: MongoDB, Firebase, DynamoDB',
  },
  5: {
    tagline: 'Absorb sudden surges without crashing',
    example: 'Used by: Amazon SQS, Kafka, Redis',
  },
  6: {
    tagline: 'Turn behavioral data into personalized suggestions',
    example: 'Used by: Spotify Discover Weekly, Netflix, TikTok',
  },
};

export default function EndScreen({ onRestart }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-950 via-indigo-950 to-slate-950 flex flex-col items-center justify-start py-12 px-6 overflow-y-auto">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.1 }}
          className="text-8xl mb-4"
        >
          🎓
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="inline-flex items-center gap-2 bg-violet-800/60 border border-violet-600 text-violet-300 text-xs font-bold uppercase tracking-widest px-5 py-2 rounded-full mb-5"
        >
          🏗️ Backyard Builder — Quest Complete
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-4xl font-black text-white mb-3"
          style={{ letterSpacing: '-1px' }}
        >
          You built Spotify.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-violet-300 text-lg max-w-md mx-auto leading-relaxed"
        >
          From a single overheating machine to a scalable, personalized music system — you solved 6 real engineering challenges.
        </motion.p>
      </motion.div>

      {/* Concept cards grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="w-full max-w-2xl mb-8"
      >
        <h2 className="text-xs font-bold uppercase tracking-widest text-violet-400 text-center mb-4">
          6 Concepts Unlocked
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4, 5, 6].map((id, i) => (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.7 + i * 0.08, type: 'spring', stiffness: 200 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur"
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl">{SCENARIO_EMOJIS[id]}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-violet-300 uppercase tracking-wider mb-0.5">
                    Scenario {id}
                  </div>
                  <div className="font-bold text-white text-sm leading-tight">
                    {SCENARIO_CONCEPTS[id]}
                  </div>
                  <div className="text-xs text-gray-400 mt-1 leading-snug">
                    {CONCEPT_DETAILS[id].tagline}
                  </div>
                  <div className="text-xs text-violet-500 mt-1.5">
                    {CONCEPT_DETAILS[id].example}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* System map */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4 }}
        className="w-full max-w-2xl bg-white/5 border border-white/10 rounded-3xl p-5 mb-8"
      >
        <h2 className="text-xs font-bold uppercase tracking-widest text-violet-400 mb-4 text-center">
          Your Complete Spotify Architecture
        </h2>
        <div className="flex items-center justify-between gap-1 text-center">
          {[
            { icon: '👥', label: 'Users' },
            { icon: '🗺️', label: 'CDN' },
            { icon: '⚖️', label: 'Load\nBalancer' },
            { icon: '🖥️🖥️', label: 'Servers' },
            { icon: '📓', label: 'Document\nDB' },
            { icon: '🤖', label: 'Recommend\nEngine' },
          ].map((node, i) => (
            <div key={i} className="flex items-center flex-1">
              <div className="flex-1 flex flex-col items-center">
                <div className="text-2xl mb-1">{node.icon}</div>
                <div className="text-xs text-gray-400 leading-tight whitespace-pre-line">
                  {node.label}
                </div>
              </div>
              {i < 5 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.6 + i * 0.1 }}
                  className="text-violet-600 text-sm shrink-0 pb-4"
                >
                  →
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* PM summary */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.7 }}
        className="w-full max-w-2xl bg-violet-900/40 border border-violet-700/60 rounded-3xl p-5 mb-8"
      >
        <div className="text-xs font-bold uppercase tracking-widest text-violet-400 mb-3">
          💼 The Big PM Lesson
        </div>
        <p className="text-violet-100 leading-relaxed text-sm">
          Every product decision has a system design consequence. Load, scale, storage, search, spikes, and personalization — these aren't backend details. They are the conditions under which your product either works or fails for your users. Understanding them is how PMs make better trade-off decisions.
        </p>
      </motion.div>

      {/* Action */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.9 }}
        className="flex gap-3 pb-12"
      >
        <button
          onClick={onRestart}
          className="bg-white hover:bg-gray-50 active:scale-[0.98] text-gray-800 font-bold px-8 py-4 rounded-2xl shadow-lg transition-all hover:scale-[1.02] cursor-pointer"
        >
          ↺ Play Again
        </button>
        <button
          disabled
          className="bg-violet-600/40 text-violet-400 font-bold px-8 py-4 rounded-2xl cursor-not-allowed opacity-60"
        >
          Next Quest: Build Twitter →
        </button>
      </motion.div>
    </div>
  );
}
