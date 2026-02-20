export type Attribution = Partial<{
  landing_page: string;
  referrer: string;
  first_seen_ts: string;
  last_seen_ts: string;
}>;

export const ATTR_COOKIE = "bitx_attr";

export function decodeAttrCookie(value: string | undefined): Attribution | null {
  if (!value) return null;
  try {
    return JSON.parse(decodeURIComponent(value)) as Attribution;
  } catch {
    return null;
  }
}
