/* Core: dates, state, storage + cloud sync, Ashanti's schedule, readiness, knee gates and back clear, progression, nutrition, weekly summary, sound. */
'use strict';
const D = window.FS, EX = D.EX;

/* ------------------------------------------------------------------ utils */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const pad2 = (n) => String(n).padStart(2, '0');
const iso = (d) => d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
const pISO = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d, 12); };
const addDays = (s, n) => { const d = pISO(s); d.setDate(d.getDate() + n); return iso(d); };
const daysBetween = (a, b) => Math.round((pISO(b) - pISO(a)) / 86400000);
const todayISO = () => iso(new Date());
const dowOf = (s) => (pISO(s).getDay() + 6) % 7; // 0 = Mon
const DOW = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DOW_LONG = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const fmtD = (s) => { const d = pISO(s); return DOW[dowOf(s)] + ' ' + d.getDate() + ' ' + MON[d.getMonth()]; };
const fmtShort = (s) => { const d = pISO(s); return MON[d.getMonth()] + ' ' + d.getDate(); };
const mondayOf = (s) => addDays(s, -dowOf(s));
const fmtTime = (sec) => { sec = Math.max(0, Math.round(sec)); const m = Math.floor(sec / 60), s = sec % 60; return m + ':' + pad2(s); };
const num = (v) => { const n = parseFloat(v); return isFinite(n) ? n : null; };
const rnd5 = (v) => Math.round(v / 5) * 5;
const topOf = (reps) => { const m = String(reps || '').match(/(\d+)(?!.*\d)/); return m ? +m[1] : null; };
const lowOf = (reps) => { const m = String(reps || '').match(/(\d+)/); return m ? +m[1] : null; };
const uid = () => Math.random().toString(36).slice(2, 10);
const fmtN = (n) => Math.round(n).toLocaleString('en-US');

/* ------------------------------------------------------------------ state */
const LS_KEY = 'rtsl1.state.v1';
const blank = () => ({ v: 1, u: 0, settings: { name: 'Ashanti', unit: 'lb', kcalAdj: 0, gate: {}, ambient: true, voice: true }, days: {}, bench: {}, sunday: {}, quiz: [], waist: {}, weeks: {}, gates: { log: [] } });
let S = blank();
const ui = { tab: 'today', date: todayISO(), stack: [], sheet: null, trainWeek: null };

/* Two on-device copies: localStorage (written instantly on every change) and an IndexedDB mirror
   (written a moment later and again whenever the app goes to the background). On launch the newer
   copy wins, day by day, so one store being cleared never loses your history. */
let saveError = null;
function lsGet() { try { const t = localStorage.getItem(LS_KEY); return t ? JSON.parse(t) : null; } catch (e) { return null; } }
function lsSet() {
  S.savedAt = Date.now();
  let json; try { json = JSON.stringify(S); } catch (e) { return; }
  try { localStorage.setItem(LS_KEY, json); saveError = null; } catch (e) { saveError = (e && e.name) || 'error'; }
  IDBStore.queue(json);
}
const IDBStore = {
  p: null, pending: null, t: null, ok: null,
  open() {
    if (this.p) return this.p;
    this.p = new Promise((res) => {
      try {
        const r = indexedDB.open('road-to-sri-lanka', 1);
        r.onupgradeneeded = () => r.result.createObjectStore('kv');
        r.onsuccess = () => { this.ok = true; const db = r.result; db.onclose = () => { this.p = null; }; db.onversionchange = () => { try { db.close(); } catch (e) { /* ignore */ } this.p = null; }; res(db); };
        r.onerror = r.onblocked = () => { this.ok = false; res(null); };
      } catch (e) { this.ok = false; res(null); }
    });
    return this.p;
  },
  queue(json) { this.pending = json; clearTimeout(this.t); this.t = setTimeout(() => this.flush(), 300); },
  async flush(retry = true) {
    clearTimeout(this.t);
    const json = this.pending; if (!json) return; this.pending = null;
    const db = await this.open(); if (!db) return;
    try {
      const tx = db.transaction('kv', 'readwrite');
      tx.objectStore('kv').put(json, 'state');
      tx.onabort = tx.onerror = () => { this.p = null; if (!this.pending) { this.pending = json; clearTimeout(this.t); this.t = setTimeout(() => this.flush(false), 500); } };
    } catch (e) {
      // iOS closes IndexedDB connections while the app is in the background: reopen once and retry
      this.pending = this.pending || json; this.p = null;
      if (retry) return this.flush(false);
    }
  },
  async read() {
    const db = await this.open(); if (!db) return null;
    return new Promise((res) => {
      try {
        const r = db.transaction('kv').objectStore('kv').get('state');
        r.onsuccess = () => { try { res(r.result ? JSON.parse(r.result) : null); } catch (e) { res(null); } };
        r.onerror = () => res(null);
      } catch (e) { res(null); }
    });
  },
};
/* iOS can kill a backgrounded web app without warning, so everything pending is written the moment it goes away */
function flushAll() { IDBStore.flush(); Cloud.flush(); }
window.addEventListener('pagehide', flushAll);
document.addEventListener('visibilitychange', () => { if (document.hidden) flushAll(); });
/* merge another copy of the state into S: newer day wins, newer settings win */
function mergeState(o) {
  if (!o || typeof o !== 'object') return false;
  let changed = false;
  Object.keys(o.days || {}).forEach((date) => {
    const r = o.days[date], l = S.days[date];
    if (r && (!l || (r.u || 0) > (l.u || 0))) { S.days[date] = r; changed = true; }
  });
  if (o.weeks && mergeWeeks(o.weeks)) changed = true;
  if ((o.u || 0) > (S.u || 0)) { ['settings', 'bench', 'sunday', 'quiz', 'waist', 'gates'].forEach((k) => { if (o[k] !== undefined) S[k] = o[k]; }); S.u = o.u; changed = true; }
  return changed;
}

function day(date, create = true) {
  let d = S.days[date];
  if (!d && create) d = S.days[date] = { u: 0 };
  return d || {};
}
function peek(date) { return S.days[date] || {}; }

/* fill in what only the other copy has, keeping every local value (two levels deep: done, sets, swaps, bench…) */
function fillMissing(l, r) {
  let ch = false;
  Object.keys(r || {}).forEach((k) => {
    if (k === 'u') return;
    const a = l[k], b = r[k];
    if (a === undefined) { l[k] = JSON.parse(JSON.stringify(b)); ch = true; }
    else if (a && b && typeof a === 'object' && typeof b === 'object' && !Array.isArray(a) && !Array.isArray(b)) {
      Object.keys(b).forEach((kk) => { if (a[kk] === undefined) { a[kk] = JSON.parse(JSON.stringify(b[kk])); ch = true; } });
    }
  });
  return ch;
}

/* mark a day (or meta) changed: saves locally now, syncs to cloud shortly */
function touch(date) {
  const now = Date.now();
  if (date) { day(date).u = now; Cloud.dirty.add('w-' + mondayOf(date)); }
  else { S.u = now; Cloud.dirty.add('meta'); }
  lsSet();
  Cloud.schedule();
}

