/* =========================================================
   Helpers for the little learners' games (ChinnaKutty's Corner).
   Load after kids.js:  <script src="../../shared/little.js"></script>
   ========================================================= */
(function () {
  const K = Kids;
  // how each letter SOUNDS (spelled so the computer voice says the sound, not the letter name)
  const SOUND = { a: 'ah', b: 'buh', c: 'kuh', d: 'duh', e: 'eh', f: 'fff', g: 'guh', h: 'huh', i: 'ih', j: 'juh', k: 'kuh', l: 'lll', m: 'mmm',
    n: 'nnn', o: 'aw', p: 'puh', q: 'kwuh', r: 'rrr', s: 'sss', t: 'tuh', u: 'uh', v: 'vvv', w: 'wuh', x: 'ks', y: 'yuh', z: 'zzz' };
  // a picture word and a little action for every letter
  const LETTERS = {
    s: ['sun', '☀️', 'hissing like a snake 🐍'], a: ['ant', '🐜', 'like the start of ant'], t: ['tiger', '🐯', 'like a ticking clock'],
    i: ['insect', '🐞', 'like the start of insect'], p: ['pig', '🐷', 'like popping bubbles'], n: ['nest', '🪺', 'like a buzzing aeroplane'],
    c: ['cat', '🐱', 'like a click'], k: ['kite', '🪁', 'like a kick'], e: ['egg', '🥚', 'like the start of egg'], h: ['hat', '🎩', 'like a puppy panting'],
    r: ['rabbit', '🐰', 'like a puppy growling'], m: ['mango', '🥭', 'like yummy food: mmm!'], d: ['dog', '🐶', 'like a drum'],
    g: ['goat', '🐐', 'like water going down a drain'], o: ['octopus', '🐙', 'like the start of octopus'], u: ['umbrella', '☂️', 'like the start of umbrella'],
    l: ['lion', '🦁', 'like licking a lollipop'], f: ['fish', '🐟', 'like air hissing out'], b: ['ball', '⚽', 'like a bouncing ball'],
    j: ['juice', '🧃', 'like jumping jelly'], z: ['zebra', '🦓', 'like a buzzing bee'], w: ['watch', '⌚', 'like blowing on a candle'],
    v: ['van', '🚐', 'like a van engine'], y: ['yo-yo', '🪀', 'like saying yes'], x: ['box', '📦', 'at the end of box'], q: ['queen', '👸', 'like a quacking duck'],
  };
  const CHEERS = ['Yay!', 'Super!', 'Wow!', 'Well done!', 'Brilliant!', 'Clap clap!', 'You did it!'];
  const cheer = () => `${CHEERS[K.rand(CHEERS.length)]} ${K.rand(2) ? K.nick : K.name}!`;

  // speak several things one after another (each waits for the voice to finish)
  function sayList(parts, rate = 0.8) {
    if (!K.sound || !('speechSynthesis' in window)) return;
    try {
      speechSynthesis.cancel();
      parts.forEach(p => { const u = new SpeechSynthesisUtterance(p); u.rate = rate; u.pitch = 1.2; speechSynthesis.speak(u); });
    } catch {}
  }
  const say = (t, rate = 0.8) => K.speak(t, false, rate);

  // a "say it out loud" button: no microphone, just praise (a grown-up listens!)
  function saidIt(btn, after) {
    btn.addEventListener('click', () => {
      K.sfx.yay(); K.confetti(); const c = cheer(); say(c); K.addStar(); if (after) after(c);
    });
  }

  // big choices: [{ label, ok, pic }]; onRight(), onWrong()
  function choose(box, choices, onRight, onWrong) {
    box.innerHTML = ''; let done = false;
    choices.forEach(c => {
      const b = document.createElement('button');
      b.className = 'bigchoice' + (c.pic ? ' pic' : ''); b.innerHTML = c.label;
      b.addEventListener('click', () => {
        if (done || b.disabled) return;
        if (c.ok) { done = true; b.classList.add('right'); K.sfx.yay(); onRight && onRight(c); }
        else { b.classList.add('wrong'); b.disabled = true; K.sfx.oops(); onWrong && onWrong(c); }
      });
      box.appendChild(b);
    });
  }
  window.Little = { SOUND, LETTERS, cheer, say, sayList, saidIt, choose };
  document.body.classList.add('little');
})();
