"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Container from "@/components/Container";
import Section from "@/components/Section";
import Segmented from "@/components/Segmented";
import MobileCTA from "@/components/MobileCTA";
import type { Locale } from "@/lib/i18n";
import { buildWhatsAppLink, buildWhatsAppText } from "@/lib/whatsapp";
import { gaEvent } from "@/lib/analytics";
import { decodeUtmCookie, UTM_COOKIE } from "@/lib/utm";
import { decodeAttrCookie, ATTR_COOKIE } from "@/lib/attribution";
import { CLIENT_ID_COOKIE, getCookie, setCookie, uuidv4 } from "@/lib/clientId";
import ru from "@/content/ru.json";
import en from "@/content/en.json";

function pickDict(locale: Locale) {
  return locale === "en" ? (en as any) : (ru as any);
}

export default function LandingClient({ locale }: { locale: Locale }) {
  const dict = useMemo(() => pickDict(locale), [locale]);
  const waPhone = "+996 509 000 991";
  const email = "info@bitx.kg";
  const tgHref = "https://t.me/bitx_kg";
  const contactsRef = useRef<HTMLDivElement | null>(null);

  const [utm, setUtm] = useState<Record<string, string> | null>(null);
  const [attr, setAttr] = useState<Record<string, string> | null>(null);
  const [clientId, setClientId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    contact: "",
    message: "",
    timeline: "",
    budget: "",
    projectType: "both" as "web" | "mobile" | "both",
    hp: ""
  });

  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "failed">("idle");
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [cooldown, setCooldown] = useState(false);

  useEffect(() => {
    const m = document.cookie.match(new RegExp(`${UTM_COOKIE}=([^;]+)`));
    const decoded = decodeUtmCookie(m?.[1]);
    if (decoded) setUtm(decoded as any);
  }, []);

  useEffect(() => {
    const m = document.cookie.match(new RegExp(`${ATTR_COOKIE}=([^;]+)`));
    const decoded = decodeAttrCookie(m?.[1]);
    if (decoded) setAttr(decoded as any);
  }, []);

  useEffect(() => {
    let cid = getCookie(CLIENT_ID_COOKIE);
    if (cid) {
      try {
        cid = decodeURIComponent(cid);
      } catch {}
      setClientId(cid);
      return;
    }
    const fresh = uuidv4();
    setCookie(CLIENT_ID_COOKIE, fresh, 180);
    setClientId(fresh);
  }, []);


  useEffect(() => {
    const items = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (!items.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
    );
    items.forEach((item) => obs.observe(item));
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (status !== "sent" && status !== "failed") return;
    contactsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [status]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "sending" || cooldown) return;
    setCooldown(true);
    setTimeout(() => setCooldown(false), 3000);
    setStatus("sending");

    gaEvent("lead_submit", {
      locale,
      project_type: form.projectType,
      client_id: clientId,
      utm_source: utm?.utm_source,
      utm_medium: utm?.utm_medium,
      utm_campaign: utm?.utm_campaign,
      landing_page: attr?.landing_page,
      referrer: attr?.referrer
    });

    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...form, locale, utm, attribution: attr, clientId })
      });
      if (res.status === 429) {
        setStatus("failed");
        setToast({ type: "error", text: dict.contact.toastRateLimit || (locale === "en" ? "Too many requests." : "Слишком много попыток.") });
        return;
      }
      if (!res.ok) throw new Error("bad_response");
      setStatus("sent");
      setToast({ type: "success", text: dict.contact.toastSuccess || (locale === "en" ? "Request sent." : "Заявка отправлена.") });
      gaEvent("lead_submit_success", { locale, project_type: form.projectType, client_id: clientId });
    } catch {
      setStatus("failed");
      setToast({ type: "error", text: dict.contact.toastFailed || (locale === "en" ? "Failed to send." : "Не удалось отправить.") });
      gaEvent("lead_submit_fail", { locale, project_type: form.projectType, client_id: clientId });
    }
  }

  const heroMetrics = Array.isArray(dict.hero.metrics) ? dict.hero.metrics : [];
  const checkpoints = Array.isArray(dict.contact.checkpoints) ? dict.contact.checkpoints : [];
  const waHeroHref = buildWhatsAppLink(waPhone, buildWhatsAppText(locale));
  const waDraftHref = buildWhatsAppLink(waPhone, buildWhatsAppText(locale, { ...form, utm }));
  const emailSubject = dict.contact.emailSubject || "BITX - Project request";
  const heroTitle = String(dict.hero.h1 || "");

  return (
    <div className="relative min-h-screen overflow-x-clip bg-bg text-fg safe-bottom">

      <Header locale={locale} nav={dict.nav} cta={dict.hero.ctaPrimary} />
      {toast ? (
        <div className="fixed top-4 left-0 right-0 z-[60] md:top-5">
          <div className="mx-auto max-w-7xl px-5">
            <div className={["glass-card rounded-2xl px-4 py-3 shadow-soft flex items-start justify-between gap-3", toast.type === "success" ? "border-line" : "border-red-200"].join(" ")} role="status">
              <div className="flex items-start gap-3">
                <div className={["mt-0.5 h-2.5 w-2.5 rounded-full", toast.type === "success" ? "bg-electric" : "bg-red-500"].join(" ")} />
                <div className="text-sm font-medium text-fg">{toast.text}</div>
              </div>
              <button type="button" onClick={() => setToast(null)} className="text-sm text-muted hover:text-fg transition" aria-label="Close">x</button>
            </div>
          </div>
        </div>
      ) : null}

      <section className="relative isolate overflow-hidden pt-0">
        <Container>
          <div className="grid items-center gap-8 py-5 md:min-h-[calc(100dvh-64px)] md:grid-cols-12 md:gap-8 md:py-6 lg:py-8">
            <div className="md:col-span-7 reveal" data-reveal>
              <h1 className="display-font text-[36px] font-extrabold leading-[1.04] sm:text-[44px] md:text-[48px] lg:text-[54px] xl:text-[58px]">{heroTitle}</h1>
              <p className="mt-4 max-w-2xl text-base text-muted md:text-[17px]">{dict.hero.sub}</p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <a href="#contacts" className="cta-button-shine inline-flex items-center justify-center rounded-full bg-electric px-6 py-3 text-sm font-semibold text-white shadow-soft hover:opacity-95 transition">{dict.hero.ctaPrimary}</a>
                <a href={waHeroHref} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-full border border-line bg-white px-6 py-3 text-sm font-semibold hover:border-electric hover:text-fg transition">{dict.hero.ctaWhatsapp}</a>
                <a href="#case" className="inline-flex items-center justify-center rounded-full border border-line bg-white px-6 py-3 text-sm font-semibold hover:border-electric hover:text-fg transition">{dict.hero.ctaSecondary}</a>
              </div>

              <div className="mt-4 text-sm text-muted">{dict.hero.chips}</div>

              {heroMetrics.length ? (
                <div className="mt-4 hidden gap-3 sm:grid-cols-3 xl:grid">
                  {heroMetrics.map((metric: any, idx: number) => (
                    <div key={idx} className="metric-card rounded-2xl p-3 reveal" data-reveal>
                      <div className="display-font text-xl font-bold text-fg">{metric.value}</div>
                      <div className="mt-1 text-xs uppercase tracking-[0.14em] text-muted">{metric.label}</div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="md:col-span-5 reveal reveal-delay-1" data-reveal>
              <div className="ui-card glass-card rounded-3xl p-5 shadow-soft md:p-5">
                <div className="text-xs uppercase tracking-[0.16em] text-electric">{locale === "en" ? "Coding in progress" : "Кодинг в процессе"}</div>
                <div className="display-font mt-2 text-[30px] font-semibold leading-tight md:text-[34px]">{locale === "en" ? "From commit to release" : "От коммита до релиза"}</div>
                <p className="mt-2 text-sm text-muted">{locale === "en" ? "A simplified live view of how we turn requirements into production code." : "Упрощенный live-вид того, как мы превращаем требования в рабочий продакшн-код."}</p>

                <div className="code-editor mt-4">
                  <div className="code-editor-head">
                    <div className="code-dots">
                      <span />
                      <span />
                      <span />
                    </div>
                    <div className="code-file">src/pipeline/release.ts</div>
                  </div>
                  <div className="code-editor-body">
                    <div className="code-line">
                      <span className="code-ln">1</span>
                      <span className="code-typing d1">const scope = validate(inputs);</span>
                    </div>
                    <div className="code-line">
                      <span className="code-ln">2</span>
                      <span className="code-typing d2">const ui = buildInterface(scope);</span>
                    </div>
                    <div className="code-line">
                      <span className="code-ln">3</span>
                      <span className="code-typing d3">const api = connectIntegrations(ui);</span>
                    </div>
                    <div className="code-line">
                      <span className="code-ln">4</span>
                      <span className="code-typing d4">runTests(api);</span>
                    </div>
                    <div className="code-line">
                      <span className="code-ln">5</span>
                      <span className="code-typing d5">deploy(\"production\");</span>
                      <span className="code-caret" />
                    </div>
                  </div>
                  <div className="code-progress">
                    <span />
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                  <div className="rounded-lg border border-line bg-white px-2.5 py-2 text-muted">
                    <span className="block font-semibold text-fg">UI</span>
                    <span>{locale === "en" ? "Ready" : "Готово"}</span>
                  </div>
                  <div className="rounded-lg border border-line bg-white px-2.5 py-2 text-muted">
                    <span className="block font-semibold text-fg">API</span>
                    <span>{locale === "en" ? "Synced" : "Синхрон"}</span>
                  </div>
                  <div className="rounded-lg border border-line bg-white px-2.5 py-2 text-muted">
                    <span className="block font-semibold text-fg">QA</span>
                    <span>{locale === "en" ? "Running" : "Проверка"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <Container>
        <Section id="services" title={dict.services.title} subtitle={dict.services.subtitle} tone="muted">
          <div className="grid gap-4 md:grid-cols-2">
            {dict.services.cards.map((c: any, idx: number) => (
              <article
                key={idx}
                className={`ui-card ui-card-hover reveal h-full rounded-2xl p-6 md:p-7 ${idx % 2 ? "reveal-delay-1" : ""}`}
                data-reveal
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="display-font text-xl font-semibold">{c.title}</h3>
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-line bg-white text-xs font-semibold text-electric">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                </div>
                <p className="mt-3 text-[15px] leading-relaxed text-muted">{c.text}</p>
              </article>
            ))}
          </div>
        </Section>

        <Section title={dict.why.title}>
          <div className="grid gap-4 md:grid-cols-2">
            {dict.why.items.map((it: any, idx: number) => (
              <article
                key={idx}
                className={`ui-card ui-card-hover ui-card-muted reveal h-full rounded-2xl p-6 ${idx > 1 ? "reveal-delay-1" : ""}`}
                data-reveal
              >
                <div className="flex items-start gap-4">
                  <div className="mt-0.5 h-9 w-9 flex-none rounded-xl bg-electric/10 text-electric flex items-center justify-center font-bold">{idx + 1}</div>
                  <div>
                    <h3 className="display-font text-xl font-semibold">{it.title}</h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-muted">{it.text}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Section>

        <Section id="clients" title={dict.clients.title} subtitle={dict.clients.subtitle} tone="tint">
          <div className="grid gap-4 md:grid-cols-3">
            {dict.clients.items.map((it: any, idx: number) => (
              <article
                key={idx}
                className={`ui-card ui-card-hover reveal h-full rounded-2xl p-6 ${idx === 1 ? "reveal-delay-1" : idx === 2 ? "reveal-delay-2" : ""}`}
                data-reveal
              >
                <div className="text-xs uppercase tracking-[0.14em] text-electric">Format {idx + 1}</div>
                <div className="display-font mt-2 text-xl font-semibold">{it.title}</div>
                <p className="mt-2 text-[15px] leading-relaxed text-muted">{it.text}</p>
              </article>
            ))}
          </div>
        </Section>

        <Section title={dict.testimonials.title} tone="muted">
          <div className="grid gap-4 md:grid-cols-2">
            {dict.testimonials.items.map((it: any, idx: number) => (
              <figure
                key={idx}
                className={`ui-card ui-card-hover ui-card-muted reveal h-full rounded-2xl p-6 ${idx ? "reveal-delay-1" : ""}`}
                data-reveal
              >
                <blockquote className="display-font text-xl font-semibold leading-snug text-fg">"{it.q}"</blockquote>
                <figcaption className="mt-3 text-[15px] leading-relaxed text-muted">{it.a}</figcaption>
              </figure>
            ))}
          </div>
        </Section>
        <Section title={dict.cases.title} tone="muted">
          <div className="grid gap-4 md:grid-cols-3">
            {dict.cases.items.map((c: any, idx: number) => (
              <article
                key={idx}
                className={`ui-card ui-card-hover ui-card-muted reveal h-full rounded-2xl p-6 ${idx ? "reveal-delay-1" : ""}`}
                data-reveal
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="display-font text-lg font-semibold text-fg">{c.name}</h3>
                  <span className="rounded-full border border-line bg-white px-2.5 py-1 text-xs text-muted">{c.tag}</span>
                </div>
                <p className="mt-3 text-[15px] leading-relaxed text-muted">{c.text}</p>
              </article>
            ))}
          </div>
        </Section>

        <Section id="case" title={dict.case.title} subtitle={dict.case.name} tone="tint">
          <div className="ui-card reveal rounded-3xl p-7 md:p-10" data-reveal>
            <div className="grid gap-6 md:grid-cols-3">
              <article className="ui-card h-full rounded-2xl border border-line/70 bg-white p-5">
                <div className="text-xs uppercase tracking-[0.12em] text-muted">{dict.case.goalTitle}</div>
                <p className="mt-2 text-[15px] leading-relaxed text-muted">{dict.case.goal}</p>
              </article>
              <article className="ui-card h-full rounded-2xl border border-line/70 bg-white p-5">
                <div className="text-xs uppercase tracking-[0.12em] text-muted">{dict.case.doneTitle}</div>
                <p className="mt-2 text-[15px] leading-relaxed text-muted">{dict.case.done}</p>
              </article>
              <article className="ui-card h-full rounded-2xl border border-line/70 bg-white p-5">
                <div className="text-xs uppercase tracking-[0.12em] text-muted">{dict.case.impactTitle}</div>
                <p className="mt-2 text-[15px] leading-relaxed text-muted">{dict.case.impact}</p>
              </article>
            </div>
          </div>
        </Section>

        <Section id="process" title={dict.process.title} tone="muted">
          <div className="grid gap-4 md:grid-cols-4">
            {dict.process.steps.map((s: any, idx: number) => (
              <article
                key={idx}
                className={`ui-card ui-card-hover ${idx % 2 ? "ui-card-muted" : ""} reveal h-full rounded-2xl p-6 ${idx === 1 ? "reveal-delay-1" : idx > 1 ? "reveal-delay-2" : ""}`}
                data-reveal
              >
                <div className="inline-flex rounded-full border border-electric/35 bg-electric/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-electric">Step {idx + 1}</div>
                <div className="display-font mt-4 text-xl font-semibold">{s.title}</div>
                <p className="mt-2 text-[15px] leading-relaxed text-muted">{s.text}</p>
              </article>
            ))}
          </div>
        </Section>

        <Section id="faq" title={dict.faq.title}>
          <div className="space-y-3">
            {dict.faq.items.map((it: any, idx: number) => (
              <details key={idx} className="faq-item reveal overflow-hidden" data-reveal>
                <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 font-medium">
                  <span>{it.q}</span>
                  <span className="faq-marker" />
                </summary>
                <p className="px-5 pb-5 text-[15px] leading-relaxed text-muted">{it.a}</p>
              </details>
            ))}
          </div>
        </Section>

        <Section id="contacts" title={dict.contact.title} subtitle={dict.contact.subtitle} tone="tint">
          <div ref={contactsRef}>
            <div className="grid items-start gap-6 md:grid-cols-12">
              <div className="ui-card reveal rounded-3xl p-6 md:col-span-7" data-reveal>
                {status === "sent" ? (
                  <div className="py-2">
                    <div className="flex items-start justify-between gap-4">
                      <div><h3 className="display-font text-2xl font-semibold tracking-tight">{dict.contact.successTitle}</h3><p className="mt-3 text-muted">{dict.contact.successText}</p></div>
                      <div className="h-11 w-11 rounded-xl border border-electric/40 bg-white flex items-center justify-center"><span className="text-electric text-lg">✓</span></div>
                    </div>
                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                      <a href={waDraftHref} target="_blank" rel="noreferrer" className="cta-button-shine inline-flex items-center justify-center rounded-full bg-electric px-6 py-3 text-sm font-semibold text-white shadow-soft hover:opacity-95 transition">{dict.contact.successWhatsapp}</a>
                      <a href={`mailto:${email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(buildWhatsAppText(locale, { ...form, utm }))}`} className="inline-flex items-center justify-center rounded-full border border-line bg-white px-6 py-3 text-sm font-semibold hover:border-electric transition">{dict.contact.successEmail}</a>
                    </div>
                    <button type="button" onClick={() => { setStatus("idle"); setForm({ name: "", contact: "", message: "", timeline: "", budget: "", projectType: "both", hp: "" }); }} className="mt-4 inline-flex w-full items-center justify-center rounded-full border border-line bg-white px-6 py-3 text-sm font-semibold hover:border-electric transition">{dict.contact.successAnother}</button>
                  </div>
                ) : (
                  <form onSubmit={submit} className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="block text-sm text-muted">{dict.contact.name}</label>
                        <div className="input-shell">
                          <input className="h-12 w-full bg-transparent px-4 text-fg outline-none" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm text-muted">{dict.contact.contact}</label>
                        <div className="input-shell">
                          <input className="h-12 w-full bg-transparent px-4 text-fg outline-none" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} required />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm text-muted">{dict.contact.message}</label>
                      <div className="input-shell">
                        <textarea className="min-h-32 w-full resize-y bg-transparent px-4 py-3 text-fg outline-none" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-3 md:items-end">
                      <div className="flex h-full flex-col gap-2">
                        <label className="block text-sm leading-5 text-muted md:min-h-10">{dict.contact.projectType}</label>
                        <div className="mt-auto">
                          <Segmented value={form.projectType} onChange={(v) => setForm({ ...form, projectType: v })} options={[{ value: "web", label: dict.contact["projectType.web"] }, { value: "mobile", label: dict.contact["projectType.mobile"] }, { value: "both", label: dict.contact["projectType.both"] }]} />
                        </div>
                      </div>
                      <div className="flex h-full flex-col gap-2">
                        <label className="block text-sm leading-5 text-muted md:min-h-10">{dict.contact.timeline}</label>
                        <div className="input-shell mt-auto">
                          <input className="h-12 w-full bg-transparent px-4 text-fg outline-none" value={form.timeline} onChange={(e) => setForm({ ...form, timeline: e.target.value })} />
                        </div>
                      </div>
                      <div className="flex h-full flex-col gap-2">
                        <label className="block text-sm leading-5 text-muted md:min-h-10">{dict.contact.budget}</label>
                        <div className="input-shell mt-auto">
                          <input className="h-12 w-full bg-transparent px-4 text-fg outline-none" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} />
                        </div>
                      </div>
                    </div>
                    <div className="hidden" aria-hidden><label>Company</label><input value={form.hp} onChange={(e) => setForm({ ...form, hp: e.target.value })} autoComplete="off" tabIndex={-1} /></div>
                    <button type="submit" disabled={status === "sending" || cooldown} className="cta-button-shine relative w-full overflow-hidden rounded-full bg-electric px-6 py-3 text-sm font-semibold text-white shadow-soft transition hover:opacity-95 disabled:opacity-70">
                      <span className={status === "sending" ? "opacity-0" : "opacity-100"}>{dict.contact.send}</span>
                      {status === "sending" ? <span className="absolute inset-0 flex items-center justify-center gap-2"><span className="inline-block h-4 w-4 rounded-full border-2 border-deep/30 border-t-deep animate-spin" /><span>{dict.contact.sending}</span></span> : null}
                      {cooldown && status !== "sending" ? <span className="absolute inset-0 flex items-center justify-center bg-white/30 backdrop-blur-[1px]"><span className="text-slate-700">{dict.contact.sending}</span></span> : null}
                    </button>
                    {status === "failed" ? <><p className="text-sm text-red-600">{dict.contact.failed}</p><a href={waDraftHref} target="_blank" rel="noreferrer" className="mt-2 inline-flex w-full items-center justify-center rounded-full border border-line bg-white px-6 py-3 text-sm font-semibold hover:border-electric transition">{dict.contact.whatsappFallback}</a></> : null}
                  </form>
                )}
              </div>

              <aside className="ui-card ui-card-muted reveal rounded-3xl p-6 md:col-span-5" data-reveal>
                <div className="text-xs uppercase tracking-[0.14em] text-electric">{dict.contact.directTag}</div>
                <h3 className="display-font mt-2 text-2xl font-semibold">{dict.contact.directTitle}</h3>
                <p className="mt-2 text-muted">{dict.contact.directText}</p>
                <div className="mt-5 space-y-3 text-sm">
                  <a className="block rounded-xl border border-line bg-white px-4 py-3 transition hover:border-electric" href={waDraftHref} target="_blank" rel="noreferrer">{dict.contact.directWhatsapp}: {waPhone}</a>
                  <a className="block rounded-xl border border-line bg-white px-4 py-3 transition hover:border-electric" href={tgHref} target="_blank" rel="noreferrer">{dict.contact.directTelegram}: @bitx_kg</a>
                  <a className="block rounded-xl border border-line bg-white px-4 py-3 transition hover:border-electric" href={`mailto:${email}`}>{dict.contact.directEmail}: {email}</a>
                </div>
                {checkpoints.length ? (
                  <div className="mt-6 rounded-2xl border border-line bg-white p-4">
                    <div className="text-xs uppercase tracking-[0.12em] text-muted">{dict.contact.checkTitle}</div>
                    <ul className="mt-3 space-y-2 text-sm text-muted">
                      {checkpoints.map((step: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2"><span className="mt-[0.4rem] inline-block h-2 w-2 rounded-full bg-electric" /><span>{step}</span></li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </aside>
            </div>
          </div>
        </Section>
      </Container>

      <Footer title={dict.footer.title} waLabel={dict.footer.wa} tgLabel={dict.footer.tg} emailLabel={dict.footer.email} waHref={waHeroHref} tgHref={tgHref} email={email} />
      <MobileCTA locale={locale} waPhone={waPhone} labels={{ primary: dict.hero.ctaPrimary, whatsapp: dict.hero.ctaWhatsapp }} />
    </div>
  );
}

