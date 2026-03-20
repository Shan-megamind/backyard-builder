import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ScenarioConfig, ScenarioOption } from '../types';

interface Props {
  scenario: ScenarioConfig;
  onTest: (optionId: string) => void;
  onBack: () => void;
}

export default function ScenarioBuild({ scenario, onTest, onBack }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState<string | null>(null);
  // Shuffle once on mount — order varies per session, correctness tied to option ID not position
  const [shuffledOptions] = useState(() => [...scenario.options].sort(() => Math.random() - 0.5));

  function handleSelect(id: string) {
    setSelected(id);
  }

  function handleTest() {
    if (selected) onTest(selected);
  }

  const selectedOption = scenario.options.find(o => o.id === selected);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3.5 bg-white border-b border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="text-gray-400 hover:text-gray-700 transition-colors cursor-pointer text-sm"
          >
            ← Back
          </button>
          <span className="text-gray-200">|</span>
          <span className="text-xl">{scenario.questEmoji}</span>
          <div>
            <div className="font-black text-gray-900 text-sm">Workshop — Scenario {scenario.id}</div>
            <div className="text-xs text-gray-400">{scenario.title}</div>
          </div>
        </div>
        <div className="bg-violet-100 text-violet-700 font-bold text-xs px-4 py-1.5 rounded-full border border-violet-200">
          Scenario {scenario.id} of 6
        </div>
      </div>

      {/* Mission banner */}
      <div className="bg-violet-600 text-white text-center py-2.5 text-sm font-semibold px-4">
        Mission: {scenario.missionText}
      </div>

      <div className="flex flex-1 gap-5 p-5">
        {/* Left — context */}
        <div className="w-52 shrink-0 bg-white rounded-3xl p-4 shadow-md border border-gray-100 flex flex-col gap-4">
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              The Problem
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">{scenario.problemContext}</p>
          </div>
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              📊 Key Stats
            </h3>
            <div className="space-y-1.5">
              {scenario.problemStats.map(s => (
                <div key={s.label} className="flex justify-between items-start gap-1">
                  <span className="text-xs text-gray-500 leading-snug">{s.label}</span>
                  <span className={`text-xs font-bold shrink-0 ${s.isWarning ? 'text-red-600' : 'text-gray-700'}`}>
                    {s.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center — option cards */}
        <div className="flex-1 flex flex-col">
          <div className="text-center mb-5">
            <h2 className="font-black text-gray-800 text-xl">Pick your approach</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Click a card to select it, then test to see how it performs.
            </p>
          </div>

          <div className="flex gap-4 justify-center items-stretch">
            {shuffledOptions.map((option, idx) => (
              <OptionCard
                key={option.id}
                option={option}
                index={idx}
                isSelected={selected === option.id}
                isRevealed={revealed === option.id}
                onSelect={() => handleSelect(option.id)}
                onReveal={() => setRevealed(revealed === option.id ? null : option.id)}
              />
            ))}
          </div>

          {/* Selected summary */}
          <div className="mt-5 min-h-14 flex justify-center">
            <AnimatePresence mode="wait">
              {selectedOption && (
                <motion.div
                  key={selectedOption.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="bg-white border border-violet-200 rounded-2xl px-5 py-3 text-center shadow-sm max-w-md"
                >
                  <span className="text-sm font-semibold text-violet-800">
                    Selected: {selectedOption.emoji} {selectedOption.name}
                  </span>
                  <p className="text-xs text-gray-500 mt-0.5 leading-snug">
                    {selectedOption.gameDescription}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Test button */}
          <div className="flex justify-center mt-4">
            <button
              onClick={handleTest}
              disabled={!selected}
              className={`font-bold text-lg px-10 py-4 rounded-2xl shadow-lg transition-all cursor-pointer ${
                selected
                  ? 'bg-green-500 hover:bg-green-600 text-white hover:scale-105 shadow-green-100 hover:shadow-green-200 active:scale-[0.98]'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
              }`}
            >
              {selected ? 'Test This Approach 🚀' : 'Pick an approach to test'}
            </button>
          </div>
        </div>

        {/* Right — hint panel */}
        <div className="w-52 shrink-0 bg-white rounded-3xl p-4 shadow-md border border-gray-100 flex flex-col">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
            💡 Concept Area
          </h3>
          <div className="bg-violet-50 rounded-xl px-3 py-2.5 text-sm font-semibold text-violet-700 border border-violet-100 mb-4">
            {scenario.conceptHint}
          </div>

          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            What to consider
          </h3>
          <div className="space-y-2 text-xs text-gray-600 flex-1">
            <p className="bg-gray-50 rounded-xl p-2.5">
              🔍 Read each option carefully — both the builder and system descriptions.
            </p>
            <p className="bg-gray-50 rounded-xl p-2.5">
              🧪 You can test any option and replay to try the others.
            </p>
            <p className="bg-gray-50 rounded-xl p-2.5">
              ⚖️ Each choice has real trade-offs. There is usually a best option — but the others teach something too.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Option Card ────────────────────────────────────────────────────────────────

function OptionCard({
  option,
  index,
  isSelected,
  isRevealed,
  onSelect,
  onReveal,
}: {
  option: ScenarioOption;
  index: number;
  isSelected: boolean;
  isRevealed: boolean;
  onSelect: () => void;
  onReveal: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="flex flex-col w-52"
    >
      {/* Main card */}
      <motion.div
        onClick={onSelect}
        whileHover={{ scale: isSelected ? 1 : 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`flex-1 rounded-3xl border-2 p-5 cursor-pointer transition-all shadow-sm flex flex-col ${
          isSelected
            ? `${option.bgColor} ${option.borderColor} shadow-lg ring-2 ring-offset-2 ring-violet-400`
            : `bg-white border-gray-200 hover:border-gray-300 hover:shadow-md`
        }`}
      >
        {/* Selection checkmark */}
        <div className="flex justify-between items-start mb-3">
          <span className="text-4xl">{option.emoji}</span>
          {isSelected && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-6 h-6 bg-violet-600 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
            >
              ✓
            </motion.div>
          )}
        </div>

        <div className={`font-bold text-sm mb-2 ${isSelected ? option.textColor : 'text-gray-800'}`}>
          {option.name}
        </div>
        <p className="text-xs text-gray-500 leading-snug flex-1">{option.gameDescription}</p>

        {/* System design reveal toggle */}
        <button
          onClick={e => {
            e.stopPropagation();
            onReveal();
          }}
          className="mt-3 text-xs text-violet-500 hover:text-violet-700 font-semibold cursor-pointer flex items-center gap-1 transition-colors"
        >
          {isRevealed ? '▲ Hide' : '▼ System design'}
        </button>
      </motion.div>

      {/* System design reveal panel */}
      <AnimatePresence>
        {isRevealed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-gray-900 text-gray-100 rounded-2xl rounded-t-none p-3 text-xs leading-snug -mt-2 pt-4">
              <span className="text-violet-300 font-bold block mb-1">💻 System design:</span>
              {option.systemDescription}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
