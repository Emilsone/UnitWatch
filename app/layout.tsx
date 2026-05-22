import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UnitWatch — Never Run Out of Light",
  description:
    "Track your Nigerian prepaid electricity meter units remotely. Get alerts before your light goes out.",
    keywords:
    "Nigerian prepaid meter tracker, electricity unit monitor, NEPA meter app, DisCo electricity tracker, kWh monitoring Nigeria, prepaid electricity alerts, smart meter tracking, electricity usage app Nigeria, meter balance checker, power outage prevention, electricity consumption tracker, UnitWatch",
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