/* ------------------------------------------------------------------ cloud sync (artifact db, private per viewer) */
const Cloud = {
  db: null, uid: null, ready: false, dirty: new Set(), timer: null, busy: false, again: false, status: 'local', lastPull: 0,
  pulled: false, bootDays: null, bootU: 0, // what this device had before the first pull (see pull)
  async init() {
    try {
      if (!window.claude || !window.claude.use) return;
      const [db, user] = await Promise.all([window.claude.use('db'), window.claude.use('user')]);
      if (!db || !user) return;
      const id = await user.id();
      if (!id) return;
      this.db = db; this.uid = id; this.ready = true; this.status = 'syncing';
      await this.pull();
      // push anything only stored locally (first run on this device)
      Object.keys(S.days).forEach((d) => this.dirty.add('w-' + mondayOf(d)));
      this.dirty.add('meta');
      this.schedule(500);
      document.addEventListener('visibilitychange', () => { if (!document.hidden && Date.now() - this.lastPull > 60000) this.pull().then(() => render()); });
    } catch (e) { this.status = 'local'; }
  },
  col() { return this.db.collection('data/users/' + this.uid); },
  async pull() {
    if (!this.ready) return;
    try {
      const snap = await this.col().get();
      let changed = false;
      /* Taps made before the first pull finished (the cloud copy can take a moment on launch, and on some
         hosts it is the only copy that survives a relaunch) must not replace the cloud's day with a partial
         one: for those, the cloud fills in everything the tap didn't touch. */
      const first = !this.pulled;
      snap.docs.forEach((doc) => {
        const body = doc.data() || {};
        if (doc.id === 'meta') {
          if (body.weeks && mergeWeeks(body.weeks)) changed = true;
          if (Object.keys(S.weeks || {}).some((k) => !body.weeks || !body.weeks[k] || (body.weeks[k].at || 0) < S.weeks[k].at)) this.dirty.add('meta'); // snapshots only this device has
          if ((body.u || 0) > (S.u || 0)) { ['settings', 'bench', 'sunday', 'quiz', 'waist', 'gates'].forEach((k) => { if (body[k] !== undefined) S[k] = body[k]; }); S.u = body.u; changed = true; }
          else if (first && (body.u || 0) > (this.bootU || 0)) {
            ['bench', 'sunday', 'waist'].forEach((k) => { if (body[k]) { const o = {}; o[k] = body[k]; if (fillMissing(S, o)) changed = true; } });
            (body.quiz || []).forEach((q) => { if (!S.quiz.some((x) => x.k === q.k && x.date === q.date && x.score === q.score)) { S.quiz.push(q); changed = true; } });
            S.gates = S.gates || { log: [] }; S.gates.log = S.gates.log || [];
            ((body.gates && body.gates.log) || []).forEach((e) => { if (!S.gates.log.some((x) => x.g === e.g && x.date === e.date && x.at === e.at)) { S.gates.log.push(e); changed = true; } });
            if (changed) this.dirty.add('meta');
          }
        } else if (body.days) {
          Object.keys(body.days).forEach((date) => {
            const r = body.days[date], l = S.days[date];
            if (!l || (r.u || 0) > (l.u || 0)) { S.days[date] = JSON.parse(JSON.stringify(r)); changed = true; }
            else if (first && this.bootDays && !this.bootDays.has(date) && fillMissing(l, r)) { changed = true; this.dirty.add('w-' + mondayOf(date)); }
          });
        }
      });
      this.pulled = true;
      this.lastPull = Date.now();
      this.status = 'synced';
      if (changed) lsSet();
    } catch (e) { this.status = 'offline'; }
  },
  schedule(ms = 1200) {
    if (!this.ready) return;
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.flush(), ms);
  },
  async flush() {
    if (!this.ready) return;
    if (this.busy) { this.again = true; return; }
    clearTimeout(this.timer);
    this.busy = true; this.again = false;
    let failed = false;
    const keys = Array.from(this.dirty); this.dirty.clear();
    for (const k of keys) {
      try {
        let body;
        if (k === 'meta') body = { u: S.u || Date.now(), settings: S.settings, bench: S.bench, sunday: S.sunday, quiz: S.quiz, waist: S.waist, gates: S.gates || { log: [] }, weeks: S.weeks || {} };
        else {
          const mon = k.slice(2), days = {};
          for (let i = 0; i < 7; i++) { const d = addDays(mon, i); if (S.days[d]) days[d] = S.days[d]; }
          body = { days };
        }
        await this.col().doc(k).set(JSON.parse(JSON.stringify(body)));
        this.status = 'synced';
      } catch (e) {
        this.dirty.add(k); failed = true;
        this.status = (e && e.code === 'quota_exceeded') ? 'full' : 'offline';
      }
    }
    this.busy = false;
    // changes made while this flush was running go out right away; failures retry later
    if (this.dirty.size) this.schedule(failed ? 8000 : this.again || document.hidden ? 0 : 1200);
  },
};

/* ------------------------------------------------------------------ schedule */
function weekOf(date) {
  const n = daysBetween(D.START, date);
  if (n < 0) return 0;
  return Math.floor(n / 7) + 1;
}
function weekStart(w) { return addDays(D.START, (w - 1) * 7); }
function phaseOf(w) {
  if (w <= 0) return { n: 0, name: 'Kickoff' };
  if (w <= 2) return { n: 1, name: 'Protect' };
  if (w <= 6) return { n: 2, name: w === 6 ? 'Pivot' : 'Rebuild' };
  if (w <= 10) return { n: 3, name: w === 10 ? 'Holiday Express' : 'Reload Legs' };
  if (w <= 12) return { n: 4, name: 'Peak' };
  if (w === 13) return { n: 5, name: 'Taper' };
  return { n: 6, name: 'Sri Lanka' };
}
const FLY_DATE = D.FLY;
const BIG_DAYS = { '2026-11-26': 'Thanksgiving', '2026-12-24': 'Christmas Eve', '2026-12-25': 'Christmas Day', '2026-12-31': "New Year's Eve" };
/* core circuits are keyed by week number: Weeks 1–3 control, 4–6 load, 7–13 shred */
function coreSet(w) { return w <= 3 ? 1 : w <= 6 ? 2 : 3; }
function coreFmt(w) { return D.CORE_FMT[clamp(w, 1, 13)]; }
/* Knee Lab angle ladder for wall sits and Spanish squats */
function angleFor(w) { return D.ANGLES[w] || '90°'; }
function sess(sid, type, src, more) { return Object.assign({ sid, type, src, title: src.title, sub: src.sub, dur: src.dur, hero: src.hero }, more || {}); }
const LOWER_KINDS = ['lower', 'lowerA', 'lowerB', 'lite', 'lab', 'taperPump'];

