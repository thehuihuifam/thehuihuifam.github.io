import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
} from "react";
import confetti from "canvas-confetti";

/* ───────────── 원본 게임 로직 (변경 없음) ─────────────
   coin += 1 클릭 / coin >= 10 이면 coin -= 10, auto += 1
   1초마다 coin += auto / localStorage('save') 저장·복원
   ───────────────────────────────────────────────────── */

const COST = 10;
const GOLD = ["#ffe9a8", "#f9c74f", "#ffd166", "#fbbf24"];

function save(s: { coin: number; auto: number }) {
  try {
    localStorage.setItem("save", JSON.stringify(s));
  } catch {
    /* 저장 실패 무시 */
  }
}

function load(): { coin: number; auto: number } {
  try {
    const s = JSON.parse(localStorage.getItem("save") || "{}");
    return { coin: Number(s.coin) || 0, auto: Number(s.auto) || 0 };
  } catch {
    return { coin: 0, auto: 0 };
  }
}

/* 카운터 롤링 트윈 (표시만 부드럽게, 실제 값은 coin 그대로) */
function useAnimatedNumber(target: number) {
  const [display, setDisplay] = useState(target);
  const fromRef = useRef(target);
  const rafRef = useRef(0);
  useEffect(() => {
    const from = fromRef.current;
    if (from === target) return;
    const t0 = performance.now();
    const dur = 320;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      const v = from + (target - from) * eased;
      fromRef.current = v;
      setDisplay(v);
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target]);
  return display;
}

interface TapFx {
  id: number;
  x: number;
  y: number;
  dx: number;
  sparks: { tx: number; ty: number; size: number; color: string; delay: number }[];
}

/* ───────────── 배경 ───────────── */

function Background() {
  const dots = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        left: Math.random() * 100,
        size: 2 + Math.random() * 4,
        delay: -(Math.random() * 26),
        duration: 15 + Math.random() * 22,
        opacity: 0.2 + Math.random() * 0.5,
        color: ["#f9c74f", "#f9c74f", "#ffd166", "#a5b4fc", "#f0abfc", "#67e8f9"][i % 6],
      })),
    []
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* 오로라 오브 */}
      <div className="animate-drift absolute -left-40 -top-40 h-[34rem] w-[34rem] rounded-full bg-indigo-600/20 blur-[140px]" />
      <div
        className="animate-drift absolute -right-40 top-1/3 h-[30rem] w-[30rem] rounded-full bg-fuchsia-500/15 blur-[140px]"
        style={{ animationDelay: "-9s", animationDuration: "34s" }}
      />
      <div
        className="animate-drift absolute -bottom-40 left-1/4 h-[32rem] w-[32rem] rounded-full bg-amber-500/10 blur-[140px]"
        style={{ animationDelay: "-17s", animationDuration: "30s" }}
      />

      {/* 그리드 */}
      <div className="bg-grid absolute inset-0" />

      {/* 떠오르는 입자 */}
      {dots.map((d, i) => {
        const style = {
          left: `${d.left}%`,
          width: d.size,
          height: d.size,
          background: d.color,
          boxShadow: `0 0 ${d.size * 3}px ${d.color}`,
          animationDelay: `${d.delay}s`,
          animationDuration: `${d.duration}s`,
          "--p-opacity": d.opacity,
        } as CSSProperties;
        return <span key={i} className="animate-rise absolute bottom-0 rounded-full" style={style} />;
      })}

      {/* 유령 $ 타이포 */}
      <span className="animate-float absolute left-[3%] top-[12%] text-[11rem] font-black leading-none text-white/[0.03]">
        $
      </span>
      <span
        className="animate-float absolute bottom-[7%] right-[4%] text-[8rem] font-black leading-none text-white/[0.03]"
        style={{ animationDelay: "-2.4s" }}
      >
        $
      </span>

      {/* 비네트 */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_42%,rgba(4,4,14,0.72))]" />
    </div>
  );
}

/* ───────────── 미니 코인 / 아이콘 ───────────── */

function MiniCoin({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <span
      className={`inline-block rounded-full ${className}`}
      style={{
        background: "radial-gradient(circle at 35% 30%, #fff3c4, #f9c74f 55%, #b8860b)",
        boxShadow: "inset 0 0 0 1.5px rgba(255,255,255,0.35)",
      }}
    />
  );
}

function LightningIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2 3 14h7l-1 8 11-13h-7l1-7z" />
    </svg>
  );
}

/* ───────────── 메인 게임 ───────────── */

