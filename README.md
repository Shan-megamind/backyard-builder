# Backyard Builder

An interactive system design learning game where you learn by making decisions, not reading diagrams.

🔗 Live: https://backyard-builder.vercel.app/

---

## What this is

Backyard Builder is a browser-based learning experience that turns system design into a decision-making game.

Instead of watching videos or memorizing patterns, you:
- pick a real-world system
- face product problems
- choose how to solve them
- see what happens
- understand the trade-offs

The goal is simple:
**learn system design the way product decisions actually happen**

---

## How it works

Each quest follows a structured loop:

Problem → Decision → Simulation → Result → Next

You are given a real scenario like:
- "Feed is empty"
- "Checkout breaks"
- "App freezes"

You pick between different approaches.

The system:
- simulates the outcome
- explains what happened
- shows trade-offs
- assigns a score

At the end, you see:
- how well your system performs
- where it breaks
- what you could have done better

---

## Quests

### 🎧 Build Spotify
Focus:
- scaling systems
- load balancing
- CDNs
- recommendation systems

### 📦 Build Amazon
Focus:
- transactional correctness
- distributed workflows
- queues
- reliability under failure

### 📸 Build Instagram
Focus:
- feed generation
- ranking
- engagement systems
- discovery

---

## What makes this different

Most system design resources start with infrastructure.

This starts with:
**user experience → system consequences**

You don’t learn:
> “use a queue”

You learn:
> “what happens if I don’t?”

---

## Important note on "correct" answers

The “right” choices in each scenario aren’t exact replicas of production systems, but simplified versions of real-world patterns chosen to make the underlying trade-offs clear and intuitive.

---

## Tech

- React + TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- dnd-kit (for drag and drop)
- localStorage for persistence

No backend. No auth. No database.

---

## Architecture

- Single state-machine driven app (no routing)
- Scenario-driven engine (all quests defined in data layer)
- Component-based rendering for problem, decision, simulation, result
- Local persistence using browser storage

Designed for:
- speed of iteration
- simplicity
- clarity of experience

---

## Why I built this

System design is often taught in a way that feels disconnected from how products actually behave.

I wanted something that:
- feels interactive
- makes trade-offs obvious
- connects product decisions to system outcomes

This is an attempt at that.

---

## Future directions

- more systems (social, payments, infra-heavy cases)
- richer simulations
- new interaction types beyond decision cards
- deeper edge-case scenarios

---

## Try it

Play it here:
👉 https://backyard-builder.vercel.app/

---

## Author

Shantanu Ghaisas
