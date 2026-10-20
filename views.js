/* Views: tabs, layers (workout overview, info), sheets, and the click/input wiring. */
'use strict';

let TRACKS = {};
const A = {}; // actions

/* ------------------------------------------------------------------ render loop */
let renderedLayers = 0;
function render() {
  const app = $('#app');
  const winY = window.scrollY;
  const scrolls = $$('.layer').map((l) => layerScroller(l).scrollTop);
  app.innerHTML = '<main class="screen">' + ({ today: vToday, train: vTrain, fuel: vFuel, mind: vMind, progress: vProgress }[ui.tab])() + '</main>' + tabbar();
  let layers = $('#layers');
  if (!layers) { layers = document.createElement('div'); layers.id = 'layers'; document.body.appendChild(layers); }
  layers.innerHTML = ui.stack.map((l, i) => renderLayer(l, i)).join('');
  $$('.layer', layers).forEach((l, i) => { if (i < renderedLayers) l.classList.add('noanim'); if (scrolls[i] != null && i < renderedLayers) layerScroller(l).scrollTop = scrolls[i]; });
  $$('.player, .mplayer', layers).forEach((l, i) => { if (i < renderedLayers - 1 || l.dataset.keep) l.style.animation = 'none'; });
  renderedLayers = ui.stack.length;
  let sh = $('#sheet');
  if (!sh) { sh = document.createElement('div'); sh.id = 'sheet'; document.body.appendChild(sh); }
  const prevSheet = sh.dataset.k, k = ui.sheet ? ui.sheet.v + JSON.stringify(ui.sheet.p || {}) : '';
  const sheetScroll = $('.sheet', sh) ? $('.sheet', sh).scrollTop : 0;
  sh.innerHTML = ui.sheet ? '<div class="scrim" data-a="closeSheet"></div><div class="sheet" role="dialog" aria-modal="true"><div class="in pad"><div class="grab"></div>' + renderSheet(ui.sheet) + '</div></div>' : '';
  if (ui.sheet && prevSheet === k) { const s = $('.sheet', sh); s.style.animation = 'none'; $('.scrim', sh).style.animation = 'none'; s.scrollTop = sheetScroll; }
  sh.dataset.k = k;
  document.body.style.overflow = ui.stack.length || ui.sheet ? 'hidden' : '';
  if (!ui.stack.length) window.scrollTo(0, winY);
  afterRender();
}
/* pushed screens scroll inside their .wrap; the .layer shell stays still so pinned bars stay pinned */
function layerScroller(l) { return (l && l.querySelector(':scope > .wrap')) || l; }
function afterRender() { if (typeof playerAfterRender === 'function') playerAfterRender(); if (ui.tab === 'progress') wkRailFix(); }
function tabbar() {
  const T = [['today', 'Today'], ['train', 'Train'], ['fuel', 'Fuel'], ['mind', 'Mind'], ['progress', 'Progress']];
  return '<nav class="tabbar" aria-label="Sections"><div class="in">' + T.map(([id, n]) =>
    '<button class="tab t-' + id + (ui.tab === id ? ' on' : '') + '" data-a="tab" data-v="' + id + '" aria-current="' + (ui.tab === id) + '">' + ic(id) + n + '</button>').join('') + '</div></nav>';
}
function push(v, p) { ui.stack.push({ v, p: p || {} }); render(); }
function pop() { const l = ui.stack.pop(); if (l && l.onClose) l.onClose(); renderedLayers = ui.stack.length; render(); }
function openSheet(v, p) { ui.sheet = { v, p: p || {} }; render(); }
function closeSheet() { ui.sheet = null; render(); }

function renderLayer(l, i) {
  const V = { workout: lWorkout, routineInfo: null, player: lPlayer, routine: lRoutine, timer: lTimer, mplayer: lMind, done: lDone, quiz: lQuiz, settings: lSettings, rules: lRules };
  return (V[l.v] || (() => ''))(l.p, i, l);
}

/* ------------------------------------------------------------------ shared bits */
function topHeader(eyebrow, title, right) {
  return '<div class="navbar" aria-hidden="true"><span>' + title + '</span></div><header class="top pad"><div class="grow"><div class="eyebrow">' + eyebrow + '</div><h1 class="h-xl" style="margin-top:2px">' + title + '</h1></div>' + (right || '') + '</header>';
}
function avatarBtn() { return '<button class="avatar" data-a="push" data-v="settings" aria-label="Settings">' + esc((S.settings.name || 'N')[0]) + '</button>'; }
function ringSVG(frac, size, stroke, color, track) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r, f = clamp(frac || 0, 0, 1);
  return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '"><circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" fill="none" stroke="' + (track || 'var(--card-3)') + '" stroke-width="' + stroke + '"/>' +
    (f > 0 ? '<circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" fill="none" stroke="' + color + '" stroke-width="' + stroke + '" stroke-linecap="round" stroke-dasharray="' + (c * f).toFixed(1) + ' ' + c.toFixed(1) + '"/>' : '') + '</svg>';
}
function strip(date, tone) {
  const mon = mondayOf(date), t = todayISO();
  let s = '<div class="wk-nav"><button data-a="wk" data-v="-7">' + ic('prev').replace('<svg', '<svg width="14" height="14" style="vertical-align:-2px"') + ' Prev week</button><div class="eyebrow">' + fmtShort(mon) + ' – ' + fmtShort(addDays(mon, 6)) + '</div><button data-a="wk" data-v="7">Next week ' + ic('next').replace('<svg', '<svg width="14" height="14" style="vertical-align:-2px"') + '</button></div><div class="strip">';
  for (let i = 0; i < 7; i++) {
    const d = addDays(mon, i), prog = dayProgress(d);
    s += '<button class="dpill' + (d === date ? ' sel' : '') + (d === t ? ' today' : '') + '" data-a="date" data-v="' + d + '" aria-label="' + fmtD(d) + '"><span class="dl">' + DOW[i][0] + '</span><span class="ring">' + ringSVG(prog, 34, 3, prog >= 1 ? 'var(--good)' : (tone || 'var(--train)')) + '<span class="num tnum">' + pISO(d).getDate() + '</span></span></button>';
  }
  return s + '</div>';
}
function bannerHTML(tone, html, action) {
  return '<div class="banner ' + (tone || '') + '"' + (action ? ' role="button" tabindex="0" data-a="' + action.a + '" data-v="' + (action.v || '') + '"' : '') + '><span class="bi"></span><div class="grow small fg2">' + html + '</div></div>';
}
function checkBtn(on, a, v, label) {
  return '<button class="check' + (on ? ' on' : '') + '" data-a="' + a + '" data-v="' + esc(v) + '" aria-pressed="' + !!on + '" aria-label="' + esc(label || 'Mark done') + '">' + (on ? ic('check') : '') + '</button>';
}
function mindArt(id) { const m = D.MIND[id] || {}; return 'art-' + (m.art || 'tide'); }

/* ------------------------------------------------------------------ TODAY */
function checklist(date) {
  const P = plan(date), d = peek(date), rows = [];
  const dn = (k) => isDone(date, k);
  rows.push({ key: 'morning', t: 'Morning light + cyclic sighing', s: '5 min · outside within an hour of waking', ic: 'sun', a: 'mind', v: 'sigh5', tone: 'mind' });
  if (P.week >= 1) rows.push({ key: 'check', t: 'Swelling check + readiness', s: '30 s · stroke test, knee, back, sleep', ic: 'shield', a: 'sheet', v: 'ready', auto: readiness(date) != null });
  if (P.kneeArmor) rows.push({ key: 'kneeArmor', t: 'Knee Armor', s: '~10 min · ' + (P.week <= 6 ? 'every morning through Week 6' : 'Mon, Wed and Fri from Week 7'), ic: 'shield', a: 'routine', v: 'kneeArmor' });
  if (P.backReset || d.needBackReset) rows.push({ key: 'backReset', t: 'Back Reset', s: '~5 min · ' + (d.needBackReset ? 'after the session: your back flagged' : backClear(date) ? 'back clear: 3 times a week' : 'every morning until back clear'), ic: 'shield', a: 'routine', v: 'backReset' });
  if (P.week >= 1) rows.push({ key: 'deepcore', t: 'Deep Core', s: '4 min · inner abs, right after Knee Armor', ic: 'core', a: 'routine', v: 'deepcore' });
  if (P.mobility) rows.push({ key: 'mobility', t: 'Easy mobility', s: '10 min · cat-camel, 90/90 hip switches, quad and hip-flexor stretches', ic: 'walk', a: 'routine', v: 'mobility' });
  if (P.confide) rows.push({ key: 'confide', t: 'Confidence rehearsal', s: '3 min · before the gate test or the first jumps', ic: 'mind', a: 'mind', v: 'confide3', tone: 'mind' });
  P.sessions.forEach((s) => {
    if (s.type === 'rest' && s.sid !== 'kickoff') return;
    rows.push({ key: 's:' + s.sid, t: s.title + (s.optional ? ' (optional)' : ''), s: [s.dur, s.sub].filter(Boolean).join(' · '), thumb: s.hero, a: 'workout', v: s.sid, session: true, optional: s.optional });
  });
  if (P.core) { const f = coreFmt(P.week); rows.push({ key: 'core', t: 'Core finisher · Core ' + P.core, s: Math.round((f[0] + f[1]) * 5 * f[2] / 60) + ' min · after the session', ic: 'core', a: 'core', v: P.core }); }
  rows.push({ key: 'sit', t: (D.MIND[P.sit] || {}).n + ' meditation', s: (D.MIND[P.sit] || {}).min + ' min · after the shake, before the day starts', ic: 'mind', a: 'mind', v: P.sit, tone: 'mind' });
  if (P.walk) rows.push({ key: 'walk', t: P.walk, s: 'Daily steps ' + P.steps + (P.sunday ? ' · make one walk a week phone-free' : ''), ic: 'walk', a: 'toggle', v: 'walk' });
  const tt = totals(date), tg = targets(date);
  rows.push({ key: 'protein', t: 'Protein ' + tg.p[0] + '–' + tg.p[1] + ' g', s: Math.round(tt.p) + ' g logged', ic: 'egg', a: 'tab', v: 'fuel', auto: tt.p >= tg.p[0], tone: 'fuel' });
  rows.push({ key: 'snack', t: 'Evening protein snack', s: '25–35 g, 1–2 h before bed', ic: 'egg', a: 'logSnack', v: '', auto: mealsFor(date).some((m) => m.slot === 'snack'), tone: 'fuel' });
  if (P.sunday && P.week >= 0) rows.push({ key: 'reset', t: 'Sunday Reset', s: '15 min · the weekly check', ic: 'list', a: 'sheet', v: 'sunday' });
  const g = (d.grat || []).filter((x) => x && x.trim()).length;
  rows.push({ key: 'grat', t: '3 good things', s: g ? g + ' of 3 written' : 'Before bed, 2 min', ic: 'pen', a: 'sheet', v: 'journal', auto: g >= 3, tone: 'mind' });
  return rows.map((r) => Object.assign(r, { done: r.auto != null ? r.auto : dn(r.key) }));
}
function dayProgress(date) {
  if (date > todayISO() && !Object.keys(peek(date)).length) return 0;
  const rows = checklist(date).filter((r) => !r.optional);
  return rows.length ? rows.filter((r) => r.done).length / rows.length : 0;
}

function vToday() {
  const date = ui.date, P = plan(date), d = peek(date), t = todayISO();
  const eyebrow = P.week === 0 ? 'Kickoff · Week 1 starts ' + fmtShort(D.START) : P.week > 13 ? (date === FLY_DATE ? 'Travel day' : 'Sri Lanka · Never Zero') : 'Week ' + P.week + ' · ' + P.phase.name;
  let h = topHeader(esc(eyebrow), date === t ? 'Today' : esc(fmtD(date)), avatarBtn());
  h += '<div class="pad">' + strip(date) + '</div>';

  // banners
  const bn = [];
  P.notes.forEach((n) => bn.push(bannerHTML(n.tone, esc(n.t))));
  if (P.gateTest && !kneeFlare(date)) bn.push(bannerHTML('good', '<b>' + esc(P.gateTest.n) + ' test today.</b> Confidence rehearsal (3 min), the warm-up, then the test. Tap to log the result.', { a: 'gateLogOpen', v: P.gateTest.id }));
  if (P.yellowAlt && readiness(date) === 'yellow') bn.push(bannerHTML('warn', esc(P.yellowAlt)));
  if (date === t && missedTwice(date)) bn.push(bannerHTML('bad', '<b>Never miss twice.</b> Two sessions missed in a row. Shrink the plan instead of stopping: do a 30-minute full-body session today.', { a: 'workoutMin', v: 'minA' }));
  if (saveError) bn.push(bannerHTML('bad', '<b>This phone refused to save.</b> Storage may be full. Save a backup now from Settings.', { a: 'push', v: 'settings' }));
  const gap = lastTrainedGap(date);
  if (date === t && gap != null && gap > 7) bn.push(bannerHTML('warn', 'Back after ' + gap + ' days off: restart at last week’s loads minus 10% (suggested weights already include it), and retest the knee gate you were on.'));
  if (date === t && [1, 6, 12].includes(P.week) && !quizDone(P.week)) bn.push(bannerHTML('mind', 'Week ' + P.week + ' check-in: take the PSS-10 and GAD-7 (under 5 minutes each).', { a: 'tab', v: 'mind' }));
  if (P.sunday && date <= t && P.week >= 2) { const c = calibration(date); if (c.rate != null) bn.push(bannerHTML(c.tone, '<b>Calibration:</b> ' + (c.rate >= 0 ? '−' : '+') + Math.abs(c.rate).toFixed(1) + ' lb this week. ' + esc(c.rec))); }
  if (bn.length) h += '<div class="pad stack section" style="margin-top:18px">' + bn.join('') + '</div>';

  // hero session, then readiness
  const ms = mainSession(P);
  if (ms) h += '<div class="pad section" style="margin-top:18px">' + sessionHero(ms, date) + '</div>';
  h += '<div class="pad" style="margin-top:10px">' + (readiness(date) || ui.editReady ? readinessCard(date) :
    '<button class="card row" style="width:100%;text-align:left;gap:12px" data-a="sheet" data-v="ready"><span style="width:32px;height:32px;border-radius:8px;background:var(--bad);color:#fff;display:grid;place-items:center;flex:none">' + ic('shield').replace('<svg', '<svg width="19" height="19"') + '</span><span class="grow"><span style="font-weight:600;display:block">30-second readiness check</span><span class="small muted">Swelling check, knee, back, sleep. Sets today’s session</span></span><span class="btn sm ghost">Check in</span></button>') + '</div>';
  P.sessions.filter((s) => s !== ms).forEach((s) => { h += '<div class="pad" style="margin-top:10px">' + sessionHero(s, date, true) + '</div>'; });

  h += '<div class="pad" style="margin-top:12px">' + ringsCard(date) + '</div>';

  // your day
  const rows = checklist(date);
  const doneN = rows.filter((r) => r.done && !r.optional).length, totN = rows.filter((r) => !r.optional).length;
  h += '<section class="pad section"><div class="sec-h"><h2 class="h-md">Your day</h2><span class="small muted tnum">' + doneN + ' of ' + totN + ' done</span></div><div class="list">';
  rows.forEach((r) => {
    const lead = r.thumb ? exThumb(r.thumb, 40) : '<span class="ico" style="color:' + (r.tone ? 'var(--' + r.tone + ')' : 'var(--train)') + '">' + ic(r.ic) + '</span>';
    h += '<div class="li' + (r.done ? ' done' : '') + '"><button class="row grow" style="gap:14px;text-align:left" data-a="' + r.a + '" data-v="' + esc(r.v) + '">' + lead + '<span class="grow"><span class="t" style="display:block">' + esc(r.t) + '</span><span class="s" style="display:block">' + esc(r.s) + '</span></span></button>' +
      (r.auto != null ? '<span class="check' + (r.done ? ' on' : '') + '" aria-label="' + (r.done ? 'Done' : 'Not yet') + '">' + (r.done ? ic('check') : '') + '</span>' : checkBtn(r.done, 'tick', r.key, r.t)) + '</div>';
  });
  h += '</div>';
  h += '</section>';

  // fuel snapshot
  const tg = targets(date), tt = totals(date);
  h += '<section class="pad section"><div class="sec-h"><h2 class="h-md">Fuel</h2><button class="link" data-a="tab" data-v="fuel">Open</button></div><div class="card row" style="gap:16px">' +
    '<div class="bigring" style="width:96px;height:96px">' + ringSVG(tt.kcal / tg.kcal, 96, 9, 'var(--fuel)') + '<div class="c"><div class="h-md tnum">' + fmtN(tt.kcal) + '</div><div class="xs muted">of ' + fmtN(tg.kcal) + '</div></div></div>' +
    '<div class="grow"><div class="row" style="justify-content:space-between"><span class="small fg2">Protein</span><span class="small tnum"><b>' + Math.round(tt.p) + '</b> / ' + tg.p[0] + '–' + tg.p[1] + ' g</span></div><div class="bar" style="margin-top:6px"><i style="width:' + clamp(tt.p / tg.p[0] * 100, 0, 100) + '%;background:var(--fuel)"></i></div>' +
    '<div class="row" style="justify-content:space-between;margin-top:10px"><span class="small fg2">Water</span><span class="small tnum"><b>' + ((d.water || 0) * 0.5).toFixed(1) + '</b> / 2.5–3 L</span></div><div class="bar" style="margin-top:6px"><i style="width:' + clamp((d.water || 0) / 6 * 100, 0, 100) + '%;background:var(--mind)"></i></div>' +
    '<button class="btn fuel sm" style="margin-top:12px" data-a="tab" data-v="fuel">Log meals</button></div></div></section>';

  // mind card
  h += '<section class="pad section"><div class="sec-h"><h2 class="h-md">Mind</h2><button class="link" data-a="tab" data-v="mind">Open</button></div>' + mindTile(P.sit, 'Today’s practice', isDone(date, 'sit')) + '</section>';
  return h;
}