/* Everything planned for one date */
function plan(date) {
  const w = weekOf(date), dw = dowOf(date), ph = phaseOf(w);
  const P = { date, week: w, dow: dw, phase: ph, sessions: [], walk: null, sit: null, core: null, ramp: null, notes: [], tests: [],
    kneeArmor: false, backReset: false, mobility: false, sunday: dw === 6, travel: false, gateTest: null, yellowAlt: null, steps: '8,000–10,000', confide: false };
  const wkInfo = D.WEEKS[w] || {};
  P.rir = wkInfo.rir || '';
  if (wkInfo.event) P.event = wkInfo.event;
  if (BIG_DAYS[date]) P.notes.push({ tone: 'warn', t: BIG_DAYS[date] + ': train in the morning, protein fills a third of the first plate, one dessert eaten slowly, walk 10–15 min after. Eat at about maintenance (~2,250); tomorrow is normal.' });

  const WALK = ['Walk 30–45 min', 'Steps only', 'Walk 40–45 min', 'Walk 30–45 min', 'Steps only', 'Walk 20 min after the session', 'Long walk 45–60 min'];
  P.walk = WALK[dw];
  P.sit = sitFor(w, dw);
  const lvl = kneeLevel(date);

  if (w === 0) {
    P.sessions.push({ sid: 'kickoff', type: 'rest', title: 'Kickoff Sunday', sub: 'Rest, long walk and set up the week', dur: '15 min', hero: 'walk' });
    P.notes.push({ tone: 'mind', t: 'Week 1 starts tomorrow. Measure waist, hips and thighs Monday morning and weigh in daily from now on. The scale can rise 1–2 lb in Week 1 (glycogen and water); judge from Week 2.' });
    P.walk = 'Long walk 45–60 min';
    return P;
  }
  if (date >= FLY_DATE) {
    if (date === FLY_DATE) {
      P.travel = true;
      P.sessions.push({ sid: 'fly', type: 'travel', title: 'Fly to Colombo', sub: 'Travel day, ~20 h', dur: '~20 h', hero: 'walk' });
      P.walk = 'Walk the aisle every 1–2 h';
      P.notes.push({ tone: 'warn', t: 'Calf pain, warmth or swelling around the flight is a red flag: see a doctor.' });
      return P;
    }
    P.phase = { n: 6, name: 'Sri Lanka' };
    P.kneeArmor = P.backReset = [0, 2, 4].includes(dw);
    P.notes.push({ tone: 'mind', t: 'Never Zero: 2–3 hotel-gym or band sessions a week, Knee Armor and Back Reset 3 times a week, daily walks, ocean swims. Mini-band and long loop band for hip thrusts, split squats, band rows, push-ups and kickbacks anywhere.' });
    if (dw === 0) P.sessions.push(sess('slA', 'lift', D.MIN.minA, { kind: 'min', sub: 'Never Zero · hotel gym or bands' }));
    if (dw === 3) P.sessions.push(sess('slB', 'lift', D.MIN.minB, { kind: 'min', sub: 'Never Zero · hotel gym or bands' }));
    if (dw === 5) P.sessions.push({ sid: 'oceanswim', type: 'cardio', title: 'Ocean swim', sub: 'Optional third session', dur: '20–30 min', hero: 'swim', optional: true, cardio: { min: 25, text: 'Easy ocean swim. Flutter kick until Gate 4; keep sand and shore-break for once Gate 4 has passed.' } });
    P.walk = 'Daily walk';
    P.gateTest = gateDue(date);
    if (P.gateTest) { P.confide = true; P.notes.push({ tone: 'train', t: P.gateTest.n + ' test (' + P.gateTest.what.toLowerCase() + ') can be done today: on firm, flat ground, lateral shuffles before bounds. Confidence rehearsal first.' }); }
    return P;
  }

  P.kneeArmor = w <= 6 || [0, 2, 4].includes(dw);
  P.backReset = w <= 6 || [0, 2, 4].includes(dw) || !backClear(date);
  if (w >= 11 && w <= 12) P.steps = '10,000–11,000';

  // Week 13 taper
  if (w === 13) {
    if (dw === 0) { P.sessions.push(sess('taperFull', 'lift', D.MIN.taperFull, { kind: 'taperFull', mods: { taper: true } })); P.core = 'A'; P.ramp = 'upper'; }
    if (dw === 1) { P.sessions.push(sess('taperPump', 'lift', D.MIN.taperPump, { kind: 'taperPump', mods: { taper: true } })); P.ramp = 'lower'; P.notes.push({ tone: 'train', t: 'Photos after the pump: front, side, back, glutes; same light.' }); }
    if (dw === 2) { P.sessions.push({ sid: 'w13-rec', type: 'recovery', title: 'Recovery', sub: 'Walk 45 min + Knee Armor and Back Reset', dur: '60 min', hero: 'walk' }); P.walk = 'Walk 45 min'; P.kneeArmor = P.backReset = true; }
    if (dw === 3) { P.sessions.push({ sid: 'pack', type: 'cardio', title: 'Easy swim or walk', sub: 'Then pack', dur: '20–30 min', hero: 'swim', cardio: { min: 20, text: 'Easy swim 20 min (flutter kick, open turns) or walk 30 min. Then pack: compression socks, a small pillow for the low back, protein snacks, mini-band and long loop band.' } }); P.walk = null; }
    if (dw >= 1 && dw <= 3) P.notes.push({ tone: 'fuel', t: 'Taper food: add about 75–100 g of carbs today (rice, fruit). Salt and water normal; no water cutting before a ~20-hour journey.' });
    if (dw === 0) P.notes.push({ tone: 'train', t: 'Taper: full-body pump, 2 × 12–15 each at RIR 2, 45 s rest. Core A today only (40/20 s, 1 round).' });
    addCheckNotes(P, date);
    return P;
  }

  const pivot = w === 6, holiday = w === 10, peak = w === 11 || w === 12;
  const factor = pivot ? 0.6 : holiday ? 2 / 3 : 1;
  const mods = { factor, pivot, holiday, peak };
  const UP = w <= 2 ? D.P1 : w <= 6 ? D.P2 : D.P3;
  const lift = (kind, src, core, more) => {
    P.sessions.push(sess('w' + w + '-' + kind, 'lift', src, Object.assign({ kind, mods }, more || {})));
    if (core) P.core = core;
    P.ramp = src.ramp;
  };
  const polo = (wk, optional) => {
    const p = D.POLO[wk]; if (!p) return;
    P.sessions.push({ sid: 'w' + w + '-polo', type: 'hiit', title: 'Polo Day', sub: p.sub, dur: optional ? '~10 min' : holiday ? '~40 min' : '35–45 min', hero: 'farmer',
      src: { title: 'Polo Day', warmup: D.POLO_WARM, blocks: p.blocks, pool: p.pool, cooldown: 'Easy walk to cool down. Electrolytes today.' }, mods, optional: !!(optional || p.optional) });
  };

  switch (dw) {
    case 0: lift('pull', UP.pull, 'A'); break;
    case 1:
      if (w <= 2) lift('lower', D.P1.lower, 'B');
      else if (w <= 6 || lvl < 2) { lift('lower', D.P2.lower, 'B'); if (w >= 7) P.notes.push({ tone: 'train', t: 'Gate 1 not passed yet: the Phase 2 Tuesday lower day stays, the upper body moves on. Retest every Saturday.' }); }
      else lift('lowerA', D.P3.lowerA, 'B');
      break;
    case 2:
      P.sessions.push({ sid: 'w' + w + '-rec', type: 'recovery', title: 'Recovery', sub: 'Walk + Knee Armor + Back Reset + easy mobility', dur: '45–60 min', hero: 'walk' });
      P.kneeArmor = P.backReset = P.mobility = true;
      if (w >= 7) P.notes.push({ tone: 'mind', t: 'Want pool time? Do Friday’s Polo Day in the water: 400 m warm-up, 3 × (4 × 50 m fast freestyle on 15 s + 100 m easy), 200 m easy. Open turns until Gate 3.' });
      break;
    case 3:
      if (pivot) {
        P.sessions.push({ sid: 'turkey', type: 'hiit', title: D.TURKEY.title, sub: D.TURKEY.sub, dur: D.TURKEY.dur, hero: D.TURKEY.hero, src: D.TURKEY, mods });
      } else lift('push', UP.push, 'C');
      if (date === '2026-12-24') P.notes.push({ tone: 'train', t: 'Christmas Eve: Push this morning.' });
      if (date === '2026-12-31') P.notes.push({ tone: 'warn', t: "New Year's Eve: Push in the morning, a walk in the afternoon, then the drink rules (cap 2–3, water between each, last drink 3 h before bed)." });
      break;
    case 4:
      if (pivot) { lift('push', UP.push, 'C'); P.notes.push({ tone: 'train', t: 'Pivot week: Push moves to Friday (no Polo Day this week) because Thursday is the Turkey Burner.' }); }
      else if (holiday) {
        P.sessions.push({ sid: 'xmas', type: 'rest', title: 'Christmas Day', sub: 'Off, or a 10-min Polo Day in the morning', dur: '', hero: 'walk' });
        polo(10, true); P.walk = 'Walk 10–15 min after the big meal';
      } else polo(w);
      break;
    case 5:
      if (w <= 2) { lift('lab', D.LAB.lab12, null); P.yellowAlt = 'Yellow day: swim instead (20–30 min easy freestyle with a pull buoy plus 4 × 50 m gentle flutter kick, open turns) or walk 45 min + Knee Armor.'; }
      else if (w <= 4) { lift('lab', D.LAB.lab34, null); P.yellowAlt = 'Yellow day: swim instead (20–30 min easy freestyle with a pull buoy plus 4 × 50 m gentle flutter kick, open turns) or walk 45 min + Knee Armor.'; }
      else if (w === 6) {
        lift('lab', D.LAB.lab34, null, { title: 'Short Knee Lab', sub: 'After the gate test and mid-point retest · B, C and D only', mods: Object.assign({}, mods, { factor: 1, only: ['B', 'C', 'D'] }) });
        P.notes.push({ tone: 'train', t: 'Mid-point retest today: ' + (lvl >= 1 ? 'Gate 1 test, ' : 'Gate A retest, ') + 'strength index, pull-ups, side plank holds, tape and photos. Then the short Knee Lab.' });
      } else if (w >= 7 && lvl >= 2) lift('lowerB', D.P3.lowerB, 'B');
      else if (lvl >= 1) lift('lite', D.LAB.lite, 'B');
      else { lift('lab', D.LAB.lab34, null, { sub: 'Gate A not passed yet: Weeks 3–4 version with 90° holds' }); P.notes.push({ tone: 'train', t: 'Gate A not passed yet: the Knee Lab with 90° holds stays, and you retest today.' }); }
      if (w >= 5 && !P.yellowAlt) P.yellowAlt = 'Swim option for a yellow day: 300 m warm-up, 10 × 50 m freestyle with the buoy on 10 s rest, 6 × 50 m flutter kick, 4 × 100 m steady, 200 m easy.';
      if (w >= 7 && lvl >= 2) P.notes.push({ tone: 'train', t: 'If your legs still feel heavy this morning, skip Lower B’s top set and do the hip thrusts and accessories.' });
      if (date === '2026-12-26') P.notes.push({ tone: 'warn', t: 'No Gate 3 test today: it needs Gate 2 + 2 weeks, so Mon Dec 28 at the earliest. Lower B as planned; jumps wait for Gate 3.' });
      break;
    case 6:
      P.sessions.push({ sid: 'w' + w + '-sun', type: 'rest', title: 'Rest + Sunday Reset', sub: 'Long walk and the weekly check', dur: '15 min', hero: 'walk' });
      if (w >= 9) P.notes.push({ tone: 'mind', t: 'Sunday long sit today: 30 min, together with Nadun if you like.' });
      if (lvl >= 4) P.notes.push({ tone: 'train', t: 'Walk-jog (Gate 3): inside the long walk, after 10 min of walking, 5 × (3 min walk / 3 min jog) on flat ground. Progress only with no swelling the next morning.' });
      break;
  }
  if (holiday && P.sessions.some((s) => s.type === 'lift')) P.notes.push({ tone: 'train', t: 'Holiday Express: ⅔ of the sets, same loads and effort, finishers optional, about 40 min.' });
  if (pivot && P.sessions.some((s) => s.type === 'lift' && s.kind !== 'lab')) P.notes.push({ tone: 'train', t: 'Pivot deload: same loads, about 60% of the sets, stop at RIR 3.' });
  if (peak && P.sessions.some((s) => s.type === 'lift')) P.notes.push({ tone: 'train', t: 'Peak: last set of every isolation exercise is a drop set or myo-reps' + (dw === 0 || dw === 3 ? ', then the arm pump finisher.' : ', then the glute pump finisher.') + ' Steps 10,000–11,000 today.' });
  if (dw === 1 && w >= 11 && lvl >= 4 && !P.notes.some((n) => /jumps/i.test(n.t))) P.notes.push({ tone: 'train', t: 'Gate 3 passed: Lower A starts with pogo hops, box jumps (step down) and jump squats. Land quietly; stop the set when a landing gets loud.' });
  if (date === '2026-10-31') P.notes.push({ tone: 'warn', t: 'Halloween tonight: drink rules apply (cap 2–3, water between each, last drink 3 h before bed).' });
  if (w === 8 && dw === 0) P.notes.push({ tone: 'mind', t: 'Holiday parties start this week: holiday playbook and drink rules.' });

  // tests and benchmarks
  const IDX = ['legextR', 'legextL', 'curlR', 'curlL', 'bridgeR', 'bridgeL'], TAPE = ['waist', 'hips', 'thigh', 'midthigh'];
  const CORE_T = ['sideL', 'sideR', 'extensor', 'flexor', 'hlr', 'abwheel', 'vacuumMax'];
  if (w === 1 && dw === 0) { P.tests.push(...TAPE); P.notes.push({ tone: 'train', t: 'Measure this morning: waist at the navel, hips at the widest point of the glutes, upper thigh 2 in below the glute fold, mid-thigh. The scale can rise 1–2 lb this week; judge from Week 2.' }); }
  if (w === 1 && dw === 5) { P.tests.push(...IDX, ...CORE_T); P.notes.push({ tone: 'train', t: 'Baseline tests before the Knee Lab: single-leg leg extension (90°–45° range) and seated leg curl at a 10-rep weight, right and left; side plank holds left and right; core benchmarks (back-extensor hold and ab wheel only once your back is clear).' }); }
  if (w === 2 && dw === 0) { P.tests.push('pullups'); P.notes.push({ tone: 'train', t: 'Baseline: strict pull-ups before the session (dead hang to chin over the bar).' }); }
  if (w === D.HT_TEST_WEEK && dw === 1) { P.tests.push('hip8'); P.notes.push({ tone: 'train', t: 'Barbell hip thrust 8RM test: today’s top set (log the weight as your baseline).' }); }
  if (w === 6 && dw === 5) P.tests.push(...IDX, 'pullups', ...TAPE, ...CORE_T);
  if (w === 9 && dw === 4) { P.tests.push('deepend'); P.notes.push({ tone: 'train', t: 'The Deep End: your first benchmark score. Log the rounds.' }); }
  if (w === 12) {
    const g2 = gateState(date).pass.g2, early = g2 && daysBetween(g2, date) >= 21;
    const T = [['pullups'], ['hip5', 'squat5'], [], ['incline8'], IDX.concat(lvl >= 4 ? ['hopR', 'hopL'] : [], ['deepend']), ['dead5', ...CORE_T], [...TAPE]];
    P.tests.push(...T[dw]);
    const N = ['Final retest: strict pull-ups before Pull.',
      'Final retest: hip thrust 5RM; back squat 5RM only if Gate 2 passed 3+ weeks ago' + (early ? ' (it did)' : ', otherwise an 8RM at RIR 1') + '.', '',
      'Final retest: incline DB press 8RM before Push.',
      'Final retest: knee strength index (leg extension, leg curl, glute bridge, right and left' + (lvl >= 4 ? ', plus the hop tests' : '') + '), then The Deep End.',
      'Final retest: deadlift 5RM (Gate 2 + back clear) or RDL 8RM; side plank holds left and right; core benchmarks.',
      'Final retest: 7-day weight average, waist, hips, thighs, photos.'];
    if (N[dw]) P.notes.push({ tone: 'train', t: N[dw] });
  }
  // gate tests: on the gate's test day once it is allowed (retest weekly if missed)
  P.gateTest = gateDue(date);
  if (P.gateTest) {
    P.confide = true;
    const flare = kneeFlare(date);
    P.notes.push({ tone: flare ? 'warn' : 'train', t: flare ? P.gateTest.n + ' test day, but the knee flagged this morning (pain above 2 or swelling): hold at your current gate and test another day.'
      : P.gateTest.n + ' test day (' + P.gateTest.what.toLowerCase() + '). Confidence rehearsal first, then the test; log it under Progress → Knee gates.' });
  }
  if (dw === 1 && w >= 11 && lvl >= 4 && firstJumpDay(date)) P.confide = true;
  addCheckNotes(P, date);
  P.tests = Array.from(new Set(P.tests));
  return P;
}
/* notes that come from the morning check-in */
function addCheckNotes(P, date) {
  const hasLift = P.sessions.some((s) => s.type === 'lift' || s.type === 'hiit'), c = peek(date).chk, y = peek(addDays(date, -1)).chk;
  if (c && c.swell === 1 && y && y.swell === 1) P.notes.push({ tone: 'warn', t: 'Swelling two mornings running means the day before was too much: keep today light and hold at your current gate.' });
  if (!hasLift || !c) return;
  if (kneeFlare(date)) P.notes.push({ tone: 'warn', t: 'Knee flagged this morning (pain above 2 or swelling): knee work goes one level down today, gated lifts use the level below, and you hold at your current gate.' });
  if (c.back != null && c.back >= 3) P.notes.push({ tone: 'warn', t: 'Back ' + c.back + '/10 this morning: hinges swap for the day (RDL → cable pull-through, back extension → glute bridge hold) and the Back Reset follows the session.' });
  if (c.instab) P.notes.push({ tone: 'bad', t: 'Shifting, slipping or giving way: stop that movement, go back one gate and call your PT. Never push through instability.' });
}

