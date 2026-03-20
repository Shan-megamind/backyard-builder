import type { GenericOutcome, QuestId } from '../types';
import { OUTCOMES as S1_OUTCOMES } from './scenario1';
import { SCENARIOS } from './scenarios';
import { AMAZON_SCENARIOS } from './amazonScenarios';

export function getOutcomeData(questId: QuestId, scenarioId: number, outcomeKey: string): GenericOutcome {
  if (questId === 'amazon') {
    const scenario = AMAZON_SCENARIOS.find(s => s.id === scenarioId);
    if (!scenario) throw new Error(`Amazon scenario ${scenarioId} not found`);
    const outcome = scenario.outcomes[outcomeKey];
    if (!outcome) throw new Error(`Outcome "${outcomeKey}" not found in Amazon scenario ${scenarioId}`);
    return outcome;
  }
  if (scenarioId === 1) {
    return S1_OUTCOMES[outcomeKey];
  }
  const scenario = SCENARIOS.find(s => s.id === scenarioId);
  if (!scenario) throw new Error(`Scenario ${scenarioId} not found`);
  const outcome = scenario.outcomes[outcomeKey];
  if (!outcome) throw new Error(`Outcome "${outcomeKey}" not found in scenario ${scenarioId}`);
  return outcome;
}

export function getScenario(questId: QuestId, id: number) {
  if (questId === 'amazon') return AMAZON_SCENARIOS.find(s => s.id === id) ?? null;
  return SCENARIOS.find(s => s.id === id) ?? null;
}

export const SCENARIO_CONCEPTS: Record<number, string> = {
  1: 'Load Balancing',
  2: 'Content Delivery Network',
  3: 'Database Indexing',
  4: 'Data Modeling',
  5: 'Traffic Spike Handling',
  6: 'Data Pipelines & Personalization',
};

export const SCENARIO_EMOJIS: Record<number, string> = {
  1: '⚖️',
  2: '🗺️',
  3: '📚',
  4: '📝',
  5: '🎤',
  6: '🎯',
};

export const AMAZON_SCENARIO_CONCEPTS: Record<number, string> = {
  1: 'Race Conditions & Atomic Operations',
  2: 'Search Indexing & Catalog Design',
  3: 'Checkout Orchestration & Sagas',
  4: 'Async Queues & Eventual Consistency',
  5: 'Autoscaling, Caching & Circuit Breakers',
  6: 'Event-Driven Order Tracking',
};

export const AMAZON_SCENARIO_EMOJIS: Record<number, string> = {
  1: '🔒',
  2: '🔍',
  3: '💳',
  4: '📬',
  5: '🔥',
  6: '📦',
};

export function getScenarioConcepts(questId: QuestId): Record<number, string> {
  return questId === 'amazon' ? AMAZON_SCENARIO_CONCEPTS : SCENARIO_CONCEPTS;
}

export function getScenarioEmojis(questId: QuestId): Record<number, string> {
  return questId === 'amazon' ? AMAZON_SCENARIO_EMOJIS : SCENARIO_EMOJIS;
}

// Spotify: SCENARIOS covers ids 2-6, plus the drag-drop S1 = 6 total
export function getQuestScenarioCount(questId: QuestId): number {
  if (questId === 'amazon') return AMAZON_SCENARIOS.length;
  return SCENARIOS.length + 1; // S2-6 + S1
}

// Derive a 0-100 score from outcome quality without touching data files
export function calcOutcomeScore(outcome: import('../types').GenericOutcome): number {
  if (outcome.isOptimal) return 100;
  if (outcome.successRate >= 0.75) return 75;
  if (outcome.successRate >= 0.50) return 55;
  return 25;
}
