export type UTM = Partial<{
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_term: string;
  utm_content: string;
  gclid: string;
  fbclid: string;
}>;

export const UTM_COOKIE = "bitx_utm";

export function decodeUtmCookie(value: string | undefined): UTM | null {
  if (!value) return null;
  try {
    return JSON.parse(decodeURIComponent(value)) as UTM;
  } catch {
    return null;
  }
}
