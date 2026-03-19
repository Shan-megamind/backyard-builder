import type { GenericOutcome } from '../types';
import { OUTCOMES as S1_OUTCOMES } from './scenario1';
import { SCENARIOS } from './scenarios';

export function getOutcomeData(scenarioId: number, outcomeKey: string): GenericOutcome {
  if (scenarioId === 1) {
    return S1_OUTCOMES[outcomeKey];
  }
  const scenario = SCENARIOS.find(s => s.id === scenarioId);
  if (!scenario) throw new Error(`Scenario ${scenarioId} not found`);
  const outcome = scenario.outcomes[outcomeKey];
  if (!outcome) throw new Error(`Outcome "${outcomeKey}" not found in scenario ${scenarioId}`);
  return outcome;
}

export function getScenario(id: number) {
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