function ringsCard(date) {
  const P = plan(date), rows = checklist(date).filter((r) => !r.optional), tg = targets(date);
  const tr = rows.filter((r) => r.session || ['kneeArmor', 'backReset', 'deepcore', 'core', 'mobility'].includes(r.key)), trD = tr.filter((r) => r.done).length;
  const prot = totals(date).p, mm = (peek(date).mind || []).reduce((a, x) => a + (x.min || 0), 0), mT = ((D.MIND[P.sit] || {}).min || 10) + 5;
  const R = [[trD / Math.max(1, tr.length), 'var(--train)'], [prot / tg.p[0], 'var(--fuel)'], [mm / mT, 'var(--mind)']];
  let svg = '<svg width="108" height="108" viewBox="0 0 108 108" aria-hidden="true">';
  R.forEach(([f, c], i) => {
    const r = 47 - i * 13, C = 2 * Math.PI * r, len = C * clamp(f, 0, 1);
    svg += '<circle cx="54" cy="54" r="' + r + '" fill="none" stroke="' + c + '" stroke-opacity=".22" stroke-width="11"/>';
    if (len > 0.5) svg += '<circle cx="54" cy="54" r="' + r + '" fill="none" stroke="' + c + '" stroke-width="11" stroke-linecap="round" stroke-dasharray="' + len.toFixed(1) + ' ' + C.toFixed(1) + '"/>';
  });
  svg += '</svg>';
  const L = (n, c, v, t, u) => '<div><span style="color:' + c + '">' + n + '</span><div><b class="tnum">' + v + '</b><span class="muted" style="font-weight:500"> / ' + t + (u ? ' ' + u : '') + '</span></div></div>';
  return '<div class="card rings" role="img" aria-label="Train ' + trD + ' of ' + tr.length + ', protein ' + Math.round(prot) + ' of ' + tg.p[0] + ' grams, mind ' + Math.round(mm) + ' of ' + mT + ' minutes">' + svg + '<div class="lg grow">' +
    L('Train', 'var(--train)', trD, tr.length, '') + L('Protein', 'var(--fuel)', Math.round(prot), tg.p[0], 'g') + L('Mind', 'var(--mind)', Math.round(mm), mT, 'min') + '</div></div>';
}
function readinessCard(date) {
  const r = readiness(date), c = peek(date).chk || {};
  if (r && !ui.editReady) {
    const tx = READY_TXT[r], tone = r === 'green' ? 'good' : r === 'yellow' ? 'warn' : 'bad';
    return '<div class="card row" style="gap:12px"><span class="chip ' + tone + '" style="height:30px;font-size:13px">' + tx[0] + '</span><div class="grow small fg2">' + tx[1] + (c.instab ? ' Shifting or giving way: stop that movement, go back one gate and call your PT.' : '') + '</div><button class="small" style="color:var(--fg-2);font-weight:600" data-a="editReady">Edit</button></div>';
  }
  return '<div class="card"><div class="row" style="justify-content:space-between"><h3 class="h-sm">30-second readiness check</h3>' + (r ? '<button class="small" style="color:var(--fg-2);font-weight:600" data-a="editReady">Done</button>' : '') + '</div>' + readinessForm(date) + '</div>';
}
function tierBanner(date) {
  const r = readiness(date);
  return bannerHTML(({ green: 'good', yellow: 'warn', red: 'bad' })[r], '<b>' + READY_TXT[r][0] + ':</b> ' + READY_TXT[r][1]);
}
/* the plan's readiness check: sleep, knee 0–10, morning swelling stroke test (no wave 0 / any wave 1), right low-back stiffness 0–10 */
function readinessForm(date) {
  const c = peek(date).chk || {};
  const seg = (label, key, opts) => '<div><span class="lbl">' + label + '</span><div class="seg">' + opts.map(([v, l]) => '<button class="' + (c[key] === v ? 'on' : '') + '" data-a="chk" data-k="' + key + '" data-v="' + v + '">' + l + '</button>').join('') + '</div></div>';
  return '<div class="stack" style="margin-top:12px">' + seg('Sleep last night', 'sleep', [[4, 'Under 5 h'], [6, '5–7 h'], [8, '7 h +']]) +
    seg('Knee swelling (stroke test)', 'swell', [[0, 'No wave · 0'], [1, 'Any wave · 1']]) +
    scaleRow('Right knee pain (0–10)', 'knee', c.knee) + scaleRow('Right low-back stiffness, morning (0–10)', 'back', c.back) +
    '<div class="row" style="gap:8px;flex-wrap:wrap">' + [['sore', 'Heavy soreness'], ['feet', 'Long day on my feet yesterday'], ['sick', 'Ill'], ['instab', 'Knee shifting or giving way']].map(([k, l]) => '<button class="chip' + (c[k] ? ' bad' : '') + '" style="height:34px" data-a="chkT" data-k="' + k + '">' + l + '</button>').join('') + '</div></div>';
}
function scaleRow(label, key, val, max = 10) {
  let s = '<div><span class="lbl">' + label + '</span><div class="scale" style="grid-template-columns:repeat(' + (max + 1) + ',1fr)">';
  for (let i = 0; i <= max; i++) { const tone = i <= 2 ? 'g' : i <= 4 ? 'y' : 'r'; s += '<button class="' + (val === i ? 'on ' + tone : '') + '" data-a="chk" data-k="' + key + '" data-v="' + i + '">' + i + '</button>'; }
  return s + '</div></div>';
}
function sessionHero(s, date, compact) {
  const done = sessionDone(date, s.sid), img = heroImg(s.hero) || heroImg('walk');
  const meta = [s.dur, s.type === 'lift' && s.src ? s.src.items.length + ' exercises' : ''].filter(Boolean);
  const cta = done ? '<span class="chip good" style="height:32px;font-size:13px">' + ic('check').replace('<svg', '<svg width="14" height="14"') + ' Completed</span>' : '<span class="btn train sm">' + (s.type === 'rest' || s.type === 'recovery' || s.type === 'travel' ? 'Open' : Object.keys(peek(date).sets || {}).some((k) => k.startsWith(s.sid + '|')) ? 'Resume' : 'Start') + '</span>';
  return '<button class="hero' + (done ? ' done' : '') + '" style="min-height:' + (compact ? 190 : 300) + 'px" data-a="workout" data-v="' + s.sid + '">' + (img ? '<img class="bg" src="' + img + '" alt="">' : '') +
    '<span class="badge chip ' + (s.type === 'rest' ? '' : 'train') + '" style="background:rgba(11,12,14,.6)">' + esc(({ lift: 'Strength', hiit: 'HIIT', cardio: 'Cardio', recovery: 'Recovery', rest: 'Rest day', travel: 'Travel' })[s.type] || '') + '</span>' +
    '<span class="in"><span class="eyebrow" style="color:var(--fg-2)">' + esc(s.sub || '') + '</span><span class="' + (compact ? 'h-lg' : 'h-xl') + '">' + esc(s.title) + '</span><span class="row" style="justify-content:space-between;margin-top:4px"><span class="meta">' + meta.map(esc).join('<span>·</span>') + '</span>' + cta + '</span></span></button>';
}
function mindTile(id, eyebrow, done) {
  const m = D.MIND[id] || {};
  return '<button class="mtile ' + mindArt(id) + '" data-a="mind" data-v="' + id + '"><span class="shine"></span><span class="eyebrow" style="color:rgba(255,255,255,.75)">' + esc(eyebrow) + '</span><span class="h-lg" style="margin-top:4px">' + esc(m.n) + '</span><span class="row" style="justify-content:space-between;margin-top:8px"><span class="small" style="color:rgba(255,255,255,.85);font-weight:600">' + m.min + ' min · ' + esc(m.sub) + '</span>' +
    (done ? '<span class="chip good" style="background:rgba(0,0,0,.35)">Done</span>' : '<span class="icon-btn" style="background:#fff;color:#111">' + ic('play') + '</span>') + '</span></button>';
}

/* ------------------------------------------------------------------ TRAIN */
function vTrain() {
  const t = todayISO(), cw = clamp(weekOf(t), 1, 13), w = ui.trainWeek || cw;
  const ph = phaseOf(w), info = D.WEEKS[w] || {};
  let h = topHeader('Comeback Season · Road to Sri Lanka', 'Train', avatarBtn());
  h += '<div class="pad"><div class="phase-bar" role="tablist" aria-label="Weeks">';
  for (let i = 1; i <= 13; i++) h += '<button class="' + (i < cw ? 'past' : '') + (i === cw && weekOf(t) >= 1 ? ' cur' : '') + (i === w ? ' sel' : '') + '" data-a="trainWeek" data-v="' + i + '" aria-label="Week ' + i + '">' + i + '</button>';
  h += '</div><div class="row" style="justify-content:space-between;margin-top:14px;align-items:flex-start"><div><div class="eyebrow">' + (ph.n <= 4 ? 'Phase ' + ph.n : esc(ph.name)) + ' · ' + fmtShort(weekStart(w)) + ' – ' + fmtShort(addDays(weekStart(w), 6)) + '</div><h2 class="h-lg" style="margin-top:4px">Week ' + w + ' · ' + esc(ph.name) + '</h2><p class="small fg2" style="margin:6px 0 0">' + esc(info.focus || '') + (info.event ? ' · <span style="color:var(--warn)">' + esc(info.event) + '</span>' : '') + '</p></div><span class="chip train" style="white-space:nowrap">RIR ' + esc(info.rir || '') + '</span></div></div>';

  h += '<section class="pad section"><div class="list">';
  for (let i = 0; i < 7; i++) {
    const d = addDays(weekStart(w), i), P = plan(d), s = mainSession(P);
    const done = s && sessionDone(d, s.sid);
    h += '<button class="li" data-a="openDay" data-v="' + d + '">' + (s ? exThumb(s.hero, 52) : '<span class="thumb"></span>') +
      '<span class="grow"><span class="eyebrow" style="display:block;font-size:12px">' + DOW[i] + ' ' + pISO(d).getDate() + (d === t ? ' · Today' : '') + (P.gateTest ? ' · ' + esc(P.gateTest.n) + ' test' : '') + '</span><span class="t" style="display:block">' + esc(s ? s.title : 'Rest') + '</span><span class="s" style="display:block">' + esc(s ? [s.dur, s.sub].filter(Boolean).join(' · ') : '') + '</span></span>' +
      '<span class="check' + (done ? ' on' : '') + '">' + (done ? ic('check') : '') + '</span></button>';
  }
  h += '</div></section>';

  h += '<section class="section"><div class="sec-h pad"><h2 class="h-md">Daily routines</h2></div><div class="rail pad">' +
    [['kneeArmor', 'Knee Armor', '~10 min · daily to Wk 6, then M/W/F'], ['backReset', 'Back Reset', '~5 min · daily until back clear'], ['deepcore', 'Deep Core', '4 min · every morning'], ['ramp_upper', 'Ramp · Pull and Push', '6–8 min · Mon and Thu'], ['ramp_lower', 'Ramp · lower days', '6–8 min · Tue and Sat'], ['mobility', 'Easy mobility', '10 min · Wednesdays']]
      .map(([id, n, sub]) => routineTile(id, n, sub)).join('') + '</div></section>';

  const cp = coreSet(w), f = coreFmt(w);
  h += '<section class="section"><div class="sec-h pad"><h2 class="h-md">Core finishers</h2><span class="small muted">' + f[0] + ' s on / ' + f[1] + ' s off · ' + f[2] + (f[2] > 1 ? ' rounds' : ' round') + (f[3] ? ' · last to failure' : '') + '</span></div><div class="rail pad">' +
    ['A', 'B', 'C'].map((k) => '<button class="tile wide" data-a="core" data-v="' + k + '" data-w="' + w + '"><div class="art">' + (EX[D.CORE[cp][k][0]].img ? '<img src="' + heroImg(D.CORE[cp][k][0]) + '" alt="">' : '<div class="figbox" style="height:100%">' + figSVG(EX[D.CORE[cp][k][0]].fig || 'breath', false) + '</div>') + '</div><div class="tx"><div class="tt">' + esc(D.CORE_NAMES[k]) + '</div><div class="ts">' + ['Mon', 'Tue and Sat', 'Thu'][['A', 'B', 'C'].indexOf(k)] + ' · ' + D.CORE[cp][k].map((e) => EX[e].n.split(',')[0]).slice(0, 3).map(esc).join(', ') + '…</div></div></button>').join('') + '</div></section>';

  h += '<section class="section"><div class="sec-h pad"><h2 class="h-md">Minimum Viable Week</h2><span class="small muted">Busy, travelling, run-down</span></div><div class="pad stack">' +
    ['minA', 'minB'].map((k) => '<button class="li card" style="padding:12px" data-a="workoutMin" data-v="' + k + '">' + exThumb(D.MIN[k].hero, 52) + '<span class="grow"><span class="t" style="display:block">' + D.MIN[k].title + '</span><span class="s" style="display:block">Two 30-min full-body sessions + Knee Armor + 4 walks + the protein target</span></span>' + ic('next').replace('<svg', '<svg width="18" height="18"') + '</button>').join('') +
    '<p class="xs muted" style="margin:2px 2px 0">No gym: single-leg glute bridges, banded kickbacks and abductions, push-ups, band rows, wall sits, side planks.</p></div></section>';

  h += '<section class="section pad"><div class="sec-h"><h2 class="h-md">The rules</h2></div><button class="li card" style="padding:14px" data-a="push" data-v="rules"><span class="ico" style="color:var(--train)">' + ic('shield') + '</span><span class="grow"><span class="t" style="display:block">Progression, traffic lights, readiness and knee gates</span><span class="s" style="display:block">Read once, apply every session</span></span>' + ic('next').replace('<svg', '<svg width="18" height="18"') + '</button></section>';
  return h;
}
function routineTile(id, n, sub) {
  const r = D.ROUTINES[id];
  return '<button class="tile" data-a="routine" data-v="' + id + '"><div class="art">' + (EX[r.hero].img ? '<img src="' + heroImg(r.hero) + '" alt="">' : '<div class="figbox" style="height:100%">' + figSVG(EX[r.hero].fig, false) + '</div>') + '</div><div class="tx"><div class="tt">' + esc(n) + '</div><div class="ts">' + esc(sub) + '</div></div></button>';
}

