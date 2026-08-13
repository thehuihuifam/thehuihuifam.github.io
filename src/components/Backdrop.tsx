import { useMemo } from "react";

/** 오로라 + 별 + 그리드 + 비네트로 구성된 배경 레이어 */
export default function Backdrop() {
  const stars = useMemo(
    () =>
      Array.from({ length: 70 }, (_, i) => ({
        id: i,
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: Math.random() * 2.2 + 0.8,
        dur: Math.random() * 4 + 2.5,
        delay: Math.random() * 5,
      })),
    [],
  );

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {/* 베이스 딥 그라디언트 */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_100%_at_50%_0%,#141733_0%,#0a0b1c_45%,#05060f_100%)]" />

      {/* 오로라 블롭 */}
      <div className="aurora-a absolute -left-[20%] top-[-15%] h-[65vh] w-[65vh] rounded-full bg-[#7c3aed] opacity-[0.30] blur-[130px]" />
      <div className="aurora-b absolute -right-[15%] top-[10%] h-[60vh] w-[60vh] rounded-full bg-[#06b6d4] opacity-[0.26] blur-[130px]" />
      <div className="aurora-c absolute bottom-[-25%] left-[20%] h-[65vh] w-[65vh] rounded-full bg-[#ec4899] opacity-[0.20] blur-[140px]" />

      {/* 별 */}
      {stars.map((s) => (
        <span
          key={s.id}
          className="twinkle absolute rounded-full bg-white"
          style={
            {
              top: `${s.top}%`,
              left: `${s.left}%`,
              width: s.size,
              height: s.size,
              "--dur": `${s.dur}s`,
              "--delay": `${s.delay}s`,
            } as React.CSSProperties
          }
        />
      ))}

      {/* 미세 그리드 */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage:
            "radial-gradient(ellipse 80% 60% at 50% 40%, black, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 60% at 50% 40%, black, transparent 75%)",
        }}
      />

      {/* 노이즈 */}
      <div
        className="absolute inset-0 opacity-[0.16] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='.5'/%3E%3C/svg%3E\")",
        }}
      />

      {/* 비네트 */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.65)_100%)]" />
    </div>
  );
}
