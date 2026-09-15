# 검증 도구 (index.html 자체가 게임 = 빌드 없음)

게임은 `index.html` 한 파일로 완결됩니다. 아래 도구는 "수정 후 숫자가 깨지지 않았는지"를
사람이 브라우저를 열지 않고도 확인하기 위한 개발용 스크립트입니다.

```bash
cd tools
npm i jsdom            # 최초 1회 (또는 상위 node_modules 재사용)

node headless-check.js 300   # ① 부트 ② 회귀 테스트 122개 ③ 300회×3전략 밸런스 리포트
node smoke.js                # 실제 DOM 클릭으로 게임을 끝까지 플레이하는 통합 점검
node tune.js 200             # 난이도 후보(웨이브 표 강화율)별 승률 비교
```

브라우저 콘솔에서 바로 확인할 수도 있습니다(개발자 도구 F12).

```js
TWR.runRegressionSuite()   // 회귀 테스트 결과 객체
TWR.balanceReport(400)     // 밸런스 지표 객체
TWR.state()                // 현재 게임 상태
TWR.dev.patchWaves({...})  // 웨이브 표 임시 교체(새로고침 시 원복)
TWR.dev.patchTuning({...}) // 상수 임시 교체
```
