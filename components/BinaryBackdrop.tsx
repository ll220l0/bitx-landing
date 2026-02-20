export default function BinaryBackdrop() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.35]"
      viewBox="0 0 1200 700"
      fill="none"
    >
      <defs>
        <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
          <path d="M 48 0 L 0 0 0 48" stroke="rgba(0, 245, 255, 0.12)" strokeWidth="1" />
        </pattern>

        <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#02040A" stopOpacity="0.05" />
          <stop offset="0.2" stopColor="#02040A" stopOpacity="0.45" />
          <stop offset="1" stopColor="#02040A" stopOpacity="0.95" />
        </linearGradient>

        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect width="1200" height="700" fill="url(#grid)" />
      <rect width="1200" height="700" fill="url(#fade)" />

      {Array.from({ length: 18 }).map((_, i) => {
        const x = 50 + i * 65;
        const y0 = (i % 5) * 22;
        const blue = i % 6 === 0;
        return (
          <g
            key={i}
            className="binary-column"
            style={{ animationDelay: `${(i % 5) * -0.9}s` }}
            transform={`translate(${x}, ${y0})`}
            opacity={blue ? 0.95 : 0.68}
          >
            {Array.from({ length: 14 }).map((__, j) => {
              const v = (i + j) % 2 === 0 ? "0" : "1";
              const y = 20 + j * 42;
              const isBlue = blue && j % 3 === 0;
              return (
                <text
                  key={j}
                  x="0"
                  y={y}
                  fontSize="16"
                  fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
                  fill={isBlue ? "rgba(0,245,255,0.95)" : "rgba(125,161,180,0.5)"}
                  filter={isBlue ? "url(#glow)" : undefined}
                >
                  {v}
                </text>
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}
