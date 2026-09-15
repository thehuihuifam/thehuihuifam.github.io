'use strict';
/* ============================================================
   tools/smoke.js — 실제 index.html 을 jsdom 으로 띄워
   "사람이 클릭하는 순서 그대로" 게임을 끝까지 돌려보는 통합 점검.

   사용법:  cd tools && node smoke.js
   확인 항목:
     1) 부트 + 튜토리얼 오버레이 닫기
     2) 카드 뽑기 → 카드 선택 → 배치 → 전투 개시 (실제 DOM 클릭)
     3) 웨이브마다 수치 무결성 (성 HP 범위 · 골드 정수 · 슬롯 3칸 · NaN 없음)
     4) 기본 6웨이브 승리 → 무한 모드 진입 → 보스 웨이브 규칙
     5) 세이브 → normalizeSave 라운드트립 (손상 세이브 방어 포함)
     6) 콘솔 에러/예외 0건
   ============================================================ */
const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const problems = [];
const vc = new VirtualConsole();
vc.on('error', function () { problems.push('console.error: ' + Array.prototype.join.call(arguments, ' ')); });
vc.on('jsdomError', function (e) { problems.push('jsdomError: ' + (e && e.message)); });
vc.on('warn', function () {});
vc.on('info', function () {});
vc.on('log', function () {});

const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://example.test/', virtualConsole: vc });
const win = dom.window;
const doc = win.document;
win.addEventListener('error', function (e) { problems.push('window error: ' + (e && e.message)); });

const sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
function waitUntil(fn, label, timeout) {
  timeout = timeout || 25000;
  const t0 = Date.now();
  return new Promise(function (resolve, reject) {
    (function poll() {
      let ok = false;
      try { ok = !!fn(); } catch (e) { return reject(new Error(label + ' 확인 중 예외: ' + e.message)); }
      if (ok) { return resolve(true); }
      if (Date.now() - t0 > timeout) { return reject(new Error('시간 초과: ' + label)); }
      setTimeout(poll, 20);
    })();
  });
}
function click(sel) {
  const el = doc.querySelector(sel);
  if (!el) { throw new Error('요소 없음: ' + sel); }
  if (el.disabled) { return false; }
  el.click();
  return true;
}
function firstEnabledSlot() {
  const slots = doc.querySelectorAll('.slot');
  for (let i = 0; i < slots.length; i++) { if (!slots[i].disabled) { return slots[i]; } }
  return null;
}
function state() { return win.TWR.state(); }
function checkIntegrity(tag) {
  const s = state();
  const bad = [];
  if (!(s.castleHp >= 0 && s.castleHp <= s.castleMaxHp)) { bad.push('성 HP 범위 ' + s.castleHp + '/' + s.castleMaxHp); }
  if (!Number.isInteger(s.gold) || s.gold < 0) { bad.push('골드 ' + s.gold); }
  for (let i = 0; i < s.warriors.length; i++) {
    const w = s.warriors[i];
    if (!w) { continue; }
    if (!Number.isFinite(w.hp) || !Number.isFinite(w.maxHp) || !Number.isFinite(w.atk) || w.hp < 0 || w.maxHp < 1 || w.atk < 1) {
      bad.push('전사 ' + i + ' ' + w.name + ' hp' + w.hp + '/' + w.maxHp + ' atk' + w.atk);
    }
  }
  if (s.warriors.length !== 3) { bad.push('슬롯 수 ' + s.warriors.length); }
  if (bad.length) { problems.push('[' + tag + '] 수치 이상 → ' + bad.join(' · ')); }
  return bad.length === 0;
}

