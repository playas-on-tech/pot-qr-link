import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import ClaimForm from "./ClaimForm";

type Link = { label: string; url: string };

type Props = { params: Promise<{ id: string }> };

const BG = "#b8e8f4";

function PlayasonFooter() {
  return (
    <div className="mt-6 pb-6 flex justify-center">
      <a
        href="https://playasontech.com"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-xs text-gray-400 hover:text-gray-600 transition-colors underline"
      >
        <span>playasontech.com</span>
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
        className="absolute bottom-0 left-0 right-0 h-20"
        style={{ background: `linear-gradient(to bottom, transparent, ${BG})` }}
      />
    </div>
  );
}

export default async function CardPage({ params }: Props) {
  const { id } = await params;
  const card = await db.card.findUnique({ where: { id } });
  if (!card) notFound();

  if (!card.claimed) {
    return (
      <main className="min-h-screen" style={{ background: BG }}>
        <Banner />
        <div className="flex justify-center px-4 pt-6 pb-8">
          <div className="card w-full max-w-lg">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Set up your card</h1>
              <p className="text-gray-500 text-sm mt-1">
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
                links: (card.links as { label: string; url: string }[]) ?? [],
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

  return (
    <main className="min-h-screen" style={{ background: BG }}>
      <Banner />
      <div className="flex justify-center px-4 pb-8">
        <div className="w-full max-w-sm">
          {/* Avatar overlaps the banner fade */}
          <div className="relative w-28 h-28 mx-auto -mt-6 mb-4 drop-shadow-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://playasontech.com/assets/app-icon.webp"
              alt="Playasontech"
              className="w-28 h-28 rounded-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              {card.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`/c/${id}/photo`}
                  alt={`${card.name} ${card.lastName}`}
                  className="w-16 h-16 rounded-full object-cover ring-2 ring-white"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-indigo-600 text-white text-xl font-bold flex items-center justify-center ring-2 ring-white">
                  {initials}
                </div>
              )}
            </div>
          </div>

          <div className="card text-center">
            <h1 className="text-2xl font-bold text-gray-900">
              {card.name} {card.lastName}
            </h1>
            {(card.jobTitle || card.company) && (
              <p className="text-gray-500 mt-1 text-sm">
                {[card.jobTitle, card.company].filter(Boolean).join(" · ")}
              </p>
            )}

            {(card.phone || card.email) && (
              <div className="mt-4 space-y-1 text-sm text-gray-600">
                {card.phone && (
                  <p>
                    <a href={`tel:${card.phone}`} className="hover:text-indigo-600">
                      {card.phone}
                    </a>
                  </p>
                )}
                {card.email && (
                  <p>
                    <a href={`mailto:${card.email}`} className="hover:text-indigo-600">
                      {card.email}
                    </a>
                  </p>
                )}
              </div>
            )}

            {links.length > 0 && (
              <div className="mt-6 space-y-2">
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

            <a
              href={`/c/${id}/vcard`}
              className="btn-primary mt-6 inline-block w-full"
              download
            >
              Save contact
            </a>
          </div>
          <PlayasonFooter />
        </div>
      </div>
    </main>
  );
}
