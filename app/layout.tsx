import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "QR Contact Cards",
  description: "Conference networking cards via QR code",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
