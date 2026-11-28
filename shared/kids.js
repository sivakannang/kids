/* =========================================================
   Shared helpers for all of Kavikuyil's apps: her name, stars,
   sounds, read-aloud, confetti and pop-up banners.

   Use in an app (put it at the END of <body>, before the app's own script):
     <script src="../../shared/kids.js"></script>

   Optional markup the helper fills in automatically:
     <div class="badges" data-kids-badges data-home="../../index.html"></div>
       → stars, trophies, streak, sound on/off and a 🏠 home button
     <span data-kid-name></span>  → replaced with the child's name
     <div class="lcard" data-say><button class="say">🔊</button>…</div>
       → the 🔊 button reads the card's heading, paragraphs and list aloud

   Two children use the games. Each has their own stars and saved work.
   The home page picks who is playing (or add ?kid=prabanjan to any link).
   ========================================================= */
(function () {
  const PROFILES = [
    { id: 'kavikuyil', name: 'Kavikuyil', nick: 'PeriyaKutty', emoji: '👧', color: '#9b5de5', grade: '1st std' },
    { id: 'prabanjan', name: 'Prabanjan', nick: 'ChinnaKutty', emoji: '👦', color: '#118ab2', grade: 'LKG' },
  ];
  const GLOBAL = new Set(['kids.sound', 'kids.profile']);
  const raw = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  };
  // who is playing? (?kid=… in the link wins, then the last choice)
  let pid = raw.get('kids.profile', 'kavikuyil');
  try { const q = new URLSearchParams(location.search).get('kid'); if (q && PROFILES.some(p => p.id === q)) { pid = q; raw.set('kids.profile', q); } } catch {}
  const PROFILE = PROFILES.find(p => p.id === pid) || PROFILES[0];
  const KID = PROFILE.name, NICK = PROFILE.nick;

  // each child's data is kept under their own name; Kavikuyil keeps her older saved data too
  const keyOf = k => GLOBAL.has(k) ? k : `${PROFILE.id}:${k}`;
  const store = {
    key: keyOf,
    get(k, d) {
      if (GLOBAL.has(k)) return raw.get(k, d);
      const v = raw.get(keyOf(k), undefined);
      if (v !== undefined) return v;
      return PROFILE.id === 'kavikuyil' ? raw.get(k, d) : d;
    },
    set(k, v) { raw.set(keyOf(k), v); },
  };
  const rand = n => Math.floor(Math.random() * n);
  const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
  // which game is this? e.g. "little/letter-sounds" (used for today's practice)
  const GAME = (() => { const parts = location.pathname.split('/').filter(Boolean); if (parts[parts.length - 1] && parts[parts.length - 1].includes('.')) parts.pop(); return parts.slice(-2).join('/'); })();

  // carry over stars earned before the shared helper existed
  const oldStars = store.get('tte.stars', null);
  if (oldStars != null) { store.set('kids.stars', store.get('kids.stars', 0) + oldStars); try { localStorage.removeItem('tte.stars'); } catch {} }

  const state = {
    stars: store.get('kids.stars', 0),
    streak: 0,
    sound: store.get('kids.sound', true),
  };

  /* ---------- sound ---------- */
  let actx;
  function beep(freqs, dur = 0.12, type = 'sine', gap = 0.09, vol = 0.22) {
    if (!state.sound) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      const t0 = actx.currentTime;
      freqs.forEach((f, i) => {
        const o = actx.createOscillator(), g = actx.createGain();
        o.type = type; o.frequency.value = f;
        const st = t0 + i * gap;
        g.gain.setValueAtTime(0.0001, st);
        g.gain.exponentialRampToValueAtTime(vol, st + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, st + dur);
        o.connect(g).connect(actx.destination);
        o.start(st); o.stop(st + dur + 0.03);
      });
    } catch {}
  }
  const sfx = {
    pop:    () => beep([660, 880], 0.09, 'sine', 0.06),
    yay:    () => beep([523, 659, 784, 1047], 0.22, 'triangle', 0.1),
    oops:   () => beep([330, 247], 0.2, 'triangle', 0.14),
    tick:   () => beep([1400], 0.03, 'square', 0, 0.05),
    whoosh: () => beep([300, 450, 600, 800], 0.08, 'sine', 0.05, 0.12),
    clock:  () => beep([1000], 0.05, 'square', 0, 0.12),   // a clear "tick" for stopwatches
    tock:   () => beep([700], 0.05, 'square', 0, 0.12),
    boing:  () => beep([220, 330, 520], 0.1, 'sine', 0.05, 0.2),
  };

  /* ---------- read aloud ---------- */
  function speak(text, force = false, rate = 0.9) {
    if ((!state.sound && !force) || !('speechSynthesis' in window)) return;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = rate; u.pitch = 1.15;
      speechSynthesis.speak(u);
    } catch {}
  }
  // read aloud in another language (lang: 'ta', 'hi', 'kn', 'en'); returns false if this device has no such voice
  function voiceFor(lang) { try { return speechSynthesis.getVoices().find(v => v.lang.toLowerCase().startsWith(lang)) || null; } catch { return null; } }
  function speakLang(text, lang, force = true, rate = 0.8) {
    if ((!state.sound && !force) || !('speechSynthesis' in window)) return false;
    if (lang === 'en') { speak(text, force, rate); return true; }
    const v = voiceFor(lang);
    if (!v) return false;
    try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.voice = v; u.lang = v.lang; u.rate = rate; speechSynthesis.speak(u); return true; } catch { return false; }
  }
  try { speechSynthesis.getVoices(); } catch {}

  /* ---------- confetti & banner (elements are created on demand) ---------- */
  let canvas, cctx, particles = [], running = false;
  function confetti() {
    if (!canvas) {
      canvas = document.createElement('canvas'); canvas.id = 'confetti';
      document.body.appendChild(canvas); cctx = canvas.getContext('2d');
    }
    canvas.width = innerWidth; canvas.height = innerHeight;
    const colors = ['#ef476f', '#ffd166', '#06d6a0', '#118ab2', '#9b5de5', '#f15bb5', '#ff9f1c'];
    for (let i = 0; i < 160; i++) {
      particles.push({
        x: innerWidth / 2 + (Math.random() - 0.5) * 200, y: innerHeight * 0.35,
        vx: (Math.random() - 0.5) * 16, vy: -Math.random() * 14 - 4,
        w: 6 + Math.random() * 8, h: 8 + Math.random() * 10, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4,
        c: colors[rand(colors.length)],
      });
    }
    if (!running) { running = true; requestAnimationFrame(draw); }
  }
  function draw() {
    cctx.clearRect(0, 0, canvas.width, canvas.height);
    particles = particles.filter(p => p.y < canvas.height + 40);
    for (const p of particles) {
      p.vy += 0.35; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.r += p.vr;
      cctx.save(); cctx.translate(p.x, p.y); cctx.rotate(p.r);
      cctx.fillStyle = p.c; cctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); cctx.restore();
    }
    if (particles.length) requestAnimationFrame(draw);
    else { running = false; cctx.clearRect(0, 0, canvas.width, canvas.height); }
  }
  let bannerEl, bannerTimer;
  function banner(text) {
    if (!bannerEl) { bannerEl = document.createElement('div'); bannerEl.className = 'banner'; document.body.appendChild(bannerEl); }
    bannerEl.textContent = text; bannerEl.classList.add('show');
    clearTimeout(bannerTimer); bannerTimer = setTimeout(() => bannerEl.classList.remove('show'), 2600);
  }

  /* ---------- praise, stars & badges ---------- */
  const PRAISE = [`Super, ${KID}! 🌟`, `Awesome, ${NICK}! 🎉`, 'You got it! 🥳', `Brilliant, ${KID}! 💫`,
    `${NICK} the superstar! ⭐`, 'Wow, well done! 🦄', `High five, ${KID}! 🙌`, `So clever, ${NICK}! 🧠`, `I'm so proud of you, ${KID}! 💖`];
  const praise = () => PRAISE[rand(PRAISE.length)];
  const forSpeech = s => s.replace(/[^\w\s!?.,']/g, '').trim();

  let badgeBox = null;
  const q = sel => badgeBox && badgeBox.querySelector(sel);
  function renderBadges(popStar) {
    if (!badgeBox) return;
    q('[data-b="stars"]').textContent = `⭐ ${state.stars}`;
    const trophies = Math.floor(state.stars / 10);
    q('[data-b="trophy"]').hidden = trophies === 0;
    q('[data-b="trophy"]').textContent = `🏆 ${trophies}`;
    q('[data-b="streak"]').hidden = state.streak < 2;
    q('[data-b="streak"]').textContent = `🔥 ${state.streak}`;
    q('[data-b="sound"]').textContent = state.sound ? '🔊' : '🔇';
    if (popStar) { const b = q('[data-b="stars"]'); b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop'); }
  }
  function addStar() {
    state.stars++; state.streak++;
    // remember that this game was practised today (for "Today's practice" on the home page)
    const dk = `day.${today()}`, done = store.get(dk, {});
    done[GAME] = (done[GAME] || 0) + 1; store.set(dk, done);
    store.set('kids.stars', state.stars);
    renderBadges(true);
    if (state.stars % 10 === 0) setTimeout(() => banner(`🏆 ${state.stars} stars! ${KID}, you earned a trophy!`), 400);
    else if (state.streak % 5 === 0) setTimeout(() => banner(`🔥 ${state.streak} in a row! Amazing!`), 400);
  }
  function resetStreak() { state.streak = 0; renderBadges(); }
  function toggleSound() {
    state.sound = !state.sound; store.set('kids.sound', state.sound);
    if (!state.sound) try { speechSynthesis.cancel(); } catch {}
    renderBadges(); sfx.pop();
  }

  function wireSay(root) {
    root.querySelectorAll('[data-say]').forEach(card => {
      const b = card.querySelector('.say');
      if (b && !b.dataset.wired) {
        b.dataset.wired = 1;
        b.addEventListener('click', () =>
          speak(forSpeech([...card.querySelectorAll('h3, p, li')].map(e => e.textContent).join('. ')), true));
      }
    });
  }

  /* ---------- learn cards: Kids.learn({ why: [...], imagine: [...], wow: [...], talk: [...] }, { why: 'Custom title' }) ---------- */
  function learn(cards, titles = {}) {
    const box = document.querySelector('[data-learn]');
    if (!box) return;
    const H = { why: '🤔 Why?', imagine: '🌠 Imagine…', wow: '🤩 Wow!', talk: '💬 Talk together' };
    box.classList.add('learn');
    box.innerHTML = Object.entries(cards).map(([k, v]) => `
      <div class="lcard ${k}" data-say><button class="say" title="Read aloud">🔊</button>
        <h3>${titles[k] || H[k]}</h3>
        ${k === 'talk' ? `<ul>${v.map(x => `<li>${x}</li>`).join('')}</ul>` : v.map(x => `<p>${x}</p>`).join('')}
      </div>`).join('');
    wireSay(box);
  }

  /* ---------- Kuyil's challenges (put <section class="card" data-kuyil></section> in the page) ----------
     const ch = Kids.challenges([{ ask, hint, ok(ctx, data), yay, start(data) }], { title: 'Moon Expert' });
     ch.check(ctx) after anything she does; ch.say(text) to let Kuyil talk. */
  function challenges(list, opts = {}) {
    const box = document.querySelector('[data-kuyil]');
    box.innerHTML = `<div class="mascot"><span class="bird">🐦</span><div class="bubble"></div></div>
      <div class="dots"></div><div class="hint"></div>
      <div class="row"><button class="btn purple">💡 Hint</button><button class="btn orange">⏭️ Next challenge</button></div>`;
    const bubble = box.querySelector('.bubble'), dots = box.querySelector('.dots'), hint = box.querySelector('.hint');
    const [hintBtn, skipBtn] = box.querySelectorAll('.row button');
    const st = { i: 0, done: new Set(), timer: null, data: {} };
    const say = (t, good) => { bubble.textContent = t; bubble.classList.toggle('done', !!good); };
    const renderDots = () => { dots.innerHTML = list.map((_, i) => `<span class="${st.done.has(i) ? 'ok' : i === st.i ? 'cur' : ''}"></span>`).join(''); };
    function show() {
      const c = list[st.i]; st.data = {};
      if (c.start) c.start(st.data);
      say(`${KID}, ${c.ask}`); hint.textContent = ''; renderDots();
    }
    function check(ctx) {
      const c = list[st.i];
      if (!c || st.done.has(st.i) || !c.ok(ctx, st.data)) return false;
      st.done.add(st.i);
      const msg = `${praise()} ${typeof c.yay === 'function' ? c.yay(ctx, st.data) : c.yay}`;
      say(msg, true); addStar(); sfx.yay(); confetti(); speak(forSpeech(msg)); renderDots();
      clearTimeout(st.timer); st.timer = setTimeout(next, opts.delay || 4500);
      return true;
    }
    function next() {
      clearTimeout(st.timer);
      if (st.done.size === list.length) {
        say(`🏆 Amazing, ${KID}! You finished all of Kuyil's challenges!`, true);
        banner(`🏆 ${opts.title || 'Champion'}: ${KID}!`);
        st.done.clear(); st.i = -1;
        st.timer = setTimeout(() => { st.i = 0; show(); }, 7000);
        return;
      }
      do { st.i = (st.i + 1) % list.length; } while (st.done.has(st.i));
      show();
    }
    hintBtn.addEventListener('click', () => { const c = list[st.i]; if (!c) return; hint.textContent = '💡 ' + c.hint; speak(c.hint, true); });
    skipBtn.addEventListener('click', () => { sfx.pop(); next(); });
    show();
    return { check, say, next, get current() { return list[st.i]; }, get data() { return st.data; }, get doneCount() { return st.done.size; } };
  }

  /* ---------- quiz rounds: Kids.quiz('#box', () => ({ q, choices: [{ label, ok }], yay, hint }), { rounds: 8 }) ---------- */
  function quiz(sel, make, opts = {}) {
    const box = document.querySelector(sel);
    const rounds = opts.rounds || 8;
    box.innerHTML = `<div class="dots"></div><div class="quiz-q"></div><div class="choices"></div><div class="result"></div>
      <div class="row"><button class="btn big orange" hidden>Next ➡️</button></div>`;
    const dots = box.querySelector('.dots'), qEl = box.querySelector('.quiz-q'), ch = box.querySelector('.choices'),
      res = box.querySelector('.result'), nextBtn = box.querySelector('.row button');
    const st = { n: 0, results: [], cur: null, first: true, done: false };
    const renderDots = () => { dots.innerHTML = Array.from({ length: rounds }, (_, i) => `<span class="${i < st.results.length ? (st.results[i] ? 'ok' : 'cur') : ''}"></span>`).join(''); };
    function ask() {
      if (st.n >= rounds) {
        const score = st.results.filter(Boolean).length;
        banner(`⭐ ${score} out of ${rounds} first time!`);
        if (score >= rounds - 1) confetti();
        st.n = 0; st.results = [];
      }
      const prev = st.cur && st.cur.q + st.cur.choices.map(c => c.label).join();
      let tries = 0;
      do { st.cur = make(); } while (prev && st.cur.q + st.cur.choices.map(c => c.label).join() === prev && ++tries < 20);
      st.first = true; st.done = false;
      qEl.innerHTML = st.cur.q; res.textContent = ''; res.className = 'result'; nextBtn.hidden = true;
      ch.innerHTML = '';
      st.cur.choices.forEach(c => {
        const b = document.createElement('button');
        b.className = 'choice'; b.innerHTML = c.label;
        b.addEventListener('click', () => {
          if (st.done || b.disabled) return;
          if (c.ok) {
            st.done = true; b.classList.add('right'); st.results.push(st.first); st.n++;
            if (st.first) addStar();
            sfx.yay();
            const msg = `${praise()} ${st.cur.yay || ''}`;
            res.textContent = msg; res.className = 'result good'; speak(forSpeech(msg));
            nextBtn.hidden = false; renderDots();
            if (opts.onRight) opts.onRight(st.cur);
          } else {
            st.first = false; resetStreak(); sfx.oops();
            b.classList.add('wrong'); b.disabled = true;
            res.textContent = `Not quite! ${st.cur.hint || 'Try again!'}`; res.className = 'result hint';
          }
        });
        ch.appendChild(b);
      });
      renderDots();
    }
    nextBtn.addEventListener('click', () => { sfx.pop(); ask(); });
    ask();
    return { ask };
  }
  const shuffle = a => a.map(x => [Math.random(), x]).sort((p, q) => p[0] - q[0]).map(p => p[1]);

  /* ---------- phonics: the sound of each letter and its picture word (as taught in school) ----------
     sound is spelled so the computer voice says the SOUND, not the letter name */
  const PHONICS = {
    a: ['ah', 'apple', '🍎'], b: ['buh', 'ball', '⚽'], c: ['kuh', 'cat', '🐱'], d: ['duh', 'dog', '🐶'], e: ['eh', 'egg', '🥚'],
    f: ['fff', 'fish', '🐟'], g: ['guh', 'goat', '🐐'], h: ['huh', 'hat', '🎩'], i: ['ih', 'igloo', '🧊'], j: ['juh', 'jug', '🫗'],
    k: ['kuh', 'kite', '🪁'], l: ['lll', 'lion', '🦁'], m: ['mmm', 'monkey', '🐒'], n: ['nnn', 'nest', '🪺'], o: ['aw', 'octopus', '🐙'],
    p: ['puh', 'pig', '🐷'], q: ['kwuh', 'queen', '👸'], r: ['rrr', 'rabbit', '🐰'], s: ['sss', 'sun', '☀️'], t: ['tuh', 'tiger', '🐯'],
    u: ['uh', 'umbrella', '☂️'], v: ['vvv', 'van', '🚐'], w: ['wuh', 'water', '💧'], x: ['ks', 'box', '📦'], y: ['yuh', 'yellow', '💛'], z: ['zzz', 'zebra', '🦓'],
  };

  /* ---------- small SVG helper ---------- */
  function svgEl(tag, attrs = {}, parent) {
    const e = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  /* ---------- the child's birthday (entered by a grown-up, kept only in this browser) ---------- */
  function birthday() {
    const v = store.get('kid.birthday', null);
    if (!v) return null;
    const [y, m, d] = v.split('-').map(Number);
    return new Date(y, m - 1, d);
  }
  const setBirthday = iso => store.set('kid.birthday', iso);

  function mount() {
    document.querySelectorAll('[data-kid-name]').forEach(e => { e.textContent = KID; });
    wireSay(document);
    badgeBox = document.querySelector('[data-kids-badges]');
    if (!badgeBox) return;
    const home = badgeBox.dataset.home;
    badgeBox.innerHTML = `
      <a class="badge" href="${home || 'index.html'}" title="${PROFILE.name} (${PROFILE.nick}). Tap 🏠 to switch child." style="text-decoration:none;color:inherit">${PROFILE.emoji} ${PROFILE.nick}</a>
      <span class="badge" data-b="stars" title="Stars earned in all games"></span>
      <span class="badge" data-b="trophy" title="Trophies (1 for every 10 stars)" hidden></span>
      <span class="badge" data-b="streak" title="Correct in a row" hidden></span>
      <button class="icon-btn" data-b="sound" title="Sound on/off"></button>
      ${home ? `<a class="icon-btn" href="${home}" title="Back to all games">🏠</a>` : ''}`;
    q('[data-b="sound"]').addEventListener('click', toggleSound);
    renderBadges();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();

  window.Kids = {
    name: KID, nick: NICK, profile: PROFILE, profiles: PROFILES, today, game: GAME,
    setProfile(id) { raw.set('kids.profile', id); },
    starsOf(id) { const k = id === 'kavikuyil' ? [`${id}:kids.stars`, 'kids.stars'] : [`${id}:kids.stars`]; for (const x of k) { const v = raw.get(x, undefined); if (v !== undefined) return v; } return 0; },
    store, rand, sfx, speak, speakLang, voiceFor, forSpeech, confetti, banner, praise, addStar, resetStreak,
    learn, challenges, quiz, shuffle, svgEl, birthday, setBirthday, phonics: PHONICS,
    get stars() { return state.stars; },
    get sound() { return state.sound; },
  };
})();
