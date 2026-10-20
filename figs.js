/* Animated figures for drills that have no photo pair (knee and back rehab, breathing, core holds),
   plus the media helpers that show photo pairs as a looping two-frame motion. */
'use strict';

const STAND = { h: [100, 30], n: [100, 42], p: [100, 82], e1: [102, 62], w1: [104, 82], e2: [98, 62], w2: [96, 82], k1: [102, 108], a1: [101, 132], k2: [98, 108], a2: [98, 132] };
const pose = (over) => Object.assign({}, STAND, over);
const QUAD = { h: [144, 72], n: [132, 80], p: [86, 82], e1: [132, 104], w1: [132, 128], e2: [134, 104], w2: [134, 128], k1: [86, 128], a1: [62, 130], k2: [88, 128], a2: [64, 130] };
const quad = (over) => Object.assign({}, QUAD, over);
const SUP = { p: [104, 128], n: [64, 128], h: [52, 126], e1: [82, 130], w1: [98, 130], e2: [84, 130], w2: [100, 130] };
const sup = (over) => Object.assign({}, SUP, over);

const FIGS = {
  hip_switch: { dur: 1300, frames: (() => {
    const b = { p: [100, 124], n: [100, 84], h: [100, 72], e1: [114, 104], w1: [120, 124], e2: [86, 104], w2: [80, 124] };
    const L = Object.assign({}, b, { k1: [76, 106], a1: [64, 128], k2: [86, 110], a2: [78, 128] });
    const M = Object.assign({}, b, { k1: [110, 96], a1: [112, 128], k2: [90, 96], a2: [88, 128] });
    const R = Object.assign({}, b, { k1: [124, 106], a1: [136, 128], k2: [114, 110], a2: [122, 128] });
    return [L, M, R, M];
  })() },
  bird_dog: { dur: 1800, frames: [quad({}), quad({ e2: [152, 76], w2: [173, 72], k1: [64, 82], a1: [40, 84] })] },
  hollow: { dur: 2200, frames: [
    sup({ p: [104, 128], n: [70, 120], h: [58, 114], e1: [86, 112], w1: [104, 108], e2: [84, 112], w2: [102, 108], k1: [116, 104], a1: [136, 108], k2: [114, 104], a2: [134, 108] }),
    sup({ p: [104, 128], n: [72, 120], h: [60, 114], e1: [54, 112], w1: [36, 108], e2: [56, 112], w2: [38, 108], k1: [128, 118], a1: [154, 112], k2: [126, 118], a2: [152, 112] })] },
  hollow_rock: { dur: 900, frames: [
    sup({ p: [104, 130], n: [72, 126], h: [60, 124], e1: [56, 120], w1: [38, 116], e2: [58, 120], w2: [40, 116], k1: [128, 114], a1: [152, 104], k2: [126, 114], a2: [150, 104] }),
    sup({ p: [104, 130], n: [74, 114], h: [64, 106], e1: [60, 104], w1: [44, 96], e2: [62, 104], w2: [46, 96], k1: [128, 126], a1: [154, 128], k2: [126, 126], a2: [152, 128] })] },
  bear_taps: { dur: 1300, frames: [
    quad({ p: [88, 84], k1: [90, 120], a1: [66, 130], k2: [92, 120], a2: [68, 130] }),
    quad({ p: [88, 84], k1: [90, 120], a1: [66, 130], k2: [92, 120], a2: [68, 130], e1: [120, 100], w1: [130, 86] })] },
  stir_pot: { dur: 1100, props: [{ t: 'circle', cx: 136, cy: 112, r: 20 }], frames: [
    { a1: [40, 130], k1: [62, 118], p: [84, 106], n: [122, 86], h: [136, 80], e1: [120, 93], w1: [138, 92], e2: [122, 93], w2: [140, 92], a2: [42, 130], k2: [64, 118] },
    { a1: [40, 130], k1: [62, 118], p: [86, 104], n: [126, 85], h: [140, 79], e1: [132, 94], w1: [150, 95], e2: [134, 94], w2: [152, 95], a2: [42, 130], k2: [64, 118] }] },
  heel_taps: { dur: 1200, frames: [
    sup({ k1: [104, 102], a1: [128, 102], k2: [106, 102], a2: [130, 102] }),
    sup({ k1: [110, 104], a1: [124, 130], k2: [106, 102], a2: [130, 102] })] },
  curl_up: { dur: 1800, frames: [
    sup({ e1: [86, 130], w1: [98, 130], e2: [88, 130], w2: [100, 130], k1: [118, 106], a1: [132, 130], k2: [130, 128], a2: [156, 128] }),
    sup({ n: [66, 122], h: [55, 116], e1: [86, 130], w1: [98, 130], e2: [88, 130], w2: [100, 130], k1: [118, 106], a1: [132, 130], k2: [130, 128], a2: [156, 128] })] },
  suitcase: { dur: 650, weight: 'w1', frames: [
    pose({ e1: [100, 62], w1: [100, 84], e2: [106, 60], w2: [112, 76], k1: [108, 106], a1: [114, 132], k2: [94, 108], a2: [84, 130] }),
    pose({ e1: [100, 62], w1: [100, 84], e2: [94, 60], w2: [88, 76], k1: [94, 108], a1: [86, 130], k2: [108, 106], a2: [114, 132] })] },
  swim: { dur: 1100, floor: false, props: [{ t: 'wave', y: 86 }], frames: [
    { h: [42, 84], n: [56, 88], p: [100, 92], k1: [126, 92], a1: [152, 90], k2: [126, 94], a2: [152, 96], e1: [40, 92], w1: [24, 94], e2: [60, 68], w2: [66, 48] },
    { h: [42, 84], n: [56, 88], p: [100, 92], k1: [126, 94], a1: [152, 96], k2: [126, 92], a2: [152, 90], e1: [60, 68], w1: [66, 48], e2: [40, 92], w2: [24, 94] }] },
  draw_in: { dur: 2400, belly: true, frames: [Object.assign(quad({}), { b: 9 }), Object.assign(quad({ p: [86, 80], n: [132, 79] }), { b: 3 })] },
  /* Knee Armor, Back Reset, Knee Lab and ramps */
  quad_set: { dur: 1600, props: [{ t: 'rect', x: 124, y: 127, w: 12, h: 6 }], frames: [
    sup({ k1: [130, 128], a1: [156, 128], k2: [130, 129], a2: [156, 129] }), sup({ k1: [130, 130], a1: [156, 123], k2: [130, 129], a2: [156, 129] })] },
  slr: { dur: 1700, frames: [
    sup({ k1: [130, 128], a1: [156, 128], k2: [120, 108], a2: [134, 130] }), sup({ k1: [127, 117], a1: [150, 104], k2: [120, 108], a2: [134, 130] })] },
  tke: { dur: 1300, props: [{ t: 'line', x1: 110, y1: 107, x2: 176, y2: 107 }, { t: 'line', x1: 178, y1: 70, x2: 178, y2: 132 }], frames: [
    pose({ k1: [109, 106], a1: [101, 132], p: [99, 83] }), pose({})] },
  balance: { dur: 1500, frames: [
    pose({ k2: [90, 100], a2: [80, 116], e1: [114, 60], w1: [126, 72], e2: [86, 60], w2: [74, 72] }),
    pose({ k2: [95, 99], a2: [102, 116], e1: [114, 60], w1: [126, 72], e2: [86, 60], w2: [74, 72] })] },
  hip_lift: { dur: 1500, props: [{ t: 'line', x1: 140, y1: 20, x2: 140, y2: 132 }], frames: [
    pose({ p: [101, 85], k2: [94, 112], a2: [93, 130], e1: [118, 56], w1: [138, 50] }), pose({ p: [100, 80], k2: [95, 104], a2: [95, 122], e1: [118, 56], w1: [138, 50] })] },
  heel_slide: { dur: 1700, frames: [
    sup({ k1: [130, 128], a1: [156, 128], k2: [130, 129], a2: [156, 129] }), sup({ k1: [118, 104], a1: [136, 128], k2: [130, 129], a2: [156, 129] })] },
  cat_camel: { dur: 2000, frames: [quad({ n: [130, 72], h: [147, 84] }), quad({ n: [132, 88], h: [145, 66] })] },
  side_plank_knee: { dur: 1700, frames: [
    { h: [44, 102], n: [56, 110], e1: [56, 128], w1: [76, 130], e2: [74, 108], w2: [92, 114], p: [98, 124], k1: [124, 128], a1: [146, 118], k2: [122, 129], a2: [144, 120] },
    { h: [44, 96], n: [56, 104], e1: [56, 128], w1: [76, 130], e2: [74, 100], w2: [92, 104], p: [98, 108], k1: [124, 124], a1: [146, 116], k2: [122, 125], a2: [144, 118] }] },
  hip_flexor_stand: { dur: 1800, frames: [
    pose({ p: [102, 82], k1: [116, 106], a1: [118, 132], k2: [86, 110], a2: [70, 132], e1: [104, 62], w1: [110, 80] }),
    pose({ p: [106, 87], n: [104, 46], h: [104, 34], k1: [122, 108], a1: [120, 132], k2: [88, 114], a2: [70, 132], e1: [106, 66], w1: [112, 84] })] },
  quad_stretch: { dur: 1800, props: [{ t: 'line', x1: 150, y1: 20, x2: 150, y2: 132 }], frames: [
    pose({ e1: [126, 50], w1: [148, 52] }), pose({ e1: [126, 50], w1: [148, 52], k2: [98, 108], a2: [86, 88], e2: [90, 64], w2: [86, 86] })] },
  croc: { dur: 3000, belly: true, frames: [
    { h: [40, 124], n: [54, 126], p: [100, 128], k1: [130, 129], a1: [158, 129], k2: [130, 130], a2: [158, 130], e1: [46, 112], w1: [30, 122], e2: [48, 112], w2: [32, 122], b: 3 },
    { h: [40, 123], n: [54, 125], p: [100, 127], k1: [130, 129], a1: [158, 129], k2: [130, 130], a2: [158, 130], e1: [46, 112], w1: [30, 122], e2: [48, 112], w2: [32, 122], b: 8 }] },
  scap_pushup: { dur: 1300, frames: [
    { h: [150, 74], n: [136, 82], p: [92, 92], e1: [136, 106], w1: [136, 130], e2: [138, 106], w2: [138, 130], k1: [68, 112], a1: [46, 130], k2: [70, 112], a2: [48, 130] },
    { h: [150, 66], n: [136, 74], p: [92, 90], e1: [136, 102], w1: [136, 130], e2: [138, 102], w2: [138, 130], k1: [68, 112], a1: [46, 130], k2: [70, 112], a2: [48, 130] }] },
  thoracic_ext: { dur: 2000, props: [{ t: 'circle', cx: 80, cy: 124, r: 9 }], frames: [
    { p: [112, 128], n: [74, 112], h: [60, 108], e1: [70, 96], w1: [58, 104], e2: [72, 96], w2: [60, 104], k1: [132, 104], a1: [148, 130], k2: [134, 104], a2: [150, 130] },
    { p: [112, 128], n: [74, 114], h: [58, 120], e1: [66, 102], w1: [54, 114], e2: [68, 102], w2: [56, 114], k1: [132, 104], a1: [148, 130], k2: [134, 104], a2: [150, 130] }] },
  glute_squeeze: { dur: 1200, frames: [pose({}), pose({ p: [102, 82], k1: [103, 108], k2: [99, 108] })] },
  wall_sit: { dur: 2400, props: [{ t: 'line', x1: 68, y1: 4, x2: 68, y2: 132 }], frames: [
    { h: [76, 34], n: [76, 46], p: [80, 86], k1: [108, 104], a1: [112, 132], k2: [110, 105], a2: [114, 132], e1: [90, 64], w1: [104, 70], e2: [92, 64], w2: [106, 70] },
    { h: [76, 46], n: [76, 58], p: [80, 98], k1: [112, 97], a1: [112, 132], k2: [114, 98], a2: [114, 132], e1: [90, 76], w1: [104, 82], e2: [92, 76], w2: [106, 82] }] },
  spanish_squat: { dur: 2400, props: [{ t: 'line', x1: 172, y1: 50, x2: 172, y2: 132 }, { t: 'line', x1: 108, y1: 102, x2: 170, y2: 100 }], frames: [
    pose({ p: [94, 84], n: [98, 44], h: [99, 32], k1: [106, 108], a1: [104, 132], k2: [104, 108], a2: [102, 132], e1: [110, 62], w1: [124, 66] }),
    pose({ p: [78, 100], n: [92, 62], h: [96, 50], k1: [106, 100], a1: [106, 132], k2: [104, 100], a2: [104, 132], e1: [110, 72], w1: [126, 74], e2: [108, 72], w2: [124, 74] })] },
  step_down: { dur: 2000, props: [{ t: 'rect', x: 70, y: 112, w: 46, h: 21 }], frames: [
    { h: [100, 10], n: [100, 22], p: [100, 62], k1: [101, 88], a1: [100, 112], k2: [108, 88], a2: [118, 108], e1: [104, 42], w1: [108, 60], e2: [96, 42], w2: [92, 60] },
    { h: [96, 24], n: [97, 36], p: [94, 74], k1: [112, 92], a1: [100, 112], k2: [116, 104], a2: [130, 132], e1: [104, 54], w1: [112, 66], e2: [94, 54], w2: [100, 70] }] },
  lateral_walk: { dur: 900, frames: [
    pose({ p: [100, 86], k1: [110, 110], a1: [114, 132], k2: [90, 110], a2: [86, 132], e1: [108, 62], w1: [104, 52], e2: [92, 62], w2: [96, 52] }),
    pose({ p: [104, 86], k1: [120, 110], a1: [128, 132], k2: [94, 110], a2: [90, 132], e1: [112, 62], w1: [108, 52], e2: [96, 62], w2: [100, 52] })] },
};

