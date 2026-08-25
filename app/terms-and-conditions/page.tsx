import { getPolicy } from "../actions/policies";
import PolicyPageView from "../components/PolicyPageView";
import { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Terms & Conditions - OMAA Company",
  description: "Terms and conditions for using OMAA Company's home appliance repair and maintenance services.",
};

export default async function TermsAndConditionsPage() {
  const policy = await getPolicy("terms-and-conditions");
  return <PolicyPageView policy={policy} />;
}