function sitFor(w, dw) {
  if (w <= 2 || w > 13) return 'breath10';
  if (w <= 4) return 'scan12';
  if (w <= 8) return dw === 6 ? 'metta15' : [0, 2, 4].includes(dw) ? 'open15' : 'scan15';
  return dw === 6 ? 'sit30' : 'open20';
}
/* which benchmark column a test fills: Baseline (Wks 1–2, hip thrust 8RM in Week 3, Deep End first score), Week 6, Week 12 */
function benchCol(w, id) {
  if (id === 'hip8') return 'base';
  if (id === 'deepend') return w <= 10 ? 'base' : 'w12';
  return w <= 3 ? 'base' : w <= 8 ? 'w6' : 'w12';
}
function mainSession(P) { return P.sessions.find((s) => s.type === 'lift') || P.sessions.find((s) => s.type !== 'rest') || P.sessions[0] || null; }
/* the Sunday Reset counts 6 sessions a week: Mon, Tue, Wed recovery, Thu, Fri, Sat */
function isTraining(s) { return s && ['lift', 'hiit', 'cardio', 'recovery'].includes(s.type) && !s.optional; }
function isLowerDay(P) { return P.sessions.some((s) => s.type === 'lift' && LOWER_KINDS.includes(s.kind)); }

/* ------------------------------------------------------------------ readiness, knee gates, back clear */
function readiness(date) {
  const c = peek(date).chk;
  if (!c || c.sleep == null || c.knee == null || c.swell == null || c.back == null) return null;
  if (c.sleep < 5 || c.knee >= 5 || c.back >= 5 || c.swell >= 1 || c.sick || c.instab) return 'red';
  if (c.sleep < 7 || c.knee >= 3 || c.back >= 3 || c.sore || c.feet) return 'yellow';
  return 'green';
}
const READY_TXT = {
  green: ['Green', 'Full session.'],
  yellow: ['Yellow', 'One set fewer per exercise, no finisher, knee work one level down.'],
  red: ['Red', 'Knee Armor + Back Reset + walk, or the 30-minute Minimum session.'],
};
/* knee pain above 2 or any swelling this morning: hold at the current gate, knee work one level down */
function kneeFlare(date) { const c = peek(date).chk; return !!(c && ((c.knee != null && c.knee > 2) || c.swell >= 1 || c.instab)); }
function kneeDown(date) { const r = readiness(date); return kneeFlare(date) || r === 'yellow' || r === 'red'; }