const BONES = [['n', 'p', 1], ['n', 'e2', 0], ['e2', 'w2', 0], ['p', 'k2', 0], ['k2', 'a2', 0], ['p', 'k1', 1], ['k1', 'a1', 1], ['n', 'e1', 1], ['e1', 'w1', 1]];

function figSVG(key, anim = true) {
  if (key === 'breath') return orbSVG(anim);
  const F = FIGS[key]; if (!F) return '';
  const f0 = F.frames[anim ? 0 : Math.min(1, F.frames.length - 1)];
  let s = '<svg class="fig" viewBox="0 0 200 140" preserveAspectRatio="xMidYMid meet" aria-hidden="true"' + (anim ? ' data-fig="' + key + '"' : '') + ' style="color:#F3F1EC">';
  if (F.floor !== false) s += '<line x1="14" y1="133.5" x2="186" y2="133.5" stroke="#3A3F47" stroke-width="2" stroke-linecap="round"/>';
  (F.props || []).forEach((p) => {
    if (p.t === 'line') s += '<line x1="' + p.x1 + '" y1="' + p.y1 + '" x2="' + p.x2 + '" y2="' + p.y2 + '" stroke="#4A505A" stroke-width="4" stroke-linecap="round"/>';
    if (p.t === 'rect') s += '<rect x="' + p.x + '" y="' + p.y + '" width="' + p.w + '" height="' + p.h + '" rx="3" fill="#2E333B"/>';
    if (p.t === 'circle') s += '<circle cx="' + p.cx + '" cy="' + p.cy + '" r="' + p.r + '" fill="#2E333B"/>';
    if (p.t === 'wave') s += '<path d="M10 ' + p.y + ' q 10 -5 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0" fill="none" stroke="#2F8EA0" stroke-width="2.5" opacity=".8"/>';
  });
  BONES.concat((F.extra || []).map((e) => [e[0], e[1], 1])).forEach(([a, b, near]) => {
    if (!f0[a] || !f0[b]) return;
    s += '<line data-a="' + a + '" data-b="' + b + '" x1="' + f0[a][0] + '" y1="' + f0[a][1] + '" x2="' + f0[b][0] + '" y2="' + f0[b][1] + '" stroke="currentColor" stroke-width="' + (near ? 7 : 6) + '" stroke-linecap="round" opacity="' + (near ? 1 : 0.42) + '"/>';
  });
  if (F.belly) s += '<circle data-belly="1" cx="' + ((f0.n[0] + f0.p[0]) / 2) + '" cy="' + ((f0.n[1] + f0.p[1]) / 2 + 4) + '" r="' + f0.b + '" fill="#5CC8D7" opacity=".55"/>';
  if (F.weight) s += '<rect data-w="' + F.weight + '" x="' + (f0[F.weight][0] - 6) + '" y="' + (f0[F.weight][1] - 4) + '" width="12" height="12" rx="3" fill="#FFB627"/>';
  s += '<circle data-h="1" cx="' + f0.h[0] + '" cy="' + f0.h[1] + '" r="9" fill="currentColor"/>';
  return s + '</svg>';
}
function orbSVG(anim) {
  return '<svg class="fig" viewBox="0 0 200 140" aria-hidden="true"' + (anim ? ' data-orb="1"' : '') + '><circle cx="100" cy="70" r="58" fill="none" stroke="#2B3A40" stroke-width="2"/><circle data-orbc="1" cx="100" cy="70" r="34" fill="#5CC8D7" opacity=".35"/><text data-orbt="1" x="100" y="76" text-anchor="middle" font-family="-apple-system, system-ui, sans-serif" font-weight="600" font-size="16" fill="#FFFFFF">Breathe</text></svg>';
}

