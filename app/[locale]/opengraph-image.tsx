import { ImageResponse } from "next/og";

export const alt = "BITX preview image";
export const size = {
  width: 1200,
  height: 630
};
export const contentType = "image/png";

export default async function OpenGraphImage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isEn = locale === "en";

  const title = isEn
    ? "Product Engineering Studio"
    : "Студия продуктовой разработки";
  const subtitle = isEn
    ? "Web • Mobile • Integrations"
    : "Web • Mobile • Интеграции";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px 64px",
          color: "#08142A",
          background:
            "radial-gradient(900px 360px at 0% -20%, rgba(42, 142, 255, 0.22), transparent 60%), radial-gradient(780px 300px at 100% 0%, rgba(0, 120, 255, 0.18), transparent 58%), linear-gradient(180deg, #F8FBFF 0%, #EEF4FE 100%)"
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <div
            style={{
              fontSize: 56,
              fontWeight: 800,
              letterSpacing: -1.4
            }}
          >
            BITX
          </div>
          <div
            style={{
              fontSize: 24,
              fontWeight: 600,
              color: "#1F5AAE"
            }}
          >
            bitx.kg
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              lineHeight: 1.04,
              letterSpacing: -1.8,
              maxWidth: "88%"
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: 34,
              fontWeight: 500,
              color: "#3A4E6E"
            }}
          >
            {subtitle}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14
          }}
        >
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: 999,
              background: "#0D6EFD"
            }}
          />
          <div
            style={{
              fontSize: 24,
              fontWeight: 600,
              color: "#31507D"
            }}
          >
            Strategy • UX/UI • Engineering
          </div>
        </div>
      </div>
    ),
    {
      ...size
    }
  );
}
