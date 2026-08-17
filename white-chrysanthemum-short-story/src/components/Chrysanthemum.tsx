type Props = { className?: string; strokeWidth?: number };

/** 흰 국화 — line-drawn chrysanthemum mark */
export default function Chrysanthemum({ className = "", strokeWidth = 1 }: Props) {
  const petals = Array.from({ length: 16 });
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" aria-hidden="true">
      <g stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round">
        {petals.map((_, i) => {
          const a = (i * 360) / petals.length;
          const long = i % 2 === 0;
          return (
            <ellipse
              key={i}
              cx="50"
              cy={long ? 27 : 32}
              rx={long ? 6.2 : 4.6}
              ry={long ? 15 : 11}
              transform={`rotate(${a} 50 50)`}
              opacity={long ? 0.9 : 0.55}
            />
          );
        })}
        <circle cx="50" cy="50" r="6.5" opacity="0.9" />
        <circle cx="50" cy="50" r="2" opacity="0.5" />
      </g>
    </svg>
  );
}