function streak(date, key, test) {
  let n = 0, d = date;
  if (!peek(d).chk || peek(d).chk[key] == null) d = addDays(d, -1);
  for (let i = 0; i < 120; i++) {
    const c = peek(d).chk;
    if (!c || c[key] == null || !test(c[key])) break;
    n++; d = addDays(d, -1);
  }
  return n;
}
/* "Back clear" = right low-back morning stiffness 0 for 7 straight days (a manual override is allowed in Progress) */
function backClear(date) {
  const ov = S.settings.gate && S.settings.gate.bc;
  if (ov === 'open') return true;
  if (ov === 'closed') return false;
  return streak(date, 'back', (v) => v === 0) >= D.BACK_CLEAR_DAYS;
}
const KG = D.KNEE_GATES, KG_BY = {};
KG.forEach((g) => { KG_BY[g.id] = g; });
function gateLog() { return (S.gates && S.gates.log) || []; }
/* pass dates as of a date: a logged pass only counts on/after the gate's earliest date and 14+ days after the
   previous gate passed; a regression ("go back one gate") closes that gate and everything above it */
function gateState(asOf) {
  const log = gateLog().filter((e) => e && e.date <= asOf).slice().sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : (a.at || 0) - (b.at || 0)));
  const pass = {};
  log.forEach((e) => {
    const g = KG_BY[e.g]; if (!g) return;
    if (e.regress) { KG.filter((x) => x.lvl >= g.lvl).forEach((x) => { delete pass[x.id]; }); return; }
    if (!e.pass || pass[g.id] || e.date < g.earliest) return;
    const prev = KG.find((x) => x.lvl === g.lvl - 1);
    if (prev && (!pass[prev.id] || daysBetween(pass[prev.id], e.date) < 14)) return;
    pass[g.id] = e.date;
  });
  let lvl = 0;
  KG.forEach((g) => { if (pass[g.id] && lvl === g.lvl - 1) lvl = g.lvl; });
  return { pass, lvl };
}
function kneeLevel(date) { return gateState(date).lvl; }
function effLevel(date) { return Math.max(0, kneeLevel(date) - (kneeDown(date) ? 1 : 0)); }
/* the earliest date a gate can be tested, given what has passed before `asOf` */
function gateEarliest(g, asOf) {
  const st = gateState(asOf), prev = KG.find((x) => x.lvl === g.lvl - 1);
  if (prev && !st.pass[prev.id]) return null;
  const after = prev ? addDays(st.pass[prev.id], 14) : g.earliest;
  return after > g.earliest ? after : g.earliest;
}
/* the next gate, if today is its test day (its weekday, on or after the earliest date) */
function gateDue(date) {
  const st = gateState(addDays(date, -1)), g = KG.find((x) => x.lvl === st.lvl + 1);
  if (!g) return null;
  const e = gateEarliest(g, addDays(date, -1));
  if (!e || date < e) return null;
  if (dowOf(date) !== g.dow) return null;
  if (g.id === 'g4' ? date <= FLY_DATE : weekOf(date) > 12) return null;
  return g;
}
function nextGate(date) { const st = gateState(date); return KG.find((x) => x.lvl === st.lvl + 1) || null; }
function firstJumpDay(date) {
  const d0 = gateState(date).pass.g3; if (!d0) return false;
  for (let d = d0; d < date; d = addDays(d, 1)) if (dowOf(d) === 1 && weekOf(d) >= 7 && weekOf(d) <= 12) return false;
  return true;
}
/* gates used by exercises: 'bc' = back clear, knee gates at today's effective level (one lower on a flare/yellow day) */
function gateOpen(id, date, logged) {
  if (Array.isArray(id)) return id.every((x) => gateOpen(x, date, logged));
  if (id === 'bc') return backClear(date);
  const g = KG_BY[id]; if (!g) return true;
  return (logged ? kneeLevel(date) : effLevel(date)) >= g.lvl;
}
function gateStatus(g, date) {
  const st = gateState(date);
  if (st.pass[g.id]) return 'open';
  const e = gateEarliest(g, date);
  if (!e) return 'locked';
  return date >= e ? 'due' : 'later';
}

/* resolve an exercise through gates and today's back swaps */
function dayEx(ex, date, firstAlt) {
  let gated = null; const chk = peek(date).chk;
  for (let i = 0; i < 5; i++) {
    const d = EX[ex]; if (!d) break;
    if (d.gate && !gateOpen(d.gate, date)) { gated = gated || { from: ex, gate: d.gate }; ex = (i === 0 && firstAlt) || d.alt; }
    else if (d.backAlt && chk && chk.back != null && chk.back > (d.backMax ?? 2)) { gated = gated || { from: ex, day: 'back' }; ex = d.backAlt; }
    else break;
  }
  return { ex, gated };
}
function resolveEx(item, date) { return dayEx(item.ex, date, item.alt); }
/* week variants: the latest variant whose gate is open; a closed gate falls back to the level below */
function pickVariant(it, w, date) {
  if (!it.v) return it;
  const cands = [Object.assign({}, it)].concat(it.v.filter((v) => (v.from || 0) <= w).map((v) => Object.assign({}, it, v)));
  let i = cands.length - 1;
  while (i > 0 && cands[i].gate && !gateOpen(cands[i].gate, date)) i--;
  if (i > 0 && painDown(cands[i].ex, date)) { i--; while (i > 0 && cands[i].gate && !gateOpen(cands[i].gate, date)) i--; }
  const out = cands[i]; delete out.v;
  return out;
}
/* knee traffic light 3–5/10 (or puffier next morning) marks an exercise one level down for the next two sessions */
function painDown(ex, date) {
  let d0 = null;
  for (let i = 0; i <= 28 && !d0; i++) { const d = addDays(date, -i), p = peek(d).pain; if (p && p[ex] === 'down') d0 = d; }
  if (!d0) return false;
  if (d0 === date) return true;
  let n = 0;
  for (let d = addDays(d0, 1); d < date; d = addDays(d, 1)) { const s = peek(d).sets || {}; if (Object.keys(s).some((k) => k.split('|')[2] === ex && s[k].some((x) => x && x.done))) n++; }
  return n < 2;
}
const HINGES = ['db_rdl', 'bb_rdl', 'pull_through', 'band_pull_through', 'conv_deadlift', 'trapbar', 'kb_swing', 'back_ext', 'reverse_hyper', 'sl_rdl_reach'];
const ISO_RE = /curl|fly|raise|pushdown|_tri|lateral|calf|leg_ext|crossover|pec_deck|kickback|abd/;
/* RIR by category: upper RIR 2 in Week 1 then 1–2; hip work 3 (Wks 1–2), 2 (Wks 3–6), 1 (Wk 7+);
   anything that bends the knee under load never closer than RIR 2 (Wks 1–2: 3, with the lower day); Knee Lab RIR 3 */
function itemRIR(x, w, mods) {
  if (mods.pivot) return '3';
  if (x.rir != null) return x.rir;
  if (x.scheme === 'top' || x.kind) return '';
  switch (x.cat) {
    case 'lab': return '3';
    case 'up': return w <= 1 ? '2' : '1–2';
    case 'hip': return w <= 1 ? '3–4' : w <= 2 ? '3' : w <= 6 ? '2' : '1';
    case 'knee': return w <= 1 ? '3–4' : w <= 2 ? '3' : '2';
  }
  return '';
}

