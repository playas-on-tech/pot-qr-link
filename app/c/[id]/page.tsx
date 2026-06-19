import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { qrDataUrl } from "@/lib/qr";
import ClaimForm from "./ClaimForm";
import type { Link } from "./actions";

type Props = { params: Promise<{ id: string }> };

const BG = "#b8e8f4";
const PAGE_BG = `linear-gradient(to bottom, ${BG}, #eaf7fc 38%, #ffffff)`;

function PlayasonFooter() {
  return (
    <div className="mt-8 pb-8 flex justify-center">
      <a
        href="https://playasontech.com"
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs font-medium text-blue-900/40 hover:text-blue-900/70 transition-colors underline underline-offset-2"
      >
        playasontech.com
      </a>
    </div>
  );
}

function Banner() {
  return (
    <div className="relative w-full">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/banner.png" alt="" className="w-full object-cover" />
      <div
        className="absolute bottom-0 left-0 right-0 h-24"
        style={{ background: `linear-gradient(to bottom, transparent, ${BG})` }}
      />
    </div>
  );
}

function Icon({ children, className = "text-blue-500" }: { children: React.ReactNode; className?: string }) {
  return (
    <svg
      width="16" height="16" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round"
      className={`shrink-0 ${className}`}
    >
      {children}
    </svg>
  );
}

function ContactLink({ href, icon, children }: { href: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <a href={href} className="flex items-center justify-center gap-2.5 text-gray-600 hover:text-blue-700 transition-colors">
      {icon}
      {children}
    </a>
  );
}

export default async function CardPage({ params }: Props) {
  const { id } = await params;
  const card = await db.card.findUnique({ where: { id } });
  if (!card) notFound();

  if (!card.claimed) {
    return (
      <main className="min-h-screen" style={{ background: PAGE_BG }}>
        <Banner />
        <div className="flex justify-center px-4 pt-2 pb-8">
          <div className="card w-full max-w-lg">
            <div className="mb-7">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">Set up your card</h1>
              <p className="text-gray-500 text-sm mt-1.5 leading-relaxed">
                Fill in your info. Once saved it&apos;s public and locked — anyone who scans your QR will see it.
              </p>
            </div>
            <ClaimForm
              id={id}
              defaults={{
                name: card.name ?? "",
                lastName: card.lastName ?? "",
                company: card.company ?? "",
                jobTitle: card.jobTitle ?? "",
                phone: card.phone ?? "",
                email: card.email ?? "",
                links: (card.links as Link[]) ?? [],
              }}
            />
          </div>
        </div>
        <PlayasonFooter />
      </main>
    );
  }

  const links = (card.links as Link[]) ?? [];
  const initials = `${card.name?.[0] ?? ""}${card.lastName?.[0] ?? ""}`.toUpperCase();
  const qr = await qrDataUrl(id);

  return (
    <main className="min-h-screen" style={{ background: PAGE_BG }}>
      <Banner />
      <div className="flex justify-center px-4 pb-8">
        <div className="w-full max-w-sm">
          {/* Avatar overlaps the banner fade, brand-gradient ring */}
          <div className="relative w-32 h-32 mx-auto -mt-16 mb-5">
            <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-br from-blue-600 to-cyan-400 shadow-xl shadow-blue-900/20">
              {card.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`/c/${id}/photo`}
                  alt={`${card.name} ${card.lastName}`}
                  className="w-full h-full rounded-full object-cover ring-4 ring-white"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 text-white text-3xl font-bold flex items-center justify-center ring-4 ring-white">
                  {initials}
                </div>
              )}
            </div>
          </div>

          <div className="card text-center">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              {card.name} {card.lastName}
            </h1>
            {(card.jobTitle || card.company) && (
              <p className="text-gray-500 mt-1.5 text-sm font-medium">
                {[card.jobTitle, card.company].filter(Boolean).join(" · ")}
              </p>
            )}

            {(card.phone || card.email) && (
              <div className="mt-5 space-y-2.5 text-sm">
                {card.phone && (
                  <ContactLink href={`tel:${card.phone}`} icon={
                    <Icon><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" /></Icon>
                  }>
                    {card.phone}
                  </ContactLink>
                )}
                {card.email && (
                  <ContactLink href={`mailto:${card.email}`} icon={
                    <Icon><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 5L2 7" /></Icon>
                  }>
                    {card.email}
                  </ContactLink>
                )}
              </div>
            )}

            {links.length > 0 && (
              <div className="mt-6 space-y-2.5">
                {links.map((lk, i) => (
                  <a
                    key={i}
                    href={lk.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-btn"
                  >
                    {lk.label}
                  </a>
                ))}
              </div>
            )}

            <a href={`/c/${id}/vcard`} className="btn-primary mt-6 w-full" download>
              <Icon className="">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M19 8v6M22 11h-6" />
              </Icon>
              Save contact
            </a>
          </div>

          <div className="mt-6 flex flex-col items-center gap-2">
            <div className="rounded-2xl bg-white p-3 shadow-lg shadow-blue-900/5 ring-1 ring-blue-900/5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qr} alt="QR code" className="w-36 h-36" />
            </div>
            <p className="text-xs font-medium text-blue-900/40">Scan to share</p>
          </div>

          <PlayasonFooter />
        </div>
      </div>
    </main>
  );
}
