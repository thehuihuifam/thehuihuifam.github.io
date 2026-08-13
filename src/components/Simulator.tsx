import { useMemo, useState } from "react";

const SUFFIX = ["", "K", "M", "B", "T", "aa", "ab", "ac", "ad", "ae"];

export function fmt(n: number): string {
  if (!isFinite(n)) return "∞";
  if (n < 1000) return n.toFixed(n < 10 && n % 1 !== 0 ? 1 : 0);
  const tier = Math.min(Math.floor(Math.log10(n) / 3), SUFFIX.length - 1);
  const scaled = n / Math.pow(10, tier * 3);
  return `${scaled.toFixed(2)}${SUFFIX[tier]}`;
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  display,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  display: string;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="text-[11px] text-slate-400">{label}</span>
        <span className="font-mono text-[13px] font-bold text-[#f9c74f]">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-[#4dabf7]"
      />
    </div>
  );
}

function OfflineCalc() {
  const [cpsExp, setCpsExp] = useState(3); // 10^3
  const [hours, setHours] = useState(9);
  const [full, setFull] = useState(false);

  const cps = Math.pow(10, cpsExp);
  const cap = full ? 24 : 8;
  const rate = full ? 1 : 0.5;
  const capped = Math.min(hours, cap);
  const reward = capped * 3600 * cps * rate;

  return (
    <div className="rounded-2xl border border-[#4ade80]/20 bg-[#20203a]/70 p-5 backdrop-blur">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-lg">🌙</span>
        <h4 className="text-sm font-bold text-white">#6 오프라인 보상 시뮬레이터</h4>
      </div>
      <div className="space-y-3.5">
        <Slider
          label="현재 초당 생산(CPS)"
          value={cpsExp}
          min={0}
          max={12}
          step={1}
          onChange={setCpsExp}
          display={`${fmt(cps)}/s`}
        />
        <Slider
          label="자리 비운 시간"
          value={hours}
          min={1}
          max={24}
          step={1}
          onChange={setHours}
          display={`${hours}시간`}
        />
        <label className="flex cursor-pointer items-center gap-2 text-[11px] text-slate-400">
          <input
            type="checkbox"
            checked={full}
            onChange={(e) => setFull(e.target.checked)}
            className="h-3.5 w-3.5 accent-[#4ade80]"
          />
          업그레이드 적용 (효율 100% · 상한 24h)
        </label>
      </div>
      <div className="mt-4 rounded-xl border border-white/10 bg-[#12121f] p-3 text-center">
        <div className="text-[10px] text-slate-500">
          정산 시간 {capped}h {hours > cap && <span className="text-[#ff8a94]">(상한 {cap}h 적용)</span>} · 효율{" "}
          {rate * 100}%
        </div>
        <div className="mt-1 font-mono text-2xl font-bold text-[#4ade80]">+{fmt(reward)}</div>
        <div className="mt-1 text-[10px] text-slate-500">현재 게임에서는 이 값이 전부 0입니다</div>
      </div>
    </div>
  );
}

function PrestigeCalc() {
  const [exp, setExp] = useState(13);
  const total = Math.pow(10, exp);
  const fame = Math.floor(150 * Math.sqrt(total / 1e12));
  const mult = 1 + fame * 0.02;

  return (
    <div className="rounded-2xl border border-[#f472b6]/20 bg-[#20203a]/70 p-5 backdrop-blur">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-lg">🔁</span>
        <h4 className="text-sm font-bold text-white">#5 환생 보상 시뮬레이터</h4>
      </div>
      <div className="space-y-3.5">
        <Slider
          label="누적 획득 코인"
          value={exp}
          min={10}
          max={20}
          step={1}
          onChange={setExp}
          display={fmt(total)}
        />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-white/10 bg-[#12121f] p-3 text-center">
          <div className="text-[10px] text-slate-500">획득 명성</div>
          <div className="font-mono text-xl font-bold text-[#f472b6]">+{fmt(fame)}</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-[#12121f] p-3 text-center">
          <div className="text-[10px] text-slate-500">영구 생산 배수</div>
          <div className="font-mono text-xl font-bold text-[#f9c74f]">×{mult.toFixed(2)}</div>
        </div>
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
        명성 = floor(150 × √(누적코인 / 1조)), 명성 1당 전체 생산 +2%. 리셋이 손해가 아니라 '가속'이 되는 순간
        플레이어는 스스로 초기화 버튼을 누릅니다.
      </p>
    </div>
  );
}

function GrowthChart() {
  const { linear, proposed } = useMemo(() => {
    const pts = 40;
    const l: string[] = [];
    const p: string[] = [];
    for (let i = 0; i <= pts; i++) {
      const t = i / pts;
      const x = 10 + t * 280;
      // 현재: 선형에 가깝게 (자동 1종만)
      const yl = 130 - Math.min(1, t * 0.42) * 110;
      // 제안: 계단형 지수 성장
      const step = Math.floor(t * 5);
      const eased = Math.pow(t, 2.2) + step * 0.06;
      const yp = 130 - Math.min(1, eased) * 118;
      l.push(`${i === 0 ? "M" : "L"}${x.toFixed(1)},${yl.toFixed(1)}`);
      p.push(`${i === 0 ? "M" : "L"}${x.toFixed(1)},${yp.toFixed(1)}`);
    }
    return { linear: l.join(" "), proposed: p.join(" ") };
  }, []);

  return (
    <div className="rounded-2xl border border-white/8 bg-[#20203a]/70 p-5 backdrop-blur">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-lg">📈</span>
        <h4 className="text-sm font-bold text-white">성장 곡선 비교</h4>
      </div>
      <svg viewBox="0 0 300 145" className="w-full">
        <defs>
          <linearGradient id="gp" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f9c74f" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#f9c74f" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3].map((i) => (
          <line key={i} x1="10" y1={12 + i * 36} x2="290" y2={12 + i * 36} stroke="rgba(255,255,255,0.06)" />
        ))}
        <path d={`${proposed} L290,130 L10,130 Z`} fill="url(#gp)" />
        <path d={linear} fill="none" stroke="#64748b" strokeWidth="2" strokeDasharray="4 4" />
        <path d={proposed} fill="none" stroke="#f9c74f" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      <div className="mt-2 flex justify-center gap-4 text-[11px]">
        <span className="flex items-center gap-1.5 text-slate-400">
          <span className="h-0.5 w-4 bg-slate-500" /> 현재 (자동 1종)
        </span>
        <span className="flex items-center gap-1.5 text-[#f9c74f]">
          <span className="h-0.5 w-4 bg-[#f9c74f]" /> 제안 적용 후
        </span>
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
        업그레이드·마일스톤·환생이 곡선에 '계단'을 만듭니다. 플레이어는 이 계단 하나하나를 다음 목표로 삼습니다.
      </p>
    </div>
  );
}

export default function Simulator() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <OfflineCalc />
      <PrestigeCalc />
      <GrowthChart />
    </div>
  );
}
