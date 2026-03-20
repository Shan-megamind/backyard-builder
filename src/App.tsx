import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { GameScreen, ComponentId, QuestId, ScenarioResult } from './types';
import TitleScreen from './components/TitleScreen';
import QuestSelect from './components/QuestSelect';
import IntroDialogue from './components/IntroDialogue';
import ProblemReveal from './components/ProblemReveal';
import BuildPhase from './components/BuildPhase';
import SimulationPhase from './components/SimulationPhase';
import ScenarioProblem from './components/ScenarioProblem';
import ScenarioBuild from './components/ScenarioBuild';
import ScenarioSimulation from './components/ScenarioSimulation';
import ResultScreen from './components/ResultScreen';
import EndScreen from './components/EndScreen';
import NavBar from './components/NavBar';
import { getScenario, getOutcomeData, calcOutcomeScore, getQuestScenarioCount } from './data/index';
import { AMAZON_INTRO_LINES } from './data/amazonScenarios';
import { PHOTO_SOCIAL_INTRO_LINES } from './data/photoSocialScenarios';
import { INTRO_LINES } from './data/scenario1';

// ── localStorage helpers ──────────────────────────────────────────────────────

const STORAGE_KEY = 'backyard-builder-progress';

interface SavedState {
  questId: QuestId;
  scenarioId: number;
  questResults: ScenarioResult[];
}

function loadProgress(): SavedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SavedState) : null;
  } catch {
    return null;
  }
}

function saveProgress(state: SavedState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { /* ignore */ }
}

function clearProgress() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch { /* ignore */ }
}

// ── Spotify S1 logic ──────────────────────────────────────────────────────────

function deriveS1Outcome(placed: ComponentId[]): string {
  const hasMega = placed.includes('mega-machine');
  const extraCount = placed.filter(id => id.startsWith('extra-machine')).length;
  const hasDirector = placed.includes('traffic-director');
  if (hasMega) return 'A';
  if (extraCount >= 2 && hasDirector) return 'C';
  return 'B';
}

