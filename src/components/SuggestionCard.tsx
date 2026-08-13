import type { Difficulty, Suggestion } from "../data/suggestions";

const DIFFICULTY_STYLE: Record<Difficulty, string> = {
  쉬움: "bg-emerald-400/10 text-emerald-300 border-emerald-400/30",
  보통: "bg-amber-400/10 text-amber-300 border-amber-400/30",
  어려움: "bg-rose-400/10 text-rose-300 border-rose-400/30",
};

const CATEGORY_STYLE: Record<Suggestion["category"], string> = {
  성장: "bg-[#f9c74f]/10 text-[#f9c74f] border-[#f9c74f]/30",
  "이벤트 & 재미": "bg-[#4dabf7]/10 text-[#4dabf7] border-[#4dabf7]/30",
  "보상 & 리텐션": "bg-violet-400/10 text-violet-300 border-violet-400/30",
  꾸미기: "bg-pink-400/10 text-pink-300 border-pink-400/30",
};

export default function SuggestionCard({ s }: { s: Suggestion }) {
  return (
    <article className="group relative flex flex-col rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition duration-300 hover:-translate-y-1 hover:border-[#f9c74f]/40 hover:bg-white/[0.07] hover:shadow-[0_8px_30px_rgba(249,199,79,0.08)]">
      {/* 상단: 이모지 + 번호 + 난이도 */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#f9c74f]/20 to-[#f9c74f]/5 text-2xl ring-1 ring-[#f9c74f]/20 transition group-hover:scale-110">
            {s.emoji}
          </div>
          <div>
            <span className="text-xs font-bold tracking-widest text-white/40">
              No.{String(s.no).padStart(2, "0")}
            </span>
            <h3 className="text-lg font-black leading-tight text-white">{s.title}</h3>
          </div>
        </div>
        <span
          className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-bold ${DIFFICULTY_STYLE[s.difficulty]}`}
        >
          구현 난이도 · {s.difficulty}
        </span>
      </div>

      {/* 카테고리 + 재미 지수 */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${CATEGORY_STYLE[s.category]}`}
        >
          {s.category}
        </span>
        <span className="text-[11px] text-white/50">
          재미 지수{" "}
          <span className="text-[#f9c74f]">{"★".repeat(s.stars)}</span>
          <span className="text-white/20">{"★".repeat(5 - s.stars)}</span>
        </span>
      </div>

      {/* 태그라인 */}
      <p className="mt-3 text-sm font-bold text-[#f9c74f]/90">“{s.tagline}”</p>

      {/* 설명 */}
      <p className="mt-2 text-sm leading-relaxed text-white/70">{s.description}</p>

      {/* 예시 수치 */}
      <div className="mt-4 rounded-xl border border-white/10 bg-black/30 p-3">
        <p className="text-[11px] font-bold uppercase tracking-wider text-white/40">
          💡 예시 수치 (참고용)
        </p>
        <ul className="mt-2 space-y-1.5">
          {s.examples.map((ex) => (
            <li key={ex} className="flex gap-2 text-[13px] leading-snug text-white/80">
              <span className="text-[#4dabf7]">▸</span>
              <span className="font-mono">{ex}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 재미 포인트 */}
      <p className="mt-3 text-[13px] leading-relaxed text-white/60">
        <span className="font-bold text-emerald-300">재미 포인트 · </span>
        {s.fun}
      </p>
    </article>
  );
}
