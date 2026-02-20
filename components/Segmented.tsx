"use client";

type Option<T extends string> = {
  value: T;
  label: string;
};

export default function Segmented<T extends string>({
  value,
  onChange,
  options
}: {
  value: T;
  onChange: (v: T) => void;
  options: Option<T>[];
}) {
  const index = Math.max(0, options.findIndex((o) => o.value === value));
  const count = Math.max(1, options.length);

  const style = {
    ["--seg-count" as any]: String(count),
    ["--seg-index" as any]: String(index)
  } as React.CSSProperties;

  return (
    <div
      className="relative inline-flex h-12 w-full items-stretch overflow-hidden rounded-xl border border-line bg-white p-1"
      style={style}
      role="group"
      aria-label="Segmented control"
    >
      <div
        className="pointer-events-none absolute top-1 bottom-1 left-1 rounded-lg bg-electric shadow-soft transition-transform duration-200 ease-out"
        style={{
          width: `calc((100% - 8px) / var(--seg-count))`,
          transform: `translateX(calc(var(--seg-index) * 100%))`
        }}
      />

      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={[
              "relative z-10 h-full w-full rounded-lg px-3 text-sm font-medium transition-colors duration-200",
              active ? "text-white" : "text-muted hover:text-fg"
            ].join(" ")}
            aria-pressed={active}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
