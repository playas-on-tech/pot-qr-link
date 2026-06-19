"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export type Link = { label: string; url: string };

export async function claimCard(id: string, formData: FormData) {
  const card = await db.card.findUnique({ where: { id } });
  if (!card) return { error: "Card not found" };
  if (card.claimed) return { error: "Already claimed" };

  const name = (formData.get("name") as string)?.trim();
  const lastName = (formData.get("lastName") as string)?.trim();
  if (!name || !lastName) return { error: "Name and last name are required" };

  const rawLinks: Link[] = [];
  let i = 0;
  while (formData.get(`link_label_${i}`) !== null) {
    const label = (formData.get(`link_label_${i}`) as string)?.trim();
    const url = (formData.get(`link_url_${i}`) as string)?.trim();
    if (label && url) rawLinks.push({ label, url });
    i++;
  }

  const photoFile = formData.get("photo") as File | null;
  let photo: Buffer | null = null;
  let photoMime: string | null = null;
  if (photoFile && photoFile.size > 0) {
    if (photoFile.size > 5 * 1024 * 1024) return { error: "Photo must be under 5 MB" };
    photo = Buffer.from(await photoFile.arrayBuffer());
    photoMime = photoFile.type || "image/jpeg";
  }

  await db.card.update({
    where: { id },
    data: {
      name,
      lastName,
      company: (formData.get("company") as string)?.trim() || null,
      jobTitle: (formData.get("jobTitle") as string)?.trim() || null,
      phone: (formData.get("phone") as string)?.trim() || null,
      email: (formData.get("email") as string)?.trim() || null,
      links: rawLinks,
      ...(photo ? { photo, photoMime } : {}),
      claimed: true,
    },
  });

  revalidatePath(`/c/${id}`);
  return { success: true };
}