/* items for a lift session after week variants, gates, week modifiers, readiness and swaps */
function sessionItems(s, date) {
  const P = plan(date), w = P.week, r = readiness(date), dd = peek(date), mods = s.mods || {};
  let items = s.src.items.map((it) => pickVariant(Object.assign({}, it), w, date)).filter((it) => !it.skip);
  if (mods.only) items = items.filter((it) => mods.only.includes(it.k));
  const kd = kneeDown(date), g2 = gateOpen('g2', date), passG2 = gateState(date).pass.g2;
  return items.map((it) => {
    const res = resolveEx(it, date);
    const swap = dd.swaps && dd.swaps[it.k];
    const ex = swap || res.ex, def = EX[ex] || {};
    const x = Object.assign({}, it);
    if (it.altRx && it.altRx[ex]) Object.assign(x, it.altRx[ex]);
    let sets = x.sets;
    if (mods.factor && mods.factor < 1 && !x.kind) sets = Math.max(1, Math.round(sets * mods.factor));
    if (r === 'yellow' && !x.kind && sets > 1) sets -= 1;
    if (x.setReps && sets < x.setReps.length) { x.setReps = x.setReps.slice(x.setReps.length - sets); x.setRest = x.setRest && x.setRest.slice(x.setRest.length - sets); }
    const optional = !!(x.optional || ((x.fin || x.kind) && (r === 'yellow' || r === 'red' || mods.holiday)));
    const backSkip = x.backSkip != null && dd.chk && dd.chk.back != null && dd.chk.back > x.backSkip;
    const noHinge = !!(dd.noHinge && HINGES.includes(ex));
    const pd = painDown(ex, date), kneeLow = !!(def.knee && (kd || pd));
    let tech = x.tech || '';
    if (x.techGate && !gateOpen(x.techGate, date)) tech = '';
    const iso = ISO_RE.test(ex) && !x.scheme && !x.kind && !x.fin && !x.time;
    if (mods.peak && iso && (!def.knee || g2)) tech = tech || 'Peak: last set drop set or myo-reps';
    else if (!tech && w >= 7 && w <= 12 && !mods.pivot && !mods.holiday && iso && x.cat === 'up') tech = 'Last set to failure';
    let note = String(x.note || '').replace('{angle}', angleFor(w));
    let topRIR = x.topRIR, rir = itemRIR(x, w, mods);
    if (x.peakLift && passG2 && passG2 > '2026-12-14') { topRIR = '2'; if (x.rir) rir = '2'; note += ' Gate 2 passed after Dec 14: stay at RIR 2 and skip the maxes.'; }
    if (kneeLow) note = (note ? note + ' ' : '') + 'Knee one level down today: less load or less range.';
    const skipped = !!(dd.skip && dd.skip[ex]) || noHinge;
    return Object.assign(x, { ex, baseEx: it.ex, gated: swap ? null : res.gated, swapped: !!swap, sets, optional, backSkip, skipped, tech, note, rir, topRIR, kneeLow });
  });
}
function groupItems(items) {
  const groups = [];
  items.forEach((it) => {
    const letter = it.k.replace(/\d+$/, '');
    const g = groups[groups.length - 1];
    if (g && g.letter === letter && /\d$/.test(it.k)) g.items.push(it);
    else groups.push({ letter, items: [it] });
  });
  return groups;
}

/* ------------------------------------------------------------------ logging helpers */
const setKey = (sid, it) => sid + '|' + it.k + '|' + it.ex;
function setsFor(date, sid, it) { const d = peek(date); return (d.sets && d.sets[setKey(sid, it)]) || []; }
function lastN(ex, beforeDate, n) {
  const dates = Object.keys(S.days).filter((d) => d < beforeDate).sort().reverse(), out = [];
  for (const d of dates) {
    const sets = S.days[d].sets; if (!sets) continue;
    for (const k of Object.keys(sets)) {
      if (k.split('|')[2] === ex && sets[k].some((x) => x && x.done)) { out.push({ date: d, sets: sets[k].filter((x) => x && x.done) }); break; }
    }
    if (out.length >= n) break;
  }
  return out;
}
function lastSets(ex, beforeDate) { return lastN(ex, beforeDate, 1)[0] || null; }
/* top of the range at the RIR → +5 lb (barbell / next DB size), +10 lb on the hip thrust; back after 7+ days off: −10% */
function suggest(it, date) {
  const prev = lastN(it.ex, date, 2), last = prev[0];
  if (!last) return null;
  const def = EX[it.ex] || {};
  const inc = def.lower ? 10 : 5;
  const ws = last.sets.map((x) => num(x.w)).filter((x) => x != null);
  if (!ws.length) return { last, w: null, msg: '' };
  const top = Math.max.apply(null, ws);
  let w = top, msg = 'Same weight as last time';
  if (it.scheme === 'top') {
    const ts = last.sets[0], tr = topOf(it.topReps);
    if (ts && tr && +ts.r >= tr) { w = top + inc; msg = 'Hit ' + ts.r + ' on the top set: add ' + inc + ' lb'; }
  } else if (!it.time && !it.dist) {
    const tr = topOf(it.reps);
    if (tr && last.sets.length >= Math.min(2, it.sets) && last.sets.every((x) => +x.r >= tr)) { w = top + inc; msg = 'Top of the range on every set: add ' + inc + ' lb'; }
  }
  if (it.kneeLow && w > top) { w = top; msg = 'Knee one level down today: no load increase'; }
  const gap = daysBetween(last.date, date);
  if (gap > 7) { w = rnd5(w * 0.9); msg = 'Back after ' + gap + ' days off: last loads minus 10%'; }
  return { last, w, msg };
}
function sessionDone(date, sid) { const d = peek(date); return !!(d.done && d.done['s:' + sid]); }
function setDone(date, key, val = true) { const d = day(date); d.done = d.done || {}; if (val) d.done[key] = Date.now(); else delete d.done[key]; touch(date); }
function isDone(date, key) { const d = peek(date); return !!(d.done && d.done[key]); }

/* Never Zero: two scheduled sessions missed in a row before this date */
function missedTwice(date) {
  let misses = 0, d = addDays(date, -1);
  for (let i = 0; i < 10 && d >= D.START; i++) {
    const s = plan(d).sessions.filter(isTraining);
    if (s.length) {
      const done = s.some((x) => sessionDone(d, x.sid)) || isDone(d, 's:min');
      if (done) return false;
      misses++;
      if (misses >= 2) return true;
    }
    d = addDays(d, -1);
  }
  return false;
}
function lastTrainedGap(date) {
  const dates = Object.keys(S.days).filter((d) => d < date && S.days[d].done && Object.keys(S.days[d].done).some((k) => k.startsWith('s:'))).sort();
  if (!dates.length) return null;
  return daysBetween(dates[dates.length - 1], date);
}

/* ------------------------------------------------------------------ nutrition */
function targets(date) {
  const dw = dowOf(date), K = D.KCAL, wkEnd = dw >= 4;
  let kcal = wkEnd ? K.weekend : K.weekday, label = wkEnd ? 'Fri–Sun target' : 'Mon–Thu target';
  let carbs = wkEnd ? [230, 250] : [190, 210];
  if (BIG_DAYS[date]) { kcal = K.bigDay; label = BIG_DAYS[date] + ' · about maintenance'; }
  if (date >= '2027-01-12' && date <= '2027-01-14') { kcal += K.taperAdd; carbs = [carbs[0] + 75, carbs[1] + 100]; label = 'Taper · +75–100 g carbs'; }
  kcal += S.settings.kcalAdj || 0;
  if (S.settings.energyLow && kcal < K.energyFloor) { kcal = K.energyFloor; label = 'Energy check · about 2,200'; }
  return { kcal, label, p: D.PROTEIN.slice(), fat: [60, 60], carbs, fiber: [25, 35], water: 3 };
}
function foodById(id) { return D.FOODS.find((f) => f.id === id); }
function mealsFor(date) { return peek(date).meals || []; }
function totals(date) {
  const t = { kcal: 0, p: 0, c: 0, f: 0 };
  mealsFor(date).forEach((m) => { const q = m.q || 1; t.kcal += m.kcal * q; t.p += m.p * q; t.c += (m.c || 0) * q; t.f += (m.f || 0) * q; });
  const dr = peek(date).drinks || {};
  D.DRINKS.forEach((x) => { t.kcal += (dr[x.id] || 0) * x.kcal; });
  return t;
}
function plannedFood(date, slot) {
  const d = peek(date);
  if (d.plan && d.plan[slot]) return foodById(d.plan[slot]);
  const P = plan(date), s = mainSession(P);
  const train = !!(s && ['lift', 'hiit', 'cardio'].includes(s.type) && !s.optional), lower = isLowerDay(P);
  switch (slot) {
    case 'pre': return train ? foodById('pre_banana') : null;
    case 'breakfast': return foodById(lower ? 'bfast_fruit' : 'bfast');
    case 'post': return train ? foodById('shake') : null;
    case 'lunch': return foodById('lunch_sl');
    case 'dinner': return BIG_DAYS[date] ? foodById('holiday_plate') : foodById(train ? 'dinner_chicken' : 'dinner_rest');
    case 'snack': return foodById(train ? 'snack_corepower' : 'snack_omelette');
  }
  return null;
}
function freeMealsThisWeek(date) {
  const mon = mondayOf(date); let n = 0;
  for (let i = 0; i < 7; i++) n += mealsFor(addDays(mon, i)).filter((m) => m.free).length;
  return n;
}
function drinksOn(date) { const dr = peek(date).drinks || {}; return D.DRINKS.reduce((a, x) => a + (dr[x.id] || 0), 0); }
/* nightly cap: 2–3, Friday 1–2, none on Thursday night before Polo Day (New Year's Eve follows the normal rules) */
function drinkCap(date) { const dw = dowOf(date), B = D.DRINK_BUDGET; return dw === 3 && date !== '2026-12-31' ? B.thu : dw === 4 ? B.fri : B.night; }
function freeMealCap() { return D.FREE_MEALS.normal; }

