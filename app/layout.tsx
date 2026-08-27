import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import GlobalLoader from "./components/GlobalLoader";
import OfferMarquee from "./components/OfferMarquee";
import RatingReviewModal from "./components/RatingReviewModal";
import { getSiteSettings } from "./actions/settings";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "OMAA Company - Get Home appliances Expert services……..",
  description: "OMAA Company - Get Home appliances Expert services at your doorstep",
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();

  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} font-sans h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#f8f9fa] text-gray-900">
        <GlobalLoader />
        <RatingReviewModal />
        {settings.offer_enabled && settings.offer_text && (
          <OfferMarquee text={settings.offer_text} />
        )}
        {children}
      </body>
    </html>
  );
}