/* rules layer */
function lRules() {
  let h = '<div class="layer"><div class="wrap"><div class="lbar pad solid"><button class="icon-btn" data-a="pop" aria-label="Back">' + ic('back') + '</button><div class="h-sm">The rules</div><span style="width:44px"></span></div><div class="pad stack" style="margin-top:8px">';
  const fold = (t, items, open) => '<details class="fold"' + (open ? ' open' : '') + '><summary>' + t + '</summary><div class="fb"><ul>' + items.map((x) => '<li>' + x + '</li>').join('') + '</ul></div></details>';
  h += fold('Progression and effort', ['<b>Main lifts: top set + back-offs.</b> Work up to one top set at the target reps and RIR, then back-offs 10–15% lighter. Top of the range at that RIR → add 5 lb to barbell lifts (10 lb on the hip thrust) or go up one dumbbell size next week.',
    '<b>Accessories: double progression.</b> Top of the rep range on all sets → add weight.',
    '<b>Effort (RIR).</b> Upper body: RIR 2 in Week 1, then 1–2, and the last isolation set to failure from Phase 3. Hip work (hip thrusts, RDLs, kickbacks): RIR 3 in Weeks 1–2, RIR 2 in Weeks 3–6, RIR 1 from Week 7. Anything that bends the knee under load (leg extension, leg curl, squats and lunges once they return): never closer than RIR 2 until Gate 2. Knee Lab: every set stops at RIR 3, knee pain 0–2.',
    '<b>Rest:</b> heavy top sets 2:30–3:00; other compounds 2 min (90 s from Phase 3); supersets 45–60 s; finishers 30–45 s. Timer on every set.',
    'Upper-body strength comes back fast; hip strength follows by Week 4. Holding strength in a deficit means you are keeping muscle.'], true);
  h += fold('Intensity techniques', D.TECHNIQUES.map(([a, b]) => '<b>' + esc(a) + ':</b> ' + esc(b)));
  h += fold('Knee traffic light', ['Score the knee during the session and again the next morning.', '<b style="color:var(--good)">0–2/10, no new swelling:</b> train as written.', '<b style="color:var(--warn)">3–5/10, or puffier next morning:</b> that exercise goes one level down (less load, less range, or the swap) for the next two sessions.', '<b style="color:var(--bad)">Above 5, swelling that lasts the day, or shifting, slipping or giving way:</b> stop that movement, go back one gate, and call your PT. Never push through instability.', 'A dull ache after a long day on your feet that’s gone by morning is fine. Sharp pain at the front of the knee isn’t.', 'The app also holds you at your current gate on any morning with knee pain above 2 or swelling, and uses the level below that day.']);
  h += fold('Low-back traffic light', ['<b style="color:var(--good)">Stiffness 0–2 that eases as you warm up:</b> train; keep RDLs at the weight where your back stays neutral.', '<b style="color:var(--warn)">3+ during a lift, or stiffer the next morning:</b> swap that lift for the day (RDL → cable pull-through or hip thrust; back extension → glute bridge hold) and do the Back Reset after the session.', '<b style="color:var(--bad)">Pain into the buttock or down the leg, numbness or tingling:</b> stop all hinging and see your doctor.', '<b>Back clear</b> = morning stiffness 0 for 7 straight days. It opens heavier RDLs, back extensions, KB swings, barbell rows, standing overhead press, the ab wheel and loaded rotation. Heavy deadlifts need back clear and Gate 2.']);
  h += fold('Readiness check', ['<b style="color:var(--good)">Green</b> (slept 7+ h, knee 0–2, back 0–2, no new swelling): full session.', '<b style="color:var(--warn)">Yellow</b> (5–7 h sleep, knee or back 3–4, heavy soreness, a long day on your feet yesterday): one set fewer per exercise, no finisher, knee work one level down.', '<b style="color:var(--bad)">Red</b> (under 5 h, knee or back 5+, swelling, ill): Knee Armor + Back Reset + walk, or the 30-minute Minimum session.', 'Swelling check: sit with the leg straight and relaxed; stroke up the inside of the knee from below the kneecap 2–3 times, then down the outside once. No wave of fluid = 0, any wave = 1. A 1 two mornings running means the day before was too much.']);
  h += fold('Knee gates', KG.map((g) => '<b>' + esc(g.n) + ' · ' + esc(g.what) + '</b> (earliest ' + esc(g.planDate && g.id === 'g3' ? fmtD(g.earliest) + '; the plan says ' + g.planDate + ', but Gate 2 + 2 weeks makes Dec 28 the first possible day' : g.planDate || fmtD(g.earliest)) + '): ' + g.crit.map(esc).join('; ') + '. <i>Then:</i> ' + esc(g.then) + '.').concat(['Each level opens on a test, logged on its date. "Index" = right-leg result ÷ left-leg result on single-leg leg extension 10RM, single-leg seated leg curl 10RM and single-leg glute bridge reps.', 'Miss a gate: retest weekly and keep training the level below. The cut and the glutes stay on track; only the knee-specific options wait.']));
  h += fold('Swapped until the gate opens', D.SWAPPED.map(([a, b]) => esc(a) + ' → ' + esc(b)));
  h += fold('Everyday life while the knee and back settle', ['Stairs: lead with the left leg going up and the right going down until Gate 1.', 'Unpacking and lifting: boxes close to the body, hinge at the hips, turn with your feet, never by twisting on a planted right foot.', 'After a long day on your feet: legs up 10 min; ice the knee 10–15 min if it’s puffy.', 'Sleep on your side with a pillow between the knees if the back is stiff in the morning.']);
  h += fold('Never Zero', ['Never miss twice. One missed session is noise; two in a row is a trend.', 'Missed sessions are dropped, not crammed into the next day. If one lower day is missed, the other one stays.', 'Back after more than 7 days off: restart at last week’s loads minus 10%, and retest the knee gate you were on.', 'Knee Armor and Back Reset happen every morning through Week 6, even in the worst week.', 'Minimum Viable Week: two 30-min full-body sessions + Knee Armor + 4 walks + the protein target.']);
  h += fold('Red flags: see a doctor, don’t wait', D.RED_FLAGS.map(esc));
  return h + '<p class="xs muted" style="margin:4px 2px 0">If your PT gave you exercises or limits, theirs win where they differ from the plan.</p></div></div></div>';
}
/* ------------------------------------------------------------------ WORKOUT overview layer */
function findSession(date, sid) {
  if (sid === 'minA' || sid === 'minB') return sess(sid, 'lift', D.MIN[sid], { min: true, kind: 'min' });
  return plan(date).sessions.find((s) => s.sid === sid) || null;
}
function lWorkout(p) {
  const date = p.date, s = findSession(date, p.sid);
  if (!s) return '';
  const P = plan(date), done = sessionDone(date, s.sid), img = heroImg(s.hero) || heroImg('walk');
  let h = '<div class="layer"><div class="wrap">';
  const bar = '<div class="lbar float pad"><button class="icon-btn glass" data-a="pop" aria-label="Back">' + ic('back') + '</button><span class="ttl">' + esc(s.title) + '</span>' + (s.type === 'lift' ? '<button class="icon-btn glass" data-a="push" data-v="rules" aria-label="Rules">' + ic('info') + '</button>' : '<span style="width:44px"></span>') + '</div>';
  h += '<div class="hero" style="border-radius:0;min-height:330px">' + (img ? '<img class="bg" src="' + img + '" alt="">' : '') +
    '<div class="in pad" style="padding-bottom:20px"><span class="eyebrow" style="color:var(--fg-2)">' + esc(fmtD(date)) + (P.week >= 1 && P.week <= 13 ? ' · Week ' + P.week + ' · ' + esc(P.phase.name) : '') + '</span><h1 class="h-xl" style="font-size:52px">' + esc(s.title) + '</h1><div class="chips">' +
    [s.dur, s.sub].filter(Boolean).map((x) => '<span class="chip" style="background:rgba(11,12,14,.6)">' + esc(x) + '</span>').join('') + '</div></div></div>';
  h += '<div class="pad stack" style="margin-top:14px">';
  if (s.type === 'lift' || s.type === 'hiit') {
    const r = readiness(date);
    if (!r) h += bannerHTML('warn', '<b>Readiness check first.</b> 30 seconds: swelling check, knee, back, sleep. It sets today’s session.', { a: 'sheet', v: 'ready' });
    else if (r !== 'green') { h += bannerHTML(r === 'yellow' ? 'warn' : 'bad', '<b>' + READY_TXT[r][0] + ':</b> ' + READY_TXT[r][1] + (r === 'red' ? ' <u>Switch to a 30-minute full-body session</u>.' : ' Sets already adjusted.'), r === 'red' ? { a: 'workoutMin', v: 'minA' } : null); }
    else h += bannerHTML('good', '<b>Green:</b> full session.');
  }
  if (P.gateTest && !s.min) h += bannerHTML(kneeFlare(date) ? 'warn' : 'good', kneeFlare(date) ? '<b>' + esc(P.gateTest.n) + ' test:</b> not today, the knee flagged this morning.' : '<b>' + esc(P.gateTest.n) + ' test first.</b> Confidence rehearsal, warm-up, then the test. Tap to log it.', kneeFlare(date) ? null : { a: 'gateLogOpen', v: P.gateTest.id });
  P.notes.filter((n) => n.tone === 'train').forEach((n) => { h += bannerHTML('', esc(n.t)); });
  if (P.yellowAlt && !s.min && s.type === 'lift') h += bannerHTML(readiness(date) === 'yellow' ? 'warn' : '', esc(P.yellowAlt));
  h += '</div>';

  if (P.tests.length && !s.min) h += testsCard(date, P);

  if (s.type === 'lift') h += liftOverview(s, date, P);
  else if (s.type === 'hiit') h += hiitOverview(s, date, P);
  else if (s.type === 'cardio') h += cardioOverview(s, date, P);
  else h += restOverview(s, date, P);

  // the bar and the CTA are children of the non-scrolling shell, outside the scroller, so they stay pinned
  h += '</div>' + bar + '<div class="sticky-cta pad"><div class="in">';
  if (s.type === 'lift') {
    const anyLogged = sessionItems(s, date).some((it) => setsFor(date, s.sid, it).length);
    h += done ? '<button class="btn ghost block" data-a="undoSession" data-v="' + s.sid + '">Completed · undo</button>' :
      '<button class="btn train block" data-a="startLift" data-v="' + s.sid + '">' + (anyLogged ? 'Resume workout' : 'Start workout') + '</button>';
  } else {
    h += done ? '<button class="btn ghost block" data-a="undoSession" data-v="' + s.sid + '">Completed · undo</button>' : '<button class="btn train block" data-a="completeSession" data-v="' + s.sid + '">Mark complete</button>';
  }
  h += '</div></div></div>';
  return h;
}
function testsCard(date, P) {
  const colN = { base: 'Baseline', w6: 'Week 6', w12: 'Week 12' };
  let h = '<section class="pad section" style="margin-top:20px"><div class="sec-h"><h2 class="h-md">Benchmarks today</h2><span class="chip">' + colN[benchCol(P.week, P.tests[0])] + '</span></div><div class="card"><table class="tbl"><tbody>';
  P.tests.forEach((id) => {
    const b = D.BENCHMARKS.find((x) => x.id === id); if (!b) return;
    const col = benchCol(P.week, id), v = (S.bench[id] || {})[col] || '';
    h += '<tr><td><div style="font-weight:600">' + esc(b.n) + '</div><div class="xs muted">' + esc(b.how) + '</div></td><td style="text-align:right"><input inputmode="decimal" data-in="bench" data-k="' + id + '" data-c="' + col + '" value="' + esc(v) + '" placeholder="' + esc(b.unit) + '" aria-label="' + esc(b.n) + '"></td></tr>';
  });
  return h + '</tbody></table></div><p class="xs muted" style="margin:6px 2px 0">Photos: front, side, back and glutes, same light, morning.</p></section>';
}
function liftOverview(s, date, P) {
  const items = sessionItems(s, date), groups = groupItems(items);
  let h = '';
  if (s.src.ramp) { const R = D.ROUTINES['ramp_' + s.src.ramp]; h += '<section class="pad section"><div class="sec-h"><h2 class="h-md">Warm-up</h2><span class="small muted">6–8 min</span></div><div class="list"><div class="li"><button class="row grow" style="gap:14px;text-align:left" data-a="routine" data-v="ramp_' + s.src.ramp + '">' + exThumb(R.hero, 52) + '<span class="grow"><span class="t" style="display:block">' + esc(R.title) + '</span><span class="s" style="display:block">' + esc(R.steps.map((x) => EX[x.ex].n).slice(0, 4).join(', ')) + (s.src.ramp === 'lower' ? ', then ramp-up sets on lift 1' : '') + '</span></span></button>' + checkBtn(isDone(date, 'ramp'), 'tick', 'ramp', 'Ramp done') + '</div></div></section>'; }
  h += '<section class="pad section"><div class="sec-h"><h2 class="h-md">Workout</h2><span class="small muted">' + items.length + ' exercises</span></div>';
  groups.forEach((g) => {
    const ss = g.items.length > 1, last = g.items[g.items.length - 1];
    h += '<div class="group' + (ss ? ' ss' : '') + '">';
    if (ss) h += '<div class="gh"><span class="eyebrow" style="color:var(--train)">' + (g.items.length === 2 ? 'Superset' : 'Tri-set') + ' · ' + last.sets + ' rounds</span><span class="xs muted">Rest ' + (last.rest || 0) + ' s after the ' + (g.items.length === 2 ? 'pair' : 'round') + '</span></div>';
    g.items.forEach((it) => { h += exRow(it, s, date); });
    h += '</div>';
  });
  h += '</section>';
  if (P.core && !s.min) {
    const cp = coreSet(P.week), f = coreFmt(P.week);
    h += '<section class="pad section"><div class="sec-h"><h2 class="h-md">Core finisher</h2><span class="small muted">' + f[0] + '/' + f[1] + ' s · ' + f[2] + (f[2] > 1 ? ' rounds' : ' round') + '</span></div><div class="list"><div class="li"><button class="row grow" style="gap:14px;text-align:left" data-a="core" data-v="' + P.core + '">' + exThumb(D.CORE[cp][P.core][0], 52) + '<span class="grow"><span class="t" style="display:block">' + esc(D.CORE_NAMES[P.core]) + '</span><span class="s" style="display:block">' + D.CORE[cp][P.core].map((e) => EX[dayEx(e, date).ex].n.split(',')[0]).map(esc).join(' → ') + '</span></span></button>' + checkBtn(isDone(date, 'core'), 'tick', 'core', 'Core finisher done') + '</div></div>' + (readiness(date) === 'yellow' ? '<p class="small muted" style="margin:8px 2px 0">Yellow day: skip the finisher.</p>' : '') + '</section>';
  }
  return h;
}
function cap(s) { return s ? s[0].toUpperCase() + s.slice(1) : ''; }
function rxText(it) {
  if (it.kind === 'emom') return it.minutes + '-min EMOM · ' + it.odd.label + ' / ' + it.even.label;
  if (it.kind === 'pump') return it.label + ' · ' + it.items.map((x) => EX[x.ex].n.split(',')[0] + ' ' + x.label).join(' + ');
  if (it.kind) return it.label || '';
  const rest = it.restLabel ? ' · rest ' + it.restLabel : it.rest ? ' · rest ' + it.rest + ' s' : '';
  const rir = it.rir ? ' · RIR ' + it.rir : '';
  if (it.rx) return it.rx + rir;
  if (it.scheme === 'top') return 'Top set 1 × ' + it.topReps + ' @ RIR ' + it.topRIR + ', then ' + (it.sets - 1) + ' × ' + it.reps + ' ' + (it.backTxt || 'at −' + it.backPct + '%') + rest;
  const r = it.time ? (it.timeLabel || it.time + ' s') : it.dist ? it.dist : it.reps;
  return it.sets + ' × ' + r + (it.side ? (it.dist ? ' per side' : ' per ' + (EX[it.ex] && EX[it.ex].knee ? 'leg' : 'side')) : '') + rir + rest;
}
const GATE_NAME = { bc: 'back clear', gA: 'Gate A', g1: 'Gate 1', g2: 'Gate 2', g3: 'Gate 3', g4: 'Gate 4' };
function gateTxt(g) {
  if (g.day) return 'Back day: ' + EX[g.from].n + ' swapped';
  const ids = [].concat(g.gate).map((x) => GATE_NAME[x] || x).join(' + ');
  return EX[g.from].n + ' waits for ' + ids;
}
function exRow(it, s, date) {
  const def = EX[it.ex] || {}, logged = setsFor(date, s.sid, it).filter((x) => x && x.done), sg = suggest(it, date);
  const doneAll = it.kind ? isDone(date, 'x:' + s.sid + ':' + it.k) : logged.length >= it.sets;
  const tags = [];
  if (it.tech) tags.push('<span class="chip train" style="height:22px;font-size:11px">' + esc(it.tech) + '</span>');
  if (it.gated) tags.push('<span class="chip warn" style="height:22px;font-size:11px">' + ic('lock').replace('<svg', '<svg width="11" height="11"') + ' ' + esc(gateTxt(it.gated)) + '</span>');
  if (it.kneeLow) tags.push('<span class="chip warn" style="height:22px;font-size:11px">Knee: one level down</span>');
  if (it.swapped) tags.push('<span class="chip" style="height:22px;font-size:11px">Swapped</span>');
  if (it.optional) tags.push('<span class="chip" style="height:22px;font-size:11px">Optional</span>');
  if (it.backSkip) tags.push('<span class="chip bad" style="height:22px;font-size:11px">Skip today: back above ' + it.backSkip + '</span>');
  if (it.skipped) tags.push('<span class="chip bad" style="height:22px;font-size:11px">Stopped today</span>');
  if (it.fin) tags.push('<span class="chip train" style="height:22px;font-size:11px">Peak pump finisher</span>');
  const lastTxt = logged.length ? logged.map((x) => (x.w ? x.w + '×' : '') + (x.r || x.t || '✓')).join(', ') : sg && sg.last ? 'Last: ' + sg.last.sets.map((x) => (x.w ? x.w + '×' : '') + (x.r || '')).join(', ') : '';
  return '<button class="exrow' + (doneAll ? ' done' : '') + '" data-a="exInfo" data-v="' + it.ex + '" data-k="' + it.k + '" data-s="' + s.sid + '">' + exThumb(it.ex, 60) +
    '<span class="grow" style="min-width:0"><span class="k">' + esc(it.k) + '</span> <span class="t">' + esc(def.n) + '</span><span class="s" style="display:block">' + esc(rxText(it)) + '</span>' +
    (it.note ? '<span class="xs muted" style="display:block;margin-top:2px">' + esc(it.note) + '</span>' : '') +
    (tags.length ? '<span class="chips" style="margin-top:5px">' + tags.join('') + '</span>' : '') +
    (lastTxt ? '<span class="last" style="display:block">' + (logged.length ? '<span class="tick">Today: </span>' : '') + esc(lastTxt) + '</span>' : '') + '</span>' +
    (doneAll ? '<span class="check on">' + ic('check') + '</span>' : '') + '</button>';
}
function hiitOverview(s, date, P) {
  const src = s.src;
  let h = '<section class="pad section"><div class="sec-h"><h2 class="h-md">Warm-up</h2></div><div class="card small fg2">' + esc(src.warmup) + '</div></section>';
  if (s.optional) h += '<section class="pad section">' + bannerHTML('mind', 'Optional today. Pick one block, about 10 minutes.') + '</section>';
  src.blocks.forEach((b, i) => {
    const done = isDone(date, 'b:' + s.sid + ':' + i);
    let sub = b.label || '';
    if (b.kind === 'circuit') sub = b.rounds + ' rounds · ' + (b.restLabel || 'rest ' + b.rest + ' s between rounds');
    if (b.kind === 'amrap') sub = b.minutes + '-min AMRAP' + (b.label ? ' · ' + b.label : '');
    if (b.kind === 'sets') sub = (b.rounds || 2) + ' rounds · ' + (b.rest || 45) + ' s rest';
    h += '<section class="pad section"><div class="sec-h"><h2 class="h-md">' + (i + 1) + ' · ' + esc(b.name) + '</h2>' + checkBtn(done, 'tick', 'b:' + s.sid + ':' + i, b.name + ' done') + '</div><div class="group">';
    const items = b.items || (b.kind === 'emom' ? [b.odd, b.even] : [{ ex: b.ex, label: '' }]);
    items.forEach((x) => { const r = dayEx(x.ex, date), xe = r.ex; h += '<button class="exrow" data-a="exInfo" data-v="' + xe + '">' + exThumb(xe, 56) + '<span class="grow"><span class="t">' + esc(EX[xe].n) + '</span><span class="s" style="display:block">' + esc(x.label || '') + '</span>' + (r.gated ? '<span class="chips" style="margin-top:5px"><span class="chip warn" style="height:22px;font-size:11px">' + esc(gateTxt(r.gated)) + '</span></span>' : '') + '</span></button>'; });
    h += '<div style="padding:8px 14px 10px"><div class="small fg2" style="margin-bottom:10px">' + esc(sub) + '</div><button class="btn train sm" data-a="startBlock" data-v="' + i + '" data-s="' + s.sid + '">' + ic('timer').replace('<svg', '<svg width="18" height="18"') + ' Start ' + ({ interval: 'intervals', circuit: 'circuit', efforts: 'efforts', amrap: 'AMRAP', sets: 'sets', emom: 'EMOM' })[b.kind] + '</button>' +
      (b.kind === 'amrap' ? '<span class="small muted" style="margin-left:10px">' + (peek(date).rounds && peek(date).rounds[s.sid + ':' + i] != null ? 'Logged: ' + peek(date).rounds[s.sid + ':' + i] + ' rounds' : '') + '</span>' : '') + '</div></div></section>';
  });
  if (src.pool) h += '<section class="pad section"><div class="card small fg2">' + ic('wave').replace('<svg', '<svg width="16" height="16" style="vertical-align:-3px;margin-right:4px"') + esc(src.pool) + '</div></section>';
  if (src.cooldown) h += '<section class="pad section"><div class="card small fg2"><b>After:</b> ' + esc(src.cooldown) + '</div></section>';
  return h;
}
function cardioOverview(s, date, P) {
  const c = s.cardio || {}, d = peek(date), log = (d.cardio || {})[s.sid] || {};
  const ex = s.hero === 'swim' ? 'swim' : 'walk';
  let h = '<section class="pad section"><div class="sec-h"><h2 class="h-md">Session</h2></div><div class="group"><button class="exrow" data-a="exInfo" data-v="' + ex + '">' + exThumb(ex, 56) + '<span class="grow"><span class="t">' + esc(s.title) + '</span><span class="s" style="display:block">' + esc(c.text || '') + '</span></span></button></div>';
  h += '<div class="row" style="gap:10px;margin-top:12px;flex-wrap:wrap"><button class="btn train sm" data-a="startCardio" data-v="' + s.sid + '">' + ic('timer').replace('<svg', '<svg width="18" height="18"') + ' Start ' + (c.min || 30) + '-min timer</button></div></section>';
  h += '<section class="pad section"><div class="sec-h"><h2 class="h-md">Log it</h2></div><div class="card stack"><div class="row" style="gap:10px">' +
    '<label class="grow"><span class="lbl">Minutes</span><input class="field" inputmode="decimal" data-in="cardio" data-s="' + s.sid + '" data-k="min" value="' + esc(log.min || '') + '" placeholder="' + (c.min || 30) + '"></label>' +
    '<label class="grow"><span class="lbl">Distance</span><input class="field" inputmode="decimal" data-in="cardio" data-s="' + s.sid + '" data-k="dist" value="' + esc(log.dist || '') + '" placeholder="m or mi"></label></div>' +
    '<p class="small muted" style="margin:0">Easy and knee-safe: flutter kick, open turns.</p></div></section>';
  return h;
}
function restOverview(s, date, P) {
  const rows = [];
  if (s.sid === 'kickoff') rows.push(['k:tape', 'Get a tape measure ready for Monday', 'Waist at the navel, hips at the widest point, upper thigh 2 in below the glute fold, mid-thigh'], ['k:weigh', 'Weigh in tomorrow morning', 'Daily weigh-ins feed the 7-day average'], ['k:book', "Book the week's training times with Nadun", 'Mon Pull · Tue Lower · Wed Recovery · Thu Push · Fri Polo Day · Sat Knee Lab'], ['k:cook', 'Cook protein for Mon–Wed together', 'Chicken, 93/7 beef, eggs, cottage cheese'], ['k:reminder', 'Set an hourly stand-up reminder', 'If you sit for work']);
  if (s.type === 'recovery') rows.push(['walk', P.walk || 'Walk 40–45 min', 'Outside if you can'], ['kneeArmor', 'Knee Armor', '~10 min'], ['backReset', 'Back Reset', '~5 min']);
  if (s.type === 'recovery' && P.mobility) rows.push(['mobility', 'Easy mobility', '10 min · cat-camel, 90/90 hip switches, standing quad and hip-flexor stretches']);
  if (s.type === 'rest' && s.sid !== 'kickoff') {
    rows.push(['walk', P.walk || 'Long walk 45–60 min', P.sunday ? 'Make it the phone-free walk: no podcast, no calls' : 'After the big meal']);
    if (P.sunday) rows.push(['reset', 'Sunday Reset', 'Open the weekly check']);
    if (P.kneeArmor) rows.push(['kneeArmor', 'Knee Armor', '~10 min']);
    if (P.backReset) rows.push(['backReset', 'Back Reset', '~5 min']);
  }
  if (s.type === 'travel') rows.push(['t:socks', 'Compression socks', ''], ['t:walk', 'Walk the aisle every 1–2 h', ''], ['t:pumps', 'Ankle pumps and quad sets in your seat', ''], ['t:pillow', 'A small pillow behind the low back', ''], ['t:water', '3 L of water', 'No water cutting'], ['t:protein', 'Protein snacks', '']);
  let h = '<section class="pad section"><div class="sec-h"><h2 class="h-md">' + (s.type === 'travel' ? 'Travel checklist' : 'Today') + '</h2></div><div class="list">';
  rows.forEach(([k, t, sub]) => {
    const act = k === 'reset' ? 'data-a="sheet" data-v="sunday"' : D.ROUTINES[k] ? 'data-a="routine" data-v="' + k + '"' : '';
    h += '<div class="li"><' + (act ? 'button ' + act : 'div') + ' class="grow" style="text-align:left"><span class="t" style="display:block">' + esc(t) + '</span>' + (sub ? '<span class="s" style="display:block">' + esc(sub) + '</span>' : '') + '</' + (act ? 'button' : 'div') + '>' + checkBtn(isDone(date, k), 'tick', k, t) + '</div>';
  });
  return h + '</div></section>';
}
/* ------------------------------------------------------------------ FUEL */
function vFuel() {
  const date = ui.date, tg = targets(date), tt = totals(date), d = peek(date), dw = dowOf(date), P = plan(date);
  let h = topHeader(esc(date === todayISO() ? 'Today · ' + fmtD(date) : fmtD(date)), 'Fuel', aiHeaderRight());
  h += '<div class="pad">' + strip(date, 'var(--fuel)') + '</div>';
  h += '<section class="pad section" style="margin-top:18px">' + aiHeroHTML(date) + '</section>';

  h += '<section class="pad section"><div class="sec-h"><h2 class="h-md">Meals</h2><button class="link" data-a="logPlan">Log the whole plan</button></div>' + aiJobsHTML(date);
  D.SLOTS.forEach((sl) => {
    const pf = plannedFood(date, sl.id), logged = mealsFor(date).map((m, i) => Object.assign({ i }, m)).filter((m) => m.slot === sl.id);
    if (!pf && !logged.length && sl.id === 'pre') return;
    h += '<div class="slot"><div class="row" style="justify-content:space-between;margin-bottom:8px"><h3 class="h-sm" style="color:var(--fg-2)">' + sl.n + '</h3><button class="small" style="color:var(--fuel);font-weight:700" data-a="sheet" data-v="food" data-s="' + sl.id + '">+ Add</button></div><div class="stack" style="gap:8px">';
    if (pf && !logged.some((m) => m.fid === pf.id)) h += foodCard(pf, '<button class="check" data-a="eat" data-v="' + pf.id + '" data-s="' + sl.id + '" aria-label="Log ' + esc(pf.n) + '"></button>', 'Planned · tap the circle when eaten', sl.id);
    logged.forEach((m) => { h += foodCard(m, '<button class="check on" data-a="uneat" data-v="' + m.i + '" aria-label="Remove ' + esc(m.n) + '">' + ic('check') + '</button>', (m.q && m.q !== 1 ? m.q + ' × · ' : '') + 'Logged', sl.id); });
    h += '</div></div>';
  });
  h += '</section>';
  h += aiExHTML(date);

  // water + supplements
  h += '<section class="pad section"><div class="sec-h"><h2 class="h-md">Water</h2><span class="small muted tnum">' + ((d.water || 0) * 0.5).toFixed(1) + ' / 2.5–3 L' + (P.sessions.some((s) => s.type === 'hiit') ? ' · electrolytes today (Polo Day)' : '') + '</span></div><div class="water">';
  for (let i = 1; i <= 6; i++) h += '<button class="' + ((d.water || 0) >= i ? 'on' : '') + '" data-a="water" data-v="' + i + '" aria-label="' + (i * 0.5) + ' litres">' + ic('water').replace('<svg', '<svg width="18" height="18" style="opacity:.8"') + '</button>';
  h += '</div><p class="xs muted" style="margin:6px 2px 0">Each drop is a 500 ml bottle.</p></section>';
  const m = pISO(date).getMonth() + 1;
  h += '<section class="pad section"><div class="sec-h"><h2 class="h-md">Supplements</h2></div><div class="list">' + D.SUPPS.filter((x) => !x.months || x.months.includes(m)).map((x) => {
    const on = !!(d.supps && d.supps[x.id]);
    return '<div class="li"><span class="grow"><span class="t" style="display:block">' + esc(x.n) + '</span><span class="s" style="display:block">' + esc(x.d) + '</span></span>' + checkBtn(on, 'supp', x.id, x.n) + '</div>';
  }).join('') + '</div><p class="xs muted" style="margin:6px 2px 0">Caffeine before training, none after 2 pm. Ask your doctor to check ferritin and iron.</p></section>';

  // drinks + free meals
  if (dw >= 3 || BIG_DAYS[date]) {
    const dr = d.drinks || {}, tot = drinksOn(date), capN = drinkCap(date), bad = tot > capN;
    h += '<section class="pad section"><div class="sec-h"><h2 class="h-md">Drinks</h2><span class="small ' + (bad ? '' : 'muted') + ' tnum" style="' + (bad ? 'color:var(--bad)' : '') + '">' + tot + ' tonight · cap ' + capN + '</span></div><p class="xs muted" style="margin:-4px 2px 8px">About 100–125 kcal each. Cap 2–3 a night, water between each, last drink 3 h before bed.</p>';
    if (capN === 0) h += '<div style="margin-bottom:10px">' + bannerHTML('warn', '<b>No drinks tonight.</b> Friday is Polo Day.') + '</div>';
    if (dw === 4) h += '<div style="margin-bottom:10px">' + bannerHTML('', 'Keep Friday to 1–2 so Saturday’s lower session stays strong.') + '</div>';
    h += '<div class="list">' + D.DRINKS.map((x) => '<div class="li"><span class="grow"><span class="t" style="display:block">' + esc(x.n) + '</span><span class="s" style="display:block">~' + x.kcal + ' kcal</span></span><div class="row" style="gap:6px"><button class="icon-btn" style="width:36px;height:36px" data-a="drink" data-v="' + x.id + '" data-d="-1" aria-label="One fewer">' + ic('minus') + '</button><span class="h-md tnum" style="min-width:20px;text-align:center">' + (dr[x.id] || 0) + '</span><button class="icon-btn" style="width:36px;height:36px" data-a="drink" data-v="' + x.id + '" data-d="1" aria-label="One more">' + ic('plus') + '</button></div></div>').join('') + '</div></section>';
  }
  const fm = freeMealsThisWeek(date), fcap = freeMealCap(date);
  h += '<section class="pad section"><div class="card row"><div class="grow"><div class="h-sm">Free meals this week</div><div class="small muted" style="margin-top:3px">Two a week at lunch: 30+ g protein first, about 900–1,200 kcal, one sitting, no grazing after.</div></div><div class="big-num tnum" style="font-size:40px;color:' + (fm > fcap ? 'var(--bad)' : 'var(--fuel)') + '">' + fm + '<span class="muted" style="font-size:22px">/' + fcap + '</span></div></div></section>';

  h += '<section class="section"><div class="sec-h pad"><h2 class="h-md">Guides</h2></div><div class="rail pad">' + D.GUIDES.map((g) => '<button class="tile" data-a="sheet" data-v="guide" data-s="' + g.id + '"><div class="art art-' + g.tone + '" style="display:grid;place-items:center">' + foodGlyph(g.tone, 54) + '</div><div class="tx"><div class="tt">' + esc(g.t) + '</div></div></button>').join('') + '</div></section>';
  return h + aiFab();
}
const FOOD_GLYPH = {
  eggs: '<ellipse cx="12" cy="13" rx="6.5" ry="8"/><path d="M9 12.5c.5-2 1.5-3 3-3.5"/>',
  banana: '<path d="M5 6c0 8 5 13 14 12-1-1.5-2-2-3.5-2C10 15.5 7 12 7 6Z"/><path d="M5 6l1-2"/>',
  shake: '<path d="M7 7h10l-1.3 13H8.3Z"/><path d="M6 7h12M12 7l2-4"/>',
  curry: '<path d="M3.5 12h17a8.5 8.5 0 0 1-17 0Z"/><path d="M8 4.5c0 1.5 1.5 1.5 1.5 3M12 3.5c0 1.5 1.5 1.5 1.5 3M16 4.5c0 1.5 1.5 1.5 1.5 3"/>',
  sandwich: '<path d="M3 14l9-8 9 8Z"/><path d="M3 14v2.5h18V14M5.5 11.5h13"/>',
  plate: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/>',
  bowl: '<path d="M4 11h16a8 8 0 0 1-16 0Z"/><circle cx="9" cy="8.5" r="1.4"/><circle cx="13" cy="7.5" r="1.4"/><circle cx="15.5" cy="9.5" r="1.2"/>',
  free: '<path d="M12 20s-7.5-4.5-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.5-7.5 10-7.5 10Z"/>',
  drink: '<path d="M6 4h12l-2 8a4 4 0 0 1-8 0Z"/><path d="M12 16v4M8.5 20h7"/>',
};
function foodGlyph(tone, size) { return '<svg viewBox="0 0 24 24" width="' + size + '" height="' + size + '" fill="none" stroke="rgba(255,255,255,.9)" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="position:absolute;inset:0;margin:auto">' + (FOOD_GLYPH[tone] || FOOD_GLYPH.plate) + '</svg>'; }
function macroBar(n, v, max, u, color, range) {
  return '<div><div class="row" style="justify-content:space-between"><span class="small fg2">' + n + '</span><span class="xs tnum"><b>' + Math.round(v) + '</b> <span class="muted">/ ' + range + ' ' + u + '</span></span></div><div class="bar" style="margin-top:5px;height:7px"><i style="width:' + clamp(v / max * 100, 0, 100) + '%;background:' + color + '"></i></div></div>';
}
function foodCard(f, right, note, slot) {
  const tone = f.tone || (foodById(f.fid) || {}).tone || 'plate', th = f.ai && typeof aiThumb === 'function' ? aiThumb(f.ai.id) : null;
  const act = f.ai ? 'data-a="aiMeal" data-v="' + esc(f.ai.id) + '"' : 'data-a="sheet" data-v="foodInfo" data-s="' + (f.fid || f.id) + '"';
  const fa = th ? '<span class="fa"><img src="' + th + '" alt="" style="width:100%;height:100%;object-fit:cover;display:block"></span>' : '<span class="fa art-' + tone + '">' + foodGlyph(tone, 30) + '</span>';
  return '<div class="food"><button class="row grow" style="gap:12px;text-align:left;min-width:0" ' + act + '>' + fa + '<span class="grow" style="min-width:0"><span class="ft" style="display:block">' + esc(f.n) + '</span><span class="fs" style="display:block">' + fmtN(f.kcal * (f.q || 1)) + ' kcal · ' + Math.round(f.p * (f.q || 1)) + ' g protein</span>' + (note ? '<span class="xs" style="display:block;color:var(--fg-2);margin-top:2px">' + esc(note) + '</span>' : '') + '</span></button>' + right + '</div>';
}