/* ------------------------------------------------------------------ weight */
function weights() { return Object.keys(S.days).filter((d) => num(S.days[d].weight) != null).sort().map((d) => ({ d, w: num(S.days[d].weight) })); }
function avg7(date) {
  const xs = []; for (let i = 0; i < 7; i++) { const w = num(peek(addDays(date, -i)).weight); if (w != null) xs.push(w); }
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null;
}
/* ------------------------------------------------------------------ weekly summary
   One summary per plan week (Mon–Sun). Computed from S.days, so the live week is always fresh; once a week
   has ended it is also frozen into S.weeks[w] (saved and synced with the meta doc, newest snapshot wins)
   and used as the fallback if that week's day data is ever missing. */
const WEEK_N = 13;
/* [key, name, unit ('wt' = weight unit), good direction (+1 higher / -1 lower / 0 neutral), decimals, colour] */
const WK_MET = [
  ['weight', 'Weight', 'wt', -1, 1, 'var(--train)'], ['sess', 'Sessions', '', 1, 0, 'var(--train)'],
  ['gate', 'Knee gates passed', '/5', 1, 0, 'var(--good)'],
  ['knee', 'Knee pain, morning', '/10', -1, 1, 'var(--bad)'], ['swell', 'Mornings with swelling', '%', -1, 0, 'var(--bad)'],
  ['back', 'Low-back stiffness', '/10', -1, 1, 'var(--warn)'],
  ['steps', 'Steps / day (logged by hand)', '', 1, 0, 'var(--train)'], ['sleep', 'Sleep / night (check-in)', ' h', 1, 1, 'var(--mind)'],
  ['kcal', 'Calories / day', ' kcal', 0, 0, 'var(--fuel)'], ['adh', 'Calories on target', '%', 1, 0, 'var(--fuel)'],
  ['prot', 'Protein / day', ' g', 1, 0, 'var(--fuel)'], ['protDays', 'Protein days hit', '', 1, 0, 'var(--fuel)'], ['aiScore', 'Food score', '/10', 1, 1, 'var(--fuel)'],
  ['stress', 'Stress', '/10', -1, 1, 'var(--mind)'], ['mind', 'Mind minutes', ' min', 1, 0, 'var(--mind)'],
];
function weekCompute(w) {
  const ws = weekStart(w), we = addDays(ws, 6), t = todayISO(), last = we < t ? we : t;
  const acc = {}, put = (k, v) => { if (v != null && isFinite(v)) (acc[k] = acc[k] || []).push(v); };
  const mean = (k) => (acc[k] && acc[k].length ? acc[k].reduce((a, b) => a + b, 0) / acc[k].length : null);
  let sess = 0, sessT = 0, days = 0, mind = 0, protDays = 0, adhOk = 0, kd = 0, hasMind = false;
  for (let i = 0; i < 7; i++) {
    const dd = addDays(ws, i), d = peek(dd);
    plan(dd).sessions.filter(isTraining).forEach((s) => { sessT++; if (dd <= t && sessionDone(dd, s.sid)) sess++; });
    if (dd > last) continue;
    if (Object.keys(d).length > 1) days++;
    const tot = totals(dd), tg = targets(dd);
    if (tot.kcal > 0) { kd++; put('kcal', tot.kcal); if (Math.abs(tot.kcal - tg.kcal) <= tg.kcal * 0.1) adhOk++; if (tot.p > 0) put('prot', tot.p); if (tot.p >= tg.p[0]) protDays++; }
    const sc = (d.meals || []).map((m) => m.ai && m.ai.score).filter((x) => x != null); if (sc.length) put('aiScore', sc.reduce((a, b) => a + b, 0) / sc.length);
    const stp = parseFloat(String(d.steps || '').replace(/[^\d.]/g, '')); if (stp > 0) put('steps', stp);
    const ch = d.chk || {}; ['knee', 'back', 'stress'].forEach((k) => put(k, ch[k])); if (ch.sleep != null) put('sleep', ch.sleep);
    if (ch.swell != null) put('swell', ch.swell ? 100 : 0);
    (d.mind || []).forEach((x) => { mind += x.min || 0; hasMind = true; });
  }
  const m = { weight: avg7(last), sess: sessT ? sess : null, mind: hasMind ? Math.round(mind) : null, adh: kd ? Math.round(adhOk / kd * 100) : null, protDays: kd ? protDays : null };
  ['steps', 'sleep', 'kcal', 'prot', 'aiScore', 'knee', 'swell', 'back', 'stress'].forEach((k) => { m[k] = mean(k); });
  m.gate = (days || gateLog().length) && last >= ws ? kneeLevel(last) : null;
  if (m.sess === 0 && days === 0) m.sess = null;
  return { w, from: ws, to: we, days, kd, sessT, m };
}
const wkCache = { key: '', v: {} };
function weekSummary(w) {
  const key = (S.savedAt || 0) + '|' + todayISO();
  if (wkCache.key !== key) { wkCache.key = key; wkCache.v = {}; }
  if (wkCache.v[w]) return wkCache.v[w];
  let r = weekCompute(w);
  const snap = (S.weeks || {})[w];
  if (snap && r.days === 0 && r.m.weight == null) r = Object.assign({}, snap, { snap: true });
  return (wkCache.v[w] = r);
}
function mergeWeeks(o) {
  S.weeks = S.weeks || {}; let ch = false;
  Object.keys(o || {}).forEach((k) => { if (o[k] && (!S.weeks[k] || (o[k].at || 0) > (S.weeks[k].at || 0))) { S.weeks[k] = o[k]; ch = true; } });
  return ch;
}
/* freeze every finished week; refresh a snapshot when a late edit changed it */
let freezeKey = '';
function freezeWeeks() {
  const key = (S.savedAt || 0) + '|' + todayISO(); if (key === freezeKey) return;
  S.weeks = S.weeks || {}; const t = todayISO(); let ch = false;
  for (let w = 1; w <= WEEK_N; w++) {
    if (addDays(weekStart(w), 6) >= t) break;
    const r = weekCompute(w); if (r.days === 0 && r.m.weight == null) continue;
    const old = S.weeks[w];
    if (!old || JSON.stringify(old.m) !== JSON.stringify(r.m)) { S.weeks[w] = { w, from: r.from, to: r.to, days: r.days, kd: r.kd, sessT: r.sessT, m: r.m, at: Date.now() }; ch = true; }
  }
  if (ch) { Cloud.dirty.add('meta'); lsSet(); Cloud.schedule(); }
  freezeKey = (S.savedAt || 0) + '|' + t;
}
function targetAt(date) {
  const T = D.TARGET_PATH;
  if (date <= T[0][0]) return { t: T[0][1], lo: T[0][2], hi: T[0][3] };
  for (let i = 1; i < T.length; i++) {
    if (date <= T[i][0]) {
      const a = T[i - 1], b = T[i], f = daysBetween(a[0], date) / daysBetween(a[0], b[0]);
      return { t: a[1] + (b[1] - a[1]) * f, lo: a[2] + (b[2] - a[2]) * f, hi: a[3] + (b[3] - a[3]) * f };
    }
  }
  const L = T[T.length - 1]; return { t: L[1], lo: L[2], hi: L[3] };
}
/* Calibration rule (Sundays, 7-day average). Ignored: Week 1 and the weeks after Thanksgiving and Christmas
   (both readings of "after": the week containing the holiday and the one following). Energy check overrides. */
