/* ============================================================================
   밸런스 탐색 도구 (개발용)
   ----------------------------------------------------------------------------
   jsdom 으로 게임을 한 번만 로드한 뒤, TWR.dev.patchWaves / patchTuning 으로
   수치를 바꿔 가며 밸런스 리포트를 반복 출력한다.
   → 난이도 목표 밴드를 만족하는 수치를 빠르게 찾기 위한 도구.

   실행:  node tools/tune.js  (jsdom 필요: cd tools && npm i jsdom)
   ========================================================================= */
'use strict';
const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const vc = new VirtualConsole();
vc.on('jsdomError', (e) => { if (e.detail) { console.error(e.detail.stack); } });
const dom = new JSDOM(html, { url: 'https://x.test/', runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc });

const RUNS = Number(process.argv[2] || 200);

/* 후보 구성: [이름, 웨이브 패치(선택), TUNING 패치(선택)] */
const candidates = [
  ['A final-candidate (+20% HP)', {
    1: { enemies: [{ t: 'grunt', hp: 8, atk: 2 }, { t: 'grunt', hp: 8, atk: 2 }, { t: 'grunt', hp: 8, atk: 2 }], gold: 8 },
    2: { enemies: [{ t: 'grunt', hp: 14, atk: 3 }, { t: 'grunt', hp: 14, atk: 3 }, { t: 'grunt', hp: 14, atk: 3 }, { t: 'armored', hp: 24, atk: 4 }], gold: 9 },
    3: { enemies: [{ t: 'grunt', hp: 18, atk: 5 }, { t: 'grunt', hp: 18, atk: 5 }, { t: 'grunt', hp: 18, atk: 5 }, { t: 'elite', hp: 36, atk: 9 }], gold: 10 },
    4: { enemies: [{ t: 'grunt', hp: 19, atk: 5 }, { t: 'ranged', hp: 24, atk: 6 }, { t: 'ranged', hp: 24, atk: 6 }, { t: 'grunt', hp: 19, atk: 5 }, { t: 'armored', hp: 29, atk: 5 }], gold: 11 },
    5: { enemies: [{ t: 'armored', hp: 32, atk: 7 }, { t: 'elite', hp: 40, atk: 10 }, { t: 'regen', hp: 48, atk: 7 }, { t: 'elite', hp: 40, atk: 10 }], gold: 13 },
    6: { enemies: [{ t: 'boss', hp: 158, atk: 16 }, { t: 'grunt', hp: 24, atk: 7 }, { t: 'grunt', hp: 24, atk: 7 }], gold: 20 }
  }, null],
  ['A- (-8% HP/ATK)', {
    1: { enemies: [{ t: 'grunt', hp: 8, atk: 2 }, { t: 'grunt', hp: 8, atk: 2 }, { t: 'grunt', hp: 8, atk: 2 }], gold: 8 },
    2: { enemies: [{ t: 'grunt', hp: 13, atk: 3 }, { t: 'grunt', hp: 13, atk: 3 }, { t: 'grunt', hp: 13, atk: 3 }, { t: 'armored', hp: 22, atk: 4 }], gold: 9 },
    3: { enemies: [{ t: 'grunt', hp: 17, atk: 5 }, { t: 'grunt', hp: 17, atk: 5 }, { t: 'grunt', hp: 17, atk: 5 }, { t: 'elite', hp: 33, atk: 8 }], gold: 10 },
    4: { enemies: [{ t: 'grunt', hp: 18, atk: 5 }, { t: 'ranged', hp: 22, atk: 6 }, { t: 'ranged', hp: 22, atk: 6 }, { t: 'grunt', hp: 18, atk: 5 }, { t: 'armored', hp: 27, atk: 5 }], gold: 11 },
    5: { enemies: [{ t: 'armored', hp: 30, atk: 6 }, { t: 'elite', hp: 37, atk: 9 }, { t: 'regen', hp: 44, atk: 6 }, { t: 'elite', hp: 37, atk: 9 }], gold: 13 },
    6: { enemies: [{ t: 'boss', hp: 148, atk: 15 }, { t: 'grunt', hp: 22, atk: 6 }, { t: 'grunt', hp: 22, atk: 6 }], gold: 20 }
  }, null],
  ['A+ (+10% ATK only)', {
    1: { enemies: [{ t: 'grunt', hp: 8, atk: 2 }, { t: 'grunt', hp: 8, atk: 2 }, { t: 'grunt', hp: 8, atk: 2 }], gold: 8 },
    2: { enemies: [{ t: 'grunt', hp: 14, atk: 4 }, { t: 'grunt', hp: 14, atk: 4 }, { t: 'grunt', hp: 14, atk: 4 }, { t: 'armored', hp: 24, atk: 4 }], gold: 9 },
    3: { enemies: [{ t: 'grunt', hp: 18, atk: 5 }, { t: 'grunt', hp: 18, atk: 5 }, { t: 'grunt', hp: 18, atk: 5 }, { t: 'elite', hp: 36, atk: 10 }], gold: 10 },
    4: { enemies: [{ t: 'grunt', hp: 19, atk: 6 }, { t: 'ranged', hp: 24, atk: 7 }, { t: 'ranged', hp: 24, atk: 7 }, { t: 'grunt', hp: 19, atk: 6 }, { t: 'armored', hp: 29, atk: 6 }], gold: 11 },
    5: { enemies: [{ t: 'armored', hp: 32, atk: 8 }, { t: 'elite', hp: 40, atk: 11 }, { t: 'regen', hp: 48, atk: 8 }, { t: 'elite', hp: 40, atk: 11 }], gold: 13 },
    6: { enemies: [{ t: 'boss', hp: 158, atk: 17 }, { t: 'grunt', hp: 24, atk: 8 }, { t: 'grunt', hp: 24, atk: 8 }], gold: 20 }
  }, null]
];

setTimeout(() => {
  const T = dom.window.TWR;
  if (!dom.window.__TWR_BOOTED__) { console.error('부트 실패'); process.exit(1); }
  const baseline = T.dev.waves();
  for (const [name, waves, tuning] of candidates) {
    T.dev.patchWaves(Object.assign(JSON.parse(JSON.stringify(baseline)), waves || {}));
    if (tuning) { T.dev.patchTuning(tuning); }
    const rep = T.balanceReport(RUNS);
    const p = rep.profiles;
    console.log(`\n### ${name}  (runs=${RUNS})`);
    console.log(`  random    승률 ${p.random.victoryRate}%  평균웨이브 ${p.random.avgWaves}`);
    console.log(`  greedy    승률 ${p.greedy.victoryRate}%  평균웨이브 ${p.greedy.avgWaves}  생존성HP ${p.greedy.avgCastleHp}`);
    console.log(`  tactician 승률 ${p.tactician.victoryRate}%  평균웨이브 ${p.tactician.avgWaves}  생존성HP ${p.tactician.avgCastleHp}`);
    console.log('  웨이브: ' + rep.waveCurve.map((c) => `W${c.wave} ${c.clearRate}%/${c.perfectRate}%p`).join('  '));
    /* 밴드 판정 */
    const ok = (v, lo, hi) => (v >= lo && v <= hi) ? 'OK ' : 'X  ';
    console.log(`  판정: greedy ${ok(p.greedy.victoryRate, 40, 72)}(${p.greedy.victoryRate}%)  tactician ${ok(p.tactician.victoryRate, 55, 88)}(${p.tactician.victoryRate}%)  random ${ok(p.random.victoryRate, 0, 28)}(${p.random.victoryRate}%)`);
  }
  process.exit(0);
}, 700);
