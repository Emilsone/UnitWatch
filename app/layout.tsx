import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UnitWatch — Never Run Out of Light",
  description:
    "Track your Nigerian prepaid electricity meter units remotely. Get alerts before your light goes out.",
  keywords: "prepaid meter, Nigeria, electricity units, NEPA, DisCo, kWh tracker",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
