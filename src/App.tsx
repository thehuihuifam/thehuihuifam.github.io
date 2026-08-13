import { useEffect, useMemo, useRef, useState } from "react";
import Backdrop from "./components/Backdrop";
import Confetti from "./components/Confetti";
import RangeGauge from "./components/RangeGauge";

type Status = "idle" | "up" | "down" | "win";

interface Entry {
  n: number;
  result: "up" | "down" | "win";
  at: number;
}

const newAnswer = () => Math.floor(Math.random() * 100) + 1;

/** 상태별 비주얼 토큰 */
const THEME: Record<
  Status,
  { glow: string; ring: string; text: string; label: string; sub: string }
> = {
  idle: {
    glow: "rgba(139,92,246,.45)",
    ring: "ring-white/10",
    text: "text-white/90",
    label: "숫자를 입력하세요",
    sub: "1부터 100 사이의 수를 맞춰보세요",
  },
  up: {
    glow: "rgba(56,189,248,.55)",
    ring: "ring-sky-400/40",
    text: "text-sky-300",
    label: "UP",
    sub: "더 큰 수를 입력하세요",
  },
  down: {
    glow: "rgba(244,114,182,.55)",
    ring: "ring-pink-400/40",
    text: "text-pink-300",
    label: "DOWN",
    sub: "더 작은 수를 입력하세요",
  },
  win: {
    glow: "rgba(52,211,153,.6)",
    ring: "ring-emerald-400/50",
    text: "text-emerald-300",
    label: "CORRECT",
    sub: "완벽합니다",
  },
};

