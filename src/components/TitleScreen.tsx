import { motion } from 'framer-motion';
import { useState } from 'react';

interface Props {
  onStart: () => void;
}

export default function TitleScreen({ onStart }: Props) {
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100 flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-8 left-12 text-5xl opacity-20 rotate-12">🔧</div>
        <div className="absolute top-24 right-16 text-4xl opacity-20 -rotate-6">⚙️</div>
        <div className="absolute bottom-32 left-20 text-5xl opacity-20 -rotate-12">🔩</div>
        <div className="absolute bottom-16 right-12 text-4xl opacity-20 rotate-6">🪛</div>
        <div className="absolute top-1/2 left-8 text-3xl opacity-15">🎵</div>
        <div className="absolute top-1/3 right-8 text-3xl opacity-15">🎶</div>
        <div className="absolute top-16 left-1/3 text-2xl opacity-10">🔊</div>
        <div className="absolute bottom-24 right-1/3 text-2xl opacity-10">🎸</div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="text-center max-w-xl relative z-10"
      >
        {/* Badge */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 300, damping: 20 }}
          className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 font-bold text-xs uppercase tracking-widest px-4 py-2 rounded-full mb-6 border border-violet-200"
        >
          <span>🎮</span> System Design Learning Game
        </motion.div>

        {/* Main title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-6xl font-black text-gray-900 mb-2 leading-none"
          style={{ letterSpacing: '-2px' }}
        >
          Backyard
          <br />
          <span className="text-violet-600">Builder</span>
        </motion.h1>

        {/* Workshop icon */}
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
          className="text-7xl my-6"
        >
          🏗️
        </motion.div>

        {/* Quest label */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="inline-flex items-center gap-2 bg-white border-2 border-green-300 text-green-700 font-bold px-5 py-2 rounded-2xl mb-6 shadow-sm"
        >
          <span>🎵</span> Today's Quest: Build Spotify
        </motion.div>

        {/* Flavor text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-gray-600 text-lg leading-relaxed mb-10"
        >
          You are a tech genius kid inventor. Today, you woke up and decided to build
          Spotify in your backyard.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex flex-col items-center gap-3"
        >
          <button
            onClick={onStart}
            className="bg-violet-600 hover:bg-violet-700 active:scale-95 text-white font-bold text-xl px-10 py-4 rounded-2xl shadow-lg shadow-violet-200 transition-all hover:scale-105 hover:shadow-xl hover:shadow-violet-200 cursor-pointer"
          >
            Start Building 🔧
          </button>
          <button
            onClick={() => setShowHowItWorks(v => !v)}
            className="text-gray-500 hover:text-gray-700 text-sm font-medium underline underline-offset-2 cursor-pointer transition-colors"
          >
            How this works
          </button>
        </motion.div>

        {/* How it works panel */}
        {showHowItWorks && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            className="mt-6 bg-white rounded-2xl p-5 text-left shadow-lg border border-gray-100 text-sm text-gray-600 space-y-2"
          >
            <p className="font-bold text-gray-800 text-base mb-3">How Backyard Builder works</p>
            <p>🎭 <strong>You play a kid inventor</strong> building real tech in your backyard.</p>
            <p>🏗️ <strong>Drag & drop components</strong> to build your system.</p>
            <p>🧪 <strong>Test your build</strong> to see how it handles real traffic.</p>
            <p>📚 <strong>Learn system design</strong> through play — not lectures.</p>
            <p className="text-violet-600 font-medium pt-2">Scenario 1 teaches: single server bottlenecks, vertical scaling, horizontal scaling, and load balancing.</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
