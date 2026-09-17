"use server";

import pool from "../../lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { writeFile } from "fs/promises";
import path from "path";
import fs from "fs";

export async function saveKyc(formData: FormData) {
  const userName = formData.get("user_name") as string;
  const panCard = formData.get("pan_card") as string;
  const aadharCard = formData.get("aadhar_card") as string;
  const bankName = formData.get("bank_name") as string;
  const branch = formData.get("branch") as string;
  const accountNumber = formData.get("account_number") as string;
  const ifscCode = formData.get("ifsc_code") as string;
  const cheque = formData.get("cheque") as File | null;

  let chequeUrl = "";

  const uploadDir = path.join(process.cwd(), "public/uploads/kyc");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  if (cheque && cheque.size > 0) {
    const bytes = await cheque.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `${Date.now()}-${cheque.name.replace(/\s+/g, '-')}`;
    const filePath = path.join(uploadDir, fileName);
    await writeFile(filePath, buffer);
    chequeUrl = `/uploads/kyc/${fileName}`;
  }

  try {
    const query = `
      INSERT INTO kyc_records (user_name, pan_card, aadhar_card, bank_name, branch, account_number, ifsc_code, cheque_image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    await pool.query(query, [
      userName, panCard, aadharCard, bankName, branch, accountNumber, ifscCode, chequeUrl
    ]);
  } catch (error) {
    console.error("Error saving KYC:", error);
    return { error: "Failed to save KYC" };
  }

  revalidatePath("/admin/kyc");
  redirect("/admin/kyc");
}
