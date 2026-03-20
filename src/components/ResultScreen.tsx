import { motion } from 'framer-motion';
import { getOutcomeData, getScenarioConcepts, getScenarioEmojis, calcOutcomeScore } from '../data/index';
import type { QuestId } from '../types';

interface Props {
  questId: QuestId;
  scenarioId: number;
  outcomeKey: string;
  totalScenarios: number;
  isRedoMode?: boolean;
  onReplay: () => void;
  onContinue: () => void;
  onRestart: () => void;
}

export default function ResultScreen({
  questId,
  scenarioId,
  outcomeKey,
  totalScenarios,
  isRedoMode = false,
  onReplay,
  onContinue,
  onRestart,
}: Props) {
  const data = getOutcomeData(questId, scenarioId, outcomeKey);
  const scenarioConcepts = getScenarioConcepts(questId);
  const scenarioEmojis = getScenarioEmojis(questId);
  const isLastScenario = scenarioId === totalScenarios;
  const score = calcOutcomeScore(data);

  const scoreStyle =
    score === 100 ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
    score >= 75   ? 'bg-teal-100 text-teal-700 border-teal-200' :
    score >= 55   ? 'bg-amber-100 text-amber-700 border-amber-200' :
                    'bg-red-100 text-red-700 border-red-200';

  const gradients: Record<string, string> = {
    true: 'from-emerald-50 via-green-50 to-teal-50',
    false: 'from-slate-50 via-gray-50 to-zinc-50',
  };
  const gradient = gradients[String(data.isOptimal)];

  const d = (n: number) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: 0.15 + n * 0.1 },
  });

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${gradient} flex flex-col items-center justify-start py-10 px-6 overflow-y-auto`}
    >
      {/* Scenario badge */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-5"
      >
        <div className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-500 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4 shadow-sm">
          <span>{scenarioEmojis[scenarioId]}</span>
          Scenario {scenarioId} of {totalScenarios} — Results
        </div>

        {/* Main icon */}
        <motion.div
          initial={{ scale: 0, rotate: -15 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 15, delay: 0.1 }}
          className="text-7xl mb-4"
        >
          {data.emoji}
        </motion.div>

        {/* Label + score */}
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <motion.span
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className={`inline-block px-5 py-2.5 rounded-2xl font-bold text-lg shadow-sm ${data.labelStyle}`}
          >
            {data.label}
          </motion.span>
          <motion.span
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25 }}
            className={`inline-block px-4 py-2.5 rounded-2xl font-black text-lg border ${scoreStyle}`}
          >
            {score}pts
          </motion.span>
        </div>
      </motion.div>

      {/* Content cards */}
      <div className="w-full max-w-xl space-y-4">
        {/* What happened */}
        <motion.div {...d(0)} className="bg-white rounded-3xl p-5 shadow-md border border-gray-100">
          <SectionLabel icon="🎬" text="What happened" />
          <p className="text-gray-800 leading-relaxed mt-2">{data.whatHappened}</p>
        </motion.div>

        {/* Concept unlocked */}
        <motion.div
          {...d(1)}
          className="bg-violet-600 rounded-3xl p-5 shadow-lg text-white"
        >
          <div className="text-xs font-bold uppercase tracking-widest text-violet-200 mb-2">
            🔓 Concept Unlocked
          </div>
          <div className="text-2xl font-black">{data.conceptUnlocked}</div>
        </motion.div>

        {/* Why it matters + two-layer */}
        <motion.div {...d(2)} className="bg-white rounded-3xl p-5 shadow-md border border-gray-100">
          <SectionLabel icon="💡" text="Why it matters" />
          <p className="text-gray-700 leading-relaxed mt-2 mb-4">{data.whyItMatters}</p>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-amber-50 rounded-2xl p-3 border border-amber-100">
              <div className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">
                🏠 Builder language
              </div>
              <p className="text-xs text-amber-900 leading-snug">{data.builderExplanation}</p>
            </div>
            <div className="bg-violet-50 rounded-2xl p-3 border border-violet-100">
              <div className="text-xs font-bold text-violet-600 uppercase tracking-wider mb-1">
                💻 System language
              </div>
              <p className="text-xs text-violet-900 leading-snug">{data.systemExplanation}</p>
            </div>
          </div>
        </motion.div>

        {/* PM Takeaway */}
        <motion.div
          {...d(3)}
          className="bg-gray-50 border border-gray-200 rounded-3xl p-5 shadow-sm"
        >
          <SectionLabel icon="💼" text="PM Takeaway" />
          <p className="text-gray-700 leading-relaxed mt-2 italic">"{data.pmTakeaway}"</p>
        </motion.div>

        {/* Sim results */}
        <motion.div {...d(4)} className="bg-white rounded-3xl p-5 shadow-md border border-gray-100">
          <SectionLabel icon="📊" text="Simulation Results" />
          <div className="mt-3 space-y-3">
            <RateBar label="Success rate" rate={data.successRate} color="bg-green-400" />
            <RateBar label="Failure rate" rate={1 - data.successRate} color="bg-red-400" />
          </div>
          {!data.isOptimal && data.optimalHint && (
            <p className="text-xs text-gray-400 mt-3 bg-gray-50 rounded-xl p-2.5">
              💡 {data.optimalHint}
            </p>
          )}
        </motion.div>

        {/* Next-up teaser (for non-final scenarios, not in redo mode) */}
        {!isLastScenario && !isRedoMode && (
          <motion.div
            {...d(5)}
            className="bg-violet-50 border-2 border-violet-200 rounded-3xl p-4 text-center"
          >
            <div className="text-xs font-bold uppercase tracking-wider text-violet-400 mb-1">
              Up next
            </div>
            <div className="font-bold text-violet-800">
              {scenarioEmojis[scenarioId + 1]} Scenario {scenarioId + 1} of {totalScenarios}
            </div>
            <div className="text-sm text-violet-600 mt-0.5 font-medium">
              {scenarioConcepts[scenarioId + 1]}
            </div>
          </motion.div>
        )}

        {/* Action buttons */}
        <motion.div {...d(6)} className="flex gap-3 pt-2 pb-8">
          <button
            onClick={onRestart}
            className="flex-1 bg-white hover:bg-gray-50 active:scale-[0.98] text-gray-600 font-semibold py-3 rounded-2xl shadow border border-gray-200 transition-all hover:scale-[1.02] cursor-pointer text-sm"
          >
            ↺ Restart
          </button>
          <button
            onClick={onReplay}
            className="flex-1 bg-white hover:bg-gray-50 active:scale-[0.98] text-gray-700 font-semibold py-3 rounded-2xl shadow border border-gray-200 transition-all hover:scale-[1.02] cursor-pointer text-sm"
          >
            ↺ Redo
          </button>
          <button
            onClick={onContinue}
            className="flex-[2] bg-violet-600 hover:bg-violet-700 active:scale-[0.98] text-white font-bold py-3 rounded-2xl shadow-lg shadow-violet-200 transition-all hover:scale-[1.02] cursor-pointer text-sm"
          >
            {isRedoMode
              ? 'Back to Summary →'
              : isLastScenario
              ? 'See final results →'
              : `Continue to Scenario ${scenarioId + 1} →`}
          </button>
        </motion.div>
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function SectionLabel({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span>{icon}</span>
      <span className="text-xs font-bold uppercase tracking-wider text-gray-400">{text}</span>
    </div>
  );
}

function RateBar({ label, rate, color }: { label: string; rate: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-bold text-gray-800">{Math.round(rate * 100)}%</span>
      </div>
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${rate * 100}%` }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.4 }}
        />
      </div>
    </div>
  );
}
