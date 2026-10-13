import { getPolicy } from "../actions/policies";
import PolicyPageView from "../components/PolicyPageView";
import { Metadata } from "next";
import { getSiteUrl } from "@/lib/site-url";

export const revalidate = 86400;

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "Privacy Policy - OMAA Company",
  description: "Learn how OMAA Company collects, uses, and protects your information.",
  alternates: { canonical: `${siteUrl}/privacy-policy` },
};

export default async function PrivacyPolicyPage() {
  const policy = await getPolicy("privacy-policy");
  return <PolicyPageView policy={policy} />;
}