/* ------------------------------------------------------------------ MIND */
function vMind() {
  const date = ui.date, P = plan(date), d = peek(date);
  const mins = (dd) => (peek(dd).mind || []).reduce((a, x) => a + (x.min || 0), 0);
  let wk = 0; for (let i = 0; i < 7; i++) wk += mins(addDays(mondayOf(date), i));
  let st = 0, dd = todayISO(); if (!mins(dd)) dd = addDays(dd, -1); while (mins(dd) > 0 && st < 400) { st++; dd = addDays(dd, -1); }
  let h = topHeader('Calm, focus and sleep', 'Mind', avatarBtn());
  h += '<div class="pad"><div class="kv" style="margin-top:14px"><div><div class="v tnum">' + st + '</div><div class="k">Day streak</div></div><div><div class="v tnum">' + Math.round(wk) + '</div><div class="k">Min this week</div></div><div><div class="v tnum">' + (P.week >= 1 && P.week <= 13 ? P.week : '–') + '</div><div class="k">Week · benefits show ~8</div></div></div></div>';
  h += '<section class="pad section">' + mindTile(P.sit, 'Today’s practice · ' + fmtD(date), isDone(date, 'sit')) + '</section>';
  h += '<section class="pad section" style="margin-top:12px"><div class="list"><div class="li"><button class="row grow" style="gap:14px;text-align:left" data-a="mind" data-v="sigh5"><span class="ico ' + mindArt('sigh5') + '" style="color:#fff">' + ic('sun') + '</span><span class="grow"><span class="t" style="display:block">Morning breath · cyclic sighing</span><span class="s" style="display:block">5 min every morning, with morning light</span></span></button>' + checkBtn(isDone(date, 'morning'), 'tick', 'morning', 'Morning breath done') + '</div></div></section>';
  D.MIND_CATS.forEach((c) => {
    const ids = Object.keys(D.MIND).filter((k) => D.MIND[k].cat === c.id);
    h += '<section class="section"><div class="sec-h pad"><h2 class="h-md">' + c.n + '</h2></div><div class="rail pad">' + ids.map((k) => { const m = D.MIND[k]; return '<button class="tile" data-a="mind" data-v="' + k + '"><div class="art ' + mindArt(k) + '"><span class="artglyph">' + m.min + '</span></div><div class="tx"><div class="tt">' + esc(m.n) + '</div><div class="ts">' + m.min + ' min · ' + esc(m.sub) + '</div></div></button>'; }).join('') +
      (c.id === 'tool' ? '<button class="tile" data-a="sheet" data-v="silent"><div class="art art-night"><span class="artglyph">' + ic('timer').replace('<svg', '<svg width="60" height="60" style="position:absolute;right:12px;bottom:10px;opacity:.4"') + '</span></div><div class="tx"><div class="tt">Silent timer</div><div class="ts">Bells only · any length</div></div></button>' : '') + '</div></section>';
  });
  const c = d.chk || {};
  h += '<section class="pad section"><div class="sec-h"><h2 class="h-md">Daily check-in</h2></div><div class="card stack">' + scaleRow('Morning stress (0–10)', 'stress', c.stress) +
    '<div><span class="lbl">Sleep quality (1–5)</span><div class="seg mind">' + [1, 2, 3, 4, 5].map((v) => '<button class="' + (c.sleepQ === v ? 'on' : '') + '" data-a="chk" data-k="sleepQ" data-v="' + v + '">' + v + '</button>').join('') + '</div></div></div></section>';
  const g = d.grat || ['', '', ''];
  h += '<section class="pad section"><div class="sec-h"><h2 class="h-md">3 good things</h2><span class="small muted">' + esc(fmtD(date)) + '</span></div><div class="card stack">' + [0, 1, 2].map((i) => '<input class="field" id="grat' + i + '" data-in="grat" data-k="' + i + '" value="' + esc(g[i] || '') + '" placeholder="' + ['A PR, a pain-free set, a good call…', 'Something that went well', 'Someone you are grateful for'][i] + '" aria-label="Good thing ' + (i + 1) + '">').join('') +
    (dowOf(date) === 6 ? '<label><span class="lbl" style="margin-top:6px">Sunday journal (10 min): what is weighing on you, and what is in your control?</span><textarea class="field" id="journal" data-in="journal">' + esc(d.journal || '') + '</textarea></label>' : '') + '</div></section>';
  const due = [1, 6, 12].includes(P.week);
  h += '<section class="pad section"><div class="sec-h"><h2 class="h-md">Questionnaires</h2><span class="small muted">Weeks 1, 6 and 12</span></div><div class="list">' + ['PSS10', 'GAD7'].map((k) => {
    const Q = D[k], last = S.quiz.filter((x) => x.k === k).slice(-1)[0];
    return '<button class="li" data-a="quiz" data-v="' + k + '"><span class="ico" style="color:var(--mind)">' + ic('list') + '</span><span class="grow"><span class="t" style="display:block">' + Q.n + ' · ' + Q.full + '</span><span class="s" style="display:block">' + (last ? 'Last: ' + last.score + ' (' + esc(Q.band(last.score)) + ') on ' + fmtShort(last.date) : 'Not taken yet') + (due ? ' · due this week' : '') + '</span></span>' + ic('next').replace('<svg', '<svg width="18" height="18"') + '</button>';
  }).join('') + '</div></section>';
  h += '<section class="pad section"><div class="sec-h"><h2 class="h-md">Mindfulness with no extra time</h2></div><div class="card"><ul class="small fg2" style="margin:0;padding-left:18px">' + D.MIND_TIPS.map((x) => '<li style="margin:4px 0">' + esc(x) + '</li>').join('') + '</ul></div></section>';
  h += '<section class="section"><div class="sec-h pad"><h2 class="h-md">Why this dose</h2></div><div class="rail pad">' + D.RESEARCH.map((r) => '<div class="tile wide card" style="padding:14px;width:270px"><div class="small" style="font-weight:600">' + esc(r.f) + '</div><div class="small" style="color:var(--mind);margin-top:8px">' + esc(r.m) + '</div><a class="xs" style="display:block;margin-top:8px" href="' + r.u + '" target="_blank" rel="noopener">' + esc(r.s) + '</a></div>').join('') + '</div></section>';
  return h;
}
function quizDone(week) {
  const ws = weekStart(week), we = addDays(ws, 6);
  return ['PSS10', 'GAD7'].every((k) => S.quiz.some((x) => x.k === k && x.date >= ws && x.date <= we));
}

