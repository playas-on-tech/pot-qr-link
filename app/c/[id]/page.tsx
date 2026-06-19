import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import ClaimForm from "./ClaimForm";

type Link = { label: string; url: string };

type Props = { params: Promise<{ id: string }> };

export default async function CardPage({ params }: Props) {
  const { id } = await params;
  const card = await db.card.findUnique({ where: { id } });
  if (!card) notFound();

  if (!card.claimed) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center p-4">
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
      </main>
    );
  }

  const links = (card.links as Link[]) ?? [];
  const initials = `${card.name?.[0] ?? ""}${card.lastName?.[0] ?? ""}`.toUpperCase();

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center p-4">
      <div className="card w-full max-w-sm text-center">
        {card.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/c/${id}/photo`}
            alt={`${card.name} ${card.lastName}`}
            className="w-20 h-20 rounded-full object-cover mx-auto mb-4"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-indigo-600 text-white text-2xl font-bold flex items-center justify-center mx-auto mb-4">
            {initials}
          </div>
        )}
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
            {card.phone && <p><a href={`tel:${card.phone}`} className="hover:text-indigo-600">{card.phone}</a></p>}
            {card.email && <p><a href={`mailto:${card.email}`} className="hover:text-indigo-600">{card.email}</a></p>}
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
    </main>
  );
}
