import { getPolicy } from "../../../app/actions/policies";
import PolicyEditor from "../components/PolicyEditor";

export const dynamic = "force-dynamic";

export default async function AdminTermsPage() {
  const policy = await getPolicy("terms-and-conditions");
  return <PolicyEditor initialPolicy={policy} />;
}
