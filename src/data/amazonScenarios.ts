import type { ScenarioConfig } from '../types';

export const AMAZON_INTRO_LINES = [
  { emoji: '🛒', text: 'Today you decided to build Amazon in your backyard.' },
  { emoji: '📦', text: 'You set up Shop Machine 1.0 — one item for sale, ready to go.' },
  { emoji: '👧👦', text: 'Alice and Bob both see "1 item left" and click Buy at the exact same second.' },
  { emoji: '✅✅', text: 'Both get "Order Confirmed". But you only had one item.' },
  { emoji: '😱', text: 'You oversold. Someone is going to get an empty box.' },
  { emoji: '🔧', text: 'Time to fix Shop Machine before more problems pile up.' },
];

export const AMAZON_SCENARIOS: ScenarioConfig[] = [
  // ── Scenario 1: Race Conditions ───────────────────────────────────────────
  {
    id: 1,
    title: 'Two kids try to buy the last item at the same time',
    questEmoji: '🛒',
    conceptHint: 'Race conditions & atomicity',
    problemNarrative:
      "You built Shop Machine 1.0 in your backyard. You're selling one last toy. Two kids — Alice and Bob — click 'Buy' at the exact same second. Both get 'Order Confirmed'. You only had one.",
    problemContext:
      'Two simultaneous orders hit your system. Both read inventory = 1. Both confirm. You ship 2 but had 1.',
    missionText: 'Fix the system so only one buyer can claim the last item.',
    problemStats: [
      { label: 'Items in stock', value: '1 left' },
      { label: 'Orders confirmed', value: '2 🔴', isWarning: true },
      { label: 'Items available to ship', value: '1 🔴', isWarning: true },
      { label: 'Oversell rate', value: '100% 🔴', isWarning: true },
    ],
    centralMachine: { emoji: '🛒', label: 'Shop Machine 1.0', status: 'Overselling!' },
    options: [
      {
        id: 'faster-checkout',
        name: 'Faster Checkout System',
        emoji: '⚡',
        gameDescription: 'Make checkout go twice as fast — maybe one buyer finishes before the other starts.',
        systemDescription:
          'Speed optimization — does not address concurrent reads. Both threads still read stale inventory before either writes.',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-300',
        textColor: 'text-amber-800',
      },
      {
        id: 'first-come-first-serve',
        name: 'First Come First Serve',
        emoji: '🏃',
        gameDescription: 'Sort orders by arrival time. Process the first one, ignore the second.',
        systemDescription:
          'Naive timestamp ordering — reduces collisions but two requests arriving within the same millisecond still race.',
        bgColor: 'bg-sky-50',
        borderColor: 'border-sky-300',
        textColor: 'text-sky-800',
      },
      {
        id: 'reserve-item',
        name: 'Reserve Item Before Confirming',
        emoji: '🔒',
        gameDescription:
          "Lock the item the moment someone starts to buy it. If it's locked, the other buyer immediately sees 'Out of Stock'.",
        systemDescription:
          'Atomic reservation — decrement inventory in a single atomic transaction. Only one operation can succeed; all others see the updated state.',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-300',
        textColor: 'text-emerald-800',
      },
      {
        id: 'queue-orders',
        name: 'Queue Orders',
        emoji: '📋',
        gameDescription: 'Put all buy requests into a single line. Process one at a time, no parallelism.',
        systemDescription:
          'Full serialization via queue — eliminates concurrency entirely. Correct but introduces latency under load.',
        bgColor: 'bg-violet-50',
        borderColor: 'border-violet-300',
        textColor: 'text-violet-800',
      },
    ],
    outcomes: {
      'faster-checkout': {
        label: 'Still overselling',
        labelStyle: 'bg-orange-100 text-orange-800 border border-orange-300',
        emoji: '⚡',
        whatHappened:
          "Both kids still clicked at the same moment. Going faster just means both orders complete faster — they still both read 'inventory = 1' before either updates it. Same race, quicker collision.",
        conceptUnlocked: 'Speed Does Not Fix Race Conditions',
        whyItMatters:
          'Race conditions happen because two operations read the same state before either commits a write. Reducing latency shrinks the window but does not close it.',
        pmTakeaway:
          'In transactional systems, correctness matters more than speed. A faster wrong answer is still wrong.',
        successRate: 0.2,
        builderExplanation:
          "Both kids saw '1 item left' at the same time and clicked Buy. Going faster didn't fix that — it just meant both confirmations happened quicker.",
        systemExplanation:
          'A race condition occurs when two threads read shared state before either commits a write. Reducing latency does not eliminate the concurrency window.',
        isOptimal: false,
        optimalHint: 'Try Reserve Item — lock inventory atomically so only one transaction can succeed.',
      },
      'first-come-first-serve': {
        label: 'Race condition still exists',
        labelStyle: 'bg-sky-100 text-sky-800 border border-sky-300',
        emoji: '🏃',
        whatHappened:
          "If Alice clicks 1ms before Bob it works. But if they click at the exact same millisecond, both requests arrive together and the race condition still fires. At scale, this happens constantly.",
        conceptUnlocked: 'Timestamp Ordering vs. Atomic Operations',
        whyItMatters:
          'Sorting by timestamp reduces collisions but does not eliminate them. Two requests can arrive within the same clock tick. True safety requires atomicity — not ordering.',
        pmTakeaway:
          'In transactional systems, correctness matters more than speed. Timestamp ordering is not a substitute for proper locking.',
        successRate: 0.55,
        builderExplanation:
          'When they click at slightly different times it works. But at scale, thousands of buyers hit at the same millisecond — and the race condition returns.',
        systemExplanation:
          'Timestamp ordering reduces collision probability but does not provide correctness guarantees under high concurrency. Atomic compare-and-swap or DB-level locking is required.',
        isOptimal: false,
        optimalHint: 'Reserve Item uses an atomic lock — the first thread to grab it wins, regardless of exact timing.',
      },
      'reserve-item': {
        label: 'Only one buyer wins',
        labelStyle: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
        emoji: '🏆',
        whatHappened:
          "Alice's request locks the item first. Bob's request checks inventory, sees it's locked — his order is immediately rejected with 'Out of Stock'. One item sold. One order confirmed. Zero oversell.",
        conceptUnlocked: 'Atomic Operations & Locking',
        whyItMatters:
          'Atomic operations guarantee that read-modify-write happens as a single indivisible step. No other thread can read stale state between the read and the write.',
        pmTakeaway:
          'In transactional systems, correctness matters more than speed. Atomic operations are the foundation of every reliable inventory, booking, and payment system.',
        successRate: 0.97,
        builderExplanation:
          "The item gets locked the moment someone starts to buy it. While it's locked, no one else can touch it. First buyer in wins — everyone else sees 'Out of Stock'.",
        systemExplanation:
          'SELECT FOR UPDATE, compare-and-swap, or optimistic locking ensure inventory reads and writes happen as one indivisible transaction, making oversell structurally impossible.',
        isOptimal: true,
      },
      'queue-orders': {
        label: 'Correct but slower',
        labelStyle: 'bg-violet-100 text-violet-800 border border-violet-300',
        emoji: '📋',
        whatHappened:
          "Orders are processed one at a time. Alice goes first, gets the item. Bob is next — inventory is already 0, so he gets 'Out of Stock'. No oversell. But checkout is slower for everyone.",
        conceptUnlocked: 'Serialization vs. Atomic Locking',
        whyItMatters:
          'A queue eliminates concurrency entirely by serializing requests. It is always correct but introduces latency. Row-level locking achieves the same safety while still allowing parallel processing for non-conflicting requests.',
        pmTakeaway:
          'In transactional systems, correctness matters more than speed. Queues guarantee correctness at the cost of throughput — use them when latency is acceptable.',
        successRate: 0.85,
        builderExplanation:
          "The queue forces one buyer at a time. No race condition possible — but everyone waits longer even when there's no conflict.",
        systemExplanation:
          'Full serialization via a queue eliminates race conditions but becomes a bottleneck under high concurrency. Row-level locking achieves safety with much less throughput penalty.',
        isOptimal: false,
        optimalHint: 'Reserve Item (atomic locking) achieves the same correctness with more concurrency allowed.',
      },
    },
  },

  // ── Scenario 2: Product Search ─────────────────────────────────────────────
  {
    id: 2,
    title: '100,000 products and search takes forever',
    questEmoji: '🔍',
    conceptHint: 'Search indexing & catalog design',
    problemNarrative:
      "Shop Machine 2.0 now stocks 100,000 products. When a kid searches for 'red bike', the machine reads every single product row one by one. It takes 30 seconds. Kids are leaving before the results appear.",
    problemContext:
      '100,000 products. Every search scans every row. That means 100,000 checks per request — and the catalog and inventory are stored in the same table.',
    missionText: 'Make product search fast and separate what you sell from how much you have.',
    problemStats: [
      { label: 'Products in catalog', value: '100,000' },
      { label: 'Search time', value: '30 seconds 🔴', isWarning: true },
      { label: 'Scans per search', value: '100,000 🔴', isWarning: true },
      { label: 'Conversion rate', value: '4% (was 31%) 🔴', isWarning: true },
    ],
    centralMachine: { emoji: '🔍', label: 'Shop Machine 2.0', status: 'Scanning forever…' },
    options: [
      {
        id: 'keep-scanning',
        name: 'Keep Scanning Everything',
        emoji: '⏳',
        gameDescription: 'Read every product row until you find the match.',
        systemDescription: 'Full table scan — O(n) time complexity. Degrades linearly with catalog size.',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-800',
      },
      {
        id: 'name-catalog',
        name: 'A-Z Product Catalog',
        emoji: '📖',
        gameDescription: "Build an alphabetical catalog so you can jump straight to 'B' for bikes.",
        systemDescription:
          'B-tree index on product name — O(log n) lookup for exact name matches. Does not support attribute or partial queries.',
        bgColor: 'bg-sky-50',
        borderColor: 'border-sky-300',
        textColor: 'text-sky-800',
      },
      {
        id: 'attribute-index',
        name: 'Smart Search Index',
        emoji: '🤖',
        gameDescription:
          "Build a word-and-attribute index that maps 'red', 'bike', 'kids' instantly to matching products. Keep catalog info separate from stock levels.",
        systemDescription:
          'Inverted index on name, brand, category, and attributes. Catalog (what exists) separated from inventory (how many). Powers fast full-text and faceted search.',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-300',
        textColor: 'text-emerald-800',
      },
    ],
    outcomes: {
      'keep-scanning': {
        label: 'Search still broken',
        labelStyle: 'bg-red-100 text-red-800 border border-red-300',
        emoji: '😬',
        whatHappened:
          "Nothing changed. The machine reads every product row every time. As the catalog grows to a million products, search goes from 30 seconds to 5 minutes.",
        conceptUnlocked: 'Unindexed Search (O(n))',
        whyItMatters:
          'Full table scans degrade linearly with data size. At 1M products, the same query that takes 30s today will take 5 minutes. There is no hardware upgrade that fixes this.',
        pmTakeaway:
          'Search is one of the highest-leverage features in e-commerce. An unindexed catalog is a business problem, not just a technical one.',
        successRate: 0.16,
        builderExplanation:
          'The machine checks every product card in the pile, one by one. The bigger the pile, the slower the search. And the pile is always growing.',
        systemExplanation:
          'A full table scan has O(n) time complexity. Without an index, every query reads every row regardless of how selective the predicate is.',
        isOptimal: false,
        optimalHint: 'Try the Smart Search Index — it maps keywords to products instantly.',
      },
      'name-catalog': {
        label: 'Faster but limited',
        labelStyle: 'bg-sky-100 text-sky-800 border border-sky-300',
        emoji: '📖',
        whatHappened:
          "Exact searches are fast — typing 'Trek Bike Model X' jumps straight to it. But searching 'red bike under $50' still scans every product. And you can't filter by color, size, or price.",
        conceptUnlocked: 'B-tree Index (Exact Match)',
        whyItMatters:
          'B-tree indexes dramatically speed up exact-match and range queries on sorted keys. But they do not support full-text search, attribute filtering, or partial keyword matching.',
        pmTakeaway:
          'The right index depends on how users actually search. Exact-name lookup is rarely how shoppers browse — they search by attribute and intent.',
        successRate: 0.78,
        builderExplanation:
          'The catalog lets you jump to the right letter fast. But when a kid types "red bike" they get nothing — because the catalog only knows names, not colors or categories.',
        systemExplanation:
          'B-tree indexes work well for sorted-key queries but cannot support full-text, fuzzy, or attribute-based lookups without a separate inverted index.',
        isOptimal: false,
        optimalHint: 'The Smart Search Index supports full-text, attribute, and faceted queries — and separates catalog from stock.',
      },
      'attribute-index': {
        label: 'Instant search, clean design',
        labelStyle: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
        emoji: '🏆',
        whatHappened:
          "Searching 'red bike under $50' returns in under 100ms. The catalog (name, description, attributes) is separate from inventory (stock levels). Updating stock doesn't slow down search.",
        conceptUnlocked: 'Inverted Index & Catalog/Inventory Separation',
        whyItMatters:
          'Inverted indexes map terms to documents for instant full-text search. Separating catalog from inventory means product info and stock counts can scale, update, and be queried independently.',
        pmTakeaway:
          'What a product is (catalog) and how many you have (inventory) are different problems. Mixing them creates correctness bugs and performance constraints that compound over time.',
        successRate: 0.96,
        builderExplanation:
          'The smart index has memorized every word and attribute for every product. A kid types "red bike" and the index instantly knows exactly which products match. Stock levels live in a separate system that never slows down search.',
        systemExplanation:
          'An inverted index maps each term/attribute to its matching product IDs, enabling O(1) term lookups. Catalog/inventory separation is a core e-commerce pattern — product metadata and stock counts have different update rates, consistency requirements, and query patterns.',
        isOptimal: true,
      },
    },
  },

  // ── Scenario 3: Checkout Orchestration ────────────────────────────────────
  {
    id: 3,
    title: 'Cart, inventory, and payment are getting tangled',
    questEmoji: '💳',
    conceptHint: 'Checkout orchestration & sagas',
    problemNarrative:
      "Shop Machine 3.0 handles cart, inventory, and payment all in one tangled blob. When a card fails, the inventory is already reserved. When confirmation crashes, the card is already charged. Kids are getting double-charged and losing their items.",
    problemContext:
      'Cart, inventory deduction, and card charge happen in a single system with no coordination. Any step failing mid-way leaves the order permanently broken.',
    missionText: 'Design a checkout flow where any failure can be undone without leaving the system in a broken state.',
    problemStats: [
      { label: 'Checkout failure rate', value: '23% 🔴', isWarning: true },
      { label: 'Double-charge incidents', value: '8% 🔴', isWarning: true },
      { label: 'Lost inventory reservations', value: 'Rising ↑', isWarning: true },
      { label: 'Support tickets / day', value: '400 🔴', isWarning: true },
    ],
    centralMachine: { emoji: '💳', label: 'Checkout Machine', status: 'Making a mess!' },
    options: [
      {
        id: 'single-machine',
        name: 'One Big Checkout Machine',
        emoji: '🏭',
        gameDescription:
          'Keep everything in one machine — cart, inventory, payment, and confirmation all talking directly to each other.',
        systemDescription:
          'Monolithic checkout — tightly coupled components. Partial failures leave data in inconsistent states with no rollback path.',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-800',
      },
      {
        id: 'split-no-coord',
        name: 'Split Into Three Machines',
        emoji: '⚙️',
        gameDescription:
          'Give inventory, payment, and order confirmation their own machines — but let them call each other directly.',
        systemDescription:
          'Service decomposition without orchestration — removes the monolith but creates distributed partial failures with no compensation logic.',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-300',
        textColor: 'text-amber-800',
      },
      {
        id: 'checkout-saga',
        name: 'Checkout Conductor',
        emoji: '🎼',
        gameDescription:
          'A conductor orchestrates each step in order: reserve → charge → confirm. If any step fails, the conductor reverses the previous steps automatically.',
        systemDescription:
          'Saga pattern — orchestrated sequence of local transactions with compensating transactions for rollback. Each step is reversible.',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-300',
        textColor: 'text-emerald-800',
      },
    ],
    outcomes: {
      'single-machine': {
        label: 'Cascade failures everywhere',
        labelStyle: 'bg-red-100 text-red-800 border border-red-300',
        emoji: '🔥',
        whatHappened:
          "A card declines at step 2 — but inventory was already deducted at step 1. The machine crashes halfway and leaves the order half-done. The kid's item is gone from inventory but their order never confirmed.",
        conceptUnlocked: 'Monolithic Checkout Failures',
        whyItMatters:
          'Tightly coupled checkout code means a failure in any one step corrupts the state of all others. There is no way to undo step 1 when step 2 has already failed.',
        pmTakeaway:
          'Checkout is the most critical flow in e-commerce. A monolithic design makes it impossible to recover cleanly from the failures that always happen in distributed systems.',
        successRate: 0.23,
        builderExplanation:
          'The three machines all talk directly to each other. When the payment machine crashes mid-way, inventory is already gone and the order is stuck in limbo. No one knows how to fix it.',
        systemExplanation:
          'Monolithic checkout with no transaction boundaries creates partial failure modes where inventory, payment, and order state drift out of sync with no compensating logic.',
        isOptimal: false,
        optimalHint: 'Try the Checkout Conductor — it orchestrates each step with automatic rollback if anything goes wrong.',
      },
      'split-no-coord': {
        label: 'Split but still tangled',
        labelStyle: 'bg-amber-100 text-amber-800 border border-amber-300',
        emoji: '⚙️',
        whatHappened:
          "The three machines are now separate — but when payment fails, inventory machine doesn't know to release the reservation. Orders get stuck in half-confirmed states across three different systems.",
        conceptUnlocked: 'Distributed Partial Failures',
        whyItMatters:
          'Splitting services without coordination distributes the failure modes without solving them. Each service succeeds or fails independently, leaving no one responsible for the overall transaction.',
        pmTakeaway:
          'Service decomposition without orchestration trades one set of problems for another. Checkout correctness requires a coordinator that owns the whole flow.',
        successRate: 0.55,
        builderExplanation:
          "Three separate machines are better than one blob — but they still don't talk to each other when something goes wrong. The payment machine fails, and the inventory machine never finds out.",
        systemExplanation:
          'Without a saga coordinator, distributed services have no mechanism to perform compensating transactions when a downstream step fails. The result is split-brain inconsistency across services.',
        isOptimal: false,
        optimalHint: 'The Checkout Conductor owns the full saga and reverses each step if anything fails downstream.',
      },
      'checkout-saga': {
        label: 'Clean flow, safe rollback',
        labelStyle: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
        emoji: '🏆',
        whatHappened:
          "The conductor runs: reserve inventory → charge card → confirm order. A card decline triggers automatic inventory release. Nothing is left in a broken state. Checkout failures become graceful rejections, not data corruption.",
        conceptUnlocked: 'Saga Pattern & Compensating Transactions',
        whyItMatters:
          'Sagas break a distributed transaction into a sequence of local transactions, each with a compensating reverse action. The coordinator ensures that any failure triggers rollback of all previous steps.',
        pmTakeaway:
          'Correct checkout is more important than fast checkout. A saga gives you a deterministic, auditable path through the most critical flow in your system.',
        successRate: 0.96,
        builderExplanation:
          'The conductor runs steps one by one: lock the item, charge the card, confirm the order. If charging fails, the conductor automatically unlocks the item. Every failure has a clean undo.',
        systemExplanation:
          'The Saga pattern coordinates distributed transactions without a global lock. Each step has a defined compensating transaction. The orchestrator tracks state and triggers compensation on failure.',
        isOptimal: true,
      },
    },
  },

  // ── Scenario 4: Async Queues & Eventual Consistency ───────────────────────
  {
    id: 4,
    title: 'Orders are confirmed but the warehouse has no idea',
    questEmoji: '📬',
    conceptHint: 'Async queues & eventual consistency',
    problemNarrative:
      "Orders are confirmed instantly. But to complete each order, your machine has to immediately call 5 systems: warehouse, inventory, email, analytics, and fulfillment. If any one of them is slow or down, the whole order fails and gets lost.",
    problemContext:
      'Post-order notifications to 5 systems happen synchronously. One slow or failing system blocks the entire order from completing.',
    missionText: 'Make post-order updates reliable and fast — even when downstream systems are slow or temporarily unavailable.',
    problemStats: [
      { label: 'Lost warehouse notifications', value: '14% 🔴', isWarning: true },
      { label: 'Double fulfillments', value: '6% 🔴', isWarning: true },
      { label: 'Missed email confirmations', value: '22% 🔴', isWarning: true },
      { label: 'Avg confirm delay', value: '8 seconds 🔴', isWarning: true },
    ],
    centralMachine: { emoji: '📬', label: 'Order Dispatcher', status: 'Losing messages!' },
    options: [
      {
        id: 'sync-all',
        name: 'Wait for All Systems',
        emoji: '⏳',
        gameDescription:
          "Don't confirm the order until all 5 systems have said 'received'. If any one is slow, the customer waits. If any one fails, the order fails.",
        systemDescription:
          'Synchronous fan-out — confirmation blocked on all downstream responses. Latency adds up; any single failure propagates to the customer.',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-300',
        textColor: 'text-amber-800',
      },
      {
        id: 'fire-forget',
        name: 'Send and Hope',
        emoji: '📡',
        gameDescription: 'Confirm the order immediately and fire notifications to all 5 systems without waiting or tracking.',
        systemDescription:
          'Async fire-and-forget — fast confirmation but no delivery guarantees. Failed notifications are silently lost.',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-800',
      },
      {
        id: 'reliable-queue',
        name: 'Reliable Message Queue',
        emoji: '📮',
        gameDescription:
          'Confirm the order immediately and put a notification into a queue for each system. If a system fails, the queue retries automatically.',
        systemDescription:
          'Durable message queue with at-least-once delivery and retries. Order confirmation is decoupled from downstream propagation. Failed deliveries retry without customer impact.',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-300',
        textColor: 'text-emerald-800',
      },
    ],
    outcomes: {
      'sync-all': {
        label: 'Slow and fragile',
        labelStyle: 'bg-amber-100 text-amber-800 border border-amber-300',
        emoji: '⏳',
        whatHappened:
          "A kid places an order. Your machine calls all 5 systems and waits. The analytics system is slow — 6 seconds. The kid waits 8 seconds for confirmation. When the email system goes down, the entire order fails even though inventory and payment are fine.",
        conceptUnlocked: 'Synchronous Fan-out Failures',
        whyItMatters:
          "When you wait for all downstream systems to confirm, your response time equals the slowest system's response time. And your reliability equals the least-reliable system's uptime.",
        pmTakeaway:
          "Customers should not wait for your internal systems to synchronize. Confirmation latency should reflect order acceptance, not downstream propagation.",
        successRate: 0.52,
        builderExplanation:
          'The machine calls all 5 systems and stands there waiting. If the analytics machine takes 6 seconds, the kid waits 6 seconds. If email is down, the order fails even though inventory is fine.',
        systemExplanation:
          'Synchronous fan-out chains latency and failure probability multiplicatively. End-to-end latency = sum of all downstream calls. Availability = product of all downstream availabilities.',
        isOptimal: false,
        optimalHint: 'A Reliable Message Queue confirms instantly and delivers to all systems in the background with retries.',
      },
      'fire-forget': {
        label: 'Fast but lossy',
        labelStyle: 'bg-red-100 text-red-800 border border-red-300',
        emoji: '📡',
        whatHappened:
          "Confirmation is instant — the kid gets an immediate response. But 14% of warehouse notifications silently disappear when the warehouse system is slow. Items get confirmed but never shipped.",
        conceptUnlocked: 'Fire-and-Forget Has No Guarantees',
        whyItMatters:
          'Async without durability trades one problem for another. You get fast confirmation but introduce silent data loss. Lost messages are the hardest kind of bug — they leave no trace.',
        pmTakeaway:
          'Speed with silent data loss is not an improvement. Every message you fire and forget is a potential ghost order that erodes trust.',
        successRate: 0.64,
        builderExplanation:
          'Confirmation is instant, which is great. But the machine fires notifications into the air without checking if they arrived. When the warehouse machine is busy, the message just disappears.',
        systemExplanation:
          'Fire-and-forget async calls have no acknowledgment, no retry, and no dead-letter queue. Network partitions, restarts, or slow consumers silently drop messages with no error surfacing.',
        isOptimal: false,
        optimalHint: 'A Reliable Message Queue gives you instant confirmation AND guaranteed delivery — not a trade-off between the two.',
      },
      'reliable-queue': {
        label: 'Fast confirmation, zero data loss',
        labelStyle: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
        emoji: '🏆',
        whatHappened:
          "The kid gets immediate confirmation. The queue delivers to all 5 systems in the background. When the warehouse is slow, the message waits in the queue and retries. Every system eventually gets the notification — none are lost.",
        conceptUnlocked: 'Message Queue & Eventual Consistency',
        whyItMatters:
          'A durable queue decouples order acceptance from downstream propagation. At-least-once delivery with retries ensures every system eventually receives its notification, even through transient failures.',
        pmTakeaway:
          "Users don't need to wait for your internal systems to synchronize. Eventual consistency is a valid model when data will converge reliably — and a queue makes that convergence guaranteed.",
        successRate: 0.97,
        builderExplanation:
          'The order goes into the queue instantly — the kid gets confirmed immediately. The queue then reliably delivers to each of the 5 systems in the background, retrying any that are temporarily unavailable.',
        systemExplanation:
          'A durable message queue (SQS, RabbitMQ, Kafka) provides at-least-once delivery semantics, retry logic, and dead-letter queues for poison messages. Order confirmation is decoupled from downstream propagation time.',
        isOptimal: true,
      },
    },
  },

  // ── Scenario 5: Mega Sale Crash ────────────────────────────────────────────
  {
    id: 5,
    title: 'Prime Backyard Sale just started and everything is crashing',
    questEmoji: '🔥',
    conceptHint: 'Autoscaling, caching & circuit breakers',
    problemNarrative:
      "Prime Backyard Sale Day just started. Normal load: 1,000 requests per second. Sale load: 50,000 requests per second. Your servers crashed in 4 seconds. 10,000 kids got error pages on the biggest shopping day of the year.",
    problemContext:
      'Normal load: 1,000 req/sec. Sale spike: 50,000 req/sec. 50× increase. Happens in under 1 second.',
    missionText: 'Handle a 50× traffic spike without crashing the core ordering system.',
    problemStats: [
      { label: 'Normal load', value: '1,000 req/sec' },
      { label: 'Sale spike', value: '50,000 req/sec 🔴', isWarning: true },
      { label: 'Time to crash', value: '4 seconds 🔴', isWarning: true },
      { label: 'Error rate during sale', value: '94% 🔴', isWarning: true },
    ],
    centralMachine: { emoji: '🔥', label: 'Sale Server', status: 'MELTDOWN' },
    options: [
      {
        id: 'bigger-servers',
        name: 'Bigger Backyard Machines',
        emoji: '💪',
        gameDescription: 'Buy the most powerful servers money can buy the night before the sale.',
        systemDescription:
          'Reactive vertical scaling — expensive, slow to provision, and still has a hard ceiling at extreme burst load.',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-300',
        textColor: 'text-amber-800',
      },
      {
        id: 'hot-cache',
        name: 'Cache the Hot Products',
        emoji: '🗄️',
        gameDescription:
          'Before the sale starts, pre-load the 200 most-viewed products into a fast cache. Serve product pages from cache, not the database.',
        systemDescription:
          'Read-through cache for hot product data — eliminates 90%+ of DB reads during a sale. Core DB stays healthy for order writes.',
        bgColor: 'bg-sky-50',
        borderColor: 'border-sky-300',
        textColor: 'text-sky-800',
      },
      {
        id: 'full-protection',
        name: 'Scale + Cache + Protect',
        emoji: '🛡️',
        gameDescription:
          'Autoscale servers when traffic spikes. Cache hot products. Add a circuit breaker to shed non-critical requests (like analytics) when the core is under pressure.',
        systemDescription:
          'Horizontal autoscaling + read cache + circuit breakers. Sheds non-critical load to protect order-taking. Scales compute up and back down automatically.',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-300',
        textColor: 'text-emerald-800',
      },
    ],
    outcomes: {
      'bigger-servers': {
        label: 'Crashed slower, still crashed',
        labelStyle: 'bg-amber-100 text-amber-800 border border-amber-300',
        emoji: '💪',
        whatHappened:
          "The new machines handled 3,000 req/sec instead of 1,000. That gave you 12 seconds before the crash instead of 4. But 50,000 req/sec is still far above the ceiling. You spent a lot of money and still failed.",
        conceptUnlocked: 'Limits of Vertical Scaling',
        whyItMatters:
          'Every server has a ceiling. Vertical scaling raises that ceiling but never eliminates it. Against a 50× spike, no single machine is the right defense.',
        pmTakeaway:
          'Hardware purchases are not an architecture strategy. Invest in caching and autoscaling — they are cheaper per request and respond automatically.',
        successRate: 0.49,
        builderExplanation:
          'The new machines are more powerful — but 50,000 kids at once is still too many. You delayed the crash by a few seconds and spent a fortune doing it.',
        systemExplanation:
          'Vertical scaling improves baseline capacity but hits hard physical limits. Provisioning decisions made before a sale cannot respond to real-time load shape. Horizontal autoscaling and caching are elastic; vertical scaling is not.',
        isOptimal: false,
        optimalHint: 'Pre-loading the cache before the sale starts eliminates 90% of reads before a single request arrives.',
      },
      'hot-cache': {
        label: 'Database protected, most traffic handled',
        labelStyle: 'bg-sky-100 text-sky-800 border border-sky-300',
        emoji: '🗄️',
        whatHappened:
          "90% of product page requests are served from cache — the database never sees them. Most of the sale traffic is handled. But the rare product outside the top 200 still hits the DB, and order-write spikes still cause some slowdowns.",
        conceptUnlocked: 'Read-Through Caching for Hot Data',
        whyItMatters:
          'During a sale, the top 1% of products get 80%+ of traffic. Caching that tiny slice eliminates the vast majority of read load and protects your transactional database for writes.',
        pmTakeaway:
          'Pre-warming caches before a known traffic event is one of the highest-ROI reliability investments you can make. Product and engineering should coordinate on upcoming demand events.',
        successRate: 0.81,
        builderExplanation:
          "The popular products are already loaded into a fast cache before the sale starts. When 50,000 kids ask for the same bike, the cache answers all of them without touching the database.",
        systemExplanation:
          'A read-through cache with pre-warming eliminates the majority of DB read load before traffic arrives. Cache hit rates of 90%+ are achievable for hot product pages during known demand events.',
        isOptimal: false,
        optimalHint: 'Add autoscaling and a circuit breaker to protect the ordering system even during the rare cache misses and write spikes.',
      },
      'full-protection': {
        label: 'Sale survived, orders protected',
        labelStyle: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
        emoji: '🏆',
        whatHappened:
          "Traffic spikes to 50,000 req/sec. The cache absorbs 90% of it. Autoscaling spins up new servers in 45 seconds for the remaining load. The circuit breaker pauses analytics and recommendation calls — keeping the order flow clear. Not a single order is lost.",
        conceptUnlocked: 'Autoscaling + Caching + Circuit Breakers',
        whyItMatters:
          'Production resilience under extreme load requires layered defense: cache eliminates most reads, autoscaling absorbs compute spikes, and circuit breakers protect your most critical path by shedding non-essential work.',
        pmTakeaway:
          'The best sale-day incident is the one that never happens. Layered resilience — cache, scale, and protection — is how you ship the sale and go home.',
        successRate: 0.97,
        builderExplanation:
          'The cache handles most product views. New server machines spin up automatically when traffic grows. When things get really busy, the circuit breaker stops less-important features to keep the checkout clear. Every order goes through.',
        systemExplanation:
          'Horizontal autoscaling (e.g., AWS ASG) responds to real-time load. Cache pre-warming eliminates most read traffic. Circuit breakers (e.g., resilience4j, Hystrix) shed non-critical calls (analytics, recs) to protect critical-path services.',
        isOptimal: true,
      },
    },
  },

  // ── Scenario 6: Package Tracking ──────────────────────────────────────────
  {
    id: 6,
    title: 'Where is my package? Nobody knows.',
    questEmoji: '📦',
    conceptHint: 'Event-driven order tracking',
    problemNarrative:
      "Order confirmed. Payment received. Package shipped. Delivered to the doorstep. But none of this ever updates on the tracking page. 47% of customers are messaging your support team asking 'Where is my order?' Your support queue is unmanageable.",
    problemContext:
      'Order status lives in 4 separate systems: Shop Machine, Warehouse, Delivery Company, and Carrier. None of them tell the tracking page when status changes.',
    missionText: 'Give customers real-time order visibility without building a manual status-checking team.',
    problemStats: [
      { label: '"Where is my order?" tickets', value: '47% of customers 🔴', isWarning: true },
      { label: 'Avg status update lag', value: '6+ hours 🔴', isWarning: true },
      { label: 'Tracking page accuracy', value: '31% 🔴', isWarning: true },
      { label: 'Support cost vs baseline', value: '12× normal 🔴', isWarning: true },
    ],
    centralMachine: { emoji: '📦', label: 'Order Tracker', status: 'No idea!' },
    options: [
      {
        id: 'manual-checks',
        name: 'Manual Status Checks',
        emoji: '📋',
        gameDescription:
          'Have your support team manually query each of the 4 systems and update the tracking page by hand.',
        systemDescription:
          'Manual polling by support staff — O(n × systems) labor cost. Does not scale. Status is always hours behind.',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-800',
      },
      {
        id: 'hourly-batch',
        name: 'Sync Status Every Hour',
        emoji: '⏱️',
        gameDescription: 'Run a job every hour that checks all 4 systems and updates the tracking page.',
        systemDescription:
          'Batch status sync — reduces labor but status is always up to 60 minutes stale. Misses rapid state transitions (shipped → out for delivery → delivered).',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-300',
        textColor: 'text-amber-800',
      },
      {
        id: 'event-stream',
        name: 'Event-Driven Status Updates',
        emoji: '📡',
        gameDescription:
          'Each system publishes an event the moment status changes. The tracking page subscribes and updates instantly — no polling, no manual work.',
        systemDescription:
          'Event-driven architecture — each system emits status-change events to a shared event bus. The tracking service subscribes and updates in real time. Eliminates polling entirely.',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-300',
        textColor: 'text-emerald-800',
      },
    ],
    outcomes: {
      'manual-checks': {
        label: 'Does not scale',
        labelStyle: 'bg-red-100 text-red-800 border border-red-300',
        emoji: '📋',
        whatHappened:
          "Your support team spends all day querying 4 systems and updating tracking pages by hand. With 10,000 daily orders, they can only check 200 before the next batch is due. Status is always wrong. The support team is drowning.",
        conceptUnlocked: 'Polling Does Not Scale',
        whyItMatters:
          'Manual or programmatic polling has O(n) labor/compute cost as order volume grows. Every order requires periodic checking regardless of whether status changed.',
        pmTakeaway:
          'Operational workflows that require human intervention to keep data synchronized will not scale. Design systems to push state changes, not pull them.',
        successRate: 0.19,
        builderExplanation:
          'The team manually checks each of the 4 systems for every order. With thousands of orders, there is no way to keep up. Most status pages are wrong.',
        systemExplanation:
          'Manual polling is O(n × systems) — cost grows with both order volume and system count. Even automated polling has wasteful compute when status rarely changes.',
        isOptimal: false,
        optimalHint: 'Event-Driven updates push status changes the moment they happen — no polling needed.',
      },
      'hourly-batch': {
        label: 'Better, but always stale',
        labelStyle: 'bg-amber-100 text-amber-800 border border-amber-300',
        emoji: '⏱️',
        whatHappened:
          "Batch jobs now run every hour. Most customers get status updates eventually. But a package can go from 'Shipped' to 'Out for Delivery' to 'Delivered' in 90 minutes — and the tracking page shows 'Shipped' the whole time.",
        conceptUnlocked: 'Batch Sync Staleness',
        whyItMatters:
          "Batch synchronization can miss rapid state transitions entirely. If an order changes status twice between batch runs, the intermediate state is never recorded. The customer sees stale data regardless of how often the batch runs.",
        pmTakeaway:
          'For time-sensitive status updates like shipping and delivery, staleness is a support cost. Every hour of tracking lag generates support tickets.',
        successRate: 0.66,
        builderExplanation:
          "The machine checks all systems every hour and updates the page. It's much better than manual checks. But if a package is delivered between two batch runs, the page says 'In Transit' for another 59 minutes.",
        systemExplanation:
          'Batch sync reduces operational cost but introduces a freshness floor bounded by the batch interval. Rapid state transitions (shipped → delivered in 2 hours) can occur entirely within a single batch window and go unrecorded.',
        isOptimal: false,
        optimalHint: 'Event-driven updates publish the moment status changes — zero staleness by design.',
      },
      'event-stream': {
        label: 'Real-time tracking, zero polling',
        labelStyle: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
        emoji: '🏆',
        whatHappened:
          "The warehouse publishes 'shipped' the moment it scans the label. The carrier publishes 'out for delivery'. The tracking page updates in under 2 seconds. Support tickets about order status drop by 91%. The support team can focus on real problems.",
        conceptUnlocked: 'Event-Driven Architecture & Real-Time Status',
        whyItMatters:
          'Event-driven systems publish state changes the moment they occur. Subscribers receive updates without polling. This eliminates staleness, reduces compute waste, and makes every system an independent source of truth.',
        pmTakeaway:
          'Operational transparency is a product feature, not an afterthought. Customers who can see where their package is do not call support. Event-driven tracking is one of the highest-ROI reliability investments in e-commerce.',
        successRate: 0.97,
        builderExplanation:
          'Every system publishes an event when something changes: warehouse says "shipped", carrier says "out for delivery". The tracking page listens for these events and updates instantly — without anyone polling or checking.',
        systemExplanation:
          'An event-driven architecture (Kafka, SNS/SQS, EventBridge) decouples producers from consumers. Each system publishes domain events. The tracking service subscribes and maintains a real-time read model. Zero polling, sub-second propagation.',
        isOptimal: true,
      },
    },
  },
];
