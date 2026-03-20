import { motion } from 'framer-motion';
import type { QuestId } from '../types';
import { getQuestScenarioCount } from '../data/index';

interface QuestCard {
  id: QuestId | 'social';
  title: string;
  emoji: string;
  description: string;
  topics: string;
  gradient: string;
  borderColor: string;
  buttonClass: string;
  resumeButtonClass: string;
  disabled?: boolean;
}

const QUESTS: QuestCard[] = [
  {
    id: 'spotify',
    title: 'Build Spotify',
    emoji: '🎵',
    description: 'Scale a music streaming system from a single backyard machine to a global platform.',
    topics: 'Load balancing · CDN · Search · Storage · Spikes · Recommendations',
    gradient: 'from-violet-50 to-purple-50',
    borderColor: 'border-violet-200',
    buttonClass: 'bg-violet-600 hover:bg-violet-700 shadow-lg shadow-violet-200',
    resumeButtonClass: 'bg-violet-100 hover:bg-violet-200 text-violet-700 border border-violet-300',
  },
  {
    id: 'amazon',
    title: 'Build Amazon',
    emoji: '📦',
    description: 'Solve the hard problems of e-commerce: inventory races, ordering systems, and more.',
    topics: 'Atomic locks · Search index · Checkout sagas · Queues · Autoscaling · Event tracking',
    gradient: 'from-orange-50 to-amber-50',
    borderColor: 'border-orange-200',
    buttonClass: 'bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-200',
    resumeButtonClass: 'bg-orange-100 hover:bg-orange-200 text-orange-700 border border-orange-300',
  },
  {
    id: 'social',
    title: 'Build Social Platform',
    emoji: '💬',
    description: 'Design the infrastructure behind a social network: feeds, graphs, and notifications.',
    topics: 'Coming soon',
    gradient: 'from-sky-50 to-blue-50',
    borderColor: 'border-sky-200',
    buttonClass: 'bg-sky-400 shadow-lg shadow-sky-200',
    resumeButtonClass: '',
    disabled: true,
  },
];

interface Props {
  onSelect: (questId: QuestId) => void;
  savedProgress?: { questId: QuestId; scenarioId: number } | null;
  onResume?: () => void;
}

export default function QuestSelect({ onSelect, savedProgress, onResume }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100 flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-8 left-12 text-5xl opacity-15 rotate-12">🔧</div>
        <div className="absolute top-24 right-16 text-4xl opacity-15 -rotate-6">⚙️</div>
        <div className="absolute bottom-32 left-20 text-5xl opacity-15 -rotate-12">🔩</div>
        <div className="absolute bottom-16 right-12 text-4xl opacity-15 rotate-6">🪛</div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-2xl relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 20 }}
            className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 font-bold text-xs uppercase tracking-widest px-4 py-2 rounded-full mb-5 border border-violet-200"
          >
            🏗️ Backyard Builder
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-black text-gray-900 mb-2"
            style={{ letterSpacing: '-1px' }}
          >
            Choose Your Quest
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-gray-500 text-base"
          >
            Each quest teaches a different set of system design concepts.
          </motion.p>
        </div>

        {/* Quest cards */}
        <div className="flex flex-col gap-4">
          {QUESTS.map((quest, i) => {
            const count = quest.disabled ? null : getQuestScenarioCount(quest.id as QuestId);
            const hasResume = !quest.disabled && savedProgress?.questId === quest.id;

            return (
              <motion.div
                key={quest.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1, type: 'spring', stiffness: 200 }}
                className={`bg-gradient-to-r ${quest.gradient} border-2 ${quest.borderColor} rounded-3xl p-5 flex items-center gap-5 shadow-sm ${quest.disabled ? 'opacity-60' : ''}`}
              >
                {/* Emoji */}
                <div className="text-5xl shrink-0">{quest.emoji}</div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-xl font-black text-gray-900">{quest.title}</h2>
                    {quest.disabled && (
                      <span className="text-xs bg-gray-200 text-gray-500 font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                        Coming Soon
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm leading-snug mb-1.5">{quest.description}</p>
                  <p className="text-gray-400 text-xs font-medium">
                    {count !== null ? `${count} scenarios · ` : ''}{quest.topics}
                  </p>
                </div>

                {/* CTA */}
                <div className="shrink-0 flex flex-col gap-2">
                  {hasResume && onResume && (
                    <button
                      onClick={onResume}
                      className={`${quest.resumeButtonClass} font-bold px-4 py-2 rounded-2xl transition-all hover:scale-105 active:scale-95 cursor-pointer text-sm whitespace-nowrap`}
                    >
                      ▶ Resume S{savedProgress!.scenarioId}
                    </button>
                  )}
                  <button
                    onClick={() => !quest.disabled && onSelect(quest.id as QuestId)}
                    disabled={quest.disabled}
                    className={`${quest.buttonClass} text-white font-bold px-5 py-3 rounded-2xl transition-all ${
                      !quest.disabled
                        ? 'hover:scale-105 hover:shadow-xl active:scale-95 cursor-pointer'
                        : 'cursor-not-allowed opacity-60'
                    }`}
                  >
                    {quest.disabled ? 'Soon' : hasResume ? 'Restart →' : 'Start →'}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
