import type { ScenarioConfig } from '../types';

export const SCENARIOS: ScenarioConfig[] = [
  // ── Scenario 2: CDN ──────────────────────────────────────────────────────
  {
    id: 2,
    title: 'Songs take forever for faraway listeners',
    questEmoji: '🗺️',
    conceptHint: 'Geographic performance',
    problemNarrative:
      "Your music machine is in your backyard. Kids nearby love it. But Felix, who lives across town, waits 10 full seconds before a song even starts. He's about to give up.",
    problemContext: 'Your server is in one place. The farther away a listener is, the longer songs take to arrive.',
    missionText: 'Get songs to faraway listeners fast — without moving your whole setup.',
    problemStats: [
      { label: 'Nearby listeners', value: 'Fast ✅' },
      { label: 'Faraway wait time', value: '10 seconds 🔴', isWarning: true },
      { label: 'Felix (East Side)', value: 'Gave up 😤', isWarning: true },
      { label: 'Distance penalty', value: 'Very High 🔴', isWarning: true },
    ],
    centralMachine: { emoji: '📡', label: 'Music Machine 2.0', status: 'Too far away!' },
    options: [
      {
        id: 'bigger-pipe',
        name: 'Faster Backyard Pipe',
        emoji: '🔌',
        gameDescription: 'Upgrade the internet connection coming into your backyard.',
        systemDescription: 'Increasing origin bandwidth — does not reduce geographic travel time for distant users.',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-300',
        textColor: 'text-amber-800',
      },
      {
        id: 'neighborhood-boxes',
        name: 'Neighborhood Music Boxes',
        emoji: '📦',
        gameDescription: 'Place small music boxes in each neighborhood that store popular songs locally.',
        systemDescription: 'Content Delivery Network (CDN) — cache content at edge nodes geographically closer to users.',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-300',
        textColor: 'text-emerald-800',
      },
      {
        id: 'compressed-songs',
        name: 'Compressed Songs',
        emoji: '🗜️',
        gameDescription: 'Shrink song files down so they travel faster through the air.',
        systemDescription: 'Data compression — reduces payload size but does not eliminate geographic latency.',
        bgColor: 'bg-sky-50',
        borderColor: 'border-sky-300',
        textColor: 'text-sky-800',
      },
    ],
    outcomes: {
      'bigger-pipe': {
        label: 'Fast pipe, still far away',
        labelStyle: 'bg-orange-100 text-orange-800 border border-orange-300',
        emoji: '🔌',
        whatHappened:
          "Your backyard connection is blazing fast — but Felix is still 8 miles away. The problem was never the pipe. It was the distance.",
        conceptUnlocked: 'Bandwidth vs. Latency',
        whyItMatters:
          'Bandwidth (how much data) and latency (how fast it travels) are different. A bigger pipe does not shorten geographic travel time.',
        pmTakeaway:
          'Understand root causes before picking solutions. Bandwidth problems and latency problems look similar but need different fixes.',
        successRate: 0.41,
        builderExplanation:
          'You made your backyard connection faster, but the kids in other neighborhoods are still waiting for songs to travel the same long distance.',
        systemExplanation:
          'Bandwidth governs throughput at origin. Geographic latency is determined by physical distance and network hops — not origin speed.',
        isOptimal: false,
        optimalHint: 'Try Neighborhood Music Boxes to put content closer to where listeners actually are.',
      },
      'neighborhood-boxes': {
        label: 'Genius geographic fix',
        labelStyle: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
        emoji: '🏆',
        whatHappened:
          "Songs are now stored in mini music boxes in every neighborhood. Felix's songs travel 2 blocks, not 8 miles. He's streaming instantly.",
        conceptUnlocked: 'Content Delivery Network (CDN)',
        whyItMatters:
          'CDNs cache content at edge nodes worldwide. By serving from a nearby location, latency drops dramatically regardless of where your origin server lives.',
        pmTakeaway:
          'Latency is invisible until it becomes a reason users churn. Building for geographic distribution early makes your product feel fast everywhere.',
        successRate: 0.95,
        builderExplanation:
          'You put copies of popular songs in every neighborhood. Now each kid grabs songs from a nearby box instead of your faraway backyard.',
        systemExplanation:
          'CDN edge nodes cache frequently-accessed content at points of presence (PoPs) near users, drastically reducing round-trip time.',
        isOptimal: true,
      },
      'compressed-songs': {
        label: 'Partial improvement',
        labelStyle: 'bg-sky-100 text-sky-800 border border-sky-300',
        emoji: '🔧',
        whatHappened:
          "Smaller files helped a little — Felix now waits 6 seconds instead of 10. But the distance is still the real problem.",
        conceptUnlocked: 'Compression vs. CDN',
        whyItMatters:
          'Compression reduces data size, which helps with bandwidth-constrained connections. But it does not address the geographic distance that causes latency.',
        pmTakeaway:
          'There are often multiple improvements to a performance problem. Understand the root cause to pick the highest-leverage fix.',
        successRate: 0.66,
        builderExplanation:
          'Smaller songs travel a bit faster, but the distance from your backyard to East Side is still the bottleneck.',
        systemExplanation:
          'Compression improves transfer efficiency but does not reduce network round-trip time caused by geographic distance.',
        isOptimal: false,
        optimalHint: 'Neighborhood Music Boxes (CDN) would solve the geographic problem directly.',
      },
    },
  },

  // ── Scenario 3: Search & Indexing ─────────────────────────────────────────
  {
    id: 3,
    title: 'Finding songs is getting painfully slow',
    questEmoji: '📚',
    conceptHint: 'Search at scale',
    problemNarrative:
      "Your music library now has 50,000 songs. When Priya asks for 'Shape of You', the machine scans every single song one by one. It takes 20 full seconds. Kids are leaving before the music starts.",
    problemContext: '50,000 songs. Every search scans every song. That means 50,000 checks per request.',
    missionText: 'Make song search fast — without rebuilding the whole machine.',
    problemStats: [
      { label: 'Songs in library', value: '50,000' },
      { label: 'Search time', value: '20 seconds 🔴', isWarning: true },
      { label: 'Scans per search', value: '50,000', isWarning: true },
      { label: 'Kids who gave up', value: 'Most of them 😤', isWarning: true },
    ],
    centralMachine: { emoji: '📚', label: 'Music Library', status: 'Scanning... forever' },
    options: [
      {
        id: 'keep-scanning',
        name: 'Keep Scanning',
        emoji: '🔍',
        gameDescription: 'Look through every song one by one until you find the right one.',
        systemDescription: 'Full table scan — O(n) complexity. Search time grows linearly with library size.',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-800',
      },
      {
        id: 'az-catalog',
        name: 'A-Z Song Catalog',
        emoji: '📖',
        gameDescription: 'Build an alphabetical catalog with dividers so you can jump to the right section fast.',
        systemDescription: 'B-tree index — O(log n) lookup. Great for sorted data, exact matches, and range queries.',
        bgColor: 'bg-sky-50',
        borderColor: 'border-sky-300',
        textColor: 'text-sky-800',
      },
      {
        id: 'word-spotter',
        name: 'Word Spotter Bot',
        emoji: '🤖',
        gameDescription: 'Build a robot that memorizes every word in every title and maps it instantly back to its song.',
        systemDescription: 'Inverted index — maps terms to documents. Powers full-text search in Elasticsearch, Spotify, and Google.',
        bgColor: 'bg-violet-50',
        borderColor: 'border-violet-300',
        textColor: 'text-violet-800',
      },
    ],
    outcomes: {
      'keep-scanning': {
        label: 'Search still broken',
        labelStyle: 'bg-red-100 text-red-800 border border-red-300',
        emoji: '😬',
        whatHappened:
          'Nothing changed. The machine still scans all 50,000 songs every time. As the library grows, it only gets worse.',
        conceptUnlocked: 'Unindexed Search (O(n))',
        whyItMatters:
          'Linear search degrades proportionally with data size. At 500,000 songs it takes 200 seconds. At 5 million songs, it takes over 30 minutes.',
        pmTakeaway:
          'Performance problems compound silently. By the time users complain, you have already lost them.',
        successRate: 0.17,
        builderExplanation:
          'The machine still checks every single song one by one. The bigger your library gets, the slower and more painful it becomes.',
        systemExplanation:
          'Full table scans have O(n) time complexity — search time grows linearly with data volume.',
        isOptimal: false,
        optimalHint: 'Try the Word Spotter Bot for instant full-text search.',
      },
      'az-catalog': {
        label: 'Solid improvement',
        labelStyle: 'bg-sky-100 text-sky-800 border border-sky-300',
        emoji: '📖',
        whatHappened:
          "Exact searches are now fast — finding 'Shape of You' by Ed Sheeran jumps straight to S. But partial searches and typos are still slow.",
        conceptUnlocked: 'Database Indexing (B-tree)',
        whyItMatters:
          'B-tree indexes speed up exact lookups and range queries dramatically. They are the backbone of every relational database.',
        pmTakeaway:
          'The right data structure depends on the queries your users actually make. Know your query patterns before picking your index.',
        successRate: 0.81,
        builderExplanation:
          'The catalog jumps you to the right section fast when you know the exact name — but typing "rainy guitar" still returns nothing.',
        systemExplanation:
          'B-tree indexes reduce lookup time from O(n) to O(log n) for sorted-key queries but do not support full-text or fuzzy search.',
        isOptimal: false,
        optimalHint: 'The Word Spotter Bot supports full-text search — including partial and keyword matches.',
      },
      'word-spotter': {
        label: 'Blazing fast search',
        labelStyle: 'bg-violet-100 text-violet-800 border border-violet-300',
        emoji: '🏆',
        whatHappened:
          "Priya types 'rainy guitar' and gets matching songs in under 100ms. The Word Spotter knows every word in every song title.",
        conceptUnlocked: 'Inverted Index / Full-Text Search',
        whyItMatters:
          'Inverted indexes store word-to-document mappings, enabling instant full-text search regardless of library size. Elasticsearch and Spotify search both use this pattern.',
        pmTakeaway:
          'Search is often the highest-value feature for content-heavy products. Invest in it early and design for how users actually type.',
        successRate: 0.97,
        builderExplanation:
          'The Word Spotter has memorized every word in every song. Type anything and it instantly knows exactly which songs match.',
        systemExplanation:
          'An inverted index maps each term to its containing documents, enabling O(1) term lookups and supporting fuzzy, keyword, and phrase queries.',
        isOptimal: true,
      },
    },
  },

  // ── Scenario 4: Data Modeling ─────────────────────────────────────────────
  {
    id: 4,
    title: 'Everyone is making playlists and your system is losing data',
    questEmoji: '📝',
    conceptHint: 'Data storage design',
    problemNarrative:
      "10,000 kids have built personal playlists. Maya's 'Homework Vibes' has 200 songs in a specific order. But your system keeps mixing up playlists, losing songs, and saving broken data.",
    problemContext: '10,000 playlists. Each looks different. Your storage has no idea how to handle them.',
    missionText: 'Choose the right way to store everyone\'s personal playlist data.',
    problemStats: [
      { label: 'Active playlists', value: '10,000' },
      { label: 'Data corruption', value: '22% 🔴', isWarning: true },
      { label: 'Lost playlist saves', value: 'Rising ↑', isWarning: true },
      { label: 'Songs misplaced', value: 'Thousands 😤', isWarning: true },
    ],
    centralMachine: { emoji: '📝', label: 'Playlist Storage', status: 'Losing data!' },
    options: [
      {
        id: 'sticky-notes',
        name: 'Sticky Note Pile',
        emoji: '📄',
        gameDescription: 'Dump everything into one big file — organized however feels natural.',
        systemDescription: 'Flat file storage — no schema, no query language, no indexing. Does not scale past toy usage.',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-800',
      },
      {
        id: 'filing-cabinet',
        name: 'Filing Cabinet',
        emoji: '🗂️',
        gameDescription: 'Store playlists in strict rows and columns with fixed headers — like a perfectly organized spreadsheet.',
        systemDescription: 'Relational database (SQL) — enforces schema, supports joins and complex queries, great for structured relationships.',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-300',
        textColor: 'text-amber-800',
      },
      {
        id: 'personal-notebooks',
        name: 'Personal Notebooks',
        emoji: '📓',
        gameDescription: "Give each kid their own flexible notebook — each notebook can look completely different inside.",
        systemDescription: 'Document database (NoSQL) — flexible schema, stores JSON-like documents, ideal for variable-structure user-generated content.',
        bgColor: 'bg-violet-50',
        borderColor: 'border-violet-300',
        textColor: 'text-violet-800',
      },
    ],
    outcomes: {
      'sticky-notes': {
        label: 'Total chaos',
        labelStyle: 'bg-red-100 text-red-800 border border-red-300',
        emoji: '🔥',
        whatHappened:
          "Songs are saved in random order. Playlists overwrite each other. Maya's 200-song playlist is gone. Data corruption is everywhere.",
        conceptUnlocked: 'Why Structure Matters',
        whyItMatters:
          'Without data structure, you cannot query, index, or reliably retrieve records. This is not a storage problem — it is an architecture problem.',
        pmTakeaway:
          'Structure is not bureaucracy. It is what makes your data useful, queryable, and trustworthy.',
        successRate: 0.13,
        builderExplanation:
          'Everything is just dumped into a pile. Finding a specific playlist means digging through everything — and half of it is garbled.',
        systemExplanation:
          'Flat file storage with no schema offers no way to enforce structure, query specific records, or prevent data collisions at scale.',
        isOptimal: false,
        optimalHint: 'Try Personal Notebooks (document store) — flexible enough for playlists, structured enough to be reliable.',
      },
      'filing-cabinet': {
        label: 'Structured but rigid',
        labelStyle: 'bg-amber-100 text-amber-800 border border-amber-300',
        emoji: '🗂️',
        whatHappened:
          "Playlists are saved reliably and queries are fast. But when you want to add 'playlist cover image' as a field, you have to rebuild every existing record.",
        conceptUnlocked: 'Relational Database',
        whyItMatters:
          'SQL databases enforce schema and support powerful joins and queries. They shine for structured, relationship-heavy data — but schema migrations slow you down as requirements change.',
        pmTakeaway:
          'Relational databases are powerful but rigid. For user-generated content that evolves, you pay a tax every time product requirements change.',
        successRate: 0.78,
        builderExplanation:
          'The filing cabinet keeps playlists safe and organized. But every time you want to add a new field, you have to reorganize the whole cabinet.',
        systemExplanation:
          'Relational databases enforce schema-on-write, meaning adding columns requires migrations and schema changes — costly in fast-moving products.',
        isOptimal: false,
        optimalHint: 'Personal Notebooks (document store) handle variable-structure playlist data with more flexibility.',
      },
      'personal-notebooks': {
        label: 'Flexible and fast',
        labelStyle: 'bg-violet-100 text-violet-800 border border-violet-300',
        emoji: '🏆',
        whatHappened:
          "Each kid's playlist is stored as its own flexible document. Maya's notebook has 200 songs in perfect order. Adding a cover image field takes one line of code.",
        conceptUnlocked: 'Document Database (NoSQL)',
        whyItMatters:
          "Document databases store data as flexible JSON-like documents. Each document can have a different shape — perfect for playlists, profiles, and any user-generated content.",
        pmTakeaway:
          'Data model choices should follow your query patterns and how often the schema changes. For fast-moving products with varied content, document stores often fit better than rigid tables.',
        successRate: 0.93,
        builderExplanation:
          "Each kid's notebook is totally theirs. Maya's 200 songs stay in perfect order. New fields appear in seconds. No more lost playlists.",
        systemExplanation:
          'Document databases like MongoDB store schema-flexible JSON documents, enabling rapid iteration without costly migrations.',
        isOptimal: true,
      },
    },
  },

  // ── Scenario 5: Traffic Spikes ────────────────────────────────────────────
  {
    id: 5,
    title: 'Mega Star Molly just dropped a surprise album at midnight',
    questEmoji: '🎤',
    conceptHint: 'Handling traffic spikes',
    problemNarrative:
      "At 12:00 AM, Mega Star Molly drops 'Neon Dreams.' At 12:00:01 AM, 800 kids all try to play it at the exact same moment. Your servers crash in 3 seconds flat.",
    problemContext: 'Normal load: 40 req/sec. Midnight spike: 800 req/sec. Difference: 20x. Duration of the spike: forever.',
    missionText: 'Design a system that handles massive simultaneous spikes without crashing.',
    problemStats: [
      { label: 'Normal load', value: '40 req/sec' },
      { label: 'Midnight spike', value: '800 req/sec 🔴', isWarning: true },
      { label: 'Time to crash', value: '3 seconds 🔴', isWarning: true },
      { label: 'Kids turned away', value: '800 😤', isWarning: true },
    ],
    centralMachine: { emoji: '💥', label: 'Music Server', status: 'CRASHED' },
    options: [
      {
        id: 'bigger-servers',
        name: 'Bigger Servers',
        emoji: '💪',
        gameDescription: 'Buy the most powerful machines money can buy before the big night.',
        systemDescription: 'Reactive vertical scaling — expensive, slow to provision, and still has a ceiling at extreme load.',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-300',
        textColor: 'text-amber-800',
      },
      {
        id: 'ticket-queue',
        name: 'Ticket Line Queue',
        emoji: '🎟️',
        gameDescription: 'Give every kid a numbered ticket. Process them in order — only accept a controlled flow at a time.',
        systemDescription: 'Message queue — decouples request intake from processing, absorbs spikes gracefully with backpressure.',
        bgColor: 'bg-sky-50',
        borderColor: 'border-sky-300',
        textColor: 'text-sky-800',
      },
      {
        id: 'preload-album',
        name: 'Pre-load the Album',
        emoji: '📼',
        gameDescription: "Before midnight, copy Neon Dreams to every neighborhood music box so it's already there when kids ask.",
        systemDescription: "Predictive caching — warm the CDN cache before a known demand event, eliminating the spike at origin entirely.",
        bgColor: 'bg-violet-50',
        borderColor: 'border-violet-300',
        textColor: 'text-violet-800',
      },
    ],
    outcomes: {
      'bigger-servers': {
        label: 'Still crashes, just slower',
        labelStyle: 'bg-amber-100 text-amber-800 border border-amber-300',
        emoji: '💪',
        whatHappened:
          "Your fancy servers handled the first 200 kids fine. Then they hit the same wall. 600 kids still got errors. You spent a lot of money on a partial fix.",
        conceptUnlocked: 'Limits of Vertical Scaling',
        whyItMatters:
          'Every server has a ceiling. If your traffic can 20x in a second, no single machine — no matter how powerful — is the right defense.',
        pmTakeaway:
          'Throwing hardware at spikes is expensive and reactive. Architectural solutions (queues, caches) are cheaper and more reliable.',
        successRate: 0.51,
        builderExplanation:
          'The new machines are powerful — but 800 kids at once is still too many. You delayed the crash by a few seconds.',
        systemExplanation:
          'Vertical scaling improves capacity but hits hard physical limits under extreme burst traffic. It also requires downtime to provision.',
        isOptimal: false,
        optimalHint: 'Pre-loading the album to CDN before midnight would eliminate the origin spike entirely.',
      },
      'ticket-queue': {
        label: 'Slow but no crashes',
        labelStyle: 'bg-sky-100 text-sky-800 border border-sky-300',
        emoji: '🎟️',
        whatHappened:
          "No crashes! Kids wait in a virtual line — most get in within 30 seconds. The server processes at a steady rate. Some kids complained about the wait.",
        conceptUnlocked: 'Message Queue / Backpressure',
        whyItMatters:
          'Queues decouple ingestion from processing. Instead of crashing under load, you absorb excess requests and process them as fast as the system can handle.',
        pmTakeaway:
          'Graceful degradation beats crashing. A 30-second wait with a clear message is far better than a confusing error page.',
        successRate: 0.84,
        builderExplanation:
          'Kids take a ticket and wait their turn. The machine never gets overwhelmed — it just works through the line steadily.',
        systemExplanation:
          'Message queues (like SQS, RabbitMQ, Kafka) buffer incoming requests, enabling producers and consumers to operate at different rates.',
        isOptimal: false,
        optimalHint: 'Pre-loading the album cache before midnight would give zero wait time to all 800 kids simultaneously.',
      },
      'preload-album': {
        label: 'Zero wait time for everyone',
        labelStyle: 'bg-violet-100 text-violet-800 border border-violet-300',
        emoji: '🏆',
        whatHappened:
          "At midnight, every kid's neighborhood music box already has Neon Dreams. The main server never even saw the spike. 800 kids streamed instantly.",
        conceptUnlocked: 'Predictive Caching',
        whyItMatters:
          "When you can predict demand spikes — album drops, sales, sports finals — warming the cache beforehand eliminates the problem before it starts.",
        pmTakeaway:
          'The best incident is the one that never happens. Build relationships with teams that can predict load events, and turn them into engineering tasks.',
        successRate: 0.98,
        builderExplanation:
          "You copied Neon Dreams to every neighborhood music box before midnight. At 12:00 AM, every kid already had it waiting. No wait, no crash.",
        systemExplanation:
          'Predictive cache warming pre-populates CDN edge nodes before a known traffic event, serving requests from cache without touching the origin server.',
        isOptimal: true,
      },
    },
  },

  // ── Scenario 6: Recommendations ───────────────────────────────────────────
  {
    id: 6,
    title: 'Can your machine recommend what to play next?',
    questEmoji: '🎯',
    conceptHint: 'Data pipelines & personalization',
    problemNarrative:
      "Kids finish a song and stare at 50,000 options. 48% of them just close the app. They want your machine to say 'here's what you'd love next' — but your machine can't read minds. Yet.",
    problemContext: 'No listening history is being collected. No patterns are being analyzed. Every kid gets the same generic experience.',
    missionText: 'Build a system that learns what kids like and suggests their next song.',
    problemStats: [
      { label: 'User churn after song', value: '48% 🔴', isWarning: true },
      { label: 'Songs in library', value: '50,000' },
      { label: 'Listening history', value: 'Not collected 🔴', isWarning: true },
      { label: 'Personalization', value: 'None', isWarning: true },
    ],
    centralMachine: { emoji: '🤷', label: 'Recommendation Engine', status: 'No idea what to suggest' },
    options: [
      {
        id: 'random-shuffle',
        name: 'Random Next Song',
        emoji: '🎲',
        gameDescription: 'When a song ends, pick a random one from the library.',
        systemDescription: 'No personalization — treats all users identically. Requires no data collection or infrastructure.',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-800',
      },
      {
        id: 'popularity-chart',
        name: 'Popularity Chart',
        emoji: '📊',
        gameDescription: 'Always suggest whatever everyone else is listening to the most right now.',
        systemDescription: 'Popularity-based ranking — simple aggregation of play counts. Ignores individual taste and creates rich-get-richer dynamics.',
        bgColor: 'bg-sky-50',
        borderColor: 'border-sky-300',
        textColor: 'text-sky-800',
      },
      {
        id: 'listening-diary',
        name: 'Listening Diary + Pattern Bot',
        emoji: '🤖',
        gameDescription: "Log every song every kid plays. Then use a pattern-spotting robot to find what similar kids liked next.",
        systemDescription: 'Event stream → data pipeline → collaborative filtering model → personalized recommendations API.',
        bgColor: 'bg-violet-50',
        borderColor: 'border-violet-300',
        textColor: 'text-violet-800',
      },
    ],
    outcomes: {
      'random-shuffle': {
        label: 'No personalization',
        labelStyle: 'bg-red-100 text-red-800 border border-red-300',
        emoji: '🎲',
        whatHappened:
          "Songs are random and irrelevant. Kids who like jazz get death metal. Churn actually went up. The random approach made the experience worse than no recommendations at all.",
        conceptUnlocked: 'Why Personalization Requires Data',
        whyItMatters:
          'You cannot recommend without signals. Random is not neutral — it actively harms trust when it misses badly.',
        pmTakeaway:
          'Do not ship a "recommendations" feature without data infrastructure behind it. A bad recommendation is worse than no recommendation.',
        successRate: 0.26,
        builderExplanation:
          'The machine picks randomly and keeps getting it wrong. Kids who love pop keep getting classical. Trust drops fast.',
        systemExplanation:
          'Without behavioral data collection, no personalization algorithm can function. Randomness introduces noise that degrades UX.',
        isOptimal: false,
        optimalHint: 'The Listening Diary + Pattern Bot collects behavioral signals and learns individual preferences over time.',
      },
      'popularity-chart': {
        label: 'Better than random',
        labelStyle: 'bg-sky-100 text-sky-800 border border-sky-300',
        emoji: '📊',
        whatHappened:
          "Popular songs play often. Most kids hear something decent. But the same 10 songs loop forever, new artists never get discovered, and power users are bored.",
        conceptUnlocked: 'Popularity Bias in Recommendations',
        whyItMatters:
          'Popularity metrics are easy to compute but create a rich-get-richer feedback loop. They optimize for the average user at the expense of everyone else.',
        pmTakeaway:
          'Easy-to-measure proxies (plays, likes) can mislead your algorithm. Define what good looks like for individual users, not just the aggregate.',
        successRate: 0.61,
        builderExplanation:
          'The chart tells everyone to listen to the same top 10 songs. Kids who like niche music feel ignored. The same songs get played forever.',
        systemExplanation:
          'Popularity-based systems use global aggregates (play counts) as a proxy for relevance, ignoring user-level behavioral signals.',
        isOptimal: false,
        optimalHint: 'The Listening Diary builds a per-user profile and can recommend across the long tail of content.',
      },
      'listening-diary': {
        label: 'Personalization flywheel',
        labelStyle: 'bg-violet-100 text-violet-800 border border-violet-300',
        emoji: '🏆',
        whatHappened:
          "Songs feel personal. Kids who love indie folk get indie folk. Power users discover artists they've never heard of. Session time tripled. The more kids use it, the smarter it gets.",
        conceptUnlocked: 'Data Pipeline + Collaborative Filtering',
        whyItMatters:
          'Recommendations require four things: event collection, data storage, model processing, and a serving layer. Each is a distinct engineering problem — and together they create a personalization flywheel.',
        pmTakeaway:
          'Personalization is a flywheel: more users → more data → better recommendations → more engagement → more users. Start collecting the right signals early.',
        successRate: 0.94,
        builderExplanation:
          "The diary logs every song every kid plays. The Pattern Bot finds what similar kids liked. Each listen teaches the machine more about what each kid loves.",
        systemExplanation:
          'The pipeline: event stream → data warehouse → collaborative filtering model (users who liked X also liked Y) → low-latency recommendations API.',
        isOptimal: true,
      },
    },
  },
];
