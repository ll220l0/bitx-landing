type Entry = { count: number; resetAt: number };

const store = new Map<string, Entry>();

export function hitRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const cur = store.get(key);

  if (!cur || now > cur.resetAt) {
    const next: Entry = { count: 1, resetAt: now + windowMs };
    store.set(key, next);
    return { ok: true, remaining: limit - 1, resetAt: next.resetAt };
  }

  if (cur.count >= limit) {
    return { ok: false, remaining: 0, resetAt: cur.resetAt };
  }

  cur.count += 1;
  store.set(key, cur);
  return { ok: true, remaining: limit - cur.count, resetAt: cur.resetAt };
}
