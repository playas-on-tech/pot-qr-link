import { NextResponse } from "next/server";
import { db } from "@/lib/db";

type Link = { label: string; url: string };

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const card = await db.card.findUnique({ where: { id } });
  if (!card || !card.claimed) return new NextResponse("Not found", { status: 404 });

  const links = (card.links as Link[]) ?? [];
  const urlLines = links.map((lk) => `URL;type=${lk.label}:${lk.url}`).join("\n");
  const photoLine = card.photo
    ? `PHOTO;ENCODING=b;TYPE=${(card.photoMime ?? "image/jpeg").split("/")[1].toUpperCase()}:${card.photo.toString("base64")}`
    : "";

  const vcf = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${card.name} ${card.lastName}`,
    `N:${card.lastName};${card.name};;;`,
    card.company ? `ORG:${card.company}` : "",
    card.jobTitle ? `TITLE:${card.jobTitle}` : "",
    card.phone ? `TEL:${card.phone}` : "",
    card.email ? `EMAIL:${card.email}` : "",
    urlLines,
    photoLine,
    "END:VCARD",
  ]
    .filter(Boolean)
    .join("\n");

  return new NextResponse(vcf, {
    headers: {
      "Content-Type": "text/vcard",
      "Content-Disposition": `attachment; filename="${card.name}-${card.lastName}.vcf"`,
    },
  });
}
