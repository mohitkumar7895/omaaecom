import pool from "../../../lib/db";
import RegistrationRecordsClient, { RegistrationRecord } from "./RegistrationRecordsClient";

export const dynamic = "force-dynamic";

export default async function ManageRegistrationPage() {
  let records: RegistrationRecord[] = [];

  try {
    // Ensure status column exists
    const [rows]: any = await pool.query(
      "SELECT * FROM registration_records ORDER BY created_at DESC LIMIT 300"
    );
    records = JSON.parse(JSON.stringify(rows));
  } catch (error) {
    console.error("Database error in RegistrationRecords:", error);
  }

  return <RegistrationRecordsClient initialRecords={records} />;
}
