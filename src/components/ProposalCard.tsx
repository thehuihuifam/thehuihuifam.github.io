import { useState } from "react";
import { CATEGORY_COLOR, type Proposal } from "../data/proposals";

function Dots({ value, color }: { value: number; color: string }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className="h-1.5 w-4 rounded-full transition-all"
          style={{ background: i <= value ? color : "rgba(255,255,255,0.12)" }}
        />
      ))}
    </div>
  );
}

export default function ProposalCard({ p }: { p: Proposal }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border bg-[#20203a]/70 backdrop-blur transition-all duration-300 ${
        open ? "border-[#4dabf7]/50 shadow-[0_0_40px_-12px_rgba(77,171,247,0.5)]" : "border-white/8 hover:border-white/20"
      }`}
    >
      <div
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#4dabf7]/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
        aria-hidden
      />
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-start gap-4 p-5 text-left"
        aria-expanded={open}
      >
        <div className="relative shrink-0">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1a1a2e] text-2xl ring-1 ring-white/10">
            {p.icon}
          </div>
          <span className="absolute -left-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#f9c74f] text-[11px] font-bold text-[#1a1a2e]">
            {p.id}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <h3 className="text-[15px] font-bold text-white sm:text-base">{p.title}</h3>
            <span className={`rounded-md border px-1.5 py-0.5 text-[10px] font-semibold ${CATEGORY_COLOR[p.category]}`}>
              {p.category}
            </span>
            {p.impact === 5 && p.effort <= 2 && (
              <span className="rounded-md border border-[#4ade80]/30 bg-[#4ade80]/10 px-1.5 py-0.5 text-[10px] font-semibold text-[#4ade80]">
                가성비 최고
              </span>
            )}
          </div>
          <p className="text-[13px] leading-relaxed text-slate-400">{p.oneLiner}</p>

          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-slate-500">
            <div className="flex items-center gap-2">
              <span>임팩트</span>
              <Dots value={p.impact} color="#f9c74f" />
            </div>
            <div className="flex items-center gap-2">
              <span>작업량</span>
              <Dots value={p.effort} color="#4dabf7" />
            </div>
            <span className="rounded bg-white/5 px-1.5 py-0.5">⏳ {p.eta}</span>
          </div>
        </div>

        <svg
          className={`mt-1 h-5 w-5 shrink-0 text-slate-500 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      <div
        className={`grid transition-all duration-300 ease-out ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
      >
        <div className="overflow-hidden">
          <div className="space-y-4 border-t border-white/8 px-5 pb-5 pt-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-[#e63946]/20 bg-[#e63946]/5 p-3">
                <div className="mb-1 text-[11px] font-bold tracking-wide text-[#ff8a94]">🔻 지금의 문제</div>
                <p className="text-[12.5px] leading-relaxed text-slate-300">{p.problem}</p>
              </div>
              <div className="rounded-xl border border-[#4ade80]/20 bg-[#4ade80]/5 p-3">
                <div className="mb-1 text-[11px] font-bold tracking-wide text-[#86efac]">🔺 이렇게 풀린다</div>
                <p className="text-[12.5px] leading-relaxed text-slate-300">{p.solution}</p>
              </div>
            </div>

            <div>
              <div className="mb-2 text-[11px] font-bold tracking-wide text-slate-400">설계 포인트</div>
              <ul className="space-y-1.5">
                {p.specs.map((s, i) => (
                  <li key={i} className="flex gap-2 text-[12.5px] leading-relaxed text-slate-300">
                    <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-[#4dabf7]" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            {p.formula && (
              <div className="rounded-xl border border-white/10 bg-[#12121f] p-3">
                <div className="mb-1 text-[10px] font-semibold tracking-wide text-slate-500">{p.formula.label}</div>
                <code className="font-mono text-[13px] text-[#f9c74f]">{p.formula.code}</code>
              </div>
            )}

            <div className="flex flex-wrap gap-2 text-[11px]">
              <span className="rounded-md bg-white/5 px-2 py-1 text-slate-400">
                기대 지표 <span className="text-white">{p.metric}</span>
              </span>
              <span className="rounded-md bg-white/5 px-2 py-1 text-slate-400">
                적용 순서 <span className="text-white">{p.phase}차</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
