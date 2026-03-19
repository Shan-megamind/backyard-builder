import type { BuildComponent, GenericOutcome } from '../types';

export const INTRO_LINES: { text: string; emoji: string }[] = [
  { text: 'You build ambitious things in your backyard all the time.', emoji: '🏗️' },
  { text: "Today's idea is bigger than usual.", emoji: '💡' },
  { text: '"I\'m building Spotify."', emoji: '🎵' },
  {
    text: 'You throw together Music Machine 1.0 using old speakers, wires, and pure genius.',
    emoji: '🔧',
  },
  { text: 'At first, only 3 friends use it. Works great.', emoji: '👦' },
  { text: 'By afternoon, 40 kids are trying to play songs at the same time.', emoji: '👥' },
  { text: '💨 The machine starts smoking. Something is very wrong.', emoji: '🔥' },
];

export const COMPONENTS: BuildComponent[] = [
  {
    id: 'mega-machine',
    name: 'Mega Music Machine',
    emoji: '⚡',
    gameDescription: 'A stronger single music box.',
    systemDescription: 'Vertical scaling — make one server more powerful.',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-400',
    textColor: 'text-amber-800',
    accentColor: '#f59e0b',
  },
  {
    id: 'extra-machine-1',
    name: 'Extra Music Machine',
    emoji: '🎵',
    gameDescription: 'Another machine to help serve songs.',
    systemDescription: 'Horizontal scaling — add another server.',
    bgColor: 'bg-sky-50',
    borderColor: 'border-sky-400',
    textColor: 'text-sky-800',
    accentColor: '#0ea5e9',
  },
  {
    id: 'extra-machine-2',
    name: 'Extra Music Machine',
    emoji: '🎵',
    gameDescription: 'Another machine to help serve songs.',
    systemDescription: 'Horizontal scaling — add another server.',
    bgColor: 'bg-sky-50',
    borderColor: 'border-sky-400',
    textColor: 'text-sky-800',
    accentColor: '#0ea5e9',
  },
  {
    id: 'traffic-director',
    name: 'Traffic Director Bot',
    emoji: '🤖',
    gameDescription: 'A robot that directs kids to the right machine.',
    systemDescription: 'Load balancer — distributes requests across servers.',
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-400',
    textColor: 'text-violet-800',
    accentColor: '#7c3aed',
  },
];

export const OUTCOMES: Record<string, GenericOutcome> = {
  A: {
    label: 'Decent short-term fix',
    labelStyle: 'bg-amber-100 text-amber-800 border border-amber-300',
    emoji: '⚡',
    whatHappened:
      'You upgraded one machine so it could handle more song requests. That helped, but your whole music system still depends on one box.',
    conceptUnlocked: 'Vertical Scaling',
    whyItMatters:
      'Making one server stronger is a common early fix, but it has limits — and it still leaves you with a single point of failure.',
    pmTakeaway:
      'A fast fix can help early growth, but not every quick fix scales well long term.',
    successRate: 0.7,
    builderExplanation:
      "You souped up one machine so it could handle more kids — but it's still just one box with one point of failure.",
    systemExplanation:
      'Vertical scaling improved single-server capacity but created a single point of failure and a hard ceiling.',
    isOptimal: false,
    optimalHint: 'Try Two Extra Machines + Traffic Director Bot for the optimal outcome.',
  },
  B: {
    label: 'Good instinct, incomplete setup',
    labelStyle: 'bg-sky-100 text-sky-800 border border-sky-300',
    emoji: '🔧',
    whatHappened:
      'You added more machines, which increased total capacity. But kids connected unevenly, so some machines got slammed while others barely worked.',
    conceptUnlocked: 'Horizontal Scaling',
    whyItMatters: 'Adding more servers helps, but traffic still needs coordination.',
    pmTakeaway: 'Adding capacity without coordination can still create a poor user experience.',
    successRate: 0.62,
    builderExplanation:
      'More machines meant more capacity, but kids crowded the same one since nothing directed traffic.',
    systemExplanation:
      'Horizontal scaling added capacity, but without a load balancer traffic distributed unevenly.',
    isOptimal: false,
    optimalHint: 'Add a Traffic Director Bot to distribute load across both machines.',
  },
  C: {
    label: 'Strong scalable setup',
    labelStyle: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
    emoji: '🏆',
    whatHappened:
      'You spread requests across multiple machines instead of crushing one. That reduced overload and made the music system more stable.',
    conceptUnlocked: 'Load Balancing',
    whyItMatters:
      'Distributing traffic across multiple servers is a foundational pattern for scaling systems gracefully.',
    pmTakeaway:
      'When usage grows, reliability depends on system design choices — not just stronger infrastructure.',
    successRate: 0.92,
    builderExplanation:
      'More machines with a traffic director spread the load evenly — no single machine gets crushed.',
    systemExplanation:
      'Horizontal scaling + load balancing is the canonical pattern for handling growing concurrent traffic.',
    isOptimal: true,
  },
};