/* ------------------------------------------------------------------ PROGRESS */
function vProgress() {
  const t = todayISO(), date = ui.date, d = peek(date), u = S.settings.unit;
  let h = topHeader('Target ' + D.GOAL.to[0] + '–' + D.GOAL.to[1] + ' lb by Jan 14', 'Progress', avatarBtn());
  const a = avg7(t), tg = targetAt(t), ws = weights(), first = ws.length ? ws[0].w : D.GOAL.from;
  const status = a == null ? null : t < '2026-10-26' ? 'early' : a <= tg.hi ? (a < tg.lo ? 'ahead' : 'on') : 'above';
  h += '<section class="pad section" style="margin-top:16px"><div class="card"><div class="row" style="justify-content:space-between;align-items:flex-start"><div><div class="eyebrow">7-day average</div><div class="big-num tnum" style="margin-top:6px">' + (a != null ? a.toFixed(1) : '—') + '<span class="muted" style="font-size:22px"> ' + u + '</span></div><div class="small fg2" style="margin-top:4px">Target today ' + tg.t.toFixed(1) + ' (' + tg.lo.toFixed(1) + '–' + tg.hi.toFixed(1) + ')' + (a != null ? ' · ' + (first - a >= 0 ? '−' : '+') + Math.abs(first - a).toFixed(1) + ' since start' : '') + '</div></div>' +
    (status ? '<span class="chip ' + (status === 'above' ? 'warn' : status === 'early' ? '' : 'good') + '">' + ({ on: 'On track', ahead: 'Ahead', above: 'Above range', early: 'Week 1: judge from Week 2' })[status] + '</span>' : '') + '</div>' + weightChart() +
    '<div class="row" style="gap:10px;margin-top:14px"><label class="grow"><span class="lbl">Weigh-in, ' + esc(fmtD(date)) + '</span><input class="field" inputmode="decimal" id="wIn" data-in="weight" value="' + esc(d.weight || '') + '" placeholder="e.g. 140.6"></label><label style="width:120px"><span class="lbl">Steps</span><input class="field" inputmode="numeric" id="stepsIn" data-in="steps" value="' + esc(d.steps || '') + '" placeholder="9,000"></label></div>' +
    '<p class="xs muted" style="margin:8px 2px 0">Compare your Sunday 7-day average with the range: inside means stay the course; above it two weeks running means the calibration rule. Added glute muscle may leave you at 136–137 looking better than 135: waist, hips, thighs and photos decide.</p></div></section>';
  freezeWeeks();
  h += wkSection() + wkReport();
  const c = calibration(t);
  h += '<section class="pad section"><div class="sec-h"><h2 class="h-md">Calibration</h2><span class="small muted">Sunday ' + fmtShort(c.sun) + '</span></div>' + (c.rate == null ? '<div class="card small fg2">Needs two weeks of weigh-ins to compare 7-day averages. Weigh in every morning.</div>' :
    '<div class="card"><div class="row" style="justify-content:space-between"><div><div class="big-num tnum" style="font-size:40px">' + (c.rate >= 0 ? '−' : '+') + Math.abs(c.rate).toFixed(1) + '<span class="muted" style="font-size:20px"> lb/wk</span></div></div><span class="chip ' + c.tone + '">Goal 0.3–0.6</span></div><p class="small fg2" style="margin:10px 0 0">' + esc(c.rec) + '</p>' +
    (c.act ? '<button class="btn fuel sm" style="margin-top:12px" data-a="kcalAdj" data-v="' + c.act + '">' + (c.act > 0 ? 'Add 150' : 'Cut 100') + ' kcal a day</button>' : '') + '</div>') +
    '<div class="card row" style="margin-top:10px"><span class="grow"><span style="font-weight:600;display:block">Energy check</span><span class="small muted">Late or missed period, constant fatigue, poor sleep or nagging little injuries: eat about 2,200 a day and tell your doctor. Overrides the scale.</span></span><button class="toggle' + (S.settings.energyLow ? ' on' : '') + '" data-a="energy" aria-pressed="' + !!S.settings.energyLow + '" aria-label="Energy check"></button></div>' +
    (S.settings.kcalAdj ? '<p class="small muted" style="margin:8px 2px 0">Current adjustment: ' + (S.settings.kcalAdj > 0 ? '+' : '') + S.settings.kcalAdj + ' kcal a day. <button style="color:var(--fuel);font-weight:600" data-a="kcalAdj" data-v="reset">Reset</button></p>' : '') + '</section>';

  // check-in trends
  h += '<section class="pad section"><div class="sec-h"><h2 class="h-md">Check-ins, last 14 days</h2></div><div class="card stack">' + [['knee', 'Knee pain', 10, 'var(--bad)'], ['swell', 'Swelling', 1, 'var(--bad)'], ['back', 'Low back', 10, 'var(--warn)'], ['stress', 'Stress', 10, 'var(--mind)']].map(([k, n, max, col]) => {
    let bars = '', last = null;
    for (let i = 13; i >= 0; i--) { const v = (peek(addDays(t, -i)).chk || {})[k]; if (v != null) last = v; bars += '<i style="height:' + (v == null ? 2 : Math.max(3, v / max * 100)) + '%;background:' + (v == null ? 'var(--card-3)' : col) + ';opacity:' + (v == null ? 1 : 0.85) + '"></i>'; }
    return '<div class="row" style="gap:12px"><div style="width:74px"><div class="small fg2">' + n + '</div><div class="h-md tnum">' + (last == null ? '–' : last) + '</div></div><div class="sparkbars grow">' + bars + '</div></div>';
  }).join('') + '</div></section>';

  // knee gates + back clear
  const st = gateState(t), bcN = streak(t, 'back', (v) => v === 0), bcOv = S.settings.gate && S.settings.gate.bc;
  h += '<section class="pad section"><div class="sec-h"><h2 class="h-md">Knee gates</h2><span class="small muted">Opened by a logged test, never by date alone</span></div><div class="list">' + KG.map((g) => {
    const s2 = gateStatus(g, t), e = gateEarliest(g, t), prev = KG.find((x) => x.lvl === g.lvl - 1);
    const chip = s2 === 'open' ? '<span class="chip good">Passed ' + esc(fmtShort(st.pass[g.id])) + '</span>' : s2 === 'due' ? '<span class="chip train">Test due</span>' : s2 === 'later' ? '<span class="chip">From ' + esc(fmtShort(e)) + '</span>' : '<span class="chip warn">' + ic('lock').replace('<svg', '<svg width="11" height="11"') + ' After ' + esc(prev ? prev.n : '') + '</span>';
    return '<div class="li" style="align-items:flex-start"><span class="grow"><span class="t" style="display:block">' + esc(g.n + ' · ' + g.what) + '</span><span class="s" style="display:block">Then: ' + esc(g.then) + '</span>' +
      '<details class="fold" style="margin-top:6px"><summary class="xs">Test criteria</summary><div class="fb"><ul class="small fg2">' + g.crit.map((c2) => '<li>' + esc(c2) + '</li>').join('') + '</ul></div></details>' +
      (s2 !== 'open' && s2 !== 'locked' ? '<button class="btn ghost sm" style="margin-top:6px" data-a="gateLogOpen" data-v="' + g.id + '">Log a test</button>' : '') + '</span>' + chip + '</div>';
  }).join('') +
    '<div class="li" style="align-items:flex-start"><span class="grow"><span class="t" style="display:block">Back clear</span><span class="s" style="display:block">Right low-back morning stiffness 0 for 7 straight days · ' + Math.min(bcN, 7) + ' of 7 now. Opens heavier RDLs, back extensions, KB swings, barbell rows, standing press, ab wheel, loaded rotation.</span><button class="xs" style="color:var(--fg-2);font-weight:600;margin-top:6px" data-a="gateOv" data-v="bc">' + (bcOv ? 'Manual: ' + bcOv + ' · clear' : 'Set manually') + '</button></span>' + (backClear(t) ? '<span class="chip good">Clear</span>' : '<span class="chip warn">' + ic('lock').replace('<svg', '<svg width="11" height="11"') + ' Not yet</span>') + '</div></div>';
  const lg = gateLog().slice().sort((x, y) => (x.date < y.date ? 1 : -1)).slice(0, 6);
  if (lg.length) h += '<div class="card small fg2" style="margin-top:10px">' + lg.map((e) => esc(fmtD(e.date)) + ' · ' + esc((KG_BY[e.g] || {}).n || e.g) + ': ' + (e.regress ? 'back one gate' : e.pass ? 'passed' : 'not yet') + (e.note ? ' (' + esc(e.note) + ')' : '')).join('<br>') + '</div>';
  h += '</section>';

  // benchmarks
  h += '<section class="pad section"><div class="sec-h"><h2 class="h-md">Benchmarks</h2></div><div class="card scrollx"><table class="tbl"><thead><tr><th>Test</th><th>Base</th><th>Wk 6</th><th>Wk 12</th></tr></thead><tbody>' + D.BENCHMARKS.map((b) => {
    const r = S.bench[b.id] || {};
    const cell = (c2) => {
      if (b.idx) { const R = num((S.bench[b.idx[0]] || {})[c2]), L = num((S.bench[b.idx[1]] || {})[c2]); return '<td class="tnum small" style="text-align:center">' + (R != null && L ? Math.round(R / L * 100) + '%' : '–') + '</td>'; }
      return '<td><input inputmode="decimal" data-in="bench" data-k="' + b.id + '" data-c="' + c2 + '" value="' + esc(r[c2] || '') + '" aria-label="' + esc(b.n) + ' ' + c2 + '"></td>';
    };
    return '<tr><td><div style="font-weight:600;font-size:13.5px">' + esc(b.n) + '</div><div class="xs muted">' + esc(b.goal || b.how) + '</div></td>' + ['base', 'w6', 'w12'].map(cell).join('') + '</tr>';
  }).join('') + '</tbody></table></div></section>';

  // sunday reset
  h += '<section class="pad section"><div class="sec-h"><h2 class="h-md">Sunday Reset</h2><button class="link" data-a="sheet" data-v="sunday">Open</button></div>';
  const sr = S.sunday[mondayOf(t)] || {}; const nDone = D.SUNDAY_RESET.filter((_, i) => sr[i]).length;
  h += '<div class="card row"><div class="grow small fg2">Week of ' + fmtShort(mondayOf(t)) + (sr.win ? ' · Win: ' + esc(sr.win) : '') + '</div><span class="chip ' + (nDone === D.SUNDAY_RESET.length ? 'good' : '') + '">' + nDone + '/' + D.SUNDAY_RESET.length + '</span></div></section>';

  // history + bests
  const hist = Object.keys(S.days).sort().reverse().flatMap((dd) => Object.keys((S.days[dd].done || {})).filter((k) => k.startsWith('s:')).map((k) => ({ dd, sid: k.slice(2) }))).slice(0, 12);
  h += '<section class="pad section"><div class="sec-h"><h2 class="h-md">History</h2></div>' + (hist.length ? '<div class="list">' + hist.map((x) => {
    const s = findSession(x.dd, x.sid) || { title: x.sid, hero: 'walk' }, sets = Object.keys(S.days[x.dd].sets || {}).filter((k) => k.startsWith(x.sid + '|')).reduce((a2, k) => a2.concat(S.days[x.dd].sets[k].filter((z) => z && z.done)), []);
    const vol = sets.reduce((a2, z) => a2 + (num(z.w) || 0) * (num(z.r) || 0), 0);
    return '<button class="li" data-a="openDay" data-v="' + x.dd + '">' + exThumb(s.hero, 44) + '<span class="grow"><span class="t" style="display:block">' + esc(s.title) + '</span><span class="s" style="display:block">' + fmtD(x.dd) + (sets.length ? ' · ' + sets.length + ' sets · ' + fmtN(vol) + ' ' + u : '') + '</span></span></button>';
  }).join('') + '</div>' : '<div class="card empty">Completed sessions show up here.</div>') + '</section>';
  const bests = bestLifts();
  if (bests.length) h += '<section class="pad section"><div class="sec-h"><h2 class="h-md">Best sets</h2><span class="small muted">Estimated 1RM</span></div><div class="list">' + bests.map((b) => '<div class="li">' + exThumb(b.ex, 44) + '<span class="grow"><span class="t" style="display:block">' + esc(EX[b.ex].n) + '</span><span class="s" style="display:block">' + b.w + ' × ' + b.r + ' on ' + fmtShort(b.d) + '</span></span><span class="h-md tnum">' + Math.round(b.e) + '</span></div>').join('') + '</div></section>';
  h += '<section class="pad section"><button class="li card" style="padding:14px" data-a="push" data-v="settings"><span class="ico">' + ic('gear') + '</span><span class="grow"><span class="t" style="display:block">Settings and backup</span><span class="s" style="display:block">' + syncLabel() + '</span></span>' + ic('next').replace('<svg', '<svg width="18" height="18"') + '</button></section>';
  return h;
}
/* ------------------------------------------------------------------ PROGRESS: weekly summary + 13-week report */
/* sparkline + change tag shared by the weekly summary */
function sparkSVG(pts, col) {
  const xs = pts.filter((p) => p != null);
  if (xs.length < 2) return '<div class="grow"></div>';
  const lo = Math.min(...xs), hi = Math.max(...xs), W = 100, Hh = 30, rng = hi - lo || 1, step = W / (pts.length - 1);
  let path = '', pen = false, lastX = 0, lastY = 0;
  pts.forEach((v, i) => { if (v == null) { pen = false; return; } lastX = i * step; lastY = 3 + (1 - (v - lo) / rng) * (Hh - 6); path += (pen ? 'L' : 'M') + lastX.toFixed(1) + ' ' + lastY.toFixed(1); pen = true; });
  return '<svg class="grow" viewBox="0 0 ' + W + ' ' + Hh + '" preserveAspectRatio="none" style="height:34px;min-width:0;overflow:visible"><path d="' + path + '" fill="none" stroke="' + col + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/><circle cx="' + lastX.toFixed(1) + '" cy="' + lastY.toFixed(1) + '" r="2.6" fill="' + col + '" vector-effect="non-scaling-stroke"/></svg>';
}
function changeTag(cur, base, dir, dec, unit) {
  if (cur == null || base == null) return '<span class="xs muted">Not enough history</span>';
  const dlt = cur - base, f = Math.pow(10, dec), shown = Math.round(dlt * f) / f, pct = base ? Math.abs(dlt / base) : 0;
  if (!shown || pct < 0.02 || !dir) return '<span class="xs muted tnum">' + (shown ? (shown > 0 ? '+' : '−') + Math.abs(shown).toFixed(dec) : 'No change') + '</span>';
  const good = dir * dlt > 0;
  return '<span class="xs tnum" style="font-weight:600;color:var(--' + (good ? 'good' : 'bad') + ')">' + (dlt > 0 ? '▲ +' : '▼ −') + Math.abs(shown).toFixed(dec) + '</span>';
}
const wkDef = (k) => WK_MET.find((x) => x[0] === k);
const WK_COUNT = ['sess', 'protDays', 'mind']; // per-week totals: shown as totals in the report, not start-vs-now
const wkCur = () => clamp(weekOf(todayISO()), 1, WEEK_N);
const wkUnitOf = (def) => (def[2] === 'wt' ? ' ' + S.settings.unit : def[2]);
const wkNum = (def, v) => (v == null ? '–' : def[4] ? v.toFixed(def[4]) : fmtN(v));
function wkSeries(k) { const c = wkCur(); return Array.from({ length: WEEK_N }, (_, i) => (i + 1 > c ? null : weekSummary(i + 1).m[k])); }
function wkPrev(k, w) { for (let i = w - 1; i >= 1; i--) { const v = weekSummary(i).m[k]; if (v != null) return v; } return null; }
function wkValHTML(def, v, s) {
  const u = def[0] === 'sess' ? '/' + (s ? s.sessT : '') : def[0] === 'protDays' ? '/7' : wkUnitOf(def);
  return wkNum(def, v) + (v == null || !u ? '' : '<span class="muted" style="font-size:12px;font-weight:500">' + u + '</span>');
}
/* plain-English verdict for a week */
function wkHeadline(w) {
  const s = weekSummary(w), m = s.m, live = addDays(weekStart(w), 6) >= todayISO();
  if (!s.days && m.weight == null) return live ? 'Nothing logged yet this week.' : 'No data for this week.';
  const bits = [];
  if (m.sess != null && s.sessT) bits.push(m.sess + '/' + s.sessT + ' sessions');
  // [key, label, smallest change worth mentioning, how to say it]
  const C = [['weight', 'weight', 0.3, (d) => Math.abs(d).toFixed(1) + ' ' + S.settings.unit], ['gate', 'knee gates', 1, (d) => Math.abs(d)], ['steps', 'steps', 800, (d) => fmtN(Math.abs(d)) + ' a day'], ['protDays', 'protein days', 1, (d) => Math.abs(d)],
    ['knee', 'knee pain', 1, (d) => Math.abs(d).toFixed(1)], ['swell', 'swelling mornings', 20, (d) => Math.round(Math.abs(d)) + ' pts'], ['back', 'back stiffness', 1, (d) => Math.abs(d).toFixed(1)], ['stress', 'stress', 1, (d) => Math.abs(d).toFixed(1)]];
  const found = [];
  C.forEach(([k, n, min, say]) => { const p = wkPrev(k, w); if (m[k] == null || p == null) return; const d = m[k] - p; if (Math.abs(d) >= min) found.push({ sc: Math.abs(d) / min, t: n + (d > 0 ? ' up ' : ' down ') + say(d) }); });
  found.sort((a, b) => b.sc - a.sc).slice(0, 3).forEach((x) => bits.push(x.t));
  let good = 0, bad = 0, cmp = false;
  WK_MET.forEach((def) => { const p = wkPrev(def[0], w), v = m[def[0]]; if (v == null || p == null) return; cmp = true; const d = v - p; if (def[3] && p && Math.abs(d / p) >= 0.02) { if (def[3] * d > 0) good++; else bad++; } });
  const ratio = m.sess != null && s.sessT ? m.sess / s.sessT : 0.7;
  const word = live ? 'So far' : ratio >= 0.8 && good >= bad ? 'Strong week' : bad > good + 1 ? 'Tougher week' : ratio >= 0.6 ? 'Solid week' : 'Light week';
  return word + (bits.length ? ': ' + bits.join(', ') : '') + '.' + (cmp ? '' : ' Comparisons start next week.');
}
function wkSection() {
  const t = todayISO(), cur = wkCur(), sel = clamp(ui.wkSel || cur, 1, cur), s = weekSummary(sel), m = s.m;
  let h = '<section class="section"><div class="sec-h pad"><h2 class="h-md">Weekly summary</h2><span class="small muted">' + esc(fmtShort(s.from)) + ' – ' + esc(fmtShort(s.to)) + '</span></div>';
  h += '<div class="rail pad" id="wkRail" style="gap:8px;margin-bottom:10px">' + Array.from({ length: WEEK_N }, (_, i) => {
    const w = i + 1, on = w === sel, off = w > cur;
    return '<button class="chip' + (on ? ' train' : '') + '" style="height:34px;padding:0 14px;font-size:15px' + (on ? ';box-shadow:inset 0 0 0 1.5px var(--train)' : w === cur ? ';box-shadow:inset 0 0 0 1.5px var(--line)' : '') + (off ? ';opacity:.35' : '') + '"' + (off ? ' disabled' : '') + ' data-a="wkSel" data-v="' + w + '" aria-pressed="' + on + '" aria-label="Week ' + w + (w === cur ? ', current' : '') + '">W' + w + '</button>';
  }).join('') + '</div><div class="pad"><div class="card">';
  h += '<div class="row" style="justify-content:space-between;align-items:center"><div class="eyebrow">Week ' + sel + ' · ' + esc(phaseOf(sel).name) + '</div><span class="chip' + (sel === cur && addDays(weekStart(sel), 6) >= t ? '' : ' good') + '">' + (sel === cur && addDays(weekStart(sel), 6) >= t ? 'In progress' : 'Complete') + '</span></div>';
  h += '<p class="small" style="margin:8px 0 14px;font-weight:600">' + esc(wkHeadline(sel)) + '</p>';
  let cells = '', cmp = false;
  WK_MET.forEach((def) => {
    const k = def[0], v = m[k], ser = wkSeries(k);
    if (!ser.some((x) => x != null)) return;
    const p = wkPrev(k, sel), partial = WK_COUNT.includes(k) && sel === cur && addDays(weekStart(sel), 6) >= t, chg = partial ? '<span class="xs muted">So far</span>' : v != null && p != null ? (cmp = true, changeTag(v, p, def[3], def[4])) : '<span class="xs muted">' + (v == null ? 'No data' : 'Baseline') + '</span>';
    cells += '<div style="background:var(--fill);border-radius:14px;padding:10px 12px;min-width:0"><div class="xs muted">' + esc(def[1]) + '</div><div class="row" style="justify-content:space-between;align-items:baseline;gap:6px;margin-top:2px"><div class="h-md tnum">' + wkValHTML(def, v, s) + '</div><div style="text-align:right;white-space:nowrap">' + chg + '</div></div><div class="row" style="margin-top:4px">' + sparkSVG(ser, def[5]) + '</div></div>';
  });
  h += cells ? '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">' + cells + '</div>' : '';
  if (cells && !cmp) h += '<p class="xs muted" style="margin:10px 0 0">Comparisons start next week.</p>';
  else if (cells) h += '<p class="xs muted" style="margin:10px 0 0">Change is against the last week with data. Green means moving the right way.</p>';
  return h + '</div></div></section>';
}
/* start vs now for every metric with data: first week that has it → latest week that has it */
function wkRows() {
  const rows = [];
  WK_MET.forEach((def) => {
    if (WK_COUNT.includes(def[0])) return;
    const ser = wkSeries(def[0]); let fi = -1, li = -1;
    ser.forEach((v, i) => { if (v != null) { if (fi < 0) fi = i; li = i; } });
    if (fi < 0) return;
    const first = ser[fi], last = ser[li], d = last - first, pct = first ? d / Math.abs(first) * 100 : 0;
    rows.push({ def, first, last, one: fi === li, d, pct, score: def[3] ? def[3] * pct : null });
  });
  return rows;
}
function wkTotals() {
  const c = wkCur(); let done = 0, planned = 0, days = 0, mind = 0;
  for (let w = 1; w <= c; w++) { const s = weekSummary(w); done += s.m.sess || 0; planned += s.m.sess != null ? s.sessT : 0; days += s.days || 0; mind += s.m.mind || 0; }
  return { done, planned, days, mind };
}
function wkWeightLine() {
  const ser = wkSeries('weight'), ws = weights(), start = ws.length ? ws[0].w : null, now = ser.filter((x) => x != null).pop();
  if (start == null || now == null) return null;
  const g = D.GOAL.to, u = S.settings.unit, d = now - start;
  return { start, now, d, txt: now <= g[1] ? (now < g[0] ? 'Under' : 'Inside') + ' your goal range' : (now - g[1]).toFixed(1) + ' ' + u + ' above the top of your goal range', rng: g[0] + '–' + g[1] };
}
function wkChgHTML(r) {
  if (r.one) return '<span class="xs muted">Baseline</span>';
  const dec = r.def[4], shown = Math.round(r.d * Math.pow(10, dec)) / Math.pow(10, dec);
  if (!shown || Math.abs(r.pct) < 2 || !r.def[3]) return '<span class="xs muted tnum">' + (shown ? (shown > 0 ? '+' : '−') + Math.abs(shown).toFixed(dec) : 'No change') + '</span>';
  const col = 'var(--' + (r.def[3] * r.d > 0 ? 'good' : 'bad') + ')';
  return '<div class="xs tnum" style="font-weight:600;color:' + col + '">' + (r.d > 0 ? '▲ +' : '▼ −') + Math.abs(shown).toFixed(dec) + '</div><div class="xs tnum" style="color:' + col + '">' + (r.pct > 0 ? '+' : '−') + Math.abs(r.pct).toFixed(1) + '%</div>';
}
function wkReport() {
  const t = todayISO(), cur = wkCur(), final = t >= addDays(weekStart(WEEK_N), 6);
  let rows = wkRows();
  if (final) rows = rows.slice().sort((a, b) => (b.score == null ? -1e9 : b.score) - (a.score == null ? -1e9 : a.score));
  const tot = wkTotals(), wl = wkWeightLine(), u = S.settings.unit;
  let h = '<section class="pad section"><div class="sec-h"><h2 class="h-md">' + (final ? 'Your ' + WEEK_N + ' weeks' : WEEK_N + '-week report') + '</h2><button class="link" data-a="wkShare">Share</button></div><div class="card">';
  if (final) h += '<div class="eyebrow">Final report · ' + esc(fmtShort(D.START)) + ' – ' + esc(fmtShort(addDays(weekStart(WEEK_N), 6))) + '</div>';
  else {
    const pctDone = Math.round(clamp(daysBetween(D.START, t) + 1, 0, WEEK_N * 7) / (WEEK_N * 7) * 100);
    h += '<div class="row" style="justify-content:space-between"><div class="eyebrow">Week ' + cur + ' of ' + WEEK_N + '</div><span class="xs muted tnum">' + pctDone + '% done</span></div><div class="bar" style="margin-top:8px"><i style="width:' + pctDone + '%;background:var(--train)"></i></div>';
  }
  if (wl) h += '<div class="row" style="justify-content:space-between;align-items:flex-end;margin-top:14px"><div><div class="big-num tnum" style="font-size:40px">' + (Math.abs(wl.d) < 0.05 ? '' : wl.d < 0 ? '−' : '+') + Math.abs(wl.d).toFixed(1) + '<span class="muted" style="font-size:20px"> ' + u + '</span></div><div class="small fg2">' + wl.start.toFixed(1) + ' → ' + wl.now.toFixed(1) + ' · goal ' + wl.rng + '</div></div><span class="chip ' + (wl.now <= D.GOAL.to[1] ? 'good' : 'warn') + '">' + esc(wl.txt) + '</span></div>';
  h += '<div class="kv" style="margin-top:14px"><div><div class="v tnum">' + tot.done + '<span class="muted" style="font-size:16px">' + (tot.planned ? '/' + tot.planned : '') + '</span></div><div class="k">Sessions</div></div><div><div class="v tnum">' + tot.days + '</div><div class="k">Days logged</div></div><div><div class="v tnum">' + fmtN(tot.mind) + '</div><div class="k">Mind min</div></div></div>';
  if (!rows.length) h += '<p class="small fg2" style="margin:14px 0 0">Comparisons start next week. Log food, weight and check-ins to fill this in.</p>';
  else {
    h += '<div class="sec-h" style="margin:16px 0 8px"><div class="small fg2" style="font-weight:600">' + (final ? 'Biggest wins first' : 'Week 1 baseline → latest week') + '</div></div><div class="stack">' + rows.map((r) =>
      '<div class="row" style="gap:10px"><div class="grow" style="min-width:0"><div class="small">' + esc(r.def[1]) + '</div><div class="xs muted tnum">' + (r.one ? wkNum(r.def, r.first) : wkNum(r.def, r.first) + ' → ' + wkNum(r.def, r.last)) + esc(wkUnitOf(r.def)) + '</div></div><div style="text-align:right;flex:none">' + wkChgHTML(r) + '</div></div>').join('') + '</div>';
    if (rows.every((r) => r.one)) h += '<p class="xs muted" style="margin:12px 0 0">Comparisons start next week.</p>';
  }
  return h + '</div></section>';
}
function wkReportText() {
  const final = todayISO() >= addDays(weekStart(WEEK_N), 6), u = S.settings.unit, wl = wkWeightLine();
  let rows = wkRows(); if (final) rows = rows.slice().sort((a, b) => (b.score == null ? -1e9 : b.score) - (a.score == null ? -1e9 : a.score));
  const tot = wkTotals(), L = ['Road to Sri Lanka · Comeback Season · ' + (final ? 'my ' + WEEK_N + ' weeks' : 'week ' + wkCur() + ' of ' + WEEK_N)];
  if (wl) L.push('Weight: ' + wl.start.toFixed(1) + ' → ' + wl.now.toFixed(1) + ' ' + u + ' (' + (wl.d <= 0 ? '−' : '+') + Math.abs(wl.d).toFixed(1) + '), goal ' + wl.rng);
  L.push('Sessions: ' + tot.done + (tot.planned ? ' of ' + tot.planned : '') + ' · Days logged: ' + tot.days + ' · Mind minutes: ' + fmtN(tot.mind));
  rows.forEach((r) => { if (r.def[0] === 'weight') return; const dec = r.def[4], un = wkUnitOf(r.def); L.push(r.def[1] + ': ' + (r.one ? wkNum(r.def, r.first) + un : wkNum(r.def, r.first) + ' → ' + wkNum(r.def, r.last) + un + ' (' + (r.d >= 0 ? '+' : '−') + Math.abs(r.d).toFixed(dec) + ', ' + (r.pct >= 0 ? '+' : '−') + Math.abs(r.pct).toFixed(1) + '%)')); });
  return L.join('\n');
}
A.wkSel = (el) => { ui.wkSel = +el.dataset.v; render(); };
A.wkShare = async () => {
  const text = wkReportText();
  try { if (navigator.share) { await navigator.share({ title: 'Road to Sri Lanka · Comeback Season report', text }); return; } } catch (e) { if (e && e.name === 'AbortError') return; }
  try { await navigator.clipboard.writeText(text); toast('Report copied'); } catch (e) { toast('Sharing is not available here'); }
};
function wkRailFix() { const r = $('#wkRail'), on = r && $('.chip.train', r); if (on) r.scrollLeft = on.offsetLeft - r.offsetLeft - 16; }

