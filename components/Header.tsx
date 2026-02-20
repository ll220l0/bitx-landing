import Container from "./Container";
import LanguageSwitch from "./LanguageSwitch";
import BrandLogo from "./BrandLogo";
import type { Locale } from "@/lib/i18n";

export default function Header({
  locale,
  nav,
  cta
}: {
  locale: Locale;
  nav: { services: string; case: string; process: string; faq: string; contacts: string; clients?: string };
  cta: string;
}) {
  return (
    <header className="surface-blur sticky top-0 z-50 border-b border-line/80">
      <Container>
        <div className="flex h-16 items-center justify-between gap-4">
          <a href="#" className="text-fg">
            <BrandLogo className="h-8 w-auto" />
          </a>

          <nav className="hidden md:flex items-center gap-2 text-sm">
            <a className="rounded-full px-3 py-1.5 text-muted hover:bg-slate-100 hover:text-fg transition" href="#services">{nav.services}</a>
            {nav.clients ? (
              <a className="rounded-full px-3 py-1.5 text-muted hover:bg-slate-100 hover:text-fg transition" href="#clients">{nav.clients}</a>
            ) : null}
            <a className="rounded-full px-3 py-1.5 text-muted hover:bg-slate-100 hover:text-fg transition" href="#case">{nav.case}</a>
            <a className="rounded-full px-3 py-1.5 text-muted hover:bg-slate-100 hover:text-fg transition" href="#process">{nav.process}</a>
            <a className="rounded-full px-3 py-1.5 text-muted hover:bg-slate-100 hover:text-fg transition" href="#faq">{nav.faq}</a>
            <a className="rounded-full px-3 py-1.5 text-muted hover:bg-slate-100 hover:text-fg transition" href="#contacts">{nav.contacts}</a>
          </nav>

          <div className="flex items-center gap-3">
            <LanguageSwitch locale={locale} />
            <a
              href="#contacts"
              className="cta-button-shine rounded-full bg-electric px-4 py-2 text-sm font-medium text-white shadow-soft hover:opacity-95 transition"
            >
              {cta}
            </a>
          </div>
        </div>
      </Container>
    </header>
  );
}