export default function App() {
  const [coin, setCoin] = useState(() => load().coin);
  const [auto, setAuto] = useState(() => load().auto);
  const [taps, setTaps] = useState<TapFx[]>([]);
  const [deny, setDeny] = useState(0);
  const buyRef = useRef<HTMLButtonElement>(null);
  const idRef = useRef(0);

  const coinRef = useRef(coin);
  const autoRef = useRef(auto);
  useEffect(() => {
    coinRef.current = coin;
  }, [coin]);
  useEffect(() => {
    autoRef.current = auto;
  }, [auto]);

  /* 1초마다 자동 생산 (원본 setInterval 그대로) */
  useEffect(() => {
    const iv = window.setInterval(() => {
      if (autoRef.current === 0) return;
      const next = coinRef.current + autoRef.current;
      coinRef.current = next;
      setCoin(next);
      save({ coin: next, auto: autoRef.current });
    }, 1000);
    return () => window.clearInterval(iv);
  }, []);

  const display = useAnimatedNumber(coin);
  const coinFloor = Math.floor(display);
  const affordable = coin >= COST;
  const pct = Math.min(1, coin / COST);

  /* 코인 탭 */
  const onTap = (e: PointerEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const dx = (Math.random() - 0.5) * 30;
    const sparks = Array.from({ length: 7 }, () => {
      const ang = Math.random() * Math.PI * 2;
      const dist = 36 + Math.random() * 62;
      return {
        tx: Math.cos(ang) * dist,
        ty: Math.sin(ang) * dist - 18,
        size: 3 + Math.random() * 4,
        color: GOLD[Math.floor(Math.random() * GOLD.length)],
        delay: Math.random() * 0.07,
      };
    });
    const id = ++idRef.current;
    setTaps((t) => [...t.slice(-9), { id, x, y, dx, sparks }]);
    window.setTimeout(() => setTaps((t) => t.filter((k) => k.id !== id)), 950);

    const next = coinRef.current + 1;
    coinRef.current = next;
    setCoin(next);
    save({ coin: next, auto: autoRef.current });
  };

  /* 자동 생산 구매 */
  const buyAuto = () => {
    if (coinRef.current < COST) {
      setDeny((d) => d + 1);
      return;
    }
    const next = coinRef.current - COST;
    coinRef.current = next;
    setCoin(next);
    const na = autoRef.current + 1;
    autoRef.current = na;
    setAuto(na);
    save({ coin: next, auto: na });

    const r = buyRef.current?.getBoundingClientRect();
    if (r) {
      confetti({
        particleCount: 36,
        spread: 70,
        startVelocity: 32,
        scalar: 0.85,
        ticks: 130,
        origin: { x: (r.left + r.width / 2) / window.innerWidth, y: r.top / window.innerHeight },
        colors: GOLD,
        zIndex: 60,
      });
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#08081a]">
      <Background />

      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-sm flex-col items-center justify-center px-5 pb-[calc(2.5rem+env(safe-area-inset-bottom))] pt-10">
        {/* ── 헤더 ── */}
        <div className="animate-fade-up flex w-full items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-10 w-10 items-center justify-center">
              <span className="coin-face absolute inset-0 rounded-full" />
              <span className="relative text-lg font-black text-amber-100/90">$</span>
            </span>
            <div>
              <h1 className="text-lg font-black tracking-tight text-white">골든 코인</h1>
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-500">
                idle clicker
              </p>
            </div>
          </div>

          {/* 자동 생산 칩 */}
          <div
            key={auto}
            className={`animate-pop flex items-center gap-2 rounded-full border px-3 py-1.5 ${
              auto > 0 ? "border-amber-300/25 bg-amber-400/10" : "border-white/10 bg-white/5"
            }`}
          >
            <div className="flex h-3.5 items-end gap-[3px]">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className={`eq-bar w-[3px] rounded-full ${auto > 0 ? "bg-amber-300" : "bg-slate-600"}`}
                  style={{ height: "100%", animationDelay: `${i * 0.18}s` }}
                />
              ))}
            </div>
            <span className={`tabular-nums text-[12px] font-bold ${auto > 0 ? "text-amber-300" : "text-slate-500"}`}>
              {auto}/s
            </span>
          </div>
        </div>

        {/* ── 카운터 ── */}
        <div className="animate-fade-up mt-9 flex flex-col items-center" style={{ animationDelay: "0.08s" }}>
          <span className="text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-500">
            보유 코인
          </span>
          <div key={coinFloor} className="animate-counter mt-1">
            <span className="text-shimmer tabular-nums text-[64px] font-black leading-none tracking-tight sm:text-[76px]">
              {coinFloor.toLocaleString()}
            </span>
          </div>
          <div className="mt-3 h-px w-40 bg-gradient-to-r from-transparent via-amber-300/40 to-transparent" />
        </div>

        {/* ── 코인 버튼 ── */}
        <div className="animate-float mt-7" style={{ animationDuration: "5.5s" }}>
          <button
            onPointerDown={onTap}
            onContextMenu={(e) => e.preventDefault()}
            aria-label="코인을 눌러 +1 획득"
            className="coin-btn group relative h-44 w-44 rounded-full outline-none transition-transform duration-100 active:scale-[0.97] sm:h-48 sm:w-48"
          >
            {/* 아우라 */}
            <div className="animate-glow pointer-events-none absolute -inset-8 rounded-full bg-amber-400/25 blur-3xl" aria-hidden />

            {/* 표면 */}
            <div className="coin-face absolute inset-1 rounded-full transition-transform duration-100 group-active:scale-95" />

            {/* 회전 광택 */}
            <div className="pointer-events-none absolute inset-1 overflow-hidden rounded-full" aria-hidden>
              <div className="coin-sheen animate-spin-slow absolute -inset-10" />
            </div>

            {/* 내부 각인 링 */}
            <div className="pointer-events-none absolute inset-6 rounded-full border-2 border-dashed border-amber-100/30" aria-hidden />

            {/* 각인 */}
            <span
              className="pointer-events-none absolute inset-0 flex items-center justify-center text-6xl font-black text-amber-100/90"
              style={{ textShadow: "0 2px 0 rgba(255,255,255,0.35), 0 -2px 3px rgba(120,60,0,0.6)" }}
              aria-hidden
            >
              $
            </span>

            {/* 탭 이펙트 오버레이 */}
            <div className="pointer-events-none absolute inset-0 overflow-visible" aria-hidden>
              {taps.map((t) => (
                <span key={`r${t.id}`} className="tap-ring absolute h-16 w-16 rounded-full border-2 border-amber-200/70" style={{ left: t.x, top: t.y }} />
              ))}
              {taps.flatMap((t) =>
                t.sparks.map((s, i) => (
                  <span
                    key={`s${t.id}-${i}`}
                    className="sparkle absolute rounded-full"
                    style={
                      {
                        left: t.x,
                        top: t.y,
                        width: s.size,
                        height: s.size,
                        background: s.color,
                        boxShadow: `0 0 ${s.size * 2.5}px ${s.color}`,
                        animationDelay: `${s.delay}s`,
                        "--tx": `${s.tx}px`,
                        "--ty": `${s.ty}px`,
                      } as CSSProperties
                    }
                  />
                ))
              )}
              {taps.map((t) => (
                <span
                  key={`p${t.id}`}
                  className="float-plus absolute text-2xl font-black text-amber-300"
                  style={{ left: t.x, top: t.y, "--tx": `${t.dx}px`, textShadow: "0 0 18px rgba(249,199,79,0.8)" } as CSSProperties}
                >
                  +1
                </span>
              ))}
            </div>
          </button>
        </div>

        {/* 힌트 */}
        <p className="mt-5 animate-pulse text-[11px] text-slate-500">· 코인을 탭하면 +1 ·</p>

        {/* ── 구매 카드 ── */}
        <button
          ref={buyRef}
          onClick={buyAuto}
          aria-disabled={!affordable}
          className={`animate-fade-up relative mt-6 w-full overflow-hidden rounded-2xl border p-4 text-left backdrop-blur transition-all duration-300 ${
            affordable
              ? "animate-buy-pulse border-amber-300/40 bg-gradient-to-br from-amber-400/20 to-amber-500/10"
              : "border-white/10 bg-white/[0.04]"
          }`}
          style={{ animationDelay: "0.16s" }}
        >
          <div key={deny} className={deny > 0 ? "animate-shake" : ""}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors duration-300 ${
                    affordable ? "bg-amber-400/25 text-amber-300" : "bg-white/8 text-slate-500"
                  }`}
                >
                  <LightningIcon className="h-5 w-5" />
                </span>
                <div>
                  <div className={`text-[14px] font-bold ${affordable ? "text-white" : "text-slate-400"}`}>
                    자동 생산기
                  </div>
                  <div className="text-[11px] text-slate-500">매초 코인 +1</div>
                </div>
              </div>

              <div
                className={`tabular-nums flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-[13px] font-black transition-colors duration-300 ${
                  affordable
                    ? "border-amber-300/30 bg-amber-400/10 text-amber-300"
                    : "border-white/10 bg-white/5 text-slate-600"
                }`}
              >
                <MiniCoin className="h-3.5 w-3.5" />
                {COST}
              </div>
            </div>

            {/* 진행 바 */}
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 via-amber-300 to-yellow-200 transition-[width] duration-300 ease-out"
                style={{ width: `${pct * 100}%` }}
              />
            </div>
            <div className="tabular-nums mt-1.5 flex justify-between text-[10px]">
              <span className="text-slate-500">다음 자동 생산까지</span>
              <span className={affordable ? "font-bold text-amber-300" : "text-slate-500"}>
                {affordable ? "구매 가능!" : `${COST - coin} 코인 남음`}
              </span>
            </div>
          </div>

          {affordable && <div className="btn-shimmer pointer-events-none absolute inset-0" aria-hidden />}
        </button>

        {/* ── 푸터 ── */}
        <p className="mt-6 flex items-center gap-1.5 text-[10px] text-slate-600">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </span>
          자동 저장됨 — 새로고침해도 그대로 이어집니다
        </p>
      </main>
    </div>
  );
}
