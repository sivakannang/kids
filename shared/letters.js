/* =========================================================
   A letters game for any language (Hindi, Kannada, …).
   Put <main data-letters></main>, <section class="card" data-kuyil></section> inside it is created,
   then call Kids.lettersGame({ lang: 'hi', langName: 'Hindi', font: "…", letters: [...] }).
   Each letter: [letter, sound, 'short' | 'long' | 'extra', word, word sound, meaning, picture]
   ========================================================= */
(function () {
  const KINDS = {
    short: { label: 'Short sound', bg: 'linear-gradient(135deg, #f774c4, #e0409e)' },
    long: { label: 'Long sound', bg: 'linear-gradient(135deg, #9b5de5, #7b3fe0)' },
    extra: { label: 'Special letter', bg: 'linear-gradient(135deg, #3aa6dd, #118ab2)' },
  };
  Kids.lettersGame = function (cfg) {
    const $ = s => document.querySelector(s);
    const R = Kids.rand, shuffle = Kids.shuffle, L = cfg.letters;
    const css = document.createElement('style');
    css.textContent = `
      .lf { font-family: ${cfg.font}; }
      .lgrid { display: grid; grid-template-columns: repeat(auto-fill, minmax(92px, 1fr)); gap: 10px; }
      .lv { border: none; border-radius: 18px; padding: 10px 4px; cursor: pointer; color: #fff; box-shadow: 0 5px 0 rgba(0,0,0,.15); font-family: inherit; }
      .lv .t { font-size: 44px; line-height: 1.25; } .lv .r { font-size: 15px; font-weight: 600; }
      .lv.seen { outline: 4px solid #ffd166; }
      .llegend { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; margin-top: 10px; font-size: 15px; }
      .llegend i { width: 18px; height: 18px; border-radius: 6px; display: inline-block; vertical-align: middle; margin-right: 4px; }
      .lbig { text-align: center; } .lbig .t { font-size: 110px; color: var(--purple); line-height: 1.2; }
      .lbig .r { font-size: 22px; color: var(--muted); } .lbig .e { font-size: 70px; } .lbig .w { font-size: 36px; } .lbig .w b { color: var(--red); }
      .lnote { font-size: 14px; color: var(--muted); text-align: center; margin-top: 8px; }
      .choice .lf { font-size: 40px; }`;
    document.head.appendChild(css);
    const main = $('[data-letters]');
    main.className = 'split';
    main.innerHTML = `<div>
        <section class="card" data-panel="learn"><div class="lgrid" id="lgrid"></div><div class="llegend" id="llegend"></div><div class="lnote" id="lnote"></div></section>
        <section class="card" id="lquiz" data-panel="quiz" hidden></section>
      </div>
      <div><section class="card lbig" id="lbig"></section><section class="card" data-kuyil></section></div>`;
    const usedKinds = [...new Set(L.map(l => l[2]))];
    $('#llegend').innerHTML = usedKinds.map(k => `<span><i style="background:${KINDS[k].bg}"></i>${KINDS[k].label}</span>`).join('');
    const hasVoice = () => !!Kids.voiceFor(cfg.lang);
    const note = () => { $('#lnote').textContent = hasVoice() ? `🔊 This device can speak ${cfg.langName}.` : `🔇 This device has no ${cfg.langName} voice, so ask a grown-up to say the sounds with you (they are written in English letters too).`; };
    try { speechSynthesis.addEventListener('voiceschanged', note); } catch {}
    const say = l => { if (!Kids.speakLang(`${l[0]}. ${l[3] || ''}`, cfg.lang)) Kids.speak(`${l[1]}${l[4] ? `, as in ${l[4]}` : ''}`, true); };
    function big(l) {
      $('#lbig').innerHTML = `<div class="t lf">${l[0]}</div><div class="r">"${l[1]}" · ${KINDS[l[2]].label.toLowerCase()}</div>` +
        (l[3] ? `<div class="e">${l[6]}</div><div class="w lf"><b>${l[0]}</b>${l[3].slice(l[0].length)}</div><div class="r">${l[4]}: ${l[5]}</div>` : `<div class="r" style="margin-top:12px">${l[5] || ''}</div>`);
    }
    const seen = new Set();
    L.forEach(l => {
      const b = document.createElement('button');
      b.className = 'lv'; b.style.background = KINDS[l[2]].bg;
      b.innerHTML = `<div class="t lf">${l[0]}</div><div class="r">${l[1]}</div>`;
      b.addEventListener('click', () => { big(l); say(l); seen.add(l[0]); b.classList.add('seen'); ch.check({ tap: l[0], seen: seen.size }); });
      $('#lgrid').appendChild(b);
    });
    const withWords = L.filter(l => l[3]);
    const pick4 = (list, a) => { const o = new Set([a]); while (o.size < Math.min(4, list.length)) o.add(list[R(list.length)]); return shuffle([...o]); };
    const MAKERS = [
      () => { const a = withWords[R(withWords.length)];
        return { q: `<div style="font-size:80px">${a[6]}</div><div class="lf" style="font-size:34px">${a[3]}</div><div class="label">${a[4]} (${a[5]}). Which letter does it start with?</div>`,
          choices: pick4(withWords, a).map(x => ({ label: `<span class="lf">${x[0]}</span>`, ok: x === a })), yay: `${a[4]} starts with ${a[0]} ("${a[1]}")!`, hint: 'Say the word slowly and listen to the first sound.' }; },
      () => { const a = L[R(L.length)];
        return { q: `Which letter says "<b>${a[1]}</b>"?`, choices: pick4(L, a).map(x => ({ label: `<span class="lf">${x[0]}</span>`, ok: x === a })), yay: `${a[0]} says "${a[1]}".`, hint: 'Look at the sounds under the letters on the Learn board.' }; },
    ];
    let quizOn = false;
    document.querySelectorAll('.tab').forEach(b => b.addEventListener('click', () => {
      Kids.sfx.pop();
      document.querySelectorAll('.tab').forEach(x => x.classList.toggle('active', x === b));
      document.querySelectorAll('[data-panel]').forEach(p => p.hidden = p.dataset.panel !== b.dataset.tab);
      if (b.dataset.tab === 'quiz' && !quizOn) { quizOn = true; Kids.quiz('#lquiz', () => MAKERS[R(MAKERS.length)](), { rounds: 8, onRight: () => ch.check({ quiz: true }) }); }
    }));
    const ch = Kids.challenges([
      { ask: `Tap the very first letter, ${L[0][0]}`, hint: 'It is the first one on the board.', ok: c => c.tap === L[0][0], yay: `${L[0][0]} for ${L[0][4]}!` },
      { ask: 'Tap 5 different letters and listen 👂', hint: 'Tap any 5 letters.', ok: c => c.seen >= 5, yay: 'Five letters, five sounds!' },
      { ask: `Tap ALL ${L.length} letters 🏆`, hint: 'Keep going until every letter has a yellow ring.', ok: c => c.seen >= L.length, yay: `You met every ${cfg.langName} vowel!` },
      { ask: 'Play the Quiz and get one right ❓', hint: 'Open the Quiz tab.', ok: c => c.quiz, yay: `Super ${cfg.langName} reading!` },
    ], { title: `${cfg.langName} Star` });
    big(L[0]); note(); setTimeout(note, 800);
  };
})();