function storageDetail() {
  const n = Object.keys(S.days).filter((d) => Object.keys(S.days[d]).length > 1).length;
  const t = S.savedAt ? new Date(S.savedAt) : null;
  return n + ' days logged' + (t ? ' · last saved ' + t.toLocaleString([], { weekday: 'short', hour: 'numeric', minute: '2-digit' }) : '') +
    (IDBStore.ok ? ' · 2 copies on device' : '') + (ui.persisted ? ' · protected from clean-up' : '') + (saveError ? ' · last save failed' : '');
}
function syncLabel() { return ({ synced: 'Synced to your Claude account', syncing: 'Syncing…', offline: 'Offline · will sync when back', full: 'Cloud storage full · saved on this device', local: 'Saved on this iPhone · back up weekly' })[Cloud.status] || 'Saved on this device'; }
function bestLifts() {
  const main = ['hip_thrust', 'bb_rdl', 'db_rdl', 'conv_deadlift', 'lowbar_squat', 'goblet_squat', 'leg_press', 'w_pullup', 'w_pullup_cluster', 'bench', 'incline_bb_bench', 'incline_db', 'barbell_row', 'tbar_row', 'cs_db_row'];
  const best = {};
  Object.keys(S.days).forEach((d) => Object.keys(S.days[d].sets || {}).forEach((k) => {
    const ex = k.split('|')[2]; if (!main.includes(ex)) return;
    S.days[d].sets[k].forEach((z) => { const w = num(z && z.w), r = num(z && z.r); if (!z || !z.done || !w || !r || r > 15) return; const e = w * (1 + r / 30); if (!best[ex] || e > best[ex].e) best[ex] = { ex, w, r, e, d }; });
  }));
  return Object.values(best).sort((a, b) => b.e - a.e).slice(0, 8);
}
function weightChart() {
  const W = 340, H = 170, L = 30, R = 8, T = 10, B = 22;
  const start = D.START, end = D.GOAL.date, span = daysBetween(start, end);
  const ws = weights().filter((x) => x.d >= addDays(start, -3));
  let lo = 133, hi = 142; ws.forEach((x) => { lo = Math.min(lo, x.w - 1); hi = Math.max(hi, x.w + 1); });
  const X = (d) => L + (daysBetween(start, d) / span) * (W - L - R), Y = (v) => T + (hi - v) / (hi - lo) * (H - T - B);
  let s = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" style="display:block;margin-top:12px" role="img" aria-label="Weight trend against the target path">';
  for (let v = Math.ceil(lo / 2) * 2; v <= hi; v += 2) s += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + Y(v).toFixed(1) + '" y2="' + Y(v).toFixed(1) + '" stroke="var(--line)" stroke-width="1"/><text x="' + (L - 6) + '" y="' + (Y(v) + 4).toFixed(1) + '" text-anchor="end" font-size="10" fill="var(--muted)">' + v + '</text>';
  ['2026-11-01', '2026-12-01', '2027-01-01'].forEach((m) => { s += '<text x="' + X(m).toFixed(1) + '" y="' + (H - 6) + '" font-size="10" fill="var(--muted)" text-anchor="middle">' + MON[pISO(m).getMonth()] + '</text>'; });
  const TP = D.TARGET_PATH;
  s += '<path d="M' + TP.map((p) => X(p[0]).toFixed(1) + ' ' + Y(p[3]).toFixed(1)).join(' L') + ' L' + TP.slice().reverse().map((p) => X(p[0]).toFixed(1) + ' ' + Y(p[2]).toFixed(1)).join(' L') + ' Z" fill="var(--good)" opacity=".13"/>';
  s += '<path d="M' + TP.map((p) => X(p[0]).toFixed(1) + ' ' + Y(p[1]).toFixed(1)).join(' L') + '" fill="none" stroke="var(--good)" stroke-width="1.5" stroke-dasharray="4 4" opacity=".8"/>';
  const td = todayISO(); if (td >= start && td <= end) s += '<line x1="' + X(td).toFixed(1) + '" x2="' + X(td).toFixed(1) + '" y1="' + T + '" y2="' + (H - B) + '" stroke="var(--fg-2)" stroke-width="1" opacity=".35"/>';
  ws.forEach((x) => { s += '<circle cx="' + X(x.d).toFixed(1) + '" cy="' + Y(x.w).toFixed(1) + '" r="2.4" fill="var(--fg-2)" opacity=".55"/>'; });
  const av = ws.map((x) => ({ d: x.d, a: avg7(x.d) })).filter((x) => x.a != null);
  if (av.length > 1) s += '<path d="M' + av.map((x) => X(x.d).toFixed(1) + ' ' + Y(x.a).toFixed(1)).join(' L') + '" fill="none" stroke="var(--train)" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>';
  if (av.length) { const z = av[av.length - 1]; s += '<circle cx="' + X(z.d).toFixed(1) + '" cy="' + Y(z.a).toFixed(1) + '" r="4.5" fill="var(--train)" stroke="var(--card)" stroke-width="2"/>'; }
  if (!ws.length) s += '<text x="' + (W / 2) + '" y="' + (H / 2) + '" text-anchor="middle" font-size="12" fill="var(--muted)">Your weigh-ins and 7-day average appear here</text>';
  s += '</svg><div class="row xs muted" style="gap:14px;margin-top:4px"><span><span style="display:inline-block;width:14px;height:3px;background:var(--train);vertical-align:middle;border-radius:2px"></span> 7-day avg</span><span><span style="display:inline-block;width:14px;height:8px;background:var(--good);opacity:.3;vertical-align:middle;border-radius:2px"></span> On-track range</span></div>';
  return s;
}

