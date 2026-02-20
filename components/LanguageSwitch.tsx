"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/i18n";

function stripLocale(pathname: string) {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 0) return "/";
  const first = parts[0];
  if (first === "ru" || first === "en") {
    const rest = parts.slice(1).join("/");
    return rest ? `/${rest}` : "/";
  }
  return pathname;
}

export default function LanguageSwitch({ locale }: { locale: Locale }) {
  const pathname = usePathname() || "/";
  const rest = stripLocale(pathname);

  const other: Locale = locale === "ru" ? "en" : "ru";
  const href = `/${other}${rest === "/" ? "" : rest}`;

  return (
    <div className="flex items-center gap-2 text-sm">
      <Link
        href={href}
        className="rounded-full border border-line bg-white px-3 py-1 font-medium text-muted hover:border-electric hover:text-fg transition"
        aria-label="Switch language"
      >
        {other.toUpperCase()}
      </Link>
    </div>
  );
}
