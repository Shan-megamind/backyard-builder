import type { ScenarioConfig } from '../types';

export const PHOTO_SOCIAL_INTRO_LINES = [
  { emoji: '📸', text: 'Today you decided to build Instagram in your backyard.' },
  { emoji: '🖼️', text: 'You set up Instagram 1.0 — users can follow each other and post photos.' },
  { emoji: '👧', text: "Alex opens the app after her best friends posted all morning." },
  { emoji: '😶', text: 'Her feed is completely empty. She refreshes three times. Nothing.' },
  { emoji: '😤', text: '"This thing is broken." She closes the app and tells her friends.' },
  { emoji: '🔧', text: 'Time to fix Photo Machine before you lose everyone on day one.' },
];

export const PHOTO_SOCIAL_SCENARIOS: ScenarioConfig[] = [
  // ── Scenario 1: Feed Delivery ──────────────────────────────────────────────
  {
    id: 1,
    title: "Why is my feed empty?",
    questEmoji: '📱',
    conceptHint: 'Feed delivery strategy',
    problemNarrative:
      "Alex follows 12 people. They've all posted photos this morning. But when she opens the app, her feed is blank. She refreshes. Still nothing. She's about to delete the app.",
    problemContext:
      'Your system stores posts but has no strategy for delivering them to followers. When Alex opens her feed, nothing shows up — even though the people she follows have posted.',
    missionText: 'Make sure followers see posts from people they follow when they open the app.',
    problemStats: [
      { label: 'Friends who posted today', value: '12 people ✅' },
      { label: "Alex's feed on open", value: 'Empty 🔴', isWarning: true },
      { label: 'App opens → closes (no content)', value: '73% 🔴', isWarning: true },
      { label: '7-day retention', value: '22% 🔴', isWarning: true },
    ],
    centralMachine: { emoji: '📱', label: 'Feed Machine 1.0', status: 'Empty feeds!' },
    options: [
      {
        id: 'global-feed',
        name: 'Show Global Recent Posts',
        emoji: '🌍',
        gameDescription: "Show the most recent posts from everyone on the platform, not just who you follow.",
        systemDescription:
          "Global timeline — ignores the follow graph entirely. Users see strangers' content instead of their social circle.",
        bgColor: 'bg-red-50',
        borderColor: 'border-red-300',
        textColor: 'text-red-800',
      },
      {
        id: 'fan-out-write',
        name: 'Push Posts to Follower Feeds',
        emoji: '📬',
        gameDescription: "When someone posts, immediately deliver it to every follower's pre-built feed list.",
        systemDescription:
          'Fan-out on write — each post is pushed to follower feed lists at write time. Read is instant because the work was already done.',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-300',
        textColor: 'text-emerald-800',
      },
      {
        id: 'fan-out-read',
        name: 'Build Feed on Demand',
        emoji: '🔍',
        gameDescription: "When a user opens the app, look up everyone they follow and gather recent posts in real time.",
        systemDescription:
          'Fan-out on read — feed is computed at read time by fetching posts from all followed accounts. Scales poorly with follow count.',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-300',
        textColor: 'text-amber-800',
      },
    ],
    outcomes: {
      'global-feed': {
        label: 'Wrong people, instant feed',
        labelStyle: 'bg-red-100 text-red-800 border border-red-300',
        emoji: '🌍',
        whatHappened:
          "Alex gets a feed instantly — but it's full of posts from strangers. She can't find any of her friends' content. Technically fast, completely useless.",
        conceptUnlocked: 'Feed Modeling',
        whyItMatters:
          "A fast feed of irrelevant content is worse than a slow feed. Feed design isn't just about speed — it's about modeling the social graph correctly.",
        pmTakeaway:
          'Feed relevance is a product requirement, not a nice-to-have. Getting the wrong content to users quickly still destroys retention.',
        successRate: 0.18,
        builderExplanation:
          "You showed all recent photos to everyone — but Alex wanted to see her friends' stuff, not strangers. The feed is full but completely wrong.",
        systemExplanation:
          'Global timeline ignores the follow graph. No social graph means no personalization — every user gets the same stream regardless of who they follow.',
        isOptimal: false,
        optimalHint: 'Try "Push Posts to Follower Feeds" — the feed should be built around who you follow, not everyone on the platform.',
      },
      'fan-out-write': {
        label: 'Instant, relevant feed',
        labelStyle: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
        emoji: '🏆',
        whatHappened:
          "When any of Alex's friends posts, it's instantly delivered to her pre-built feed list. She opens the app and her feed loads in milliseconds — 12 friends' photos, in order, no lag.",
        conceptUnlocked: 'Fan-out on Write',
        whyItMatters:
          'Fan-out on write pre-computes feed lists at post time so reads are instant. This is how Instagram, Twitter, and most social feeds work at scale.',
        pmTakeaway:
          'Feed read speed directly affects daily active users. Pre-computing feeds at write time trades write cost for near-zero read latency — the right trade for social platforms.',
        successRate: 0.97,
        builderExplanation:
          "When a friend posts, their photo is immediately added to every follower's personal feed list. Alex's feed is always ready to read — no waiting.",
        systemExplanation:
          'Fan-out on write: on each post, write to all follower feed lists. Read is O(1) — just fetch the pre-built list. Write amplification is acceptable for follower counts under ~10K.',
        isOptimal: true,
      },
      'fan-out-read': {
        label: 'Slow feed, high load',
        labelStyle: 'bg-amber-100 text-amber-800 border border-amber-300',
        emoji: '⏳',
        whatHappened:
          'When Alex opens the app, the system queries all 12 accounts she follows, fetches their recent posts, merges and sorts them. It takes 4 seconds. Users with 300+ followers wait even longer.',
        conceptUnlocked: 'Fan-out on Read',
        whyItMatters:
          'Fan-out on read delays the work until someone requests the feed. Correct content, but read latency grows with follow count — following 500 people means 500× the load.',
        pmTakeaway:
          'Read latency that scales with follow count hits power users hardest — exactly the users you most want to retain.',
        successRate: 0.52,
        builderExplanation:
          "Every time Alex opens the app, you look through all 12 friends' recent posts and stitch them together. It works but takes seconds, and gets worse as follow counts grow.",
        systemExplanation:
          'Fan-out on read: at read time, query each followed account for recent posts. Merge and sort. Read latency = O(following_count × posts). Unacceptable at scale.',
        isOptimal: false,
        optimalHint: 'Fan-out on write pre-computes the feed when a post is created — reads become instant regardless of follow count.',
      },
    },
  },

  // ── Scenario 2: Photo Storage & CDN ────────────────────────────────────────
  {
    id: 2,
    title: 'Photos take forever to load',
    questEmoji: '🖼️',
    conceptHint: 'Media storage & delivery',
    problemNarrative:
      "Users scroll their feed and photos load one agonizing second at a time. Some never fully load — just a grey placeholder. Half your users never make it past the first 3 posts before giving up and closing the app.",
    problemContext:
      'Photos are stored on and served from your main app server. Every image download competes with everything else your server does — and users far away wait even longer.',
    missionText: 'Make photos load fast for every user, everywhere, without overloading your app.',
    problemStats: [
      { label: 'Avg photo load time', value: '8.2s 🔴', isWarning: true },
      { label: 'Users who scrolled past 3 posts', value: '31% 🔴', isWarning: true },
      { label: '"Feed is too slow" complaints', value: '67% 🔴', isWarning: true },
      { label: 'Session length (trend)', value: '−44% 🔴', isWarning: true },
    ],
    centralMachine: { emoji: '🖼️', label: 'Photo Server 1.0', status: 'Overloaded!' },
    options: [
      {
        id: 'object-cdn',
        name: 'Serve Images from Closer Locations',
        emoji: '🌐',
        gameDescription: 'Store photos in a dedicated photo library, then send them from the nearest mini-server to each user — wherever they are.',
        systemDescription:
          'Object storage (S3-style) decouples media from app servers. CDN caches photos at edge nodes globally — reads never hit your origin.',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-300',
        textColor: 'text-emerald-800',
      },
      {
        id: 'bigger-server',
        name: 'Make Server Stronger',
        emoji: '💪',
        gameDescription: 'Upgrade to a more powerful server with more storage, more RAM, and faster connections.',
        systemDescription:
          'Vertical scaling — increases capacity but photo reads still compete with app logic. Geographic distance problem remains.',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-300',
        textColor: 'text-amber-800',
      },
      {
        id: 'compress-photos',
        name: 'Use Smaller Image Files',
        emoji: '🗜️',
        gameDescription: 'Automatically shrink and compress every photo on upload so they transfer to users faster.',
        systemDescription:
          'Lossy compression reduces file size but degrades photo quality — central to a photo-sharing product. Helps bandwidth, not origin overload.',
        bgColor: 'bg-sky-50',
        borderColor: 'border-sky-300',
        textColor: 'text-sky-800',
      },
    ],
    outcomes: {
      'object-cdn': {
        label: 'Photos fly — everywhere',
        labelStyle: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
        emoji: '🏆',
        whatHappened:
          "Photos now load in under 200ms for users everywhere. Your main server never touches a photo again. Scroll feels instant — users are making it to the 10th post and beyond.",
        conceptUnlocked: 'Object Storage & CDN',
        whyItMatters:
          'Separating photo storage from your app server is foundational. A CDN puts copies of your photos near every user — no matter where they are in the world.',
        pmTakeaway:
          'Photo load speed is the product. On a photo platform, slow images = users leave. Serving from nearby locations is the only approach that solves both speed and scale at the same time.',
        successRate: 0.96,
        builderExplanation:
          "Photos live in a dedicated photo library, and a network of mini-servers caches them close to every user. Your main machine never deals with photo delivery again.",
        systemExplanation:
          'Object storage (S3/GCS) handles durability and access. CDN edges cache content geographically — reads never reach origin. Write path: upload → origin. Read path: nearest CDN edge.',
        isOptimal: true,
      },
      'bigger-server': {
        label: 'Faster nearby, same everywhere else',
        labelStyle: 'bg-amber-100 text-amber-800 border border-amber-300',
        emoji: '💪',
        whatHappened:
          "Photos load a bit faster for users nearby. But users across town still wait. During busy times, the server still slows to a crawl — photo loads compete with everything else your app does.",
        conceptUnlocked: 'Vertical Scaling Limits',
        whyItMatters:
          "A stronger server helps, but the real problem is that photos and app requests are fighting for the same machine. And no matter how powerful the server, distant users still wait.",
        pmTakeaway:
          'Upgrading your server buys time, not a solution. Geographic distance and resource contention are architectural problems — more power alone cannot fix them.',
        successRate: 0.44,
        builderExplanation:
          'You made the server bigger — photos load a bit faster nearby, but faraway users still wait and busy times slow everything down.',
        systemExplanation:
          'Vertical scaling increases capacity at origin. Does not address geographic latency, CPU contention between app logic and media delivery, or cost per GB served.',
        isOptimal: false,
        optimalHint: 'Serving from nearby locations removes photo delivery from your app entirely — and gets images to users from wherever they are.',
      },
      'compress-photos': {
        label: 'Faster loads, ugly photos',
        labelStyle: 'bg-sky-100 text-sky-800 border border-sky-300',
        emoji: '🗜️',
        whatHappened:
          "Photos load 40% faster. But they look blurry and washed out. Users start complaining that photos look bad. On a platform built around sharing beautiful photos, this is a dealbreaker.",
        conceptUnlocked: 'Quality vs Performance Trade-offs',
        whyItMatters:
          "You sped up the load — but destroyed the reason people use the app. On a photo product, image quality is not optional.",
        pmTakeaway:
          "Before making a performance trade-off, ask: what is non-negotiable? Photo quality is the product. Anything that degrades it is not a win, no matter how fast it loads.",
        successRate: 0.31,
        builderExplanation:
          "Photos arrive faster, but everyone notices they look blurry. On a platform built around sharing beautiful photos, this is the wrong trade.",
        systemExplanation:
          'Lossy compression reduces transfer size and time. For media products, quality degradation has direct product impact — compression ratios must balance quality with file size.',
        isOptimal: false,
        optimalHint: 'Serving from nearby locations gives you full-quality, fast photos — you never have to choose between quality and speed.',
      },
    },
  },

  // ── Scenario 3: Feed Ranking ────────────────────────────────────────────────
  {
    id: 3,
    title: 'Everyone is unfollowing the heavy posters',
    questEmoji: '📋',
    conceptHint: 'Feed ranking & personalization',
    problemNarrative:
      "Three power users post 40 times a day. Their content floods everyone's feeds. Quieter users who post twice a week get buried. Session length is dropping and people say the feed feels exhausting.",
    problemContext:
      'Your feed is chronological — newest posts first. High-volume posters dominate. Users get the same experience regardless of what they personally engage with.',
    missionText: "Make the feed feel relevant to each user's interests, not dominated by whoever posts most.",
    problemStats: [
      { label: 'Top 3 posters share of feed', value: '71% 🔴', isWarning: true },
      { label: 'Avg session duration (trend)', value: '−38% 🔴', isWarning: true },
      { label: 'Unfollow rate (power users)', value: '22%/week 🔴', isWarning: true },
      { label: 'Users reporting "feed is boring"', value: '61% 🔴', isWarning: true },
    ],
    centralMachine: { emoji: '📋', label: 'Feed Ranker 1.0', status: 'Chronological only!' },
    options: [
      {
        id: 'chronological',
        name: 'Keep Chronological Order',
        emoji: '🕐',
        gameDescription: 'Show posts from newest to oldest. Simple, transparent, and predictable.',
        systemDescription:
          'Reverse-chronological feed — no ranking algorithm, no personalization. High-frequency posters dominate by volume.',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-300',
        textColor: 'text-amber-800',
      },
      {
        id: 'popularity-sort',
        name: 'Sort by Global Popularity',
        emoji: '🔥',
        gameDescription: 'Show the posts with the most likes and comments first, for all users.',
        systemDescription:
          'Global engagement ranking — shows most-liked content platform-wide. Same ranked feed for everyone, not personalized.',
        bgColor: 'bg-sky-50',
        borderColor: 'border-sky-300',
        textColor: 'text-sky-800',
      },
      {
        id: 'relevance-rank',
        name: 'Personal Relevance Ranking',
        emoji: '🤖',
        gameDescription: "Rank each user's feed based on their personal engagement history — what they like, comment on, and linger over.",
        systemDescription:
          'Personalized ranking — scores each post per-user using engagement signals (likes, shares, watch time, comment history). Feed is unique per user.',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-300',
        textColor: 'text-emerald-800',
      },
    ],
    outcomes: {
      'chronological': {
        label: 'Fair but overwhelming',
        labelStyle: 'bg-amber-100 text-amber-800 border border-amber-300',
        emoji: '🕐',
        whatHappened:
          "The feed stays chronological. Power users still dominate. Session lengths keep dropping. Users appreciate the transparency but the quality problem is unsolved.",
        conceptUnlocked: 'Chronological Feed',
        whyItMatters:
          "Chronological feeds are transparent and fair to all posters. But they can't filter signal from noise — high-volume posters crowd out lower-frequency creators regardless of quality.",
        pmTakeaway:
          'Chronological ordering is a principled choice, but it scales poorly when creator activity is uneven. Understand your posting distribution before deciding.',
        successRate: 0.41,
        builderExplanation:
          "You kept showing photos from newest to oldest. Everyone is treated equally, but the people who post the most still take up most of the feed.",
        systemExplanation:
          'Reverse-chronological: O(1) sort by timestamp. No ranking model, no personalization. Posts ordered purely by creation time.',
        isOptimal: false,
        optimalHint: 'Personal relevance ranking shows each user what they personally care about — not what was posted most recently.',
      },
      'popularity-sort': {
        label: 'Popular feed, same for everyone',
        labelStyle: 'bg-sky-100 text-sky-800 border border-sky-300',
        emoji: '🔥',
        whatHappened:
          "Everyone now sees the same 20 viral posts. It's engaging for a few days, then users realize the feed doesn't reflect who they follow. Niche creators feel invisible.",
        conceptUnlocked: 'Global Popularity Ranking',
        whyItMatters:
          "Global popularity ranking solves the dominance problem but replaces it with monoculture — everyone sees the same content. A social network lives on personal connections, not universal virality.",
        pmTakeaway:
          'Trending feeds work for discovery, not for the main social feed. Optimizing for global engagement destroys the personal identity of a social platform.',
        successRate: 0.37,
        builderExplanation:
          "You started showing the most-liked photos first. The feed looks better, but everyone sees the same posts — your friends' photos get buried unless they go viral.",
        systemExplanation:
          'Global popularity rank: sort by aggregate engagement score across all users. No user-specific signal. Creates a rich-get-richer dynamic where viral posts dominate.',
        isOptimal: false,
        optimalHint: "Personal relevance ranking uses each individual's engagement history to score posts differently per user.",
      },
      'relevance-rank': {
        label: 'Feed feels personal',
        labelStyle: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
        emoji: '🏆',
        whatHappened:
          "Each user's feed is ranked based on their personal engagement history. Alex sees her close friends first; the casual acquaintances who post 40 times a day get deprioritized. Session time goes up 60%.",
        conceptUnlocked: 'Feed Ranking Algorithm',
        whyItMatters:
          "Personalized ranking is the core product decision that separates good social feeds from great ones. It turns a commodity feature into a retention engine.",
        pmTakeaway:
          'Feed ranking is one of the highest-ROI investments a social platform can make. Small improvements to ranking accuracy directly improve DAU and session length.',
        successRate: 0.91,
        builderExplanation:
          "Now each user's feed is sorted based on what they personally liked, commented on, and lingered over. Close friends appear first; people you barely interact with get pushed down.",
        systemExplanation:
          'Personalized ranking: per-user engagement features (CTR, like probability, watch time) scored against a ranking model. Each request produces a unique ranked list.',
        isOptimal: true,
      },
    },
  },

  // ── Scenario 4: Notifications ───────────────────────────────────────────────
  {
    id: 4,
    title: 'Nobody knows when they get a like',
    questEmoji: '🔔',
    conceptHint: 'Real-time notification delivery',
    problemNarrative:
      "You posted a photo. Your 5 best friends liked it within 3 minutes. But you only find out when you open the app 45 minutes later. The dopamine hit is gone. You post less the next day.",
    problemContext:
      'Your notification system has no real-time delivery. Users only see likes and comments when they manually open the app.',
    missionText: 'Deliver like and comment notifications to users the moment they happen.',
    problemStats: [
      { label: 'Avg notification delay', value: '47 minutes 🔴', isWarning: true },
      { label: 'App opens per day to check activity', value: '8× (manual) 🔴', isWarning: true },
      { label: 'Post frequency: week 2 vs week 1', value: '−41% 🔴', isWarning: true },
      { label: 'Creator satisfaction score', value: '2.1/10 🔴', isWarning: true },
    ],
    centralMachine: { emoji: '🔔', label: 'Notif Machine 1.0', status: 'No real-time!' },
    options: [
      {
        id: 'polling-30s',
        name: 'Poll for New Activity',
        emoji: '🔄',
        gameDescription: 'The app checks the server for new likes every 30 seconds in the background.',
        systemDescription:
          'Client-side polling — periodic HTTP requests. Delays up to 30 seconds; N clients × polling requests regardless of actual activity.',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-300',
        textColor: 'text-amber-800',
      },
      {
        id: 'push-notifications',
        name: 'Real-Time Push Notifications',
        emoji: '⚡',
        gameDescription: 'When someone likes your photo, instantly push a notification to their device via a push service.',
        systemDescription:
          'Push notification service (APNs/FCM) — server-initiated delivery. Notifications arrive regardless of whether the app is open. Latency <1 second.',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-300',
        textColor: 'text-emerald-800',
      },
      {
        id: 'email-digest',
        name: 'Daily Email Digest',
        emoji: '📧',
        gameDescription: 'Send users a daily email summarizing all their likes and comments from the past 24 hours.',
        systemDescription:
          'Batch email digest — aggregates activity and delivers a daily summary. Cheap to implement but notification latency = up to 24 hours.',
        bgColor: 'bg-sky-50',
        borderColor: 'border-sky-300',
        textColor: 'text-sky-800',
      },
    ],
    outcomes: {
      'polling-30s': {
        label: 'Better, but battery drain',
        labelStyle: 'bg-amber-100 text-amber-800 border border-amber-300',
        emoji: '🔄',
        whatHappened:
          "Notifications now arrive within 30 seconds — much better. But constant polling drains device batteries and hammers your servers even when nothing is happening.",
        conceptUnlocked: 'Client Polling',
        whyItMatters:
          'Polling trades real-time latency for constant server load. Every user polls regardless of whether there is new activity — it does not scale and hurts devices.',
        pmTakeaway:
          '30-second polling feels responsive but is wasteful. Every user on your platform generates constant background requests — a design that breaks down at scale.',
        successRate: 0.54,
        builderExplanation:
          "The app now checks for new likes every 30 seconds. Notifications arrive fast, but every phone on your platform is constantly calling your server even during quiet times.",
        systemExplanation:
          'Short-polling: client makes periodic HTTP requests at fixed intervals. Latency bounded by interval. Server load = concurrent_users / interval. No server-push capability.',
        isOptimal: false,
        optimalHint: 'Push notifications are server-initiated — your server tells the device when something happens. Zero wasted requests.',
      },
      'push-notifications': {
        label: 'Instant gratification',
        labelStyle: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
        emoji: '🏆',
        whatHappened:
          "The moment someone likes your photo, your phone buzzes. Not 30 seconds later — immediately. Post frequency increases 38%. The social feedback loop is alive.",
        conceptUnlocked: 'Push Notification Service',
        whyItMatters:
          'Real-time notifications close the feedback loop between creator and audience. Immediate social validation is a core product mechanic for social platforms.',
        pmTakeaway:
          "Notification latency directly affects creator behavior. 1-second delivery vs 30-minute delivery changes how often users post — one of the highest-leverage investments in creator retention.",
        successRate: 0.94,
        builderExplanation:
          "When someone likes a photo, the like machine instantly sends a ping to that person's phone via a push service. No polling, no delay — the phone lights up immediately.",
        systemExplanation:
          'Push service (APNs/FCM): server pushes event to notification service, which delivers to device token. Latency <1s. No client polling needed. Delivery even when app is closed.',
        isOptimal: true,
      },
      'email-digest': {
        label: 'Delivered 18 hours late',
        labelStyle: 'bg-sky-100 text-sky-800 border border-sky-300',
        emoji: '📧',
        whatHappened:
          "Users get a daily email summarizing their activity. Nobody reads it. By the time you see '12 people liked your photo', the moment has completely passed.",
        conceptUnlocked: 'Batch Notification Delivery',
        whyItMatters:
          "Social validation is time-sensitive. A notification that arrives 18 hours after the event carries no emotional impact. Batch delivery is for weekly summaries, not engagement events.",
        pmTakeaway:
          'Match notification latency to the time-sensitivity of the event. Likes expire emotionally within minutes. Email digests are for weekly summaries, not real-time social feedback.',
        successRate: 0.09,
        builderExplanation:
          "You send everyone a daily summary email. By the time it arrives, the photos were posted yesterday. The excitement is gone.",
        systemExplanation:
          'Batch email digest: aggregate events in DB, send on schedule. Delivery latency = current_time to next_digest_time. Up to 24h. Cannot compete with real-time social signals.',
        isOptimal: false,
        optimalHint: 'Push notifications deliver server-initiated events to devices in under 1 second — the right primitive for social feedback.',
      },
    },
  },

  // ── Scenario 5: Upload Pipeline ─────────────────────────────────────────────
  {
    id: 5,
    title: 'The app freezes when you post a photo',
    questEmoji: '📤',
    conceptHint: 'Async media processing',
    problemNarrative:
      "Alex taps Post on her photo. The button grays out. A spinner appears. She waits. 9 seconds. Still spinning. She taps again — nothing. Then she closes and reopens the app. Two copies of the same photo are in her feed.",
    problemContext:
      'When a user posts, the app waits while the server does everything — resizing, thumbnails, content checks — before confirming. Every step makes the user stare at a spinner.',
    missionText: 'Make posting feel instant. The moment a user taps Post, they should get confirmation.',
    problemStats: [
      { label: 'Time from "Post" tap to confirmation', value: '9.4s 🔴', isWarning: true },
      { label: 'Posts abandoned mid-upload', value: '34% 🔴', isWarning: true },
      { label: 'Users who tapped Post twice', value: '28% 🔴', isWarning: true },
      { label: 'Duplicate posts from retries', value: '11% 🔴', isWarning: true },
    ],
    centralMachine: { emoji: '📤', label: 'Post Machine 1.0', status: 'Making users wait!' },
    options: [
      {
        id: 'sync-process',
        name: 'Make Users Wait for Everything',
        emoji: '⏳',
        gameDescription: 'Keep the current flow: show a spinner while the server resizes, processes, and verifies the photo — then confirm.',
        systemDescription:
          'Synchronous pipeline — all processing happens within the HTTP request lifecycle. User experiences full processing latency. Timeout risk on slow connections.',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-300',
        textColor: 'text-red-800',
      },
      {
        id: 'async-pipeline',
        name: 'Confirm Instantly, Process in Background',
        emoji: '✅',
        gameDescription: 'The moment a user taps Post, confirm it immediately and show their post. Resizing, thumbnails, and checks happen quietly in the background.',
        systemDescription:
          'Async processing pipeline — upload writes to storage, enqueues a job, confirms to client immediately. Processing happens out of band.',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-300',
        textColor: 'text-emerald-800',
      },
      {
        id: 'client-resize',
        name: 'Shrink the Photo Before Sending',
        emoji: '📱',
        gameDescription: "Compress and resize the photo on the user's phone before uploading — smaller file, faster transfer.",
        systemDescription:
          "Client-side processing — reduces upload payload size. But processing happens on diverse, resource-constrained devices. Battery drain, inconsistent quality, can't run server-side ML.",
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-300',
        textColor: 'text-amber-800',
      },
    ],
    outcomes: {
      'sync-process': {
        label: 'Still freezing',
        labelStyle: 'bg-red-100 text-red-800 border border-red-300',
        emoji: '⏳',
        whatHappened:
          "Nothing changed. Users still stare at a spinner for 9 seconds. On spotty connections it still times out. People are still double-tapping Post and flooding feeds with duplicates.",
        conceptUnlocked: 'Synchronous Bottlenecks',
        whyItMatters:
          "Users tapping Post only need to know their photo was received — not that the server finished all its processing. Making them wait for the full pipeline is making them pay for your backend work.",
        pmTakeaway:
          '"Accepted" and "fully processed" are two different events. If users only need confirmation of the first, never make them wait for the second.',
        successRate: 0.21,
        builderExplanation:
          "You kept the same flow — the user's phone still waits while the server does all the work. On slow connections, it still freezes.",
        systemExplanation:
          'Synchronous pipeline ties client latency to total processing time. Any downstream slowness (ML, resize, CDN propagation) becomes user-visible wait time.',
        isOptimal: false,
        optimalHint: "Confirm instantly and process in the background. Users only need to know their photo was saved — not that it's fully processed.",
      },
      'async-pipeline': {
        label: 'Post confirmed instantly',
        labelStyle: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
        emoji: '🏆',
        whatHappened:
          "Alex taps Post — her screen immediately shows the post appearing with a 'Processing…' badge. Done in 1 second. No spinner, no waiting, no double-posts. Processing finishes quietly in the background.",
        conceptUnlocked: 'Async Processing Pipeline',
        whyItMatters:
          "The user's job is to submit the photo. The platform's job is to process it. These two things don't need to happen at the same time.",
        pmTakeaway:
          "Immediate confirmation + background processing is the pattern behind Instagram, TikTok, and YouTube uploads. Separating 'accepted' from 'processed' is one of the highest-value product decisions in social apps.",
        successRate: 0.95,
        builderExplanation:
          "The moment you tap Post, your photo is saved and you get instant confirmation. The photo machine quietly handles resizing, thumbnails, and checks in the background — without making you wait.",
        systemExplanation:
          'Async pipeline: accept upload to object storage, enqueue processing job (resize, thumbnail, ML), immediately return 200 to client. Worker processes job async, updates record on completion.',
        isOptimal: true,
      },
      'client-resize': {
        label: 'Faster upload, new trade-offs',
        labelStyle: 'bg-amber-100 text-amber-800 border border-amber-300',
        emoji: '📱',
        whatHappened:
          "Uploads are 60% faster since files are smaller. But older phones struggle during the resize step, battery complaints spike, and server-side content checks no longer work. You traded server problems for device problems.",
        conceptUnlocked: 'Client-Side Processing Trade-offs',
        whyItMatters:
          "Moving processing to the user's device frees your server — but you lose control. You can't guarantee quality, can't run ML models, and the experience varies by phone.",
        pmTakeaway:
          "Client-side processing reduces upload size, but it can't replace server-side pipelines for quality control, safety checks, and content policies.",
        successRate: 0.51,
        builderExplanation:
          "Users' phones now do most of the work before uploading. Uploads are faster, but old phones struggle and you can no longer run photo quality improvements server-side.",
        systemExplanation:
          'Client-side compression reduces upload payload. Cannot run server-side ML models. Behavior varies by device capability. Creates quality inconsistency across uploads.',
        isOptimal: false,
        optimalHint: 'Confirm instantly and process in the background — users never wait, and you keep full control of the processing pipeline.',
      },
    },
  },

  // ── Scenario 6: Discovery ───────────────────────────────────────────────────
  {
    id: 6,
    title: "The Explore page shows nothing interesting",
    questEmoji: '🔥',
    conceptHint: 'Explore feed curation',
    problemNarrative:
      "You shipped an Explore page — a space for users to discover content beyond who they follow. But it's showing a random dump of recent posts. Users open it, see nothing compelling, and never return. The page is dead.",
    problemContext:
      'Your Explore page has no curation strategy. Users visiting Explore want to be surprised and entertained — not see a chronological list of strangers\' posts.',
    missionText: 'Make the Explore page surface content that makes users stop scrolling and want to come back.',
    problemStats: [
      { label: 'Explore page return rate', value: '8% 🔴', isWarning: true },
      { label: 'Avg time on Explore page', value: '4 seconds 🔴', isWarning: true },
      { label: '"Explore feels empty" reports', value: '79% 🔴', isWarning: true },
      { label: 'New follows from Explore', value: '0.2/visit 🔴', isWarning: true },
    ],
    centralMachine: { emoji: '🔥', label: 'Explore 1.0', status: 'Showing random posts!' },
    options: [
      {
        id: 'graph-traversal',
        name: "Show Content from Friends' Networks",
        emoji: '🕸️',
        gameDescription: "Surface posts that people in your social circle are engaging with — content liked and shared by friends-of-friends.",
        systemDescription:
          'Social graph traversal — BFS on the follow graph to surface posts engaged by accounts at distance 2. Personalized but bounded by your existing social circle.',
        bgColor: 'bg-sky-50',
        borderColor: 'border-sky-300',
        textColor: 'text-sky-800',
      },
      {
        id: 'search-bar',
        name: 'Add a Search Bar',
        emoji: '🔍',
        gameDescription: 'Let users search for topics, hashtags, or usernames to find content they are interested in.',
        systemDescription:
          "Keyword/hashtag search — retrieval requires intent. Users must already know what to search for. Does not surface unexpected content or drive spontaneous discovery.",
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-300',
        textColor: 'text-amber-800',
      },
      {
        id: 'popularity-rank',
        name: 'Surface Trending & Popular Posts',
        emoji: '🔥',
        gameDescription: "Show the content catching fire across the platform right now — posts with the highest engagement velocity, viral photos, rising creators.",
        systemDescription:
          'Trending content ranking — scores posts by recent engagement velocity (likes + comments per hour). Surfaces culturally relevant, high-quality content at scale.',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-300',
        textColor: 'text-emerald-800',
      },
    ],
    outcomes: {
      'graph-traversal': {
        label: 'Familiar, not truly exploratory',
        labelStyle: 'bg-sky-100 text-sky-800 border border-sky-300',
        emoji: '🕸️',
        whatHappened:
          "Explore now shows content from friends-of-friends. Users recognize some names and engage more. But the content feels too close to their regular feed — not surprising, not truly exploratory. Time on page improves only modestly.",
        conceptUnlocked: 'Social Graph Discovery',
        whyItMatters:
          "Graph-based discovery is powerful for 'suggested follows' — but Explore is about stumbling onto the unexpected. Content from your social circle is relevant but not wide enough to feel like discovery.",
        pmTakeaway:
          "Match the discovery mechanism to the job. Social graph traversal is ideal for 'people you may know'. For an Explore feed, you want cultural signal — what's catching fire across the whole platform, not just your social bubble.",
        successRate: 0.72,
        builderExplanation:
          "You surfaced content that friends-of-friends are engaging with. It's better than random — but users feel like they're still inside their social bubble, not exploring the full platform.",
        systemExplanation:
          'Graph traversal at distance 2: surfaces posts liked/shared by friend-of-friend accounts. Personalized but bounded by social graph. Limited diversity for an open Explore use case.',
        isOptimal: false,
        optimalHint: "Trending content surfaces what's catching fire across the whole platform — that's what makes Explore feel alive and worth opening.",
      },
      'search-bar': {
        label: 'Useful, but not discovery',
        labelStyle: 'bg-amber-100 text-amber-800 border border-amber-300',
        emoji: '🔍',
        whatHappened:
          "Users can now search hashtags and topics. Power users love it. But most people open Explore wanting to be surprised — they don't have a query in mind. The page still feels empty to 80% of visitors.",
        conceptUnlocked: 'Search vs Discovery',
        whyItMatters:
          "Search is for finding what you already know to look for. Discovery is surfacing what you didn't know you wanted. Explore needs discovery, not search.",
        pmTakeaway:
          "Search and Explore solve different jobs. Search requires intent — the user knows the destination. Discovery creates the destination. Don't confuse the two features.",
        successRate: 0.28,
        builderExplanation:
          "Users can search for topics, but most people open Explore hoping to stumble onto something great — not type a query. The page still disappoints most visitors.",
        systemExplanation:
          'Keyword/hashtag search: fast, low-cost, solves known-item retrieval. Does not solve ambient discovery. Requires active user intent — most Explore visits are passive browsing.',
        isOptimal: false,
        optimalHint: "Trending posts surface what's compelling right now — no search intent required.",
      },
      'popularity-rank': {
        label: 'Explore comes alive',
        labelStyle: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
        emoji: '🏆',
        whatHappened:
          "Explore now surfaces photos blowing up across the platform — high engagement velocity, viral moments, rising creators. Users open it and immediately see something surprising. Time on Explore jumps from 4 seconds to 3 minutes.",
        conceptUnlocked: 'Explore Feed Curation',
        whyItMatters:
          "Trending content captures cultural momentum. For Explore, engagement velocity is the right signal — it surfaces what the whole platform is finding compelling right now, not just your social circle.",
        pmTakeaway:
          "Trending/popularity ranking is the right primitive for Explore. It answers 'what should I look at?' for users who don't know what they're looking for yet. This is how Instagram Explore, TikTok For You, and Twitter Trending work.",
        successRate: 0.93,
        builderExplanation:
          "Explore now shows posts getting the most likes and comments per hour across the whole platform — the ones catching fire right now. Users keep scrolling because there's always something new and exciting.",
        systemExplanation:
          'Trending rank: score posts by engagement_velocity = (likes + comments × 2) / hours_since_posted. Surface top-N globally. Refresh on schedule. Optionally add category diversity signals.',
        isOptimal: true,
      },
    },
  },
];
