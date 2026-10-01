import { metricsFor, visibleRange, cellCenter, lens, damp } from "../src/lib/wall/wallMath";
import { bookingAt } from "../src/lib/wall/wallData";

let fails = 0;
const ok = (c: boolean, msg: string) => { if (!c) { fails++; console.log("FAIL:", msg); } };

// 1. determinism + variety
const a = bookingAt(3, -5), b = bookingAt(3, -5);
ok(JSON.stringify(a) === JSON.stringify(b), "bookingAt must be deterministic");
const ids = new Set<string>(); const names = new Set<string>();
for (let c = -40; c < 40; c++) for (let r = -25; r < 25; r++) { const k = bookingAt(c, r); ids.add(k.id); names.add(k.first + k.lastInitial + k.doctor + k.time); }
console.log("unique ids in 4000 cells:", ids.size, " unique name+doc+time combos:", names.size);
ok(names.size > 3500, "too many duplicate cards");
ok(a.token >= 1 && a.token <= 40, "token range");

// 2. lens: overlap + density across viewports and random camera positions
const viewports: Array<[number, number]> = [[390, 800], [430, 932], [768, 1024], [1024, 768], [1280, 720], [1440, 900], [1920, 1080], [2560, 1440]];
let seed = 12345; const rnd = () => (seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296;
for (const [W, H] of viewports) {
  const m = metricsFor(W);
  let minGap = Infinity, maxCount = 0, minCount = Infinity, inViewMax = 0;
  for (let trial = 0; trial < 60; trial++) {
    const camX = (rnd() - 0.5) * 20000, camY = (rnd() - 0.5) * 20000;
    const rg = visibleRange(camX, camY, W, H, m);
    const cards: Array<{ l: number; r: number; t: number; b: number }> = [];
    for (let row = rg.r0; row <= rg.r1; row++) for (let col = rg.c0; col <= rg.c1; col++) {
      const w = cellCenter(col, row, m);
      const s = lens(w.x + camX + W / 2, w.y + camY + H / 2, W, H);
      const hw = (m.cardW * s.scale) / 2, hh = (m.cardH * s.scale) / 2;
      cards.push({ l: s.x - hw, r: s.x + hw, t: s.y - hh, b: s.y + hh });
    }
    maxCount = Math.max(maxCount, cards.length); minCount = Math.min(minCount, cards.length);
    inViewMax = Math.max(inViewMax, cards.filter(c => c.r > 0 && c.l < W && c.b > 0 && c.t < H).length);
    for (let i = 0; i < cards.length; i++) for (let j = i + 1; j < cards.length; j++) {
      const A = cards[i], B = cards[j];
      const gx = Math.max(B.l - A.r, A.l - B.r), gy = Math.max(B.t - A.b, A.t - B.b);
      const gap = Math.max(gx, gy); // >0 means separated
      if (gap < minGap) minGap = gap;
    }
    // visible range must cover every card that lands on screen after the lens
    for (let row = rg.r0 - 6; row <= rg.r1 + 6; row++) for (let col = rg.c0 - 8; col <= rg.c1 + 8; col++) {
      if (row >= rg.r0 && row <= rg.r1 && col >= rg.c0 && col <= rg.c1) continue;
      const w = cellCenter(col, row, m);
      const s = lens(w.x + camX + W / 2, w.y + camY + H / 2, W, H);
      const hw = (m.cardW * s.scale) / 2, hh = (m.cardH * s.scale) / 2;
      const on = s.x + hw > 0 && s.x - hw < W && s.y + hh > 0 && s.y - hh < H;
      ok(!on, `cell outside range appears on screen at ${W}x${H} (${col},${row})`);
    }
  }
  console.log(`${W}x${H}  rendered ${minCount}-${maxCount}  on-screen<=${inViewMax}  minGap=${minGap.toFixed(1)}px`);
  ok(minGap > 2, `cards overlap at ${W}x${H} (minGap ${minGap.toFixed(1)})`);
}

// 3. centre card is biggest, corner smallest
const c = lens(720, 450, 1440, 900), k = lens(0, 0, 1440, 900);
console.log("centre scale", c.scale.toFixed(2), "corner scale", k.scale.toFixed(2), "corner opacity", k.opacity.toFixed(2));
ok(c.scale > 1.29 && k.scale < 0.52, "lens extremes");
ok(damp(0, 100, 1 / 60) > 8 && damp(0, 100, 1 / 60) < 10, "damp ~9% per 60fps frame");
console.log(fails ? `${fails} FAILURES` : "ALL PASS");
process.exit(fails ? 1 : 0);
