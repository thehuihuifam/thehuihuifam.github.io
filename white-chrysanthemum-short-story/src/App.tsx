import { useEffect, useMemo, useRef, useState } from "react";
import Chrysanthemum from "./components/Chrysanthemum";
import { authorNote, meta, sections, type Block } from "./story";

const SPEAKER: Record<string, string> = {
  gm: "var(--moss)",
  man: "var(--clay)",
  etc: "var(--rule)",
};

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".reveal:not(.is-visible)");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

function Paragraph({ b }: { b: Block }) {
  if (b.t === "beat") {
    return (
      <p className="reveal my-14 text-center font-myeongjo text-[1.15em] leading-[1.9] text-[var(--fg)]">
        {b.x}
      </p>
    );
  }
  if (b.t === "d") {
    return (
      <p
        className="reveal my-6 border-l-2 pl-5 font-myeongjo text-[1.03em] leading-[2] text-[var(--fg)] sm:pl-6"
        style={{ borderColor: SPEAKER[b.who] }}
      >
        {b.x}
      </p>
    );
  }
  return (
    <p className="reveal my-6 text-[1em] leading-[2.15] font-light tracking-[0.002em] text-[var(--fg-soft)]">
      {b.x}
    </p>
  );
}

export default function App() {
  const [night, setNight] = useState(true);
  const [step, setStep] = useState(1);
  const [progress, setProgress] = useState(0);
  const secRefs = useRef<(HTMLElement | null)[]>([]);

  useReveal();

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setProgress(max > 0 ? Math.min(1, h.scrollTop / max) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const theme = useMemo(
    () =>
      night
        ? {
            "--bg": "#141519",
            "--bg-2": "#1a1c21",
            "--fg": "#e9e3d7",
            "--fg-soft": "#c4beb2",
            "--faint": "#7c7567",
            "--rule": "#2c2f36",
            "--moss": "#a4b790",
            "--clay": "#d99b74",
          }
        : {
            "--bg": "#f3f0e8",
            "--bg-2": "#e8e3d6",
            "--fg": "#25221e",
            "--fg-soft": "#44403a",
            "--faint": "#8d8577",
            "--rule": "#dcd4c3",
            "--moss": "#5b6d4d",
            "--clay": "#a25c34",
          },
    [night],
  ) as React.CSSProperties;

  const fontPx = [16, 18, 20, 22][step];

  return (
    <div
      style={theme}
      className="min-h-screen bg-[var(--bg)] text-[var(--fg)] transition-colors duration-700"
    >
      {/* progress bar */}
      <div className="fixed inset-x-0 top-0 z-50 h-[2px]">
        <div
          className="h-full bg-[var(--clay)]/60 transition-[width] duration-150 ease-out"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {/* ── HERO ─────────────────────────────────────────── */}
      <header className="relative isolate flex h-[100svh] min-h-[560px] items-end overflow-hidden">
        <img
          src="/images/shop.jpg"
          alt=""
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
          className="absolute inset-0 -z-10 h-full w-full object-cover opacity-[0.6]"
        />
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "linear-gradient(to top, var(--bg) 4%, rgba(20,21,25,0.5) 48%, rgba(20,21,25,0.25) 100%)",
          }}
        />

        <div className="mx-auto w-full max-w-[42rem] px-6 pb-24 sm:px-8">
          <span className="fade-up font-myeongjo text-[0.7rem] tracking-[0.5em] text-white/55">
            {meta.kicker}
          </span>
          <h1
            className="fade-up mt-5 font-myeongjo text-[clamp(3.2rem,14vw,7rem)] leading-[1] font-extrabold text-white/95"
            style={{ animationDelay: "0.15s" }}
          >
            흰 국화
          </h1>
          <p
            className="fade-up mt-7 font-myeongjo text-sm leading-[2] text-white/65 sm:text-base"
            style={{ animationDelay: "0.3s" }}
          >
            {meta.subtitle} · 읽는 데 약 {meta.minutes}분
          </p>
        </div>
      </header>

      {/* ── CONTROLS ─────────────────────────────────────── */}
      <div className="fixed right-4 bottom-5 z-40 flex items-center rounded-full border border-[var(--rule)] bg-[var(--bg-2)]/90 backdrop-blur">
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          className="h-9 w-9 font-myeongjo text-xs text-[var(--faint)] transition hover:text-[var(--fg)]"
          aria-label="글자 작게"
        >
          가−
        </button>
        <button
          onClick={() => setStep((s) => Math.min(3, s + 1))}
          className="h-9 w-9 font-myeongjo text-sm text-[var(--faint)] transition hover:text-[var(--fg)]"
          aria-label="글자 크게"
        >
          가+
        </button>
        <span className="h-4 w-px bg-[var(--rule)]" />
        <button
          onClick={() => setNight((n) => !n)}
          className="h-9 px-4 text-xs tracking-[0.1em] text-[var(--faint)] transition hover:text-[var(--fg)]"
        >
          {night ? "밤" : "낮"}
        </button>
      </div>

      {/* ── STORY ────────────────────────────────────────── */}
      <main className="mx-auto max-w-[38rem] px-6 pt-20 sm:px-8" style={{ fontSize: `${fontPx}px` }}>
        {sections.map((s, i) => (
          <section
            key={s.no}
            ref={(el) => {
              secRefs.current[i] = el;
            }}
            className="pb-10"
          >
            <h2 className="reveal mb-10 flex items-baseline gap-4 font-myeongjo">
              <span className="text-[0.7em] tracking-[0.25em] text-[var(--faint)]">{s.no}</span>
              <span className="text-[0.95em] tracking-[0.15em] text-[var(--fg)]">{s.title}</span>
              <span className="h-px flex-1 translate-y-[-2px] bg-[var(--rule)]" />
            </h2>

            {s.blocks.map((b, j) => (
              <Paragraph key={j} b={b} />
            ))}

            {i === 3 && (
              <figure className="reveal my-14">
                <img
                  src="/images/chrysanthemum.jpg"
                  alt="한지에 싸인 흰 국화 열 송이"
                  onError={(e) => {
                    e.currentTarget.closest("figure")?.remove();
                  }}
                  className="w-full rounded-[2px] object-cover"
                  style={{ opacity: night ? 0.85 : 0.95 }}
                />
                <figcaption className="mt-3 text-center text-[0.65em] tracking-[0.15em] text-[var(--faint)]">
                  흰 국화 열 송이 · 한지와 흰 리본
                </figcaption>
              </figure>
            )}
          </section>
        ))}

        {/* 끝 */}
        <div className="reveal flex flex-col items-center py-14">
          <Chrysanthemum className="w-10 text-[var(--faint)] opacity-70" strokeWidth={1.2} />
          <span className="mt-5 font-myeongjo text-sm tracking-[0.6em] text-[var(--faint)]">끝</span>
        </div>
      </main>

      {/* ── AUTHOR NOTE ──────────────────────────────────── */}
      <section className="px-6 pb-20 sm:px-8">
        <div className="reveal mx-auto max-w-[38rem] border-l-2 border-[var(--moss)]/50 bg-[var(--bg-2)] px-7 py-8 sm:px-10">
          <h3 className="font-myeongjo text-xs tracking-[0.4em] text-[var(--moss)]">작가 노트</h3>
          <p className="mt-4 font-gowun text-[0.95rem] leading-[2.05] text-[var(--fg-soft)]">{authorNote}</p>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────── */}
      <footer className="border-t border-[var(--rule)]">
        <div className="mx-auto flex max-w-[38rem] flex-col items-center gap-6 px-6 py-14 text-center">
          <p className="font-myeongjo text-[1rem] leading-[2] text-[var(--fg)]">
            보통의 날들이 쌓여서 사람이 되는 것이니까.
          </p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="text-[0.7rem] tracking-[0.3em] text-[var(--faint)] underline underline-offset-8 transition hover:text-[var(--fg)]"
          >
            처음으로
          </button>
        </div>
      </footer>
    </div>
  );
}
