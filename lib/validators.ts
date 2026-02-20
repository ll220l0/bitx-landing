export function isEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
}

export function safeText(s: unknown, max = 500) {
  const v = String(s ?? "").trim();
  return v.length > max ? v.slice(0, max) : v;
}
