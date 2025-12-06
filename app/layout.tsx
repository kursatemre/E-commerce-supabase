import type { Metadata } from "next";
import "./globals.css";
import { GoogleAnalytics, GoogleTagManager, MetaPixel } from "@/components/analytics/GoogleScripts";

export const metadata: Metadata = {
  title: "E-Ticaret - Modern Alışveriş Platformu",
  description: "Next.js ve Supabase ile modern e-ticaret",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body>
        {children}
        <GoogleAnalytics />
        <GoogleTagManager />
        <MetaPixel />
      </body>
    </html>
  );
}