export default function App() {
  const [answer, setAnswer] = useState(newAnswer);
  const [count, setCount] = useState(0);
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [history, setHistory] = useState<Entry[]>([]);
  const [shake, setShake] = useState(0);
  const [confettiKey, setConfettiKey] = useState(0);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const solved = status === "win";
  const theme = THEME[status];

  // 좁혀진 범위 계산
  const { lo, hi } = useMemo(() => {
    let l = 1;
    let h = 100;
    for (const e of history) {
      if (e.result === "up") l = Math.max(l, e.n + 1);
      if (e.result === "down") h = Math.min(h, e.n - 1);
    }
    return { lo: Math.min(l, h), hi: Math.max(h, l) };
  }, [history]);

  const last = history.length ? history[history.length - 1].n : null;

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  /* ─── 원본 check() 로직 유지 ─── */
  function check() {
    if (solved) return;
    const g = Number(value);

    if (value.trim() === "" || Number.isNaN(g)) {
      setError("숫자를 입력해 주세요");
      setShake((s) => s + 1);
      return;
    }
    if (g < 1 || g > 100) {
      setError("1부터 100 사이의 수만 가능합니다");
      setShake((s) => s + 1);
      return;
    }
    setError("");

    const next = count + 1;
    setCount(next);

    let result: Entry["result"];
    if (g === answer) {
      result = "win";
      setStatus("win");
      setConfettiKey((k) => k + 1);
    } else if (g < answer) {
      result = "up";
      setStatus("up");
      setShake((s) => s + 1);
    } else {
      result = "down";
      setStatus("down");
      setShake((s) => s + 1);
    }

    setHistory((h) => [...h, { n: g, result, at: next }]);
    setValue("");
    inputRef.current?.focus();
  }

  function reset() {
    setAnswer(newAnswer());
    setCount(0);
    setValue("");
    setStatus("idle");
    setHistory([]);
    setError("");
    inputRef.current?.focus();
  }

  const rating =
    count <= 5 ? "천재적인 감각" : count <= 8 ? "훌륭한 추리" : "끈기의 승리";

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden text-white [font-family:'Noto_Sans_KR',system-ui,sans-serif]">
      <Backdrop />
      {solved && <Confetti key={confettiKey} />}

      <main className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
        <div className="rise w-full max-w-lg">
          {/* ───────── 타이틀 ───────── */}
          <div className="mb-7 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-1.5 text-[11px] font-bold tracking-[0.2em] text-white/50 backdrop-blur-xl">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-violet-400" />
              </span>
              NUMBER GUESS
            </div>
            <h1 className="shimmer bg-gradient-to-r from-violet-300 via-cyan-200 via-50% to-pink-300 bg-clip-text text-5xl font-black tracking-tight text-transparent sm:text-6xl">
              업 &amp; 다운
            </h1>
            <p className="mt-3 text-sm text-white/40">
              1 – 100 · 숨겨진 하나의 수를 찾아내세요
            </p>
          </div>

          {/* ───────── 메인 카드 ───────── */}
          <section
            key={shake}
            className={`${shake ? "shake" : ""} relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-white/[0.045] p-6 shadow-[0_30px_90px_-20px_rgba(0,0,0,0.85)] backdrop-blur-2xl sm:p-8`}
          >
            {/* 상단 하이라이트 라인 */}
            <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />
            {/* 상태 글로우 */}
            <div
              className="pointer-events-none absolute -top-24 left-1/2 h-56 w-72 -translate-x-1/2 rounded-full blur-[70px] transition-all duration-700"
              style={{ background: theme.glow, opacity: 0.5 }}
            />

            {/* ── 결과 디스플레이 ── */}
            <div className="relative flex flex-col items-center py-3">
              {/* 정답 시 파동 링 */}
              {solved && (
                <>
                  <span className="ripple absolute top-8 h-28 w-28 rounded-full border border-emerald-300/50" />
                  <span
                    className="ripple absolute top-8 h-28 w-28 rounded-full border border-emerald-300/40"
                    style={{ animationDelay: "0.5s" }}
                  />
                </>
              )}

              {/* 아이콘 / 화살표 */}
              <div className="relative flex h-24 items-center justify-center">
                {status === "up" && (
                  <div className="float-up text-7xl leading-none text-sky-300 drop-shadow-[0_0_28px_rgba(56,189,248,0.8)]">
                    ▲
                  </div>
                )}
                {status === "down" && (
                  <div className="float-down text-7xl leading-none text-pink-300 drop-shadow-[0_0_28px_rgba(244,114,182,0.8)]">
                    ▼
                  </div>
                )}
                {status === "win" && (
                  <div className="pop text-7xl leading-none drop-shadow-[0_0_30px_rgba(52,211,153,0.8)]">
                    🏆
                  </div>
                )}
                {status === "idle" && (
                  <div className="text-7xl leading-none text-white/15">?</div>
                )}
              </div>

              {/* 라벨 */}
              <div
                key={`${status}-${count}`}
                className={`pop mt-1 text-4xl font-black tracking-[0.12em] ${theme.text} sm:text-5xl`}
                style={{ textShadow: `0 0 40px ${theme.glow}` }}
              >
                {theme.label}
              </div>
              <p className="mt-2 text-sm text-white/45">
                {solved ? (
                  <>
                    정답은 <span className="font-black text-emerald-300">{answer}</span> ·{" "}
                    <span className="font-black text-white">{count}</span>번 만에 맞혔습니다
                  </>
                ) : (
                  theme.sub
                )}
              </p>
            </div>

            {/* ── 게이지 ── */}
            <div className="mt-6">
              <RangeGauge lo={lo} hi={hi} last={last} solved={solved} />
            </div>

            {/* ── 입력부 ── */}
            {!solved ? (
              <div className="mt-7">
                <div
                  className={`group relative flex items-center gap-3 rounded-2xl bg-black/35 p-2 pl-5 ring-1 transition-all duration-300 ${
                    error ? "ring-rose-400/60" : `${theme.ring} focus-within:ring-violet-400/60`
                  }`}
                >
                  <input
                    ref={inputRef}
                    type="number"
                    inputMode="numeric"
                    value={value}
                    placeholder="1 ~ 100"
                    onChange={(e) => {
                      setValue(e.target.value);
                      setError("");
                    }}
                    onKeyDown={(e) => e.key === "Enter" && check()}
                    className="w-full bg-transparent py-3 text-center text-3xl font-black tabular-nums tracking-widest text-white outline-none placeholder:text-base placeholder:font-medium placeholder:tracking-normal placeholder:text-white/25"
                  />
                  <button
                    onClick={check}
                    className="sweep relative shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 px-7 py-4 text-sm font-black tracking-wider text-white shadow-[0_10px_30px_-8px_rgba(168,85,247,0.9)] transition-all duration-200 hover:brightness-115 active:scale-[0.96]"
                  >
                    확인
                  </button>
                </div>

                <div className="mt-2.5 flex h-5 items-center justify-between px-1 text-[11px]">
                  <span className="text-rose-300">{error}</span>
                  <span className="text-white/25">Enter 키로도 입력됩니다</span>
                </div>
              </div>
            ) : (
              <div className="mt-7">
                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.07] p-5 text-center">
                  <p className="text-[11px] font-bold tracking-[0.25em] text-emerald-300/70">
                    {rating.toUpperCase()}
                  </p>
                  <p className="mt-1.5 text-lg font-black text-white">{rating}</p>
                  <p className="mt-1 text-xs text-white/50">
                    총 {count}번의 시도로 정답에 도달했습니다
                  </p>
                </div>
                <button
                  onClick={reset}
                  className="sweep relative mt-3 w-full overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-400 via-cyan-400 to-sky-500 py-4 text-sm font-black tracking-wider text-[#05221a] shadow-[0_10px_30px_-8px_rgba(52,211,153,0.9)] transition-all duration-200 hover:brightness-110 active:scale-[0.98]"
                >
                  다시 도전하기
                </button>
              </div>
            )}

            {/* ── 하단 통계 ── */}
            <div className="mt-6 grid grid-cols-3 gap-2 border-t border-white/[0.07] pt-5 text-center">
              {[
                { k: "시도", v: count, c: "text-violet-300" },
                { k: "최소", v: solved ? answer : lo, c: "text-sky-300" },
                { k: "최대", v: solved ? answer : hi, c: "text-pink-300" },
              ].map((s) => (
                <div key={s.k}>
                  <p className="text-[10px] font-bold tracking-[0.2em] text-white/30">
                    {s.k}
                  </p>
                  <p className={`mt-0.5 text-2xl font-black tabular-nums ${s.c}`}>{s.v}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ───────── 기록 ───────── */}
          <div className="mt-5 min-h-[64px]">
            {history.length > 0 && (
              <>
                <p className="mb-2.5 px-1 text-[11px] font-bold tracking-[0.2em] text-white/30">
                  HISTORY
                </p>
                <div className="thin-scroll flex flex-wrap gap-2">
                  {history.map((e, i) => (
                    <span
                      key={i}
                      className={`pop inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-sm font-black tabular-nums backdrop-blur-xl ${
                        e.result === "win"
                          ? "border-emerald-400/40 bg-emerald-400/15 text-emerald-200 shadow-[0_0_20px_rgba(52,211,153,0.3)]"
                          : e.result === "up"
                            ? "border-sky-400/25 bg-sky-400/10 text-sky-200"
                            : "border-pink-400/25 bg-pink-400/10 text-pink-200"
                      }`}
                      style={{ animationDelay: `${Math.min(i, 12) * 0.04}s` }}
                    >
                      <span className="text-[10px] font-bold text-white/30">
                        #{e.at}
                      </span>
                      {e.n}
                      <span className="text-[10px] opacity-80">
                        {e.result === "win" ? "◎" : e.result === "up" ? "▲" : "▼"}
                      </span>
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* ───────── 푸터 ───────── */}
          <footer className="mt-8 flex items-center justify-center gap-3 text-[11px] text-white/20">
            <span className="h-px w-10 bg-gradient-to-r from-transparent to-white/20" />
            <span className="tracking-[0.2em]">UP &amp; DOWN · 1 – 100</span>
            <span className="h-px w-10 bg-gradient-to-l from-transparent to-white/20" />
          </footer>
        </div>
      </main>
    </div>
  );
}
