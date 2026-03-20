import type { GenericOutcome, QuestId } from '../types';
import { OUTCOMES as S1_OUTCOMES } from './scenario1';
import { SCENARIOS } from './scenarios';
import { AMAZON_SCENARIOS } from './amazonScenarios';
import { PHOTO_SOCIAL_SCENARIOS } from './photoSocialScenarios';

export function getOutcomeData(questId: QuestId, scenarioId: number, outcomeKey: string): GenericOutcome {
  if (questId === 'amazon') {
    const scenario = AMAZON_SCENARIOS.find(s => s.id === scenarioId);
    if (!scenario) throw new Error(`Amazon scenario ${scenarioId} not found`);
    const outcome = scenario.outcomes[outcomeKey];
    if (!outcome) throw new Error(`Outcome "${outcomeKey}" not found in Amazon scenario ${scenarioId}`);
    return outcome;
  }
  if (questId === 'photo-social') {
    const scenario = PHOTO_SOCIAL_SCENARIOS.find(s => s.id === scenarioId);
    if (!scenario) throw new Error(`Photo Social scenario ${scenarioId} not found`);
    const outcome = scenario.outcomes[outcomeKey];
    if (!outcome) throw new Error(`Outcome "${outcomeKey}" not found in Photo Social scenario ${scenarioId}`);
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
  if (questId === 'photo-social') return PHOTO_SOCIAL_SCENARIOS.find(s => s.id === id) ?? null;
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

export const PHOTO_SOCIAL_SCENARIO_CONCEPTS: Record<number, string> = {
  1: 'Fan-out on Write',
  2: 'Object Storage & CDN',
  3: 'Feed Ranking Algorithm',
  4: 'Push Notification Service',
  5: 'Async Processing Pipeline',
  6: 'Explore Feed Curation',
};

export const PHOTO_SOCIAL_SCENARIO_EMOJIS: Record<number, string> = {
  1: '📱',
  2: '🖼️',
  3: '📋',
  4: '🔔',
  5: '📤',
  6: '🔥',
};

export function getScenarioConcepts(questId: QuestId): Record<number, string> {
  if (questId === 'amazon') return AMAZON_SCENARIO_CONCEPTS;
  if (questId === 'photo-social') return PHOTO_SOCIAL_SCENARIO_CONCEPTS;
  return SCENARIO_CONCEPTS;
}

export function getScenarioEmojis(questId: QuestId): Record<number, string> {
  if (questId === 'amazon') return AMAZON_SCENARIO_EMOJIS;
  if (questId === 'photo-social') return PHOTO_SOCIAL_SCENARIO_EMOJIS;
  return SCENARIO_EMOJIS;
}

// Spotify: SCENARIOS covers ids 2-6, plus the drag-drop S1 = 6 total
export function getQuestScenarioCount(questId: QuestId): number {
  if (questId === 'amazon') return AMAZON_SCENARIOS.length;
  if (questId === 'photo-social') return PHOTO_SOCIAL_SCENARIOS.length;
  return SCENARIOS.length + 1; // S2-6 + S1
}

// Derive a 0-100 score from outcome quality without touching data files
export function calcOutcomeScore(outcome: import('../types').GenericOutcome): number {
  if (outcome.isOptimal) return 100;
  if (outcome.successRate >= 0.75) return 75;
  if (outcome.successRate >= 0.50) return 55;
  return 25;
}
