interface ProgressRingProps {
  value: number;
  max: number;
  label: string;
  sublabel?: string;
  size?: number;
}

export function ProgressRing({
  value,
  max,
  label,
  sublabel,
  size = 80,
}: ProgressRingProps) {
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = max > 0 ? Math.min(value / max, 1) : 0;
  const dashOffset = circumference * (1 - progress);
  const center = size / 2;

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        className="-rotate-90"
        aria-hidden="true"
      >
        {/* Track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: "stroke-dashoffset 0.4s ease" }}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-bebas text-text leading-none" style={{ fontSize: size * 0.22 }}>
          {label}
        </span>
        {sublabel && (
          <span
            className="text-muted font-dm leading-none mt-0.5"
            style={{ fontSize: size * 0.13 }}
          >
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
}
