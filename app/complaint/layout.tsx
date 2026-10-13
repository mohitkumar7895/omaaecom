import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/site-url";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "Lodge Complaint | OMAA Company",
  description: "Lodge a service complaint with OMAA Company for doorstep appliance repair in Delhi NCR.",
  alternates: { canonical: `${siteUrl}/complaint` },
};

export default function ComplaintLayout({ children }: { children: React.ReactNode }) {
  return children;
}