/* ------------------------------------------------------------------ SETTINGS layer */
function lSettings() {
  const st = S.settings;
  let h = '<div class="layer"><div class="wrap"><div class="lbar pad solid"><button class="icon-btn" data-a="pop" aria-label="Back">' + ic('back') + '</button><div class="h-sm">Settings</div><span style="width:44px"></span></div><div class="pad stack" style="margin-top:8px">';
  h += '<div class="card stack"><label><span class="lbl">Name</span><input class="field" id="setName" data-in="setting" data-k="name" value="' + esc(st.name || '') + '"></label>' +
    '<div><span class="lbl">Weight unit</span><div class="seg">' + ['lb', 'kg'].map((u) => '<button class="' + (st.unit === u ? 'on' : '') + '" data-a="setting" data-k="unit" data-v="' + u + '">' + u + '</button>').join('') + '</div><p class="xs muted" style="margin:6px 0 0">The plan is written in lb. Switching only changes labels.</p></div>' +
    '<div class="row"><span class="grow"><span style="font-weight:600;display:block">Voice cues during timers</span><span class="small muted">"Next: dead bug", side switches</span></span><button class="toggle' + (st.voice ? ' on' : '') + '" data-a="setting" data-k="voice" data-v="' + (!st.voice) + '" aria-pressed="' + !!st.voice + '" aria-label="Voice cues"></button></div>' +
    '<div class="row"><span class="grow"><span style="font-weight:600;display:block">Ocean sound under meditations</span><span class="small muted">Soft background swell</span></span><button class="toggle' + (st.ambient ? ' on' : '') + '" data-a="setting" data-k="ambient" data-v="' + (!st.ambient) + '" aria-pressed="' + !!st.ambient + '" aria-label="Ocean sound"></button></div>' +
    '<div class="row"><span class="grow"><span style="font-weight:600;display:block">Calorie adjustment</span><span class="small muted">From the calibration rule: −100 or +150</span></span><div class="row" style="gap:6px"><button class="icon-btn" style="width:36px;height:36px" data-a="kcalAdj" data-v="-100" aria-label="Minus 100">' + ic('minus') + '</button><span class="tnum" style="min-width:52px;text-align:center;font-weight:700">' + (st.kcalAdj > 0 ? '+' : '') + (st.kcalAdj || 0) + '</span><button class="icon-btn" style="width:36px;height:36px" data-a="kcalAdj" data-v="150" aria-label="Plus 150">' + ic('plus') + '</button></div></div></div>';
  h += aiSettingsCard();
  h += '<div class="card stack"><div class="row"><span class="grow"><span style="font-weight:600;display:block">Storage</span><span class="small muted">' + syncLabel() + '</span><span class="small muted" style="display:block">' + storageDetail() + '</span></span></div><div class="row" style="gap:10px;flex-wrap:wrap"><button class="btn ghost sm" data-a="exportData">Save a backup file</button><label class="btn ghost sm" style="cursor:pointer">Restore backup<input type="file" accept="application/json,.json" data-in="import" hidden></label></div><p class="xs muted" style="margin:0">Your logs are private to you. Backups are a JSON file you keep.</p></div>';
  h += '<div class="card"><h3 class="h-sm">Red flags: see a doctor, don’t wait</h3><ul class="small fg2" style="margin:8px 0 0;padding-left:18px">' + D.RED_FLAGS.map((x) => '<li style="margin:4px 0">' + esc(x) + '</li>').join('') + '</ul><p class="small muted" style="margin:8px 0 0">If your PT gave you exercises or limits, theirs win where they differ from the plan. The knee gates are built from published rehab protocols; your PT can sign them off, and Gate 3 needs your PT to agree.</p></div>';
  h += '<div class="card"><div class="row"><span class="grow"><span style="font-weight:600;display:block">Reset everything</span><span class="small muted">Deletes all logs on this device and in sync</span></span><button class="btn ghost sm" style="color:var(--bad)" data-a="resetAsk">' + (ui.resetArm ? 'Tap again to confirm' : 'Reset') + '</button></div></div>';
  return h + '<p class="xs muted" style="text-align:center;margin-top:8px">Exercise photos: Free Exercise DB (public domain). Plan: Comeback Season, Ashanti’s Road to Sri Lanka. Guided audio: Road to Sri Lanka.</p></div></div></div>';
}

/* ------------------------------------------------------------------ SHEETS */
function renderSheet(sh) {
  const p = sh.p || {}, date = ui.date;
  if (sh.v === 'ready') {
    // the check belongs to the day of the screen it was opened from (a workout can be for another day)
    const rd = p.date || topDate(), ok = !!readiness(rd);
    const cta = p.go ? '<button class="btn train block" style="margin-top:16px" data-a="readyGo"' + (ok ? '' : ' disabled') + '>' + (ok ? 'Start workout' : 'Answer all four, then start') + '</button>'
      : '<button class="btn train block" style="margin-top:16px" data-a="closeSheet">Done</button>';
    return '<h2 class="h-lg">Readiness</h2><p class="small fg2" style="margin:6px 0 12px">' + esc(fmtD(rd)) + '. Thirty seconds, then train.</p>' + readinessForm(rd) + (ok ? '<div style="margin-top:14px">' + tierBanner(rd) + '</div>' : '') + cta;
  }
  if (AI_SHEETS.includes(sh.v)) return aiRenderSheet(sh.v);
  if (sh.v === 'exinfo') return exInfoSheet(p);
  if (sh.v === 'food') return foodSheet(p);
  if (sh.v === 'foodInfo') {
    const f = foodById(p.s) || {}; const g = D.GUIDES.find((x) => x.id === (f.free ? 'free' : f.slot === 'lunch' ? 'srilankan' : f.slot === 'snack' ? 'snack' : f.slot === 'dinner' || f.slot === 'breakfast' ? 'plate' : ''));
    return '<div class="food" style="background:none;padding:0"><span class="fa art-' + (f.tone || 'plate') + '" style="width:72px;height:72px">' + foodGlyph(f.tone || 'plate', 38) + '</span><div><h2 class="h-lg">' + esc(f.n || 'Food') + '</h2><div class="small muted">' + esc(f.d || '') + '</div></div></div>' +
      '<div class="kv" style="margin-top:16px;grid-template-columns:repeat(4,1fr)"><div><div class="v tnum" style="font-size:22px">' + (f.kcal || 0) + '</div><div class="k">kcal</div></div><div><div class="v tnum" style="font-size:22px">' + (f.p || 0) + '</div><div class="k">Protein g</div></div><div><div class="v tnum" style="font-size:22px">' + (f.c || 0) + '</div><div class="k">Carbs g</div></div><div><div class="v tnum" style="font-size:22px">' + (f.f || 0) + '</div><div class="k">Fat g</div></div></div>' +
      (g ? '<div class="card" style="margin-top:12px"><div class="h-sm">' + esc(g.t) + '</div><ul class="small fg2" style="margin:8px 0 0;padding-left:18px">' + g.body.map((x) => '<li style="margin:4px 0">' + esc(x) + '</li>').join('') + '</ul></div>' : '') +
      '<p class="xs muted" style="margin:10px 2px 0">Macros are estimates for typical portions.</p><div class="row" style="gap:10px;margin-top:14px"><button class="btn fuel grow" data-a="eat" data-v="' + f.id + '" data-s="' + f.slot + '">Log it</button><button class="btn ghost" data-a="sheet" data-v="food" data-s="' + f.slot + '">Swap</button></div>';
  }
  if (sh.v === 'guide') {
    const g = D.GUIDES.find((x) => x.id === p.s) || D.GUIDES[0];
    return '<h2 class="h-lg">' + esc(g.t) + '</h2><ul class="fg2" style="margin:12px 0 0;padding-left:18px">' + g.body.map((x) => '<li style="margin:8px 0">' + esc(x) + '</li>').join('') + '</ul><button class="btn ghost block" style="margin-top:18px" data-a="closeSheet">Close</button>';
  }
  if (sh.v === 'journal') {
    const g = peek(date).grat || [];
    return '<h2 class="h-lg">3 good things</h2><p class="small fg2" style="margin:6px 0 12px">' + esc(fmtD(date)) + '. Before bed, two minutes.</p><div class="stack">' + [0, 1, 2].map((i) => '<input class="field" id="sgrat' + i + '" data-in="grat" data-k="' + i + '" value="' + esc(g[i] || '') + '" placeholder="Good thing ' + (i + 1) + '">').join('') + '</div><button class="btn mind block" style="margin-top:16px" data-a="closeSheet">Done</button>';
  }
  if (sh.v === 'sunday') {
    const mon = mondayOf(date), sr = S.sunday[mon] || {}, c = calibration(date);
    let s = '<h2 class="h-lg">Sunday Reset</h2><p class="small fg2" style="margin:6px 0 12px">Week of ' + fmtShort(mon) + ' · 15 min</p>';
    if (c.rate != null) s += bannerHTML(c.tone, '<b>' + (c.rate >= 0 ? '−' : '+') + Math.abs(c.rate).toFixed(1) + ' lb this week.</b> ' + esc(c.rec));
    s += '<div class="list" style="margin-top:10px">' + D.SUNDAY_RESET.map((t, i) => '<div class="li"><span class="grow t">' + esc(t) + '</span>' + checkBtn(!!sr[i], 'sunday', i, t) + '</div>').join('') + '</div>';
    s += '<label><span class="lbl" style="margin-top:14px">One win from the week</span><input class="field" id="sunWin" data-in="sundayWin" value="' + esc(sr.win || '') + '" placeholder="A first pain-free stair day, a heavy hip thrust, the first jump"></label>';
    s += '<div class="card row" style="margin-top:12px"><span class="grow"><span style="font-weight:600;display:block">Energy check</span><span class="small muted">Late or missed period, constant fatigue, poor sleep or nagging little injuries? Then eat about 2,200 a day and tell your doctor.</span></span><button class="toggle' + (S.settings.energyLow ? ' on' : '') + '" data-a="energy" aria-pressed="' + !!S.settings.energyLow + '" aria-label="Energy check"></button></div>';
    const ng = nextGate(date), ne = ng && gateEarliest(ng, date);
    if (ng && ne) s += '<p class="small fg2" style="margin:10px 2px 0">Next gate: <b>' + esc(ng.n) + '</b> (' + esc(ng.what.toLowerCase()) + '), earliest ' + esc(fmtD(ne)) + '. Book it.</p>';
    return s + '<button class="btn train block" style="margin-top:16px" data-a="closeSheet">Done</button>';
  }
  if (sh.v === 'silent') return '<h2 class="h-lg">Silent timer</h2><p class="small fg2" style="margin:6px 0 14px">A bell to start, a bell to finish.</p><div class="row" style="gap:8px;flex-wrap:wrap">' + [5, 10, 15, 20, 30].map((m) => '<button class="btn ghost sm" data-a="silent" data-v="' + m + '">' + m + ' min</button>').join('') + '</div>';
  if (sh.v === 'gate') {
    return '<h2 class="h-lg">Back clear</h2><p class="small fg2" style="margin:6px 0 14px">Opens when right low-back morning stiffness has been 0 for 7 straight days. The app reads your morning check-ins. Set it by hand only if you haven’t been logging them.</p><div class="stack"><button class="btn good block" style="background:var(--good);color:#062014" data-a="gateSet" data-v="open" data-s="bc">7 days at 0: mark clear</button><button class="btn ghost block" data-a="gateSet" data-v="closed" data-s="bc">Not clear</button><button class="btn ghost block" data-a="gateSet" data-v="" data-s="bc">Use my check-ins</button></div>';
  }
  if (sh.v === 'gateLog') return gateLogSheet(p);
  if (sh.v === 'pain') return painSheet(p);
  if (sh.v === 'swap') return swapSheet(p);
  if (sh.v === 'jump') return jumpSheet(p);
  return '';
}
/* log a knee gate test: every criterion ticked, on or after the earliest date, not on a flare morning */
function gateLogSheet(p) {
  const g = KG_BY[p.s], date = p.date || topDate(), dr = ui.gateDraft && ui.gateDraft.g === g.id ? ui.gateDraft : (ui.gateDraft = { g: g.id, crit: [], note: '' });
  const e = gateEarliest(g, date), flare = kneeFlare(date), all = g.crit.every((_, i) => dr.crit[i]);
  const why = !e ? 'needs ' + (KG.find((x) => x.lvl === g.lvl - 1) || {}).n + ' first' : date < e ? 'earliest ' + fmtD(e) : flare ? 'the knee flagged this morning' : !all ? 'tick every criterion' : '';
  let s = '<h2 class="h-lg">' + esc(g.n) + ' test</h2><p class="small fg2" style="margin:6px 0 12px">' + esc(fmtD(date)) + ' · ' + esc(g.what) + '. Confidence rehearsal first (3 min), then the warm-up. The gates, not the imagery, decide.</p>';
  s += '<button class="li card" style="padding:10px;margin-bottom:10px" data-a="mind" data-v="confide3"><span class="ico" style="color:var(--mind)">' + ic('mind') + '</span><span class="grow t">Confidence rehearsal · 3 min</span>' + ic('play').replace('<svg', '<svg width="18" height="18"') + '</button>';
  s += '<div class="list">' + g.crit.map((c, i) => '<div class="li"><span class="grow small">' + esc(c) + '</span>' + checkBtn(!!dr.crit[i], 'gateCrit', i, c) + '</div>').join('') + '</div>';
  s += '<label><span class="lbl" style="margin-top:12px">Notes (index numbers, PT comments)</span><input class="field" id="gateNote" data-in="gateNote" value="' + esc(dr.note || '') + '" placeholder="e.g. quad index 78%"></label>';
  s += '<p class="small fg2" style="margin:10px 2px 0">Then: ' + esc(g.then) + '.</p>';
  s += '<div class="stack" style="margin-top:14px"><button class="btn train block" data-a="gateSave" data-v="pass"' + (why ? ' disabled' : '') + '>' + (why ? 'Pass: ' + esc(why) : 'Passed: open ' + esc(g.n)) + '</button><button class="btn ghost block" data-a="gateSave" data-v="fail">Not yet: keep the level below, retest next week</button></div>';
  return s;
}
function exInfoSheet(p) {
  const e = EX[p.ex] || {}, hist = [];
  Object.keys(S.days).sort().reverse().forEach((d) => Object.keys(S.days[d].sets || {}).forEach((k) => { if (k.split('|')[2] === p.ex) { const z = S.days[d].sets[k].filter((x) => x && x.done); if (z.length && hist.length < 5) hist.push({ d, z }); } }));
  let s = '<div style="border-radius:16px;overflow:hidden">' + exMedia(p.ex, 'pmedia') + '</div>';
  s += '<h2 class="h-lg" style="margin-top:14px">' + esc(e.n) + '</h2><div class="chips" style="margin-top:8px">' + (e.m ? '<span class="chip">' + esc(e.m) + '</span>' : '') + (e.eq ? '<span class="chip">' + esc(e.eq) + '</span>' : '') + '</div>';
  if (e.cues) s += '<ol class="fg2" style="margin:14px 0 0;padding-left:20px">' + e.cues.map((c) => '<li style="margin:6px 0">' + esc(c) + '</li>').join('') + '</ol>';
  if (p.k && p.s) {
    const alts = [EX[p.ex].alt, EX[p.ex].swapTo, p.base && p.base !== p.ex ? p.base : null].filter((x, i, a) => x && a.indexOf(x) === i && x !== p.ex);
    if (alts.length) s += '<div style="margin-top:16px"><span class="lbl">Swap for today</span><div class="stack">' + alts.map((x) => '<button class="li card" style="padding:10px" data-a="doSwap" data-v="' + x + '" data-k="' + p.k + '">' + exThumb(x, 44) + '<span class="grow t">' + esc(EX[x].n) + '</span>' + ic('swap').replace('<svg', '<svg width="18" height="18"') + '</button>').join('') + '</div></div>';
  }
  if (hist.length) s += '<div style="margin-top:16px"><span class="lbl">History</span><div class="list">' + hist.map((x) => '<div class="li" style="min-height:48px"><span class="small muted" style="width:86px">' + fmtD(x.d) + '</span><span class="small tnum grow">' + x.z.map((z) => (z.w ? z.w + '×' : '') + (z.r || z.t || '✓')).join('  ·  ') + '</span></div>').join('') + '</div></div>';
  return s + '<button class="btn ghost block" style="margin-top:18px" data-a="closeSheet">Close</button>';
}
function foodSheet(p) {
  const slot = p.s || 'snack', sl = D.SLOTS.find((x) => x.id === slot) || {};
  const recents = []; Object.keys(S.days).sort().reverse().forEach((d) => (S.days[d].meals || []).forEach((m) => { if (m.custom && !recents.some((r) => r.n === m.n)) recents.push(m); }));
  let s = '<h2 class="h-lg">Add to ' + esc(sl.n || 'meals') + '</h2><p class="small fg2" style="margin:6px 0 12px">Tap to log. Your plan’s meals come first.</p>' + aiButtons(slot, 'margin-bottom:14px');
  const mine = D.FOODS.filter((f) => f.slot === slot), others = D.FOODS.filter((f) => f.slot !== slot);
  s += '<div class="stack" style="gap:8px">' + mine.map((f) => foodPick(f, slot)).join('') + '</div>';
  if (recents.length) s += '<div class="lbl" style="margin-top:16px">Your recent</div><div class="stack" style="gap:8px">' + recents.slice(0, 6).map((f) => foodPick(f, slot, true)).join('') + '</div>';
  s += '<div class="lbl" style="margin-top:16px">Quick add</div><div class="card stack"><input class="field" id="cfName" placeholder="What did you eat?" aria-label="Food name"><div class="row" style="gap:8px"><input class="field" id="cfKcal" inputmode="numeric" placeholder="kcal" aria-label="Calories"><input class="field" id="cfP" inputmode="numeric" placeholder="Protein g" aria-label="Protein"></div><div class="row" style="gap:8px"><input class="field" id="cfC" inputmode="numeric" placeholder="Carbs g" aria-label="Carbs"><input class="field" id="cfF" inputmode="numeric" placeholder="Fat g" aria-label="Fat"></div><button class="btn fuel block" data-a="customFood" data-s="' + slot + '">Add</button></div>';
  s += '<details class="fold" style="margin-top:14px"><summary>Everything else</summary><div class="fb stack" style="gap:8px">' + others.map((f) => foodPick(f, slot)).join('') + '</div></details>';
  return s;
}
function foodPick(f, slot, custom) {
  return '<button class="food" data-a="' + (custom ? 'eatCustom' : 'eat') + '" data-v="' + esc(custom ? f.n : f.id) + '" data-s="' + slot + '"><span class="fa art-' + (f.tone || 'plate') + '" style="width:46px;height:46px">' + foodGlyph(f.tone || 'plate', 24) + '</span><span class="grow" style="min-width:0"><span class="ft" style="display:block">' + esc(f.n) + '</span><span class="fs" style="display:block">' + f.kcal + ' kcal · ' + f.p + ' g protein' + (f.d ? ' · ' + esc(f.d) : '') + '</span></span><span style="color:var(--fuel)">' + ic('plus').replace('<svg', '<svg width="20" height="20"') + '</span></button>';
}

