import "@/styles/globals.css";
import Script from "next/script";
import type { Metadata, Viewport } from "next";
import { use } from "react";
import { Exo_2, Manrope } from "next/font/google";
import { getDict, isLocale, type Locale } from "@/lib/i18n";

const bodyFont = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
  display: "swap"
});

const displayFont = Exo_2({
  subsets: ["latin", "cyrillic"],
  variable: "--font-display",
  weight: ["600", "700", "800"],
  display: "swap"
});

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const loc: Locale = isLocale(locale) ? locale : "ru";
  const dict = await getDict(loc);
  const localePath = `/${loc}`;
  const ogImagePath = `${localePath}/opengraph-image`;

  return {
    title: dict.meta.title,
    description: dict.meta.description,
    metadataBase: new URL("https://bitx.kg"),
    alternates: {
      canonical: localePath,
      languages: {
        ru: "/ru",
        en: "/en"
      }
    },
    openGraph: {
      title: dict.meta.title,
      description: dict.meta.description,
      url: localePath,
      siteName: "BITX",
      locale: loc === "en" ? "en_US" : "ru_RU",
      images: [
        {
          url: ogImagePath,
          width: 1200,
          height: 630,
          alt: dict.meta.title
        }
      ],
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title: dict.meta.title,
      description: dict.meta.description,
      images: [ogImagePath]
    }
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover"
};

export default function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  const loc: Locale = isLocale(locale) ? locale : "ru";
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang={loc} className={`${bodyFont.variable} ${displayFont.variable}`}>
      <head>
        <meta name="color-scheme" content="light" />
        <meta name="supported-color-schemes" content="light" />
      </head>
      {gaId ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script id="ga4" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              window.gtag = gtag;
              gtag('js', new Date());
              gtag('config', '${gaId}', { anonymize_ip: true });
            `}
          </Script>
        </>
      ) : null}
      <body>{children}</body>
    </html>
  );
}
