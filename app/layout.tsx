import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import GlobalLoader from "./components/GlobalLoader";
import OfferMarquee from "./components/OfferMarquee";
import { getSiteSettings } from "./actions/settings";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OMAA",
  description: "OMAA E-Commerce Platform",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <GlobalLoader />
        {settings.offer_enabled && settings.offer_text && (
          <OfferMarquee text={settings.offer_text} />
        )}
        {children}
      </body>
    </html>
  );
}
