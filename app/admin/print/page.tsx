import { verifySession } from "@/lib/auth";
import { db } from "@/lib/db";
import { qrDataUrl } from "@/lib/qr";
import { redirect } from "next/navigation";
import PrintButton from "./PrintButton";

export default async function PrintPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const authed = await verifySession();
  if (!authed) redirect("/admin");

  const { id } = await searchParams;

  const where = id ? { id } : { claimed: false };
  const unclaimed = await db.card.findMany({
    where,
    orderBy: { createdAt: "asc" },
  });

  const cards = await Promise.all(
    unclaimed.map(async (c) => ({ id: c.id, qr: await qrDataUrl(c.id) }))
  );

  return (
    <>
      <style>{`
        @page { size: 5cm 2.5cm; margin: 0 }
        @media print {
          .no-print { display: none }
          body { background: white; margin: 0 }
          .qr-card { border: none; outline: 1px dotted #e5e7eb }
        }
        .grid { display: flex; flex-wrap: wrap; gap: 8px; }
        .qr-card { width: 5cm; height: 2.5cm; border: 1px solid #e5e7eb; display: flex; align-items: center; justify-content: flex-end; box-sizing: border-box; overflow: hidden }
        .qr-card img { width: 2.5cm; height: 2.5cm; padding: 0.5cm; box-sizing: border-box; image-rendering: pixelated; display: block }
      `}</style>
      <div className="no-print" style={{ padding: "16px" }}>
        <PrintButton />
        <a href="/admin">← Back to admin</a>
        <p style={{ marginTop: 8, color: "#6b7280", fontSize: 14 }}>
          {id ? "1 QR code" : `${cards.length} unclaimed QR codes`}
        </p>
      </div>
      <div className="grid">
        {cards.map((c) => (
          <div key={c.id} className="qr-card">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={c.qr} alt="QR" />
          </div>
        ))}
      </div>
    </>
  );
}
