import { isLocale, type Locale } from "@/lib/i18n";
import LandingClient from "./_client";

export default async function Page({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const loc: Locale = isLocale(locale) ? locale : "ru";

  return <LandingClient locale={loc} />;
}
