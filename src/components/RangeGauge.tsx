interface Props {
  lo: number; // 확정된 하한 (이보다 큼)
  hi: number; // 확정된 상한 (이보다 작음)
  last: number | null; // 마지막 추측
  solved: boolean;
}

/** 1~100 구간에서 남은 정답 후보 범위를 보여주는 게이지 */
export default function RangeGauge({ lo, hi, last, solved }: Props) {
  const pct = (v: number) => ((v - 1) / 99) * 100;
  const left = pct(lo);
  const width = Math.max(pct(hi) - pct(lo), 0.8);
  const remain = Math.max(hi - lo + 1, 1);

  return (
    <div className="select-none">
      <div className="mb-2.5 flex items-end justify-between text-[11px] font-semibold tracking-widest text-white/40">
        <span>SEARCH RANGE</span>
        <span className="tabular-nums">
          남은 후보{" "}
          <span
            className={`font-black ${solved ? "text-emerald-300" : "text-white/80"}`}
          >
            {solved ? 1 : remain}
          </span>
          <span className="text-white/25"> / 100</span>
        </span>
      </div>

      {/* 트랙 */}
      <div className="relative h-3 w-full overflow-visible rounded-full bg-white/[0.07] ring-1 ring-inset ring-white/10">
        {/* 활성 구간 */}
        <div
          className="absolute top-0 h-full rounded-full transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            left: `${left}%`,
            width: `${width}%`,
            background: solved
              ? "linear-gradient(90deg,#34d399,#22d3ee)"
              : "linear-gradient(90deg,#8b5cf6,#22d3ee,#ec4899)",
            boxShadow: solved
              ? "0 0 22px rgba(52,211,153,.65)"
              : "0 0 22px rgba(139,92,246,.55)",
          }}
        />

        {/* 마지막 추측 마커 */}
        {last !== null && (
          <div
            className="absolute top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{ left: `${pct(Math.min(Math.max(last, 1), 100))}%` }}
          >
            <div
              className={`pulse-dot h-5 w-5 rounded-full border-2 ${
                solved
                  ? "border-emerald-200 bg-emerald-400"
                  : "border-white bg-white/25 backdrop-blur"
              }`}
            />
            <span
              className={`absolute left-1/2 top-7 -translate-x-1/2 rounded-md px-1.5 py-0.5 text-[10px] font-black tabular-nums ${
                solved ? "bg-emerald-400/20 text-emerald-200" : "bg-white/10 text-white/70"
              }`}
            >
              {last}
            </span>
          </div>
        )}
      </div>

      {/* 눈금 */}
      <div className="mt-6 flex justify-between text-[10px] font-bold tabular-nums text-white/25">
        {[1, 25, 50, 75, 100].map((n) => (
          <span key={n}>{n}</span>
        ))}
      </div>
    </div>
  );
}
