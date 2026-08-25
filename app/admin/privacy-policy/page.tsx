import { getPolicy } from "../../../app/actions/policies";
import PolicyEditor from "../components/PolicyEditor";

export const dynamic = "force-dynamic";

export default async function AdminPrivacyPolicyPage() {
  const policy = await getPolicy("privacy-policy");
  return <PolicyEditor initialPolicy={policy} />;
}
