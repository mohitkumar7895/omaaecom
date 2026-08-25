import { getPolicy } from "../actions/policies";
import PolicyPageView from "../components/PolicyPageView";
import { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Privacy Policy - OMAA Company",
  description: "Learn how OMAA Company collects, uses, and protects your information.",
};

export default async function PrivacyPolicyPage() {
  const policy = await getPolicy("privacy-policy");
  return <PolicyPageView policy={policy} />;
}
