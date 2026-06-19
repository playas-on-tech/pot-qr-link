import { verifySession } from "@/lib/auth";
import { db } from "@/lib/db";
import { qrDataUrl } from "@/lib/qr";
import LoginForm from "./LoginForm";
import AdminDashboard from "./AdminDashboard";

export default async function AdminPage() {
  const authed = await verifySession();
  if (!authed) return <LoginForm />;

  const raw = await db.card.findMany({ orderBy: { createdAt: "desc" } });
  const cards = await Promise.all(
    raw.map(async (c) => ({
      id: c.id,
      name: c.name,
      lastName: c.lastName,
      company: c.company,
      claimed: c.claimed,
      createdAt: c.createdAt,
      qrDataUrl: await qrDataUrl(c.id),
      photoDataUrl: c.photo && c.photoMime
        ? `data:${c.photoMime};base64,${Buffer.from(c.photo).toString("base64")}`
        : null,
    }))
  );

  return <AdminDashboard cards={cards} />;
}
