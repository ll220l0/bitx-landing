export default function Section({
  id,
  title,
  subtitle,
  tone = "plain",
  className,
  children
}: {
  id?: string;
  title: string;
  subtitle?: string;
  tone?: "plain" | "muted" | "tint" | "contrast";
  className?: string;
  children: React.ReactNode;
}) {
  const toneClass =
    tone === "muted"
      ? "section-tone-muted"
      : tone === "tint"
        ? "section-tone-tint"
        : tone === "contrast"
          ? "section-tone-contrast"
          : "section-tone-plain";

  return (
    <section id={id} className={["py-12 md:py-14", className || ""].join(" ").trim()}>
      <div className={["section-panel", toneClass].join(" ")}>
        <div className="mb-7 reveal" data-reveal>
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">{title}</h2>
          {subtitle ? <p className="mt-3 max-w-2xl text-muted">{subtitle}</p> : null}
        </div>
        {children}
      </div>
    </section>
  );
}
