import type { UTM } from "@/lib/utm";
import type { Attribution } from "@/lib/attribution";

export type LeadPayload = {
  name: string;
  contact: string;
  message: string;
  timeline?: string;
  budget?: string;
  projectType?: "web" | "mobile" | "both";
  utm?: UTM;
  attribution?: Attribution;
  clientId?: string;
  locale: "ru" | "en";
};

export function formatLead(lead: LeadPayload) {
  const utmLine = lead.utm
    ? Object.entries(lead.utm).filter(([, v]) => v).map(([k, v]) => `${k}=${v}`).join("&")
    : "";

  const attrLine = lead.attribution
    ? Object.entries(lead.attribution).filter(([, v]) => v).map(([k, v]) => `${k}=${v}`).join(" | ")
    : "";

  const lines = [
    `BITX Lead (${lead.locale.toUpperCase()})`,
    lead.clientId ? `ClientId: ${lead.clientId}` : null,
    lead.projectType ? `Project type: ${lead.projectType}` : null,
    utmLine ? `UTM: ${utmLine}` : null,
    attrLine ? `Attribution: ${attrLine}` : null,
    `Name: ${lead.name}`,
    `Contact: ${lead.contact}`,
    `Message: ${lead.message}`,
    lead.timeline ? `Timeline: ${lead.timeline}` : null,
    lead.budget ? `Budget: ${lead.budget}` : null,
    `Source: Landing`,
    `At: ${new Date().toISOString()}`
  ].filter(Boolean);

  return lines.join("\n");
}
