import { scoreColor } from '@/lib/dashboard/health-score';

export function HealthGauge({ score }: { score: number }) {
  const color = scoreColor(score);
  const offset = 283 - (283 * score) / 100; // circumference 283 for r=45

  return (
    <div className="flex items-center gap-4">
      <svg width="120" height="120" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="none" stroke="var(--border)" strokeWidth="8" />
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray="283"
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
          style={{ transition: 'stroke-dashoffset 0.4s ease' }}
        />
        <text
          x="50"
          y="54"
          textAnchor="middle"
          fontSize="22"
          fontWeight="700"
          fill="var(--fg)"
        >
          {score}
        </text>
      </svg>
      <div>
        <div className="text-xs uppercase tracking-wider text-zinc-500">Health</div>
        <div className="text-lg font-medium">
          {score >= 75 ? 'Healthy' : score >= 50 ? 'Watch' : 'Needs attention'}
        </div>
      </div>
    </div>
  );
}
