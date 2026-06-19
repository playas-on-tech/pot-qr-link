"use server";

import { db } from "@/lib/db";
import { setSession, verifySession, clearSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function requireAdmin() {
  const ok = await verifySession();
  if (!ok) redirect("/admin");
}

export async function login(_prev: unknown, formData: FormData) {
  const password = formData.get("password") as string;
  if (password !== process.env.ADMIN_PASSWORD) {
    return { error: "Wrong password" };
  }
  await setSession();
  redirect("/admin");
}

export async function logout() {
  await clearSession();
  redirect("/admin");
}

export async function generateBatch(formData: FormData) {
  await requireAdmin();
  const n = Math.min(500, Math.max(1, parseInt(formData.get("count") as string, 10) || 1));
  await db.card.createMany({ data: Array.from({ length: n }, () => ({})) });
  revalidatePath("/admin");
}

export async function resetCard(id: string) {
  await requireAdmin();
  await db.card.update({
    where: { id },
    data: { claimed: false },
  });
  revalidatePath("/admin");
}

export async function deleteCard(id: string) {
  await requireAdmin();
  await db.card.delete({ where: { id } });
  revalidatePath("/admin");
}

export async function deleteCards(ids: string[]) {
  await requireAdmin();
  await db.card.deleteMany({ where: { id: { in: ids } } });
  revalidatePath("/admin");
}

export async function resetCards(ids: string[]) {
  await requireAdmin();
  await db.card.updateMany({ where: { id: { in: ids } }, data: { claimed: false } });
  revalidatePath("/admin");
}
