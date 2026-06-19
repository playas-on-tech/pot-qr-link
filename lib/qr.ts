import QRCode from "qrcode";

export async function qrDataUrl(id: string): Promise<string> {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  return QRCode.toDataURL(`${base}/c/${id}`, { margin: 1, width: 256 });
}