/* ------------------------------------------------------------------ actions */
A.tab = (el) => { ui.tab = el.dataset.v; ui.stack = []; renderedLayers = 0; window.scrollTo(0, 0); render(); };
A.date = (el) => { ui.date = el.dataset.v; ui.editReady = false; render(); };
A.wk = (el) => { ui.date = addDays(ui.date, +el.dataset.v); render(); };
A.push = (el) => push(el.dataset.v, {});
A.pop = () => pop();
A.closeSheet = () => closeSheet();
A.sheet = (el) => openSheet(el.dataset.v, { s: el.dataset.s });
A.workout = (el) => push('workout', { date: ui.date, sid: el.dataset.v });
A.workoutMin = (el) => { closeSheet(); ui.sheet = null; push('workout', { date: ui.date, sid: el.dataset.v }); };
A.openDay = (el) => { const d = el.dataset.v, s = mainSession(plan(d)); ui.date = d; if (s) push('workout', { date: d, sid: s.sid }); else { ui.tab = 'today'; render(); } };
A.trainWeek = (el) => { ui.trainWeek = +el.dataset.v; render(); };
A.editReady = () => { ui.editReady = !ui.editReady; render(); };
/* readiness answers go to the day being checked: the sheet's day, else the open workout's, else the selected day */
function chkDate() { return (ui.sheet && ui.sheet.p && ui.sheet.p.date) || topDate(); }
A.chk = (el) => { const date = chkDate(), d = day(date); d.chk = d.chk || {}; d.chk[el.dataset.k] = +el.dataset.v; touch(date); render(); };
A.chkT = (el) => { const date = chkDate(), d = day(date); d.chk = d.chk || {}; d.chk[el.dataset.k] = !d.chk[el.dataset.k]; touch(date); render(); };
A.tick = (el) => {
  const k = el.dataset.v, date = topDate(), on = !isDone(date, k);
  setDone(date, k, on);
  if (on) Sound.done();
  render();
};
A.toggle = (el) => A.tick(el);
A.desk = (el) => { const d = day(ui.date); d.desk = Math.max(0, (d.desk || 0) + +el.dataset.v); touch(ui.date); render(); };
A.routine = (el) => openRoutine(el.dataset.v);
A.core = (el) => openCore(el.dataset.v, el.dataset.w ? +el.dataset.w : null);
A.mind = (el) => openMind(el.dataset.v);
A.logSnack = () => { ui.tab = 'fuel'; ui.stack = []; render(); openSheet('food', { s: 'snack' }); };
A.exInfo = (el) => { const l = ui.stack[ui.stack.length - 1]; openSheet('exinfo', { ex: el.dataset.v, k: el.dataset.k, s: el.dataset.s, base: el.dataset.k && l && l.p.sid ? (findSession(l.p.date, l.p.sid).src.items.find((i) => i.k === el.dataset.k) || {}).ex : null }); };
A.doSwap = (el) => { const date = topDate(), d = day(date); d.swaps = d.swaps || {}; const it = el.dataset.k; if (d.swaps[it] === el.dataset.v) delete d.swaps[it]; else d.swaps[it] = el.dataset.v; touch(date); closeSheet(); toast('Swapped to ' + EX[el.dataset.v].n); };
A.completeSession = (el) => { const date = topDate(); setDone(date, 's:' + el.dataset.v, true); Sound.done(); pop(); toast('Session complete'); };
A.undoSession = (el) => { setDone(topDate(), 's:' + el.dataset.v, false); render(); };
A.startBlock = (el) => openBlock(topDate(), el.dataset.s, +el.dataset.v);
A.startCardio = (el) => openCardio(topDate(), el.dataset.v);
A.startStrides = (el) => openStrides(topDate(), el.dataset.v);
A.eat = (el) => {
  const f = foodById(el.dataset.v); if (!f) return;
  const d = day(ui.date); d.meals = d.meals || [];
  d.meals.push({ fid: f.id, slot: el.dataset.s || f.slot, n: f.n, kcal: f.kcal, p: f.p, c: f.c, f: f.f, q: 1, free: !!f.free, tone: f.tone });
  touch(ui.date); ui.sheet = null; render(); toast(f.n + ' logged');
};
A.eatCustom = (el) => {
  let src = null; Object.keys(S.days).forEach((d) => (S.days[d].meals || []).forEach((m) => { if (m.custom && m.n === el.dataset.v) src = m; }));
  if (!src) return; const d = day(ui.date); d.meals = d.meals || [];
  d.meals.push(Object.assign(aiCloneMeal(src), { slot: el.dataset.s })); touch(ui.date); ui.sheet = null; render(); toast(src.n + ' logged');
};
A.customFood = (el) => {
  const n = ($('#cfName').value || '').trim(), kcal = num($('#cfKcal').value), p = num($('#cfP').value) || 0;
  if (!n || kcal == null) { toast('Add a name and calories'); return; }
  const d = day(ui.date); d.meals = d.meals || [];
  d.meals.push({ custom: true, slot: el.dataset.s, n, kcal, p, c: num($('#cfC').value) || 0, f: num($('#cfF').value) || 0, q: 1, tone: 'plate' });
  touch(ui.date); ui.sheet = null; render(); toast(n + ' logged');
};
A.uneat = (el) => { const d = day(ui.date); d.meals.splice(+el.dataset.v, 1); touch(ui.date); render(); };
A.logPlan = () => {
  const d = day(ui.date); d.meals = d.meals || []; let n = 0;
  D.SLOTS.forEach((sl) => { const f = plannedFood(ui.date, sl.id); if (f && sl.id !== 'pre' && !d.meals.some((m) => m.slot === sl.id)) { d.meals.push({ fid: f.id, slot: sl.id, n: f.n, kcal: f.kcal, p: f.p, c: f.c, f: f.f, q: 1, tone: f.tone }); n++; } });
  touch(ui.date); render(); toast(n ? n + ' planned meals logged' : 'Every meal slot already has food');
};
A.water = (el) => { const d = day(ui.date), v = +el.dataset.v; d.water = d.water === v ? v - 1 : v; touch(ui.date); render(); };
A.supp = (el) => { const d = day(ui.date); d.supps = d.supps || {}; d.supps[el.dataset.v] = !d.supps[el.dataset.v]; touch(ui.date); render(); };
A.drink = (el) => { const d = day(ui.date); d.drinks = d.drinks || {}; d.drinks[el.dataset.v] = Math.max(0, (d.drinks[el.dataset.v] || 0) + +el.dataset.d); touch(ui.date); render(); };
A.kcalAdj = (el) => { S.settings.kcalAdj = el.dataset.v === 'reset' ? 0 : (S.settings.kcalAdj || 0) + +el.dataset.v; touch(); render(); toast('Daily target ' + (S.settings.kcalAdj > 0 ? '+' : '') + S.settings.kcalAdj + ' kcal'); };
A.gateOv = (el) => openSheet('gate', { s: el.dataset.v });
A.gateLogOpen = (el) => { ui.gateDraft = { g: el.dataset.v, crit: [], note: '' }; openSheet('gateLog', { s: el.dataset.v, date: topDate() }); };
A.gateCrit = (el) => { const dr = ui.gateDraft; if (!dr) return; dr.crit[+el.dataset.v] = !dr.crit[+el.dataset.v]; render(); };
A.gateSave = (el) => {
  const dr = ui.gateDraft, p = (ui.sheet && ui.sheet.p) || {}, g = KG_BY[dr.g], date = p.date || topDate(), pass = el.dataset.v === 'pass';
  S.gates = S.gates || { log: [] }; S.gates.log = S.gates.log || [];
  S.gates.log.push({ g: g.id, date, pass, crit: g.crit.map((_, i) => !!dr.crit[i]), note: dr.note || '', at: Date.now() });
  touch(); ui.gateDraft = null; closeSheet(); toast(pass ? g.n + ' passed: ' + g.what.toLowerCase() + ' opens' : 'Logged. Keep the level below and retest next week');
};
A.energy = () => { S.settings.energyLow = !S.settings.energyLow; touch(); render(); toast(S.settings.energyLow ? 'Energy check on: about 2,200 a day' : 'Energy check off'); };
A.gateSet = (el) => { S.settings.gate = S.settings.gate || {}; if (el.dataset.v) S.settings.gate[el.dataset.s] = el.dataset.v; else delete S.settings.gate[el.dataset.s]; touch(); closeSheet(); };
A.sunday = (el) => { const mon = mondayOf(ui.date); S.sunday[mon] = S.sunday[mon] || {}; S.sunday[mon][el.dataset.v] = !S.sunday[mon][el.dataset.v]; touch(); if (D.SUNDAY_RESET.every((_, i) => S.sunday[mon][i])) setDone(ui.date, 'reset', true); render(); };
A.setting = (el) => { const k = el.dataset.k, v = el.dataset.v; S.settings[k] = v === 'true' ? true : v === 'false' ? false : v; touch(); render(); };
A.quiz = (el) => push('quiz', { k: el.dataset.v, a: [] });
A.silent = (el) => { closeSheet(); openSilent(+el.dataset.v); };
A.exportData = async () => {
  const data = JSON.stringify(S, null, 1), name = 'road-to-sri-lanka-backup-' + todayISO() + '.json';
  try { const dl = window.claude && window.claude.use ? await window.claude.use('downloads') : null; if (dl) { await dl.save({ filename: name, data }); toast('Backup saved'); return; } } catch (e) { /* fall through */ }
  if (!window.claude) {
    // installed iPhone app: share sheet ("Save to Files"), else a normal download
    try {
      const file = new File([data], name, { type: 'application/json' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: 'Road to Sri Lanka backup' }); return; }
      const u = URL.createObjectURL(file), a = document.createElement('a'); a.href = u; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 5000); toast('Backup saved'); return;
    } catch (e) { if (e && e.name === 'AbortError') return; }
  }
  try { await navigator.clipboard.writeText(data); toast('Backup copied to clipboard'); } catch (e) { toast('Saving files is not available here'); }
};
A.resetAsk = () => {
  if (!ui.resetArm) { ui.resetArm = true; render(); setTimeout(() => { ui.resetArm = false; }, 4000); return; }
  ui.resetArm = false; const keep = S.settings.name; S = blank(); S.settings.name = keep; S.u = Date.now();
  Object.keys(Cloud.ready ? {} : {}).forEach(() => {}); lsSet();
  if (Cloud.ready) { Cloud.col().get().then((snap) => snap.docs.forEach((d) => { if (d.id !== 'meta') Cloud.col().doc(d.id).delete(); })).catch(() => {}); Cloud.dirty.add('meta'); Cloud.schedule(300); }
  ui.stack = []; render(); toast('Everything reset');
};
function topDate() { const l = ui.stack.slice().reverse().find((x) => x.p && x.p.date); return l ? l.p.date : ui.date; }

/* inputs */
const IN = {
  bench: (el) => { const k = el.dataset.k; S.bench[k] = S.bench[k] || {}; S.bench[k][el.dataset.c] = el.value.trim(); touch(); },
  weight: (el) => { const d = day(ui.date); d.weight = el.value.trim(); touch(ui.date); },
  steps: (el) => { const d = day(ui.date); d.steps = el.value.trim(); touch(ui.date); },
  grat: (el) => { const d = day(ui.date); d.grat = d.grat || ['', '', '']; d.grat[+el.dataset.k] = el.value; touch(ui.date); },
  journal: (el) => { const d = day(ui.date); d.journal = el.value; touch(ui.date); },
  sundayWin: (el) => { const mon = mondayOf(ui.date); S.sunday[mon] = S.sunday[mon] || {}; S.sunday[mon].win = el.value; touch(); },
  setting: (el) => { S.settings[el.dataset.k] = el.value; touch(); },
  gateNote: (el) => { if (ui.gateDraft) ui.gateDraft.note = el.value; },
  cardio: (el) => { const date = topDate(), d = day(date); d.cardio = d.cardio || {}; d.cardio[el.dataset.s] = d.cardio[el.dataset.s] || {}; d.cardio[el.dataset.s][el.dataset.k] = el.value.trim(); touch(date); },
  import: (el) => {
    const f = el.files && el.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => { try { const o = JSON.parse(r.result); if (!o || !o.days) throw new Error('bad'); S = Object.assign(blank(), o); S.u = Date.now(); Object.keys(S.days).forEach((dd) => { S.days[dd].u = Date.now(); Cloud.dirty.add('w-' + mondayOf(dd)); }); Cloud.dirty.add('meta'); lsSet(); Cloud.schedule(300); render(); toast('Backup restored'); } catch (e) { toast('That file is not a Road to Sri Lanka backup'); } };
    r.readAsText(f);
  },
};
const RERENDER_ON_CHANGE = { weight: 1, steps: 1, bench: 0 };

document.addEventListener('click', (ev) => {
  const el = ev.target.closest('[data-a]');
  if (!el) return;
  const fn = A[el.dataset.a] || (window.PA && window.PA[el.dataset.a]);
  if (!fn) return;
  ev.preventDefault();
  Sound.ensure();
  fn(el, ev);
});
document.addEventListener('keydown', (ev) => {
  if ((ev.key === 'Enter' || ev.key === ' ') && ev.target.matches('[role="button"][data-a]')) { ev.preventDefault(); ev.target.click(); }
  if (ev.key === 'Escape') { if (ui.sheet) closeSheet(); else if (ui.stack.length) pop(); }
});
document.addEventListener('input', (ev) => {
  const el = ev.target.closest('[data-in]'); if (!el) return;
  const fn = IN[el.dataset.in] || (window.PIN && window.PIN[el.dataset.in]);
  if (fn && el.type !== 'file') fn(el, ev);
});
document.addEventListener('change', (ev) => {
  const el = ev.target.closest('[data-in]'); if (!el) return;
  if (el.type === 'file') { IN.import(el); return; }
  if (RERENDER_ON_CHANGE[el.dataset.in]) render();
});

/* ------------------------------------------------------------------ boot */
async function boot() {
  try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (e) { /* not supported */ }
  const saved = lsGet();
  if (saved && saved.days) S = Object.assign(blank(), saved, { settings: Object.assign(blank().settings, saved.settings || {}) });
  // restore anything the IndexedDB mirror has that localStorage lost
  try {
    const mirror = await Promise.race([IDBStore.read(), new Promise((r) => setTimeout(() => r(null), 1500))]);
    if (mergeState(mirror)) { S.settings = Object.assign(blank().settings, S.settings || {}); lsSet(); }
    else if (saved) IDBStore.queue(JSON.stringify(S));
  } catch (e) { /* mirror unavailable */ }
  Cloud.bootDays = new Set(Object.keys(S.days)); Cloud.bootU = S.u || 0;
  try { if (navigator.storage && navigator.storage.persisted) ui.persisted = await navigator.storage.persisted(); } catch (e) { /* unknown */ }
  if (location.hash && ['today', 'train', 'fuel', 'mind', 'progress'].includes(location.hash.slice(1))) ui.tab = location.hash.slice(1);
  render();
  fetch('audio/tracks.json').then((r) => r.json()).then((j) => { TRACKS = j; }).catch(() => {});
  await Cloud.init();
  render();
  // keep "today" fresh if the app stays open past midnight. iOS keeps a home-screen app in memory for days,
  // so check the moment it comes back too: otherwise the first minute of taps would be logged to yesterday.
  let lastDay = todayISO();
  const rollover = () => { const t = todayISO(); if (t !== lastDay) { if (ui.date === lastDay) ui.date = t; lastDay = t; render(); } };
  setInterval(rollover, 60000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) rollover(); });
  window.addEventListener('pageshow', rollover);
  window.addEventListener('focus', rollover);
}
