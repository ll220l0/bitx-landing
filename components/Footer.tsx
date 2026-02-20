import Container from "./Container";
import BrandLogo from "./BrandLogo";

export default function Footer({
  title,
  waLabel,
  tgLabel,
  emailLabel,
  waHref,
  tgHref,
  email
}: {
  title: string;
  waLabel: string;
  tgLabel: string;
  emailLabel: string;
  waHref: string;
  tgHref: string;
  email: string;
}) {
  return (
    <footer className="surface-blur border-t border-line/80 py-10">
      <Container>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="text-fg">
              <BrandLogo className="h-7 w-auto" />
            </div>
            <p className="mt-2 text-sm text-muted">{title}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 text-sm">
            <a className="rounded-xl border border-line bg-white px-4 py-2 hover:border-electric transition" href={waHref} target="_blank" rel="noreferrer">
              {waLabel}
            </a>
            <a className="rounded-xl border border-line bg-white px-4 py-2 hover:border-electric transition" href={tgHref} target="_blank" rel="noreferrer">
              {tgLabel}
            </a>
            <a className="rounded-xl border border-line bg-white px-4 py-2 hover:border-electric transition" href={`mailto:${email}`}>
              {emailLabel}: {email}
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
}
