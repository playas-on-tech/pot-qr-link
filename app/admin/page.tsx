import { verifySession } from "@/lib/auth";
import { db } from "@/lib/db";
import { qrDataUrl } from "@/lib/qr";
import LoginForm from "./LoginForm";
import AdminDashboard from "./AdminDashboard";

const PAGE_SIZE = 25;

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const authed = await verifySession();
  if (!authed) return <LoginForm />;

  const { q = "", page: pageStr = "1" } = await searchParams;
  const page = Math.max(1, parseInt(pageStr) || 1);

  const where = q
    ? {
        claimed: true,
        OR: [
          { name: { contains: q, mode: "insensitive" as const } },
          { lastName: { contains: q, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [raw, total] = await Promise.all([
    db.card.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.card.count({ where }),
  ]);

  const cards = await Promise.all(
    raw.map(async (c) => ({
      id: c.id,
      name: c.name,
      lastName: c.lastName,
      company: c.company,
      claimed: c.claimed,
      createdAt: c.createdAt,
      qrDataUrl: await qrDataUrl(c.id),
      photoDataUrl:
        c.photo && c.photoMime
          ? `data:${c.photoMime};base64,${Buffer.from(c.photo).toString("base64")}`
          : null,
    }))
  );

  return (
    <AdminDashboard
      cards={cards}
      total={total}
      page={page}
      pageSize={PAGE_SIZE}
      q={q}
    />
  );
}