function calcProgress(screen: GameScreen, scenarioId: number, totalScenarios: number): number {
  const stepMap: Partial<Record<GameScreen, number>> = {
    title: 0, quest_select: 0, intro: 0.02,
    problem: 0, build: 1, simulating: 2, result: 3, end: 4,
  };
  if (screen === 'title' || screen === 'quest_select') return 0;
  if (screen === 'intro') return 0.02;
  if (screen === 'end') return 1;
  const step = stepMap[screen] ?? 0;
  return ((scenarioId - 1) * 4 + step) / (totalScenarios * 4);
}

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState<GameScreen>('title');
  const [questId, setQuestId] = useState<QuestId>('spotify');
  const [scenarioId, setScenarioId] = useState(1);
  const [placedComponents, setPlacedComponents] = useState<ComponentId[]>([]);
  const [_selectedOption, setSelectedOption] = useState<string | null>(null);
  const [outcomeKey, setOutcomeKey] = useState<string | null>(null);
  const [questResults, setQuestResults] = useState<ScenarioResult[]>([]);

  // Mirrors localStorage — updated any time we save or clear progress
  const [savedState, setSavedState] = useState<SavedState | null>(() => loadProgress());

  // When non-null, the player is redoing a specific scenario from the EndScreen
  const [redoScenarioId, setRedoScenarioId] = useState<number | null>(null);

  const totalScenarios = getQuestScenarioCount(questId);
  const pageKey = `${screen}-${questId}-${scenarioId}`;
  const progress = calcProgress(screen, scenarioId, totalScenarios);

  const isSpotifyS1 = questId === 'spotify' && scenarioId === 1;
  const currentScenario = !isSpotifyS1 ? getScenario(questId, scenarioId) : null;
  const showNavBar = screen !== 'title' && screen !== 'quest_select' && screen !== 'end';

  // ── Result recording helper ─────────────────────────────────────────────────

  function recordResult(
    sid: number, key: string, current: ScenarioResult[]
  ): ScenarioResult[] {
    const outcome = getOutcomeData(questId, sid, key);
    const score = calcOutcomeScore(outcome);
    const result: ScenarioResult = {
      scenarioId: sid,
      outcomeKey: key,
      score,
      isOptimal: outcome.isOptimal,
      conceptUnlocked: outcome.conceptUnlocked,
      label: outcome.label,
      emoji: outcome.emoji,
      optimalHint: outcome.optimalHint,
    };
    return [...current.filter(r => r.scenarioId !== sid), result];
  }

  // ── Handlers ────────────────────────────────────────────────────────────────

  function handleQuestSelect(selected: QuestId) {
    setQuestId(selected);
    setScenarioId(1);
    setPlacedComponents([]);
    setSelectedOption(null);
    setOutcomeKey(null);
    setQuestResults([]);
    setScreen('intro');
  }

  function handleResume() {
    if (!savedState) return;
    setQuestId(savedState.questId);
    setScenarioId(savedState.scenarioId);
    setQuestResults(savedState.questResults);
    setRedoScenarioId(null);
    setPlacedComponents([]);
    setSelectedOption(null);
    setOutcomeKey(null);
    setScreen('problem');
  }

  function handleRedoScenario(sid: number) {
    setRedoScenarioId(sid);
    setScenarioId(sid);
    setPlacedComponents([]);
    setSelectedOption(null);
    setOutcomeKey(null);
    setScreen('problem');
  }

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
    const updatedResults = outcomeKey
      ? recordResult(scenarioId, outcomeKey, questResults)
      : questResults;
    setQuestResults(updatedResults);

    // If redoing a scenario from the EndScreen, return there when done
    if (redoScenarioId !== null) {
      setRedoScenarioId(null);
      setPlacedComponents([]);
      setSelectedOption(null);
      setOutcomeKey(null);
      setScreen('end');
      return;
    }

    const next = scenarioId + 1;
    if (next > totalScenarios) {
      clearProgress();
      setSavedState(null);
      setScreen('end');
    } else {
      const saved = { questId, scenarioId: next, questResults: updatedResults };
      saveProgress(saved);
      setSavedState(saved);
      setScenarioId(next);
      setPlacedComponents([]);
      setSelectedOption(null);
      setOutcomeKey(null);
      setScreen('problem');
    }
  }

  function handleRestart() {
    clearProgress();
    setSavedState(null);
    setRedoScenarioId(null);
    setScenarioId(1);
    setPlacedComponents([]);
    setSelectedOption(null);
    setOutcomeKey(null);
    setQuestResults([]);
    setScreen('title');
  }

  function handleBackToQuests() {
    setScenarioId(1);
    setPlacedComponents([]);
    setSelectedOption(null);
    setOutcomeKey(null);
    setQuestResults([]);
    setScreen('quest_select');
  }

  function handleSaveAndLeave() {
    // If redoing from EndScreen, just cancel redo and return to EndScreen
    if (redoScenarioId !== null) {
      setRedoScenarioId(null);
      setScenarioId(1);
      setPlacedComponents([]);
      setSelectedOption(null);
      setOutcomeKey(null);
      setScreen('end');
      return;
    }
    const toSave = { questId, scenarioId, questResults };
    saveProgress(toSave);
    setSavedState(toSave);
    handleBackToQuests();
  }

  const introLines = questId === 'amazon'
    ? AMAZON_INTRO_LINES
    : questId === 'photo-social'
    ? PHOTO_SOCIAL_INTRO_LINES
    : INTRO_LINES;

  return (
    <div className={`min-h-screen overflow-x-hidden ${showNavBar ? 'pt-11' : ''}`}>
      {/* Persistent top nav — rendered outside AnimatePresence so it doesn't re-animate */}
      {showNavBar && (
        <NavBar
          questId={questId}
          scenarioId={scenarioId}
          totalScenarios={totalScenarios}
          leaveLabel={redoScenarioId !== null ? '← Summary' : '← Quests'}
          onLeave={handleSaveAndLeave}
        />
      )}

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
            <TitleScreen onStart={() => setScreen('quest_select')} />
          )}
          {screen === 'quest_select' && (
            <QuestSelect
              onSelect={handleQuestSelect}
              savedProgress={savedState ? { questId: savedState.questId, scenarioId: savedState.scenarioId } : null}
              onResume={handleResume}
            />
          )}
          {screen === 'intro' && (
            <IntroDialogue lines={introLines} onComplete={() => setScreen('problem')} />
          )}
          {screen === 'end' && (
            <EndScreen
              questId={questId}
              results={questResults}
              onRestart={handleRestart}
              onBackToQuests={handleBackToQuests}
              onRedoScenario={handleRedoScenario}
            />
          )}

          {/* ── Spotify Scenario 1: Drag-and-drop build ────────────── */}
          {isSpotifyS1 && screen === 'problem' && (
            <ProblemReveal onBuild={() => setScreen('build')} />
          )}
          {isSpotifyS1 && screen === 'build' && (
            <BuildPhase
              onTest={handleS1Test}
              onBack={() => setScreen('problem')}
            />
          )}
          {isSpotifyS1 && screen === 'simulating' && outcomeKey && (
            <SimulationPhase
              placed={placedComponents}
              outcome={outcomeKey as 'A' | 'B' | 'C'}
              onComplete={handleS1SimComplete}
            />
          )}

          {/* ── Generic card-selection scenarios (Spotify S2-6, all Amazon) ── */}
          {!isSpotifyS1 && screen === 'problem' && currentScenario && (
            <ScenarioProblem
              scenario={currentScenario}
              onBuild={() => setScreen('build')}
            />
          )}
          {!isSpotifyS1 && screen === 'build' && currentScenario && (
            <ScenarioBuild
              scenario={currentScenario}
              onTest={handleOptionSelect}
              onBack={() => setScreen('problem')}
            />
          )}
          {!isSpotifyS1 && screen === 'simulating' && currentScenario && outcomeKey && (
            <ScenarioSimulation
              scenario={currentScenario}
              optionId={outcomeKey}
              questId={questId}
              onComplete={handleSimComplete}
            />
          )}

          {/* ── Shared result screen ───────────────────────────────── */}
          {screen === 'result' && outcomeKey && (
            <ResultScreen
              questId={questId}
              scenarioId={scenarioId}
              outcomeKey={outcomeKey}
              totalScenarios={totalScenarios}
              isRedoMode={redoScenarioId !== null}
              onReplay={handleReplay}
              onContinue={handleContinue}
              onRestart={handleRestart}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Global progress bar */}
      {showNavBar && (
        <div className="fixed bottom-0 left-0 right-0 h-1 bg-gray-200 z-50">
          <motion.div
            className={`h-full ${questId === 'amazon' ? 'bg-orange-500' : questId === 'photo-social' ? 'bg-pink-500' : 'bg-violet-500'}`}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      )}
    </div>
  );
}