(async function main() {
  const log = function (s) { console.log(s); };
  log('=== 통합 스모크 (실제 DOM 클릭) ===');

  await waitUntil(function () { return win.__TWR_BOOTED__; }, '부트', 15000);
  log('부트        OK · TWR ' + win.TWR.version);

  await sleep(700);
  const helpOverlay = doc.querySelector('#help-overlay');
  if (helpOverlay && helpOverlay.classList.contains('show')) {
    click('#btn-help-close');
    await waitUntil(function () { return !helpOverlay.classList.contains('show'); }, '튜토리얼 닫기', 5000);
    log('튜토리얼    OK · 도움말 자동 표시 + 닫기 동작');
  } else {
    log('튜토리얼    OK · 오버레이 미표시 상태');
  }

  let wavesPlayed = 0;
  let endlessSeen = false;
  const waveLog = [];
  for (let guard = 0; guard < 40; guard++) {
    const s0 = state();
    if (s0.isGameOver || s0.isVictory) { break; }
    await waitUntil(function () { const s = state(); return s.phase === 'DRAW' && !s.isResolving && !s.isGameOver && !s.isVictory; }, 'DRAW 대기 w' + s0.wave);
    const waveNo = state().wave;

    /* --- 사람처럼 상점/전술을 먼저 정리한다 --- */
    const sPre = state();
    if (sPre.castleHp <= sPre.castleMaxHp * 0.6) {
      for (let k = 0; k < 6 && !doc.querySelector('#shop-repair').disabled && state().castleHp <= state().castleMaxHp * 0.85; k++) {
        click('#shop-repair');
      }
    }
    const def = win.TWR.getWaveDef(waveNo);
    const has = {};
    def.enemies.forEach(function (e) { has[e.t] = true; });
    let tac = 'RAID';
    if (has.boss || has.elite) { tac = 'SHIELD_WALL'; }
    else if (has.armored || has.ranged) { tac = 'FOCUS_FIRE'; }
    const tacBtn = doc.querySelector('[data-tactic="' + tac + '"]');
    if (tacBtn && !tacBtn.disabled) { tacBtn.click(); }

    if (!click('#btn-draw')) { problems.push('w' + waveNo + ': 카드 뽑기 버튼 비활성'); break; }
    await waitUntil(function () { return doc.querySelector('#card-choice-0'); }, '카드 표시');

    /* --- 손패 평가: 역할에 맞는 빈 슬롯에 배치, 즉시 카드는 상황 가치로 평가 --- */
    const hand = state().hand;
    const units = state().warriors;
    const roleSlot = { FRONT: 0, MID: 1, BACK: 2 };
    let bestIdx = -1, bestVal = -Infinity;
    for (let i = 0; i < hand.length; i++) {
      const c = hand[i];
      let v;
      if (c.role === 'INSTANT') {
        if (c.effect === 'HEAL') { v = (state().castleMaxHp - state().castleHp) * 1.8; }
        else if (c.effect === 'HEAL_POTION') { v = 16; }
        else if (c.effect === 'ATK_BOOST') { v = units.filter(Boolean).length * 10; }
        else if (c.effect === 'FRONT_WALL') { v = units[0] ? 16 : 0; }
        else if (c.effect === 'BACK_FOCUS') { v = units[2] ? 16 : 0; }
        else { v = waveNo <= 2 ? 14 : 4; }
      } else {
        const want = roleSlot[c.role];
        const empty = !units[want] || units[want].hp <= 0;
        v = c.hp * 0.6 + c.atk * 5 + (empty ? 22 : -30);
      }
      if (v > bestVal) { bestVal = v; bestIdx = i; }
    }

    let placed = false;
    if (bestIdx >= 0 && click('#card-choice-' + bestIdx)) {
      const st = state();
      if (st.phase === 'DEPLOY') {
        const card = hand[bestIdx];
        const want = roleSlot[card.role];
        let slot = doc.querySelector('.slot[data-slot="' + want + '"]');
        if (!slot || slot.disabled) { slot = firstEnabledSlot(); }
        if (slot) { slot.click(); placed = true; }
      } else { placed = true; }
    }
    if (!placed) {
      /* 배치할 자리가 없으면 되돌리고 넘어간다 (게임은 카드 없이도 진행 가능) */
      click('#btn-cancel');
      log('  w' + waveNo + ' · 배치 가능한 카드 없음(스킵)');
    }

    /* --- 남는 골드는 강화에 투자 --- */
    let guard2 = 0;
    while (!doc.querySelector('#shop-upgrade').disabled && guard2 < 4) {
      const before = state().gold;
      click('#shop-upgrade');
      const alive = state().warriors.map(function (w, i) { return w && w.hp > 0 ? i : -1; }).filter(function (i) { return i >= 0; });
      if (!alive.length) { click('#shop-upgrade'); break; }
      let tgt = alive[0];
      alive.forEach(function (i) { if (state().warriors[i].atk > state().warriors[tgt].atk) { tgt = i; } });
      click('.slot[data-slot="' + tgt + '"]');
      if (state().gold >= before) { break; }
      guard2++;
    }

    if (!click('#btn-fight')) { problems.push('w' + waveNo + ': 전투 개시 버튼 비활성'); break; }
    if (doc.querySelector('#btn-fast') && !doc.querySelector('#btn-fast').hidden) { click('#btn-fast'); }
    await waitUntil(function () { return !state().isResolving; }, 'w' + waveNo + ' 전투 종료', 40000);

    wavesPlayed++;
    const s1 = state();
    checkIntegrity('w' + waveNo);
    waveLog.push('w' + waveNo + ' 성HP ' + s1.castleHp + '/' + s1.castleMaxHp + ' 골드 ' + s1.gold + ' 전사 ' + s1.warriors.filter(Boolean).length + ' 콤보 ' + s1.combo);

    if (s1.isVictory) {
      log('  ' + waveLog[waveLog.length - 1] + '  ← 기본 웨이브 승리');
      click('#btn-continue');
      await sleep(120);
      endlessSeen = !!state().isEndless;
      log('무한 모드   ' + (endlessSeen ? 'OK · 진입 성공' : '실패 · isEndless=' + state().isEndless));
      if (!endlessSeen) { problems.push('무한 모드 진입 실패'); break; }
      await waitUntil(function () { const s = state(); return s.phase === 'DRAW' && !s.isResolving && !s.isVictory; }, '무한 웨이브 시작');
      continue;
    }
    if (s1.isGameOver) { log('  ' + waveLog[waveLog.length - 1] + '  ← 패배'); break; }

    if (endlessSeen && wavesPlayed >= 9) { break; }
    if (!endlessSeen && waveNo >= 8) { problems.push('8웨이브까지 진행했지만 승패가 갈리지 않음'); break; }
  }

  const final = state();
  log('진행 결과   웨이브 ' + final.wave + ' · 클리어 ' + Math.max(0, final.maxWaveReached - 1) + ' · 성HP ' + final.castleHp + '/' + final.castleMaxHp + ' · 골드 ' + final.gold);

  /* 무한 모드 보스 규칙 */
  const bossWaves = [];
  for (let w = 7; w <= 15; w++) {
    const def = win.TWR.getWaveDef(w);
    if (def.enemies.some(function (e) { return e.t === 'boss'; })) { bossWaves.push(w); }
  }
  const bossOk = bossWaves.length > 0 && bossWaves.every(function (w) { return w % 3 === 0; });
  log('보스 규칙   ' + (bossOk ? 'OK' : '실패') + ' · 보스 웨이브 ' + bossWaves.join(','));

  /* 세이브 라운드트립 */
  const raw = JSON.parse(win.localStorage.getItem('twr5.save.v1') || 'null');
  const norm = win.TWR.normalizeSave(raw);
  const st = state();
  const roundOk = !!norm && norm.wave === st.wave && norm.castleHp === st.castleHp &&
    norm.gold === st.gold && norm.goldPerWave === st.goldPerWave && norm.castleMaxHp === st.castleMaxHp;
  log('세이브      ' + (roundOk ? 'OK' : '실패') + ' · 저장/복원 핵심 필드 일치');
  if (!roundOk) { problems.push('세이브 라운드트립 불일치'); }

  const junk = win.TWR.normalizeSave({ wave: 'x', castleHp: -50, gold: NaN, warriors: 'nope', hand: [1, 2], pity: null, log: 'zzz' });
  const junkOk = !!junk && junk.wave === 1 && junk.castleHp >= 0 && Number.isFinite(junk.gold) && junk.warriors.length === 3 && junk.log.length === 0;
  log('손상 세이브 ' + (junkOk ? 'OK' : '실패') + ' · 쓰레기 입력 → 안전한 기본값');
  if (!junkOk) { problems.push('손상 세이브 방어 실패'); }

  log('--- 웨이브 기록 ---');
  waveLog.forEach(function (l) { log('  ' + l); });

  log('=== 결과 ===');
  if (problems.length) {
    log('SMOKE FAIL · 이상 ' + problems.length + '건');
    problems.forEach(function (p) { log('  - ' + p); });
    process.exitCode = 1;
  } else {
    log('SMOKE PASS · 콘솔 에러 0건 · 수치 이상 0건 · ' + wavesPlayed + '웨이브 실제 플레이');
  }
  dom.window.close();
})().catch(function (e) {
  console.log('SMOKE FAIL · 예외: ' + e.message);
  problems.forEach(function (p) { console.log('  - ' + p); });
  process.exitCode = 1;
});
