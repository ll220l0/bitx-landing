import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

import { safeText, isEmail } from "@/lib/validators";
import { formatLead, type LeadPayload } from "@/lib/lead";
import { hitRateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";

async function sendToTelegram(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) return { ok: false, reason: "telegram_not_configured" };

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      disable_web_page_preview: true
    })
  });

  if (!res.ok) return { ok: false, reason: "telegram_request_failed" };
  return { ok: true };
}

async function sendToEmail(subject: string, text: string) {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const to = process.env.LEADS_TO_EMAIL;

  if (!host || !user || !pass || !to) return { ok: false, reason: "smtp_not_configured" };

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });

  const from = process.env.LEADS_FROM_EMAIL || user;

  await transporter.sendMail({
    from,
    to,
    subject,
    text
  });

  return { ok: true };
}

export async function POST(req: Request) {
  try {
    const data = (await req.json()) as any;

    // Honeypot (bots)
    const hp = safeText(data.hp, 200);
    if (hp) {
      // pretend success to avoid training bots
      return NextResponse.json({ ok: true, delivered: { telegram: false, email: false } });
    }

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const clientId = safeText(data.clientId, 80) || "no_cid";

    // Rate limit: 5 / 10 minutes per (clientId + ip)
    const key = `lead:${clientId}:${ip}`;
    const rl = hitRateLimit(key, 5, 10 * 60 * 1000);
    if (!rl.ok) {
      return NextResponse.json(
        { ok: false, error: "rate_limited", resetAt: rl.resetAt },
        { status: 429 }
      );
    }

    // Project type normalization
    const ptRaw = safeText(data.projectType, 20).toLowerCase();
    const projectType =
      ptRaw === "web" ? "web" :
      ptRaw === "mobile" ? "mobile" :
      ptRaw === "both" ? "both" :
      undefined;

    // UTM normalization
    const utmRaw = data.utm;
    const utm =
      utmRaw && typeof utmRaw === "object"
        ? Object.fromEntries(
            Object.entries(utmRaw)
              .filter(([_, v]) => typeof v === "string" && v.trim())
              .map(([k, v]) => [k, String(v).trim().slice(0, 120)])
          )
        : undefined;

    // Attribution normalization
    const attrRaw = data.attribution;
    const attribution =
      attrRaw && typeof attrRaw === "object"
        ? Object.fromEntries(
            Object.entries(attrRaw)
              .filter(([_, v]) => typeof v === "string" && v.trim())
              .map(([k, v]) => [k, String(v).trim().slice(0, 300)])
          )
        : undefined;

    const lead: LeadPayload = {
      name: safeText(data.name, 120),
      contact: safeText(data.contact, 200),
      message: safeText(data.message, 1200),
      timeline: safeText(data.timeline, 120),
      budget: safeText(data.budget, 120),
      projectType,
      utm,
      attribution,
      clientId: clientId || undefined,
      locale: (data.locale === "en" ? "en" : "ru")
    };

    if (lead.name.length < 2 || lead.contact.length < 3 || lead.message.length < 5) {
      return NextResponse.json({ ok: false, error: "validation_failed" }, { status: 400 });
    }

    if (lead.contact.includes("@") && !isEmail(lead.contact)) {
      return NextResponse.json({ ok: false, error: "bad_email" }, { status: 400 });
    }

    const text = formatLead(lead);

    const [tg, mail] = await Promise.allSettled([
      sendToTelegram(text),
      sendToEmail("BITX — New lead", text)
    ]);

    const tgOk = tg.status === "fulfilled" && (tg.value as any).ok === true;
    const mailOk = mail.status === "fulfilled" && (mail.value as any).ok === true;

    if (!tgOk && !mailOk) {
      return NextResponse.json(
        { ok: false, error: "no_delivery", hint: "Configure TELEGRAM_* or SMTP_* env vars." },
        { status: 501 }
      );
    }

    return NextResponse.json({ ok: true, delivered: { telegram: tgOk, email: mailOk } });
  } catch {
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
