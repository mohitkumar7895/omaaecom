import ProfessionalRegistrationForm from "../components/ProfessionalRegistrationForm";
import { Metadata } from "next";
import { getSiteUrl } from "@/lib/site-url";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "Professional Registration - OMAA Company",
  description: "Register as a service technician or professional partner with OMAA Company.",
  alternates: { canonical: `${siteUrl}/professional-registration` },
};

export default function RegistrationFormPhpPage() {
  return <ProfessionalRegistrationForm />;
}
