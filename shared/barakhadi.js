/* =========================================================
   A vowel-signs game for any Indian script: Hindi matras (बारहखड़ी), Kannada kagunita (ಕಾಗುಣಿತ),
   Tamil uyirmei (உயிர்மெய்). A consonant + a vowel sign = a new letter: क + ा = का.
   Put <main data-barakhadi></main> in the page, then call Kids.barakhadi({
     lang: 'hi', langName: 'Hindi', what: 'matra', font: "…",
     consonants: [['क', 'k'], …],            // the bare consonant (with its built-in "a") and its sound
     vowels: [['अ', '', 'a'], ['आ', 'ा', 'aa'], …],   // vowel, its sign (empty = none), sound
     words: [['कमल', 'kamal', 'lotus', '🪷'], …],     // simple words to read
     plus: c => c + '्',                       // optional: how to show the consonant on its own (Tamil mei: க்)
   })
   ========================================================= */
(function () {
  Kids.barakhadi = function (cfg) {
    const $ = s => document.querySelector(s);
    const R = Kids.rand, shuffle = Kids.shuffle, C = cfg.consonants, V = cfg.vowels;
    const join = (c, v) => c[0] + v[1];
    const sound = (c, v) => c[1] + v[2];
    const alone = c => cfg.plus ? cfg.plus(c[0]) : c[0];
    const css = document.createElement('style');
    css.textContent = `
      .bf { font-family: ${cfg.font}; }
      .cons { display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; }
      .cons button { min-width: 58px; height: 58px; border: 3px solid #eee; background: #fff; border-radius: 16px; font-size: 30px; cursor: pointer; color: var(--ink); }
      .cons button.on { border-color: var(--purple); background: #f1e9ff; }
      .bgrid { display: grid; grid-template-columns: repeat(auto-fill, minmax(96px, 1fr)); gap: 8px; margin-top: 12px; }
      .bc { border: none; border-radius: 18px; padding: 8px 4px; cursor: pointer; color: #fff; box-shadow: 0 5px 0 rgba(0,0,0,.15); background: linear-gradient(135deg, #9b5de5, #7b3fe0); }
      .bc:nth-child(3n+2) { background: linear-gradient(135deg, #f774c4, #e0409e); } .bc:nth-child(3n) { background: linear-gradient(135deg, #3aa6dd, #118ab2); }
      .bc .t { font-size: 44px; line-height: 1.25; } .bc .r { font-size: 14px; font-weight: 600; } .bc .s { font-size: 13px; opacity: .85; }
      .bc.seen { outline: 4px solid #ffd166; }
      .sum { display: flex; align-items: center; justify-content: center; gap: 12px; flex-wrap: wrap; font-size: 64px; margin: 6px 0; }
      .sum .op { font-size: 40px; color: var(--muted); } .sum .res { color: var(--red); font-size: 90px; }
      .sumr { text-align: center; font-size: 22px; color: var(--muted); }
      .words { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 8px; }
      .wd { border: 3px solid #eee; background: #fff; border-radius: 18px; padding: 8px; cursor: pointer; color: var(--ink); }
      .wd .e { font-size: 40px; display: block; } .wd .t { font-size: 30px; display: block; } .wd .r { font-size: 14px; color: var(--muted); }
      .wd.seen { border-color: #ffd166; background: #fffbea; }
      .choice .bf { font-size: 40px; }`;
    document.head.appendChild(css);
    const main = $('[data-barakhadi]');
    main.className = 'split';
    main.innerHTML = `<div>
        <section class="card" data-panel="chart"><div class="label" style="margin-top:0">Pick a letter:</div><div class="cons bf" id="cons"></div><div class="bgrid" id="bgrid"></div><div class="hint" id="bnote" style="margin-top:8px"></div></section>
        <section class="card" data-panel="read" hidden><div class="label" style="margin-top:0">Read these words. Tap one to hear it!</div><div class="words" id="words"></div></section>
        <section class="card" id="bquiz" data-panel="quiz" hidden></section>
      </div>
      <div><section class="card" id="bsum"></section><section class="card" data-kuyil></section></div>`;
    const sayIt = (text, fallback) => { if (!Kids.speakLang(text, cfg.lang)) Kids.speak(fallback, true, 0.8); };
    const note = () => { $('#bnote').textContent = Kids.voiceFor(cfg.lang) ? `🔊 This device can speak ${cfg.langName}.` : `🔇 This device has no ${cfg.langName} voice, so say the sounds with a grown-up (they are written in English letters too).`; };
    try { speechSynthesis.addEventListener('voiceschanged', note); } catch {}

    let cur = C[0];
    const seen = new Set(), consDone = new Set();
    function showSum(c, v) {
      $('#bsum').innerHTML = `<div class="sum bf"><span>${alone(c)}</span><span class="op">+</span><span>${v[0]}</span><span class="op">=</span><span class="res">${join(c, v)}</span></div>
        <div class="sumr">${c[1]} + ${v[2]} = <b>${sound(c, v)}</b>${v[1] ? ` · the sign is <span class="bf" style="font-size:30px">◌${v[1]}</span>` : ' · no sign needed!'}</div>`;
    }
    C.forEach(c => {
      const b = document.createElement('button'); b.textContent = c[0];
      b.addEventListener('click', () => { cur = c; Kids.sfx.pop(); [...$('#cons').children].forEach(x => x.classList.toggle('on', x === b)); grid(); sayIt(c[0], c[1] + 'a'); });
      $('#cons').appendChild(b);
    });
    function grid() {
      [...$('#cons').children].forEach((b, i) => b.classList.toggle('on', C[i] === cur));
      $('#bgrid').innerHTML = '';
      V.forEach(v => {
        const k = join(cur, v), b = document.createElement('button');
        b.className = 'bc' + (seen.has(k) ? ' seen' : '');
        b.innerHTML = `<div class="t bf">${k}</div><div class="r">${sound(cur, v)}</div>`;
        b.addEventListener('click', () => {
          showSum(cur, v); sayIt(k, sound(cur, v)); seen.add(k); b.classList.add('seen');
          if (V.every(x => seen.has(join(cur, x)))) consDone.add(cur[0]);
          ch.check({ tap: k, v, c: cur, row: V.every(x => seen.has(join(cur, x))), rows: consDone.size });
        });
        $('#bgrid').appendChild(b);
      });
      showSum(cur, V[1]);
    }
    /* ---------- words ---------- */
    const wseen = new Set();
    cfg.words.forEach(w => {
      const b = document.createElement('button'); b.className = 'wd';
      b.innerHTML = `<span class="e">${w[3]}</span><span class="t bf">${w[0]}</span><span class="r">${w[1]} · ${w[2]}</span>`;
      b.addEventListener('click', () => { sayIt(w[0], w[1]); b.classList.add('seen'); wseen.add(w[0]); Kids.sfx.pop(); ch.check({ word: wseen.size }); });
      $('#words').appendChild(b);
    });
    /* ---------- quiz ---------- */
    const pickC = () => C[R(C.length)], pickV = () => V[1 + R(V.length - 1)];
    const MAKERS = [
      () => { const c = pickC(), v = pickV(), a = join(c, v); const o = new Set([a]); while (o.size < 4) o.add(R(2) ? join(c, pickV()) : join(pickC(), v));
        return { q: `<span class="bf" style="font-size:54px">${alone(c)} + ${v[0]} = ?</span>`, choices: shuffle([...o]).map(x => ({ label: `<span class="bf">${x}</span>`, ok: x === a })), yay: `${alone(c)} + ${v[0]} = ${a} (${sound(c, v)})!`, hint: `Look for ${c[0]} with the ${v[0]} sign ◌${v[1]}.` }; },
      () => { const c = pickC(), v = pickV(); const o = new Set([v]); while (o.size < 4) o.add(pickV());
        return { q: `<span class="bf" style="font-size:80px">${join(c, v)}</span><div class="label">${alone(c)} + which vowel?</div>`, choices: shuffle([...o]).map(x => ({ label: `<span class="bf">${x[0]}</span>`, ok: x === v })), yay: `${join(c, v)} = ${alone(c)} + ${v[0]}, it says "${sound(c, v)}".`, hint: 'Look at the little sign stuck to the letter. Check the chart!' }; },
      () => { const c = pickC(), v = pickV(), a = join(c, v); const o = new Set([a]); while (o.size < 3) o.add(join(c, pickV()));
        return { q: `Which one says "<b>${sound(c, v)}</b>"?`, choices: shuffle([...o]).map(x => ({ label: `<span class="bf">${x}</span>`, ok: x === a })), yay: `${a} says "${sound(c, v)}".`, hint: `Long sounds (aa, ee, oo) have bigger signs.` }; },
    ];
    let quizOn = false;
    document.querySelectorAll('.tab').forEach(b => b.addEventListener('click', () => {
      Kids.sfx.pop();
      document.querySelectorAll('.tab').forEach(x => x.classList.toggle('active', x === b));
      document.querySelectorAll('[data-panel]').forEach(p => p.hidden = p.dataset.panel !== b.dataset.tab);
      if (b.dataset.tab === 'quiz' && !quizOn) { quizOn = true; Kids.quiz('#bquiz', () => MAKERS[R(MAKERS.length)](), { rounds: 8, onRight: () => ch.check({ quiz: true }) }); }
    }));
    const ch = Kids.challenges([
      { ask: `Tap ${join(C[0], V[1])}: ${alone(C[0])} + ${V[1][0]} 🧩`, hint: `It is the second one in the chart for ${C[0][0]}.`, ok: c => c.tap === join(C[0], V[1]), yay: `${join(C[0], V[1])} says "${sound(C[0], V[1])}"!` },
      { ask: `Hear the whole row for one letter (all ${V.length}) 👂`, hint: 'Tap every box in the chart.', ok: c => c.row, yay: 'A whole row! That is how the letters grow.' },
      { ask: 'Pick a different letter and hear its whole row 🔁', hint: 'Choose a new letter at the top, then tap all its boxes.', ok: c => c.rows >= 2, yay: 'The signs work the same for every letter!' },
      { ask: 'Read 5 words on the Read tab 📖', hint: 'Open Read Words and tap 5 words.', ok: c => c.word >= 5, yay: 'You are reading real words!' },
      { ask: 'Get a quiz question right ❓', hint: 'Open the Quiz tab.', ok: c => c.quiz, yay: `Super ${cfg.langName} reading!` },
    ], { title: `${cfg.langName} Reader` });
    grid(); note(); setTimeout(note, 800);
  };
})();
