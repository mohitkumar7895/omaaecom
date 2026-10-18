import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

interface ReferPageProps {
  searchParams: Promise<{ ref?: string }>;
}

export default async function ReferPage({ searchParams }: ReferPageProps) {
  const params = await searchParams;
  const ref = params?.ref?.trim() || "";

  if (ref) {
    redirect(`/?ref=${encodeURIComponent(ref)}`);
  }

  redirect("/");
}
