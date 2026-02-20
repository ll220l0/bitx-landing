type GtagFn = (...args: any[]) => void;

declare global {
  interface Window {
    gtag?: GtagFn;
  }
}

export function gaEvent(name: string, params?: Record<string, any>) {
  if (typeof window === "undefined") return;
  const gtag = window.gtag;
  if (!gtag) return;
  gtag("event", name, params ?? {});
}
