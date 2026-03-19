import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { GameScreen, ComponentId } from './types';
import TitleScreen from './components/TitleScreen';
import IntroDialogue from './components/IntroDialogue';
import ProblemReveal from './components/ProblemReveal';
import BuildPhase from './components/BuildPhase';
import SimulationPhase from './components/SimulationPhase';
import ScenarioProblem from './components/ScenarioProblem';
import ScenarioBuild from './components/ScenarioBuild';
import ScenarioSimulation from './components/ScenarioSimulation';
import ResultScreen from './components/ResultScreen';
import EndScreen from './components/EndScreen';
import { getScenario } from './data/index';

function deriveS1Outcome(placed: ComponentId[]): string {
  const hasMega = placed.includes('mega-machine');
  const extraCount = placed.filter(id => id.startsWith('extra-machine')).length;
  const hasDirector = placed.includes('traffic-director');
  if (hasMega) return 'A';
  if (extraCount >= 2 && hasDirector) return 'C';
  return 'B';
}

const TOTAL_SCENARIOS = 6;

// Progress: 4 steps per scenario (problem, build, sim, result) × 6 scenarios + title/intro
function calcProgress(screen: GameScreen, scenarioId: number): number {
  const stepMap: Partial<Record<GameScreen, number>> = {
    title: 0,
    intro: 0.02,
    problem: 0,
    build: 1,
    simulating: 2,
    result: 3,
    end: 4,
  };
  if (screen === 'title') return 0;
  if (screen === 'intro') return 0.02;
  if (screen === 'end') return 1;
  const step = stepMap[screen] ?? 0;
  return ((scenarioId - 1) * 4 + step) / (TOTAL_SCENARIOS * 4);
}

export default function App() {
  const [screen, setScreen] = useState<GameScreen>('title');
  const [scenarioId, setScenarioId] = useState(1);

  // Scenario 1 specific
  const [placedComponents, setPlacedComponents] = useState<ComponentId[]>([]);

  // Scenarios 2-6: selected option ID (kept for potential replay state)
  const [_selectedOption, setSelectedOption] = useState<string | null>(null);

  // Unified outcome key (string) — 'A'/'B'/'C' for s1, option-id for s2-6
  const [outcomeKey, setOutcomeKey] = useState<string | null>(null);

  // Animation key changes on screen+scenario to trigger AnimatePresence
  const pageKey = `${screen}-${scenarioId}`;

  const progress = calcProgress(screen, scenarioId);

  function handleS1Test(placed: ComponentId[]) {
    setPlacedComponents(placed);
    const key = deriveS1Outcome(placed);
    setOutcomeKey(key);
    setScreen('simulating');
  }

  function handleS1SimComplete() {
    setScreen('result');
  }

  function handleOptionSelect(optionId: string) {
    setSelectedOption(optionId);
    setOutcomeKey(optionId);
    setScreen('simulating');
  }

  function handleSimComplete() {
    setScreen('result');
  }

  function handleReplay() {
    setPlacedComponents([]);
    setSelectedOption(null);
    setOutcomeKey(null);
    setScreen('build');
  }

  function handleContinue() {
    const next = scenarioId + 1;
    if (next > TOTAL_SCENARIOS) {
      setScreen('end');
    } else {
      setScenarioId(next);
      setPlacedComponents([]);
      setSelectedOption(null);
      setOutcomeKey(null);
      setScreen('problem');
    }
  }

  function handleRestart() {
    setScenarioId(1);
    setPlacedComponents([]);
    setSelectedOption(null);
    setOutcomeKey(null);
    setScreen('title');
  }

  const currentScenario = scenarioId > 1 ? getScenario(scenarioId) : null;

  return (
    <div className="min-h-screen overflow-x-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={pageKey}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
        >
          {/* ── Global screens ─────────────────────────────────────── */}
          {screen === 'title' && (
            <TitleScreen onStart={() => setScreen('intro')} />
          )}
          {screen === 'intro' && (
            <IntroDialogue onComplete={() => setScreen('problem')} />
          )}
          {screen === 'end' && (
            <EndScreen onRestart={handleRestart} />
          )}

          {/* ── Scenario 1: Drag-and-drop build ───────────────────── */}
          {scenarioId === 1 && screen === 'problem' && (
            <ProblemReveal onBuild={() => setScreen('build')} />
          )}
          {scenarioId === 1 && screen === 'build' && (
            <BuildPhase
              onTest={handleS1Test}
              onBack={() => setScreen('problem')}
            />
          )}
          {scenarioId === 1 && screen === 'simulating' && outcomeKey && (
            <SimulationPhase
              placed={placedComponents}
              outcome={outcomeKey as 'A' | 'B' | 'C'}
              onComplete={handleS1SimComplete}
            />
          )}

          {/* ── Scenarios 2-6: Card-selection build ───────────────── */}
          {scenarioId > 1 && screen === 'problem' && currentScenario && (
            <ScenarioProblem
              scenario={currentScenario}
              onBuild={() => setScreen('build')}
            />
          )}
          {scenarioId > 1 && screen === 'build' && currentScenario && (
            <ScenarioBuild
              scenario={currentScenario}
              onTest={handleOptionSelect}
              onBack={() => setScreen('problem')}
            />
          )}
          {scenarioId > 1 && screen === 'simulating' && currentScenario && outcomeKey && (
            <ScenarioSimulation
              scenario={currentScenario}
              optionId={outcomeKey}
              onComplete={handleSimComplete}
            />
          )}

          {/* ── Shared result screen ───────────────────────────────── */}
          {screen === 'result' && outcomeKey && (
            <ResultScreen
              scenarioId={scenarioId}
              outcomeKey={outcomeKey}
              totalScenarios={TOTAL_SCENARIOS}
              onReplay={handleReplay}
              onContinue={handleContinue}
              onRestart={handleRestart}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Global progress bar */}
      {screen !== 'title' && screen !== 'end' && (
        <div className="fixed bottom-0 left-0 right-0 h-1 bg-gray-200 z-50">
          <motion.div
            className="h-full bg-violet-500"
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      )}
    </div>
  );
}