const CALIB_IGNORE = ['2026-11-29', '2026-12-06', '2026-12-27', '2027-01-03'];
function calibration(date) {
  const sun = addDays(mondayOf(date), 6 > dowOf(date) ? -1 : 6);
  const a1 = avg7(sun), a0 = avg7(addDays(sun, -7)), am1 = avg7(addDays(sun, -14));
  if (a1 == null || a0 == null) return { sun, rate: null };
  const rate = a0 - a1, prev = am1 != null ? am1 - a0 : null;
  const w = weekOf(sun);
  const ignore = w <= 1 || CALIB_IGNORE.includes(sun);
  let rec = 'Losing 0.3–0.6 lb a week: change nothing.', act = 0, tone = 'good';
  if (S.settings.energyLow) { rec = 'Energy check overrides the scale: eat about 2,200 a day and tell your doctor. No cuts while it is on.'; tone = 'warn'; }
  else if (ignore) { rec = 'Ignore this week: Week 1 and the weeks after Thanksgiving and Christmas are water.'; tone = 'mind'; }
  else if (rate < 0.25 && prev != null && prev < 0.25) { rec = 'Under 0.25 lb a week for 2 weeks: cut 100 kcal a day (carbs or fat, never protein) or add 2,000 steps a day.'; act = -100; tone = 'warn'; }
  else if (rate > 0.8 && prev != null && prev > 0.8) { rec = 'Over 0.8 lb a week for 2 weeks: add 150 kcal a day of carbs. Faster costs glute muscle.'; act = 150; tone = 'warn'; }
  else if (rate < 0.3 || rate > 0.6) { rec = 'Outside 0.3–0.6 lb this week. One week is noise; the rule acts only after 2 weeks.'; tone = 'mind'; }
  return { sun, rate, prev, a1, a0, rec, act, tone };
}


/* ------------------------------------------------------------------ sound + voice */
const Sound = {
  ctx: null,
  ensure() {
    if (!this.ctx) { try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; } }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  },
  beep(freq = 880, dur = 0.12, vol = 0.25) {
    const c = this.ensure(); if (!c) return;
    const o = c.createOscillator(), g = c.createGain();
    o.type = 'sine'; o.frequency.value = freq;
    g.gain.setValueAtTime(0, c.currentTime); g.gain.linearRampToValueAtTime(vol, c.currentTime + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
    o.connect(g).connect(c.destination); o.start(); o.stop(c.currentTime + dur + 0.02);
  },
  go() { this.beep(1320, 0.28, 0.3); },
  tick() { this.beep(880, 0.1, 0.22); },
  done() { this.beep(660, 0.12, 0.25); setTimeout(() => this.beep(990, 0.22, 0.25), 140); },
  bell() {
    const c = this.ensure(); if (!c) return;
    [432, 868, 1192, 2333].forEach((f, i) => {
      const o = c.createOscillator(), g = c.createGain(); o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, c.currentTime); g.gain.linearRampToValueAtTime(0.18 / (i + 1), c.currentTime + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 4 - i * 0.6);
      o.connect(g).connect(c.destination); o.start(); o.stop(c.currentTime + 4.2);
    });
  },
  say(text) {
    if (!S.settings.voice || !('speechSynthesis' in window)) return;
    try { const u = new SpeechSynthesisUtterance(text); u.rate = 1.02; u.pitch = 1; speechSynthesis.cancel(); speechSynthesis.speak(u); } catch (e) { /* no voice */ }
  },
  /* soft ocean bed for meditations: filtered noise with slow swells */
  ocean: null,
  oceanOn() {
    const c = this.ensure(); if (!c || this.ocean) return;
    const len = c.sampleRate * 4, buf = c.createBuffer(1, len, c.sampleRate), ch = buf.getChannelData(0);
    let last = 0; for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; last = (last + 0.02 * w) / 1.02; ch[i] = last * 3.5; }
    const src = c.createBufferSource(); src.buffer = buf; src.loop = true;
    const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 700;
    const g = c.createGain(); g.gain.value = 0.0;
    const lfo = c.createOscillator(), lg = c.createGain(); lfo.frequency.value = 0.09; lg.gain.value = 0.05; lfo.connect(lg).connect(g.gain);
    src.connect(lp).connect(g).connect(c.destination); src.start(); lfo.start();
    g.gain.linearRampToValueAtTime(0.08, c.currentTime + 3);
    this.ocean = { src, lfo, g };
  },
  oceanOff() {
    if (!this.ocean) return; const c = this.ctx, o = this.ocean; this.ocean = null;
    try { o.g.gain.cancelScheduledValues(c.currentTime); o.g.gain.setValueAtTime(o.g.gain.value, c.currentTime); o.g.gain.linearRampToValueAtTime(0, c.currentTime + 1); setTimeout(() => { o.src.stop(); o.lfo.stop(); }, 1100); } catch (e) { /* already stopped */ }
  },
};
const Wake = {
  lock: null,
  async on() { try { if ('wakeLock' in navigator && !this.lock) { this.lock = await navigator.wakeLock.request('screen'); this.lock.addEventListener('release', () => { this.lock = null; }); } } catch (e) { /* refused */ } },
  off() { try { this.lock && this.lock.release(); } catch (e) { /* ignore */ } this.lock = null; },
};
document.addEventListener('visibilitychange', () => { if (!document.hidden && (ui.stack.some((l) => l.v === 'player' || l.v === 'timer' || l.v === 'routine'))) Wake.on(); });

/* ------------------------------------------------------------------ icons */
const IC = {
  today: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/><circle cx="12" cy="15" r="1.6" fill="currentColor" stroke="none"/></svg>',
  train: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6.5 8v8M17.5 8v8M3.5 10v4M20.5 10v4M6.5 12h11"/></svg>',
  fuel: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h16a8 8 0 0 1-16 0Z"/><path d="M9 4c0 2 2 2 2 4M13 4c0 2 2 2 2 4"/></svg>',
  mind: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="M7.5 13.5c1.5 1.8 7.5 1.8 9 0"/><path d="M12 3.5v3"/></svg>',
  progress: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19h16"/><path d="M5 15l4-4 3 3 6-7"/><path d="M15 7h3v3"/></svg>',
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z"/></svg>',
  pause: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4.2" height="14" rx="1.2"/><rect x="13.8" y="5" width="4.2" height="14" rx="1.2"/></svg>',
  info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/></svg>',
  prev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M14 6l-6 6 6 6"/></svg>',
  next: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M10 6l6 6-6 6"/></svg>',
  swap: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4L4 7l3 3M4 7h12M17 20l3-3-3-3M20 17H8"/></svg>',
  pain: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l9.5 17h-19Z"/><path d="M12 10v4M12 17v.5"/></svg>',
  list: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M9 6h11M9 12h11M9 18h11M4.5 6h.5M4.5 12h.5M4.5 18h.5"/></svg>',
  sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/></svg>',
  shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 3l7.5 3v5.5c0 4.5-3.2 8.2-7.5 9.5-4.3-1.3-7.5-5-7.5-9.5V6Z"/></svg>',
  core: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="7" y="4" width="10" height="16" rx="4"/><path d="M7 9.5h10M7 14.5h10M12 4v16"/></svg>',
  walk: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13" cy="4.5" r="1.8"/><path d="M10 21l2.5-6 2.5 2.5V21M8 12l2.5-4.5 3 1.5 2 3 2.5 1"/><path d="M12.5 15l-1-6"/></svg>',
  egg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3c3.5 0 6.5 6 6.5 10a6.5 6.5 0 0 1-13 0C5.5 9 8.5 3 12 3Z"/></svg>',
  pen: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L19 9l-4-4L4 16Z"/><path d="M13.5 6.5l4 4"/></svg>',
  desk: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3.5" y="4" width="17" height="11" rx="2"/><path d="M8 20h8M12 15v5"/></svg>',
  water: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 3s6.5 7 6.5 11.5a6.5 6.5 0 0 1-13 0C5.5 10 12 3 12 3Z"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  minus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M5 12h14"/></svg>',
  lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8.5 10.5V7.5a3.5 3.5 0 0 1 7 0v3"/></svg>',
  gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/></svg>',
  wave: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 10c2-2 4-2 6 0s4 2 6 0 4-2 6 0M3 15c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/></svg>',
  heart: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 20.5s-7.5-4.4-9.2-9.3C1.7 7.9 3.9 4.5 7.3 4.5c2 0 3.5 1.1 4.7 2.7 1.2-1.6 2.7-2.7 4.7-2.7 3.4 0 5.6 3.4 4.5 6.7-1.7 4.9-9.2 9.3-9.2 9.3Z"/></svg>',
  timer: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2M9.5 2.5h5"/></svg>',
};
const ic = (n) => IC[n] || '';

/* ------------------------------------------------------------------ toast */
let toastT = null;
function toast(msg) {
  let el = $('#toast');
  if (!el) { el = document.createElement('div'); el.id = 'toast'; el.className = 'toast'; el.setAttribute('role', 'status'); document.body.appendChild(el); }
  el.textContent = msg; el.hidden = false;
  clearTimeout(toastT); toastT = setTimeout(() => { el.hidden = true; }, 2200);
}

