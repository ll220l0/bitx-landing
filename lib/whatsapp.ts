import type { Locale } from "@/lib/i18n";

type LeadDraft = {
  name?: string;
  contact?: string;
  message?: string;
  timeline?: string;
  budget?: string;
  projectType?: "web" | "mobile" | "both";
  utm?: Record<string, string> | null;
};

export function buildWhatsAppText(locale: Locale, draft?: LeadDraft) {
  const name = (draft?.name || "").trim();
  const contact = (draft?.contact || "").trim();
  const message = (draft?.message || "").trim();
  const timeline = (draft?.timeline || "").trim();
  const budget = (draft?.budget || "").trim();
  const pt = draft?.projectType;

  const ptLabel =
    pt === "web" ? "Web" :
    pt === "mobile" ? "Mobile" :
    pt === "both" ? "Web + Mobile" :
    "";

  const utmLine = draft?.utm
    ? Object.entries(draft.utm).filter(([, v]) => v).map(([k, v]) => `${k}=${v}`).join("&")
    : "";

  if (locale === "en") {
    return [
      "Hello BITX! I’d like a project estimate.",
      pt ? `Project type: ${ptLabel}` : null,
      name ? `Name: ${name}` : null,
      contact ? `Contact: ${contact}` : null,
      message ? `Request: ${message}` : null,
      timeline ? `Timeline: ${timeline}` : null,
      budget ? `Budget: ${budget}` : null,
      utmLine ? `UTM: ${utmLine}` : null
    ].filter(Boolean).join("\n");
  }

  return [
    "Здравствуйте, BITX! Хочу оценку проекта.",
    pt ? `Тип проекта: ${ptLabel}` : null,
    name ? `Имя: ${name}` : null,
    contact ? `Контакт: ${contact}` : null,
    message ? `Задача: ${message}` : null,
    timeline ? `Сроки: ${timeline}` : null,
    budget ? `Бюджет: ${budget}` : null,
    utmLine ? `UTM: ${utmLine}` : null
  ].filter(Boolean).join("\n");
}

export function buildWhatsAppLink(phoneE164: string, text: string) {
  const cleaned = phoneE164.replace(/[^\d]/g, "");
  const encoded = encodeURIComponent(text);
  return `https://wa.me/${cleaned}?text=${encoded}`;
}