const ease = (t) => 0.5 - Math.cos(Math.PI * t) / 2;
function figTick(now) {
  $$('svg[data-fig]').forEach((svg) => {
    const F = FIGS[svg.dataset.fig]; if (!F) return;
    const n = F.frames.length, seg = F.dur, total = seg * (n === 2 ? 2 : n);
    let t = (now % total) / seg, i = Math.floor(t), f = t - i;
    let A, B;
    if (n === 2) { A = F.frames[i === 0 ? 0 : 1]; B = F.frames[i === 0 ? 1 : 0]; }
    else { A = F.frames[i % n]; B = F.frames[(i + 1) % n]; }
    // hold briefly at each end
    f = ease(clamp((f - 0.12) / 0.76, 0, 1));
    const P = (k) => { const a = A[k], b = B[k]; if (!a) return b; if (!b) return a; return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]; };
    svg.querySelectorAll('line[data-a]').forEach((l) => {
      const a = P(l.dataset.a), b = P(l.dataset.b); if (!a || !b) return;
      l.setAttribute('x1', a[0].toFixed(1)); l.setAttribute('y1', a[1].toFixed(1)); l.setAttribute('x2', b[0].toFixed(1)); l.setAttribute('y2', b[1].toFixed(1));
    });
    const h = P('h'), hc = svg.querySelector('[data-h]'); if (h && hc) { hc.setAttribute('cx', h[0].toFixed(1)); hc.setAttribute('cy', h[1].toFixed(1)); }
    const bc = svg.querySelector('[data-belly]');
    if (bc) { const nn = P('n'), pp = P('p'), r = (A.b || 4) + ((B.b || 4) - (A.b || 4)) * f; bc.setAttribute('cx', ((nn[0] + pp[0]) / 2).toFixed(1)); bc.setAttribute('cy', ((nn[1] + pp[1]) / 2 + 4).toFixed(1)); bc.setAttribute('r', r.toFixed(1)); }
    const wr = svg.querySelector('[data-w]'); if (wr) { const w = P(wr.dataset.w); wr.setAttribute('x', (w[0] - 6).toFixed(1)); wr.setAttribute('y', (w[1] - 4).toFixed(1)); }
  });
  // generic breathing orb: 4 s in, 6 s out unless a player drives it
  $$('svg[data-orb]').forEach((svg) => {
    if (svg.dataset.driven) return;
    const t = (now / 1000) % 10, inhale = t < 4, f = inhale ? ease(t / 4) : 1 - ease((t - 4) / 6);
    svg.querySelector('[data-orbc]').setAttribute('r', (30 + f * 26).toFixed(1));
    svg.querySelector('[data-orbt]').textContent = inhale ? 'In' : 'Out';
  });
  requestAnimationFrame(figTick);
}
requestAnimationFrame(figTick);

/* ------------------------------------------------------------------ media helpers */
function exMedia(key, cls = '', abs = false) {
  const e = EX[key] || {}, st = abs ? ' style="position:absolute;inset:0"' : '';
  if (e.img) {
    const b = 'ex/' + e.img;
    return '<div class="media ' + cls + '"' + st + '><img class="bgblur" src="' + b + '-0.jpg" alt=""><img class="f0" src="' + b + '-0.jpg" alt="' + esc(e.n) + ', start position"><img class="f1" src="' + b + '-1.jpg" alt="' + esc(e.n) + ', end position"></div>';
  }
  return '<div class="media figbox ' + cls + '"' + st + '>' + figSVG(e.fig || 'breath', true) + '</div>';
}
function exThumb(key, size) {
  const e = EX[key] || {};
  const st = size ? ' style="width:' + size + 'px;height:' + size + 'px"' : '';
  if (e.img) return '<div class="thumb"' + st + '><img loading="lazy" src="ex/' + e.img + '-0.jpg" alt=""></div>';
  return '<div class="thumb figbox"' + st + '>' + figSVG(e.fig || 'breath', false) + '</div>';
}
function heroImg(key) { const e = EX[key] || {}; return e.img ? 'ex/' + e.img + '-1.jpg' : null; }
