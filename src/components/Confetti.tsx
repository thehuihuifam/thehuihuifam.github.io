import { useMemo } from "react";

const COLORS = [
  "#a78bfa",
  "#22d3ee",
  "#f472b6",
  "#fbbf24",
  "#34d399",
  "#f87171",
  "#ffffff",
];

/** 정답 시 쏟아지는 컨페티 (key 변경으로 재생) */
export default function Confetti() {
  const bits = useMemo(
    () =>
      Array.from({ length: 90 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        dx: (Math.random() - 0.5) * 340,
        rot: Math.random() * 1080 + 360,
        dur: Math.random() * 1.8 + 2.4,
        delay: Math.random() * 0.7,
        w: Math.random() * 7 + 4,
        h: Math.random() * 12 + 6,
        color: COLORS[i % COLORS.length],
        round: Math.random() > 0.7,
      })),
    [],
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {bits.map((b) => (
        <span
          key={b.id}
          className="confetti absolute top-0"
          style={
            {
              left: `${b.left}%`,
              width: b.w,
              height: b.round ? b.w : b.h,
              background: b.color,
              borderRadius: b.round ? "999px" : "2px",
              boxShadow: `0 0 12px ${b.color}90`,
              "--dx": `${b.dx}px`,
              "--rot": `${b.rot}deg`,
              "--dur": `${b.dur}s`,
              "--delay": `${b.delay}s`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
