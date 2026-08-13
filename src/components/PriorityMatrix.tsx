import { useState } from "react";
import { proposals } from "../data/proposals";

export default function PriorityMatrix() {
  const [hover, setHover] = useState<number | null>(null);

  // 같은 좌표 충돌 분산용 오프셋
  const seen = new Map<string, number>();

  return (
    <div className="rounded-2xl border border-white/8 bg-[#20203a]/70 p-5 backdrop-blur">
      <div className="mb-1 text-sm font-bold text-white">우선순위 매트릭스</div>
      <p className="mb-4 text-[12px] text-slate-400">
        왼쪽 위 = 적게 일하고 크게 먹는 구간. <span className="text-[#f9c74f]">6번(오프라인 보상)</span>과{" "}
        <span className="text-[#f9c74f]">1번(유닛 확장)</span>부터 착수하는 걸 권장합니다.
      </p>

      <div className="relative aspect-square w-full rounded-xl border border-white/10 bg-[#12121f] p-3">
        {/* 사분면 */}
        <div className="absolute inset-3 grid grid-cols-2 grid-rows-2">
          <div className="rounded-tl-lg bg-[#4ade80]/[0.07]" />
          <div className="rounded-tr-lg bg-[#f9c74f]/[0.05]" />
          <div className="rounded-bl-lg bg-white/[0.02]" />
          <div className="rounded-br-lg bg-[#e63946]/[0.05]" />
        </div>
        <div className="pointer-events-none absolute inset-3">
          <div className="absolute left-0 top-0 p-2 text-[10px] font-semibold text-[#4ade80]/70">즉시 착수</div>
          <div className="absolute right-0 top-0 p-2 text-[10px] font-semibold text-[#f9c74f]/70">계획 필요</div>
          <div className="absolute bottom-0 left-0 p-2 text-[10px] font-semibold text-slate-600">틈틈이</div>
          <div className="absolute bottom-0 right-0 p-2 text-[10px] font-semibold text-[#ff8a94]/60">보류</div>
        </div>

        {/* 점들 */}
        {proposals.map((p) => {
          const key = `${p.impact}-${p.effort}`;
          const dup = seen.get(key) ?? 0;
          seen.set(key, dup + 1);
          const jitter = dup * 7;
          const left = ((p.effort - 0.5) / 5) * 100;
          const top = ((5 - p.impact + 0.5) / 5) * 100;
          const active = hover === p.id;
          return (
            <button
              key={p.id}
              onMouseEnter={() => setHover(p.id)}
              onMouseLeave={() => setHover(null)}
              onClick={() => setHover(active ? null : p.id)}
              className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `calc(${left}% + ${jitter}px)`, top: `calc(${top}% + ${jitter * 0.6}px)` }}
            >
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full border text-[12px] font-bold transition-all ${
                  active
                    ? "scale-125 border-[#f9c74f] bg-[#f9c74f] text-[#1a1a2e]"
                    : "border-[#4dabf7]/50 bg-[#1a1a2e] text-[#4dabf7] hover:border-[#4dabf7]"
                }`}
              >
                {p.id}
              </span>
            </button>
          );
        })}

        {hover !== null && (
          <div className="absolute bottom-3 left-1/2 z-20 w-[85%] -translate-x-1/2 rounded-lg border border-white/15 bg-[#1a1a2e] px-3 py-2 text-center text-[12px] text-white shadow-xl">
            {proposals.find((p) => p.id === hover)?.icon} {proposals.find((p) => p.id === hover)?.title}
          </div>
        )}
      </div>

      <div className="mt-2 flex justify-between text-[10px] text-slate-500">
        <span>← 작업량 적음</span>
        <span>작업량 많음 →</span>
      </div>
      <div className="mt-1 text-center text-[10px] text-slate-500">세로축: 위로 갈수록 임팩트 큼</div>
    </div>
  );
}
