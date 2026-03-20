import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { INTRO_LINES } from '../data/scenario1';

interface IntroLine {
  emoji: string;
  text: string;
}

interface Props {
  lines?: IntroLine[];
  onComplete: () => void;
}

export default function IntroDialogue({ lines: propLines, onComplete }: Props) {
  const lines = propLines ?? INTRO_LINES;
  const [lineIndex, setLineIndex] = useState(0);

  const current = lines[lineIndex];
  const isLast = lineIndex === lines.length - 1;
  const progress = ((lineIndex + 1) / lines.length) * 100;

  function advance() {
    if (isLast) {
      onComplete();
    } else {
      setLineIndex(i => i + 1);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-6 left-8 text-4xl opacity-10">🎵</div>
        <div className="absolute bottom-12 right-10 text-4xl opacity-10">🔧</div>
        <div className="absolute top-1/4 right-6 text-3xl opacity-10">🎶</div>
      </div>

      {/* Top bar */}
      <div className="w-full max-w-sm mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Story</span>
          <span className="text-xs text-gray-400">{lineIndex + 1} / {lines.length}</span>
        </div>
        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-violet-400 rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <div className="w-full max-w-sm relative z-10">
        {/* Character avatar */}
        <motion.div
          className="flex justify-start mb-3"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-end gap-2">
            <div className="w-12 h-12 rounded-full bg-amber-200 border-2 border-amber-400 flex items-center justify-center text-2xl shadow-sm">
              👦
            </div>
            <div className="text-xs text-gray-500 font-medium mb-1">You</div>
          </div>
        </motion.div>

        {/* Dialogue bubble */}
        <AnimatePresence mode="wait">
          <motion.div
            key={lineIndex}
            initial={{ opacity: 0, x: 24, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -24, scale: 0.97 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="bg-white rounded-3xl rounded-tl-sm p-6 shadow-xl border border-gray-100 mb-5"
          >
            {/* Big emoji */}
            <div className="text-4xl mb-3">{current.emoji}</div>
            <p className="text-gray-800 text-lg font-medium leading-relaxed">
              {current.text}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Dot indicators */}
        <div className="flex justify-center gap-1.5 mb-5">
          {lines.map((_, i) => (
            <button
              key={i}
              onClick={() => setLineIndex(i)}
              className={`rounded-full transition-all ${
                i === lineIndex
                  ? 'w-5 h-2 bg-violet-500'
                  : i < lineIndex
                  ? 'w-2 h-2 bg-violet-300'
                  : 'w-2 h-2 bg-gray-300'
              }`}
            />
          ))}
        </div>

        {/* Advance button */}
        <button
          onClick={advance}
          className="w-full bg-violet-600 hover:bg-violet-700 active:scale-[0.98] text-white font-bold py-4 rounded-2xl shadow-lg shadow-violet-200 transition-all hover:shadow-xl cursor-pointer text-lg"
        >
          {isLast ? 'Go to workshop →' : 'Next →'}
        </button>

        {/* Skip all */}
        {!isLast && (
          <button
            onClick={onComplete}
            className="w-full text-center mt-3 text-gray-400 hover:text-gray-600 text-sm font-medium cursor-pointer transition-colors"
          >
            Skip intro
          </button>
        )}
      </div>
    </div>
  );
}
