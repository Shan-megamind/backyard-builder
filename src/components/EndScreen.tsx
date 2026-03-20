import { motion } from 'framer-motion';
import {
  SCENARIO_CONCEPTS, SCENARIO_EMOJIS,
  AMAZON_SCENARIO_CONCEPTS, AMAZON_SCENARIO_EMOJIS,
  PHOTO_SOCIAL_SCENARIO_CONCEPTS, PHOTO_SOCIAL_SCENARIO_EMOJIS,
} from '../data/index';
import type { QuestId, ScenarioResult } from '../types';

interface Props {
  questId: QuestId;
  results: ScenarioResult[];
  onRestart: () => void;
  onBackToQuests: () => void;
  onRedoScenario: (scenarioId: number) => void;
}

// ── Quality tier helpers ──────────────────────────────────────────────────────

function getQualityTier(avg: number) {
  if (avg >= 85) return {
    label: 'Strong Architecture',
    grade: 'A',
    description: 'Your system is production-ready. You made smart trade-offs throughout.',
    gradient: 'from-emerald-950 via-teal-950 to-slate-950',
    accentColor: 'text-emerald-300',
    accentBg: 'bg-emerald-800/60 border-emerald-600',
    badgeText: 'text-emerald-300',
    gradeColor: 'text-emerald-400',
  };
  if (avg >= 65) return {
    label: 'Good Architecture',
    grade: 'B',
    description: 'Your system works but has some rough edges that would cause issues at scale.',
    gradient: 'from-teal-950 via-cyan-950 to-slate-950',
    accentColor: 'text-teal-300',
    accentBg: 'bg-teal-800/60 border-teal-600',
    badgeText: 'text-teal-300',
    gradeColor: 'text-teal-400',
  };
  if (avg >= 45) return {
    label: 'Fragile Architecture',
    grade: 'C',
    description: 'Your system has significant gaps. Real users would experience problems.',
    gradient: 'from-amber-950 via-yellow-950 to-slate-950',
    accentColor: 'text-amber-300',
    accentBg: 'bg-amber-800/60 border-amber-600',
    badgeText: 'text-amber-300',
    gradeColor: 'text-amber-400',
  };
  return {
    label: 'Critical Issues',
    grade: 'D',
    description: 'Your system would fail in production. You made some costly trade-offs.',
    gradient: 'from-red-950 via-rose-950 to-slate-950',
    accentColor: 'text-red-300',
    accentBg: 'bg-red-800/60 border-red-600',
    badgeText: 'text-red-300',
    gradeColor: 'text-red-400',
  };
}

function scoreColor(score: number) {
  if (score === 100) return 'text-emerald-400 bg-emerald-900/40 border-emerald-700';
  if (score >= 75)   return 'text-teal-400 bg-teal-900/40 border-teal-700';
  if (score >= 55)   return 'text-amber-400 bg-amber-900/40 border-amber-700';
  return 'text-red-400 bg-red-900/40 border-red-700';
}

// ── Quest-specific metadata ───────────────────────────────────────────────────

