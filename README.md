# 🌈 Kavikuyil & Prabanjan's Learning World

Small, playful learning games for Kavikuyil (PeriyaKutty, 1st std) and Prabanjan (ChinnaKutty, LKG), grouped by subject like school.

The home page asks **who is learning today**; each child has their own stars, saved work and 3 practice games a day. A link can pick the child too: `index.html?kid=prabanjan`.

**Start here:** open [`index.html`](index.html) in a browser. It's the home page with a tile for every game.

```
file:///Users/sivakannan/Developer/kids/index.html
```

Everything works offline. There's nothing to install and nothing to build.

**What's next:** see [ROADMAP.md](ROADMAP.md), the Curiosity Journey from the clock all the way to the universe, plus focus, goals and dreams.

## Folder layout

```
kids/
├── index.html          🏠 home page: one tile per game (edit the SUBJECTS list to add tiles)
├── shared/             used by every game
│   ├── kids.css        colours, buttons, cards, font
│   ├── kids.js         her name, ⭐ stars (shared by all games), sounds, read-aloud, confetti
│   ├── fonts/          Fredoka font
│   └── vendor/         third-party libraries & data (d3, world map), kept locally for offline use
├── templates/
│   └── app-starter/    copy this to start a new game
├── english/            class-1-basics/ (reading lists, sentences, worksheets)
├── tamil/
├── maths/              time & measuring games (world-clock, time-ladder, ruler-race, speed-race…)
├── science/            Earth, space & universe games (spin-the-earth, rocket-launch, black-hole, zoom-out…)
├── world/
├── art-and-music/
├── mind/               focus-garden, goal-ladder, dream-jar, why-jar, imagine-time
├── little/             ChinnaKutty's Corner (LKG): letter-sounds, blend-it, trace-it, picture-talk, number-friends, story-time
├── hindi/, kannada/    swar, swaragalu (vowels)
└── languages/          word-explorer (English, Tamil, Hindi, Kannada)
```

Each subject folder has a `README.md` listing its projects and ideas for new ones.

## Adding a new game

1. Copy `templates/app-starter/` to `<subject>/<game-name>/`, using lowercase-with-dashes and no spaces.
2. Build the game in its `index.html`. Use `Kids.addStar()`, `Kids.sfx.yay()`, `Kids.confetti()`, `Kids.speak()` and `Kids.praise()` for rewards, `Kids.challenges([...])` for Kuyil's challenges (needs `<section class="card" data-kuyil>`), `Kids.quiz(...)` for quiz rounds, and `Kids.learn({...})` for the Why / Imagine / Wow / Talk cards (needs `<section data-learn>`).
3. Put pictures and sounds in an `assets/` folder inside the game. Put any library in `shared/vendor/`. Never load from the internet.
4. Add a `README.md` to the game (what it teaches, age).
5. Add a tile in the `SUBJECTS` list in the root `index.html`, and a row in the subject's `README.md`.
6. If you change anything in `shared/`, bump the `?v=3` number on the shared links in every page (so tablets and phones fetch the new version instead of an old cached copy).
