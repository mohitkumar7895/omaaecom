import ProfessionalRegistrationForm from "../components/ProfessionalRegistrationForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Professional Registration - OMAA Company",
  description: "Register as a service technician or professional partner with OMAA Company.",
};

export default function RegistrationFormPhpPage() {
  return <ProfessionalRegistrationForm />;
}
