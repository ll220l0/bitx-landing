export const CLIENT_ID_COOKIE = "bitx_cid";

export function getCookie(name: string) {
  if (typeof document === "undefined") return undefined;
  const m = document.cookie.match(new RegExp(`${name}=([^;]+)`));
  return m?.[1];
}

export function setCookie(name: string, value: string, days = 180) {
  if (typeof document === "undefined") return;
  const maxAge = 60 * 60 * 24 * days;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; samesite=lax`;
}

export function uuidv4() {
  const webCrypto = typeof globalThis !== "undefined" ? globalThis.crypto : undefined;

  if (webCrypto?.randomUUID) {
    return webCrypto.randomUUID();
  }

  const bytes = new Uint8Array(16);
  if (webCrypto?.getRandomValues) {
    webCrypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i += 1) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = [...bytes].map((b) => b.toString(16).padStart(2, "0"));
  return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex.slice(6, 8).join("")}-${hex.slice(8, 10).join("")}-${hex.slice(10, 16).join("")}`;
}