const QUEST_META: Record<QuestId, {
  badge: string;
  headline: string;
  subheading: string;
  pmLesson: string;
  archNodes: Array<{ icon: string; label: string }>;
}> = {
  spotify: {
    badge: '🎵 Build Spotify — Quest Complete',
    headline: 'You built Spotify.',
    subheading: 'From a single overheating machine to a scalable, personalized music system.',
    pmLesson: 'Every product decision has a system design consequence. Load, scale, storage, search, spikes, and personalization — these aren\'t backend details. They are the conditions under which your product either works or fails for your users.',
    archNodes: [
      { icon: '👥', label: 'Users' },
      { icon: '🗺️', label: 'CDN' },
      { icon: '⚖️', label: 'Load\nBalancer' },
      { icon: '🖥️🖥️', label: 'Servers' },
      { icon: '📓', label: 'Document\nDB' },
      { icon: '🤖', label: 'Recommend\nEngine' },
    ],
  },
  amazon: {
    badge: '📦 Build Amazon — Quest Complete',
    headline: 'You built Amazon.',
    subheading: 'From a race-condition disaster to a scalable, reliable, real-time commerce system.',
    pmLesson: 'Every product decision in e-commerce has a correctness consequence. Race conditions, broken checkouts, lost messages, traffic spikes, stale tracking — these are not backend details. They are the conditions under which your product either works or fails for your customers.',
    archNodes: [
      { icon: '👥', label: 'Buyers' },
      { icon: '🔒', label: 'Atomic\nLock' },
      { icon: '🎼', label: 'Checkout\nSaga' },
      { icon: '📮', label: 'Message\nQueue' },
      { icon: '🗄️', label: 'Cache\n+Scale' },
      { icon: '📡', label: 'Event\nStream' },
    ],
  },
  'photo-social': {
    badge: '📸 Build Instagram — Quest Complete',
    headline: 'You built Instagram.',
    subheading: 'From empty feeds and broken uploads to a real-time, personalized, scalable social network.',
    pmLesson: 'Social products live or die on feed delivery speed, notification latency, and content relevance. Fan-out strategy, CDN for media, ranking algorithms, async pipelines, and Explore curation are not backend details — they determine whether users stay engaged or churn.',
    archNodes: [
      { icon: '👥', label: 'Users' },
      { icon: '📬', label: 'Fan-out\nWrite' },
      { icon: '🌐', label: 'Photo\nCDN' },
      { icon: '🤖', label: 'Feed\nRanker' },
      { icon: '⚡', label: 'Push\nNotifs' },
      { icon: '🔥', label: 'Explore\nFeed' },
    ],
  },
};

// ── Main component ────────────────────────────────────────────────────────────

