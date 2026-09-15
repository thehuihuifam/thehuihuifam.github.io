/* ============================================================================
   타이니 워리어 러시 v5.0 — 헤드리스 검증 하네스
   ----------------------------------------------------------------------------
   실제 index.html 을 jsdom 에 로드해 (코드 복제 없이) 다음을 검증한다.

     1) 부트 성공 여부 (window.__TWR_BOOTED__)
     2) 내장 회귀 테스트 스위트  (TWR.runRegressionSuite)
     3) 밸런스 시뮬레이션 리포트 (TWR.balanceReport)

   실행:
     cd tools && npm i jsdom@25.0.1 && node headless-check.js [시뮬레이션 횟수]
   ========================================================================= */
'use strict';

const fs = require('fs');
const path = require('path');

let JSDOM;
try {
  ({ JSDOM } = require('jsdom'));
} catch (e) {
  console.error('jsdom 이 필요합니다:  npm i jsdom@25.0.1');
  process.exit(2);
}

const htmlPath = path.join(__dirname, '..', 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');
const simRuns = Number(process.argv[2] || 300);

function fail(msg) {
  console.error('FAIL  ' + msg);
  process.exitCode = 1;
}

const dom = new JSDOM(html, {
  url: 'https://thehuihuifam.github.io/',
  runScripts: 'dangerously',
  pretendToBeVisual: true,
  virtualConsole: new (require('jsdom').VirtualConsole)().on('jsdomError', (e) => {
    if (String(e.message).indexOf('Could not parse CSS') === -1) {
      console.error('jsdom error:', e.message);
    }
  })
});

const { window } = dom;

setTimeout(() => {
  console.log('=== 1. 부트 ===');
  if (!window.__TWR_BOOTED__) {
    fail('window.__TWR_BOOTED__ 가 true 가 아닙니다 (부트 실패)');
    const box = window.document.getElementById('boot-error');
    console.error('boot-error 내용:', box ? box.textContent : '(없음)');
    process.exit(1);
  }
  console.log('OK    부트 성공 · TWR 버전 ' + window.TWR.version);

  console.log('\n=== 2. 회귀 테스트 스위트 ===');
  const report = window.TWR.runRegressionSuite();
  console.log('result      : ' + report.result);
  console.log('passed/total: ' + report.passed + '/' + report.totalTests);
  if (report.failed) {
    console.log('실패 목록:');
    report.errors.forEach((e) => console.log('   - ' + e));
    fail('회귀 테스트 ' + report.failed + '건 실패');
  } else {
    console.log('전 항목 통과');
  }

  console.log('\n=== 3. 밸런스 시뮬레이션 (' + simRuns + '회 × 3전략) ===');
  const bal = window.TWR.balanceReport(simRuns);
  Object.keys(bal.profiles).forEach((k) => {
    const p = bal.profiles[k];
    console.log(
      `  ${k.padEnd(10)} 승률 ${String(p.victoryRate).padStart(5)}%  평균웨이브 ${p.avgWaves}  평균점수 ${p.avgScore}  평균성HP ${p.avgCastleHp}  평균퍼펙트 ${p.avgPerfect}`
    );
  });
  console.log('  --- 웨이브별 (전술 AI) ---');
  bal.waveCurve.forEach((c) => {
    console.log(`  W${c.wave}  도달 ${String(c.reached).padStart(4)}  클리어율 ${String(c.clearRate).padStart(5)}%  퍼펙트율 ${String(c.perfectRate).padStart(5)}%  평균성피해 ${c.avgDamage}`);
  });
  console.log('  --- 카드 선택률 (전술 AI, 높은 순) ---');
  bal.cards.forEach((c) => {
    console.log(`  ${c.name.padEnd(8)} ${c.rarity.padEnd(6)} ${c.role.padEnd(7)} 제안 ${String(c.offered).padStart(4)}  선택 ${String(c.picked).padStart(4)}  선택률 ${String(c.pickRate).padStart(5)}%`);
  });

  console.log('\n=== 요약 ===');
  if (process.exitCode) {
    console.log('검증 실패 — 위 FAIL 항목을 확인하세요.');
  } else {
    console.log('모든 헤드리스 검증 통과.');
  }
  window.close();
}, 700);
