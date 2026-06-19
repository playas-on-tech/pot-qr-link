import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

const COOKIE = "admin_session";

function sign(value: string) {
  const secret = process.env.SESSION_SECRET!;
  return createHmac("sha256", secret).update(value).digest("hex");
}

export async function setSession() {
  const sig = sign("admin");
  const store = await cookies();
  store.set(COOKIE, sig, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 hours
    secure: process.env.NODE_ENV === "production",
  });
}

export async function verifySession(): Promise<boolean> {
  const store = await cookies();
  const val = store.get(COOKIE)?.value;
  if (!val) return false;
  const expected = sign("admin");
  try {
    return timingSafeEqual(Buffer.from(val), Buffer.from(expected));
  } catch {
    return false;
  }
}

export async function clearSession() {
  const store = await cookies();
  store.delete(COOKIE);
}
