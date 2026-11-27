/* =========================================================
   Shared helpers for all of Kavikuyil's apps: her name, stars,
   sounds, read-aloud, confetti and pop-up banners.

   Use in an app (put it at the END of <body>, before the app's own script):
     <script src="../../shared/kids.js"></script>

   Optional markup the helper fills in automatically:
     <div class="badges" data-kids-badges data-home="../../index.html"></div>
       → stars, trophies, streak, sound on/off and a 🏠 home button
     <span data-kid-name></span>  → replaced with the child's name

   Stars are shared by every app (they live in the browser's storage).
   ========================================================= */
(function () {
  const KID = 'Kavikuyil';

  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  };
  const rand = n => Math.floor(Math.random() * n);

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
  };

  /* ---------- read aloud ---------- */
  function speak(text, force = false) {
    if ((!state.sound && !force) || !('speechSynthesis' in window)) return;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.9; u.pitch = 1.15;
      speechSynthesis.speak(u);
    } catch {}
  }

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
  const PRAISE = [`Super, ${KID}! 🌟`, `Awesome, ${KID}! 🎉`, 'You got it! 🥳', `Brilliant, ${KID}! 💫`,
    `${KID} the superstar! ⭐`, 'Wow, well done! 🦄', `High five, ${KID}! 🙌`];
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

  function mount() {
    document.querySelectorAll('[data-kid-name]').forEach(e => { e.textContent = KID; });
    badgeBox = document.querySelector('[data-kids-badges]');
    if (!badgeBox) return;
    const home = badgeBox.dataset.home;
    badgeBox.innerHTML = `
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
    name: KID, store, rand, sfx, speak, forSpeech, confetti, banner, praise, addStar, resetStreak,
    get stars() { return state.stars; },
    get sound() { return state.sound; },
  };
})();
