export type QuestId = 'spotify' | 'amazon' | 'photo-social';

export type GameScreen =
  | 'title'
  | 'quest_select'
  | 'intro'
  | 'problem'
  | 'build'
  | 'simulating'
  | 'result'
  | 'end';

// ── Scenario 1 types (drag-and-drop build) ────────────────────────────────────

export type ComponentId =
  | 'mega-machine'
  | 'extra-machine-1'
  | 'extra-machine-2'
  | 'traffic-director';

export type OutcomeId = 'A' | 'B' | 'C';

export interface BuildComponent {
  id: ComponentId;
  name: string;
  emoji: string;
  gameDescription: string;
  systemDescription: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  accentColor: string;
}

// ── Shared outcome shape (all scenarios) ─────────────────────────────────────

export interface GenericOutcome {
  label: string;
  labelStyle: string;
  emoji: string;
  whatHappened: string;
  conceptUnlocked: string;
  whyItMatters: string;
  pmTakeaway: string;
  successRate: number;
  builderExplanation: string;
  systemExplanation: string;
  isOptimal: boolean;
  optimalHint?: string;
}

// ── Per-scenario result (recorded when player clicks Continue) ─────────────────

export interface ScenarioResult {
  scenarioId: number;
  outcomeKey: string;
  score: number;        // 25 | 55 | 75 | 100
  isOptimal: boolean;
  conceptUnlocked: string;
  label: string;
  emoji: string;
  optimalHint?: string;
}

// ── Scenarios 2-6 types (card-selection build) ────────────────────────────────

export interface ScenarioOption {
  id: string;
  name: string;
  emoji: string;
  gameDescription: string;
  systemDescription: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
}

export interface ScenarioConfig {
  id: number;
  title: string;
  questEmoji: string;
  conceptHint: string;
  problemNarrative: string;
  problemContext: string;
  missionText: string;
  problemStats: Array<{ label: string; value: string; isWarning?: boolean }>;
  centralMachine: { emoji: string; label: string; status: string };
  options: ScenarioOption[];
  outcomes: Record<string, GenericOutcome>;
}
