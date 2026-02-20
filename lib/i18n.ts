export const locales = ["ru", "en"] as const;
export type Locale = (typeof locales)[number];

export function isLocale(v: string): v is Locale {
  return (locales as readonly string[]).includes(v);
}

export async function getDict(locale: Locale) {
  const dict = await import(`../content/${locale}.json`);
  return dict.default as Record<string, any>;
}
