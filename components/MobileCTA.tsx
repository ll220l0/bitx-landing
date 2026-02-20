"use client";

import { useEffect, useMemo, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { buildWhatsAppLink, buildWhatsAppText } from "@/lib/whatsapp";

export default function MobileCTA({
  locale,
  waPhone,
  labels
}: {
  locale: Locale;
  waPhone: string;
  labels: { primary: string; whatsapp: string };
}) {
  const [hide, setHide] = useState(false);

  const waHref = useMemo(
    () => buildWhatsAppLink(waPhone, buildWhatsAppText(locale)),
    [waPhone, locale]
  );

  useEffect(() => {
    const target = document.getElementById("contacts");
    if (!target) return;

    const obs = new IntersectionObserver(
      (entries) => {
        setHide(entries[0]?.isIntersecting ?? false);
      },
      {
        root: null,
        rootMargin: "-10% 0px -55% 0px",
        threshold: 0.01
      }
    );

    obs.observe(target);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      className={[
        "md:hidden fixed bottom-0 left-0 right-0 z-50 transition-all duration-300",
        hide ? "translate-y-28 opacity-0 pointer-events-none" : "translate-y-0 opacity-100"
      ].join(" ")}
    >
      <div className="h-6 bg-gradient-to-t from-white to-transparent" />
      <div className="surface-blur border-t border-line/80">
        <div className="mobile-cta-shell mx-auto max-w-6xl px-5 py-3">
          <div className="flex gap-3">
            <a
              href="#contacts"
              className="cta-button-shine flex-1 inline-flex items-center justify-center rounded-full bg-electric px-5 py-3 text-sm font-medium text-white shadow-soft hover:opacity-95 transition"
            >
              {labels.primary}
            </a>

            <a
              href={waHref}
              target="_blank"
              rel="noreferrer"
              className="flex-1 inline-flex items-center justify-center rounded-full border border-line bg-white px-5 py-3 text-sm font-medium hover:border-electric transition"
            >
              {labels.whatsapp}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