export default function EndScreen({ questId, results, onRestart, onBackToQuests, onRedoScenario }: Props) {
  const concepts = questId === 'amazon'
    ? AMAZON_SCENARIO_CONCEPTS
    : questId === 'photo-social'
    ? PHOTO_SOCIAL_SCENARIO_CONCEPTS
    : SCENARIO_CONCEPTS;
  const emojis = questId === 'amazon'
    ? AMAZON_SCENARIO_EMOJIS
    : questId === 'photo-social'
    ? PHOTO_SOCIAL_SCENARIO_EMOJIS
    : SCENARIO_EMOJIS;
  const meta = QUEST_META[questId];

  const totalScenarios = 6;
  const avgScore = results.length > 0
    ? Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length)
    : 0;
  const tier = getQualityTier(avgScore);
  const weakScenarios = results.filter(r => r.score < 75);
  const questButtonClass = questId === 'spotify'
    ? 'bg-violet-600 hover:bg-violet-700'
    : questId === 'amazon'
    ? 'bg-orange-500 hover:bg-orange-600'
    : 'bg-pink-500 hover:bg-pink-600';
  const questName = questId === 'spotify' ? 'Spotify' : questId === 'amazon' ? 'Amazon' : 'Instagram';

  return (
    <div className={`min-h-screen bg-gradient-to-br ${tier.gradient} flex flex-col items-center justify-start py-12 px-6 overflow-y-auto`}>

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
          className={`inline-flex items-center gap-2 ${tier.accentBg} border ${tier.badgeText} text-xs font-bold uppercase tracking-widest px-5 py-2 rounded-full mb-5`}
        >
          {meta.badge}
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-4xl font-black text-white mb-3"
          style={{ letterSpacing: '-1px' }}
        >
          {meta.headline}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className={`${tier.accentColor} text-lg max-w-md mx-auto leading-relaxed`}
        >
          {meta.subheading}
        </motion.p>
      </motion.div>

      {/* Overall score */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.55, type: 'spring', stiffness: 200 }}
        className="w-full max-w-2xl bg-white/5 border border-white/10 rounded-3xl p-6 mb-6 text-center"
      >
        <div className={`text-xs font-bold uppercase tracking-widest ${tier.accentColor} mb-3`}>
          Overall Score
        </div>
        <div className={`text-7xl font-black ${tier.gradeColor} mb-2`}>
          {avgScore}
          <span className="text-3xl text-white/40">/100</span>
        </div>
        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold border ${tier.accentBg} ${tier.badgeText}`}>
          Grade {tier.grade} — {tier.label}
        </div>
        <p className="text-gray-400 text-sm mt-3 max-w-sm mx-auto">{tier.description}</p>

        {weakScenarios.length > 0 && (
          <div className="mt-4 bg-white/5 rounded-2xl p-3 text-left border border-white/10">
            <div className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2">
              ⚠️ Weak areas to revisit
            </div>
            {weakScenarios.map(r => (
              <div key={r.scenarioId} className="text-xs text-gray-400 flex items-center gap-2 mb-1">
                <span>{emojis[r.scenarioId]}</span>
                <span className="text-white/70">S{r.scenarioId} {concepts[r.scenarioId]}</span>
                <span className={`ml-auto font-bold px-2 py-0.5 rounded-lg border text-xs ${scoreColor(r.score)}`}>
                  {r.score}pts
                </span>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Per-scenario breakdown */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="w-full max-w-2xl mb-8"
      >
        <h2 className={`text-xs font-bold uppercase tracking-widest ${tier.accentColor} text-center mb-4`}>
          Scenario Breakdown
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: totalScenarios }, (_, i) => i + 1).map((id, i) => {
            const result = results.find(r => r.scenarioId === id);
            return (
              <motion.div
                key={id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.7 + i * 0.08, type: 'spring', stiffness: 200 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur"
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{emojis[id]}</div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-xs font-bold ${tier.accentColor} uppercase tracking-wider mb-0.5`}>
                      Scenario {id}
                    </div>
                    <div className="font-bold text-white text-sm leading-tight mb-1.5">
                      {concepts[id]}
                    </div>
                    {result ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">{result.emoji} {result.label}</span>
                        <span className={`ml-auto text-xs font-black px-2 py-0.5 rounded-lg border ${scoreColor(result.score)}`}>
                          {result.score}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-600 italic">Not played</span>
                    )}
                  </div>
                </div>
                {result && !result.isOptimal && result.optimalHint && (
                  <div className="mt-2 text-xs text-gray-500 bg-white/5 rounded-xl p-2 leading-snug">
                    💡 {result.optimalHint}
                  </div>
                )}
                {result && !result.isOptimal && (
                  <button
                    onClick={() => onRedoScenario(id)}
                    className="mt-2 w-full text-xs font-bold px-3 py-1.5 rounded-xl bg-white/8 hover:bg-white/15 text-white/60 hover:text-white border border-white/10 hover:border-white/20 transition-all cursor-pointer"
                  >
                    ↺ Redo S{id}
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Architecture map */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4 }}
        className="w-full max-w-2xl bg-white/5 border border-white/10 rounded-3xl p-5 mb-8"
      >
        <h2 className={`text-xs font-bold uppercase tracking-widest ${tier.accentColor} mb-4 text-center`}>
          Your Complete {questName} Architecture
        </h2>
        <div className="flex items-center justify-between gap-1 text-center">
          {meta.archNodes.map((node, i) => (
            <div key={i} className="flex items-center flex-1">
              <div className="flex-1 flex flex-col items-center">
                <div className="text-2xl mb-1">{node.icon}</div>
                <div className="text-xs text-gray-400 leading-tight whitespace-pre-line">{node.label}</div>
              </div>
              {i < meta.archNodes.length - 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.6 + i * 0.1 }}
                  className={`${tier.accentColor} text-sm shrink-0 pb-4 opacity-60`}
                >
                  →
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* PM lesson */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.7 }}
        className={`w-full max-w-2xl ${tier.accentBg} border rounded-3xl p-5 mb-8`}
      >
        <div className={`text-xs font-bold uppercase tracking-widest ${tier.accentColor} mb-3`}>
          💼 The Big PM Lesson
        </div>
        <p className="text-white/80 leading-relaxed text-sm">{meta.pmLesson}</p>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.9 }}
        className="flex gap-3 pb-12"
      >
        <button
          onClick={onBackToQuests}
          className="bg-white hover:bg-gray-50 active:scale-[0.98] text-gray-800 font-bold px-8 py-4 rounded-2xl shadow-lg transition-all hover:scale-[1.02] cursor-pointer"
        >
          ← Choose Quest
        </button>
        <button
          onClick={onRestart}
          className={`${questButtonClass} active:scale-[0.98] text-white font-bold px-8 py-4 rounded-2xl shadow-lg transition-all hover:scale-[1.02] cursor-pointer`}
        >
          ↺ Play Again
        </button>
      </motion.div>
    </div>
  );
}
