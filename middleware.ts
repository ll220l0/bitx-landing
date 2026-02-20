import { NextRequest, NextResponse } from "next/server";

const PUBLIC_FILE = /\.(.*)$/;

const LOCALES = ["ru", "en"] as const;
type Locale = (typeof LOCALES)[number];

const DEFAULT_LOCALE: Locale = "ru";
const LOCALE_COOKIE = "bitx_locale";

const UTM_COOKIE = "bitx_utm";
const ATTR_COOKIE = "bitx_attr";
const CLIENT_ID_COOKIE = "bitx_cid";

function getLocaleFromPath(pathname: string): Locale | null {
  const seg = pathname.split("/")[1];
  return (LOCALES as readonly string[]).includes(seg) ? (seg as Locale) : null;
}

function pickFromAcceptLanguage(header: string | null): Locale | null {
  if (!header) return null;
  const v = header.toLowerCase();
  return v.includes("en") ? "en" : null;
}

function captureUTM(req: NextRequest, res: NextResponse) {
  const sp = req.nextUrl.searchParams;
  const utmKeys = ["utm_source","utm_medium","utm_campaign","utm_term","utm_content","gclid","fbclid"];
  const utm: Record<string, string> = {};

  utmKeys.forEach((k) => {
    const v = sp.get(k);
    if (v && v.trim()) utm[k] = v.trim().slice(0, 120);
  });

  if (Object.keys(utm).length > 0) {
    res.cookies.set(UTM_COOKIE, encodeURIComponent(JSON.stringify(utm)), {
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: "lax"
    });
  }
}

function captureAttribution(req: NextRequest, res: NextResponse) {
  const now = new Date().toISOString();
  const existing = req.cookies.get(ATTR_COOKIE)?.value;

  let attr: any = null;
  try {
    attr = existing ? JSON.parse(decodeURIComponent(existing)) : null;
  } catch {
    attr = null;
  }

  const landing = `${req.nextUrl.pathname}${req.nextUrl.search ? req.nextUrl.search : ""}`;
  const ref = req.headers.get("referer") || "";

  if (!attr?.first_seen_ts) {
    attr = {
      ...(attr || {}),
      landing_page: landing,
      referrer: ref,
      first_seen_ts: now
    };
  }

  attr = { ...(attr || {}), last_seen_ts: now };

  res.cookies.set(ATTR_COOKIE, encodeURIComponent(JSON.stringify(attr)), {
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    sameSite: "lax"
  });
}

function ensureClientId(req: NextRequest, res: NextResponse) {
  const existingCid = req.cookies.get(CLIENT_ID_COOKIE)?.value;
  if (!existingCid) {
    const cid =
      (globalThis.crypto as any)?.randomUUID?.() ??
      `${Date.now()}_${Math.random().toString(16).slice(2)}`;

    res.cookies.set(CLIENT_ID_COOKIE, cid, {
      path: "/",
      maxAge: 60 * 60 * 24 * 180,
      sameSite: "lax"
    });
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon") ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  const inPath = getLocaleFromPath(pathname);

  // If already /ru or /en -> set locale cookie + capture attribution/utm/cid
  if (inPath) {
    const res = NextResponse.next();

    res.cookies.set(LOCALE_COOKIE, inPath, {
      path: "/",
      maxAge: 60 * 60 * 24 * 180,
      sameSite: "lax"
    });

    captureUTM(req, res);
    captureAttribution(req, res);
    ensureClientId(req, res);

    return res;
  }

  // URL without locale -> choose locale by cookie > accept-language > default
  const cookieLocale = req.cookies.get(LOCALE_COOKIE)?.value as Locale | undefined;
  const acceptLocale = pickFromAcceptLanguage(req.headers.get("accept-language"));

  const locale: Locale =
    (cookieLocale && (LOCALES as readonly string[]).includes(cookieLocale)) ? cookieLocale
    : (acceptLocale ?? DEFAULT_LOCALE);

  const url = req.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;

  const res = NextResponse.redirect(url);

  // Save chosen locale (so user doesn't bounce)
  res.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 180,
    sameSite: "lax"
  });

  captureUTM(req, res);
  captureAttribution(req, res);
  ensureClientId(req, res);

  return res;
}

export const config = {
  matcher: ["/((?!_next).*)"]
};
