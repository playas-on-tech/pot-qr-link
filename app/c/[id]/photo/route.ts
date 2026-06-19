import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const card = await db.card.findUnique({ where: { id }, select: { photo: true, photoMime: true } });
  if (!card?.photo) return new NextResponse("Not found", { status: 404 });

  return new NextResponse(card.photo.buffer as ArrayBuffer, {
    headers: {
      "Content-Type": card.photoMime ?? "image/jpeg",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
