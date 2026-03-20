import { motion } from 'framer-motion';
import type { QuestId } from '../types';

const QUEST_META: Record<QuestId, { emoji: string; name: string }> = {
  spotify: { emoji: '🎵', name: 'Build Spotify' },
  amazon: { emoji: '📦', name: 'Build Amazon' },
  'photo-social': { emoji: '📸', name: 'Build Instagram' },
};

interface Props {
  questId: QuestId;
  scenarioId: number;
  totalScenarios: number;
  leaveLabel?: string;
  onLeave: () => void;
}

export default function NavBar({ questId, scenarioId, totalScenarios, leaveLabel = '← Quests', onLeave }: Props) {
  const { emoji, name } = QUEST_META[questId];

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b border-gray-200 px-4 h-11 flex items-center justify-between"
    >
      {/* Quest identity — clickable to go home */}
      <button
        onClick={onLeave}
        className="flex items-center gap-2 min-w-0 cursor-pointer hover:opacity-70 transition-opacity"
      >
        <span className="text-base">{emoji}</span>
        <span className="font-bold text-gray-800 text-sm truncate">{name}</span>
      </button>

      {/* Scenario progress */}
      <div className="flex items-center gap-1.5">
        {Array.from({ length: totalScenarios }).map((_, i) => (
          <div
            key={i}
            className={`rounded-full transition-all ${
              i < scenarioId - 1
                ? 'w-2 h-2 bg-violet-400'
                : i === scenarioId - 1
                ? 'w-3 h-2 bg-violet-600'
                : 'w-2 h-2 bg-gray-200'
            }`}
          />
        ))}
        <span className="text-xs text-gray-400 font-medium ml-1">
          {scenarioId}/{totalScenarios}
        </span>
      </div>

      {/* Exit */}
      <button
        onClick={onLeave}
        className="text-xs text-gray-500 hover:text-gray-800 font-semibold cursor-pointer transition-colors px-2 py-1 rounded-lg hover:bg-gray-100"
      >
        {leaveLabel}
      </button>
    </motion.div>
  );
}
