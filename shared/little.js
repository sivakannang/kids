/* =========================================================
   Helpers for the little learners' games (ChinnaKutty's Corner).
   Load after kids.js:  <script src="../../shared/little.js"></script>
   ========================================================= */
(function () {
  const K = Kids;
  // how each letter SOUNDS and its picture word come from Kids.phonics (shared with Phonics Fun)
  const ACT = { s: 'hissing like a snake 🐍', a: 'like the start of apple', t: 'like a ticking clock', i: 'like the start of igloo', p: 'like popping bubbles',
    n: 'like a buzzing aeroplane', c: 'like a click', k: 'like a kick', e: 'like the start of egg', h: 'like a puppy panting', r: 'like a puppy growling',
    m: 'like yummy food: mmm!', d: 'like a drum', g: 'like water going down a drain', o: 'like the start of octopus', u: 'like the start of umbrella',
    l: 'like licking a lollipop', f: 'like air hissing out', b: 'like a bouncing ball', j: 'like jumping jelly', z: 'like a buzzing bee', w: 'like blowing on a candle',
    v: 'like a van engine', y: 'like saying yes', x: 'at the end of box', q: 'like a quacking duck' };
  const SOUND = {}, LETTERS = {};
  for (const [l, [snd, word, pic]] of Object.entries(K.phonics)) { SOUND[l] = snd; LETTERS[l] = [word, pic, ACT[l]]; }
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
