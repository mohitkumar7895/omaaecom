"use server";

import pool from "../../lib/db";
import { revalidatePath } from "next/cache";

export interface PolicySection {
  heading: string;
  content?: string;
  bullets?: string[];
}

export interface PolicyData {
  id: string;
  title: string;
  subtitle: string;
  last_updated: string;
  contact_email: string;
  sections: PolicySection[];
  updated_at?: string;
}

const DEFAULT_POLICIES: Record<string, PolicyData> = {
  "privacy-policy": {
    id: "privacy-policy",
    title: "Privacy Policy",
    subtitle: "How we collect, use, and protect your information",
    last_updated: "January 2026",
    contact_email: "support@omaacompany.com",
    sections: [
      {
        heading: "1. Information We Collect",
        bullets: [
          "Personal Information: Name, phone number, email address",
          "Service Details: Address, service location, appliance information",
          "Booking Information: Service date, time preferences",
        ],
      },
      {
        heading: "2. How We Use Your Information",
        bullets: [
          "Booking and scheduling services",
          "Customer support and service-related communication",
          "Processing payments and managing transactions",
        ],
      },
      {
        heading: "3. Information Sharing",
        bullets: [
          "We do not sell your personal information to third parties",
          "We may share information only as required to deliver our services",
        ],
      },
      {
        heading: "4. Data Security",
        bullets: [
          "Customer data is stored securely using industry-standard security measures",
          "Access to personal information is restricted to authorized personnel only",
        ],
      },
      {
        heading: "5. Contact Us",
        content: "For privacy-related concerns, contact us at: support@omaacompany.com",
        bullets: [],
      },
    ],
  },
  "terms-and-conditions": {
    id: "terms-and-conditions",
    title: "Terms & Conditions",
    subtitle: "Effective Date: January 2026\nBy using OMAA Company's website or services, you agree to the following terms and conditions.",
    last_updated: "January 2026",
    contact_email: "support@omaacompany.com",
    sections: [
      {
        heading: "1. Service Agreement",
        bullets: [
          "OMAA Company provides home appliance repair and maintenance services through trained service professionals",
          "Service availability depends on location and technician availability",
        ],
      },
      {
        heading: "2. Customer Responsibilities",
        bullets: [
          "Customers must provide accurate details while booking a service",
          "Ensure a safe and suitable working environment at the service location",
        ],
      },
      {
        heading: "3. Pricing and Payments",
        bullets: [
          "Service charges, inspection fees, and spare part costs will be informed before service execution",
          "Any additional work will be carried out only after customer approval",
        ],
      },
      {
        heading: "4. Limitations of Liability",
        bullets: [
          "OMAA Company is not responsible for issues caused by misuse, power fluctuations, or improper installation by third parties",
        ],
      },
      {
        heading: "5. Warranty Terms",
        bullets: [
          "Warranty, if provided, is limited only to the service performed or parts replaced",
        ],
      },
      {
        heading: "6. Policy Updates",
        bullets: [
          "OMAA Company reserves the right to update services, prices, or policies at any time",
        ],
      },
    ],
  },
};

// Helper: Ensure the table exists
async function ensurePolicyTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS site_policies (
        id VARCHAR(50) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        subtitle VARCHAR(255),
        last_updated VARCHAR(100),
        contact_email VARCHAR(255),
        sections JSON NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
  } catch (err) {
    console.error("Failed to ensure site_policies table:", err);
  }
}

export async function getPolicy(policyId: string): Promise<PolicyData> {
  try {
    const queryPromise = pool.query(
      "SELECT * FROM site_policies WHERE id = ?",
      [policyId]
    );
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 2000));

    const [rows]: any = await Promise.race([queryPromise, timeoutPromise]);

    if (rows && rows.length > 0) {
      const row = rows[0];
      let parsedSections: PolicySection[] = [];
      try {
        parsedSections = typeof row.sections === "string" ? JSON.parse(row.sections) : row.sections;
      } catch (e) {
        parsedSections = [];
      }

      return {
        id: row.id,
        title: row.title,
        subtitle: row.subtitle || "",
        last_updated: row.last_updated || "",
        contact_email: row.contact_email || "support@omaacompany.com",
        sections: parsedSections,
        updated_at: row.updated_at,
      };
    }
  } catch {
    // Fail silently to default policy without throwing
  }

  // Fallback to default policy
  return DEFAULT_POLICIES[policyId] || {
    id: policyId,
    title: policyId.replace(/-/g, " ").toUpperCase(),
    subtitle: "",
    last_updated: "January 2026",
    contact_email: "support@omaacompany.com",
    sections: [],
  };
}

export async function updatePolicy(policyData: PolicyData) {
  await ensurePolicyTable();

  try {
    const query = `
      INSERT INTO site_policies (id, title, subtitle, last_updated, contact_email, sections)
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        title = VALUES(title),
        subtitle = VALUES(subtitle),
        last_updated = VALUES(last_updated),
        contact_email = VALUES(contact_email),
        sections = VALUES(sections)
    `;

    await pool.query(query, [
      policyData.id,
      policyData.title,
      policyData.subtitle || "",
      policyData.last_updated || "",
      policyData.contact_email || "support@omaacompany.com",
      JSON.stringify(policyData.sections || []),
    ]);

    revalidatePath(`/${policyData.id}`);
    revalidatePath(`/admin/${policyData.id}`);
    if (policyData.id === "privacy-policy") {
      revalidatePath("/privacy");
      revalidatePath("/admin/privacy-policy");
    } else if (policyData.id === "terms-and-conditions") {
      revalidatePath("/terms");
      revalidatePath("/admin/terms-and-conditions");
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error updating policy:", error);
    return { success: false, error: error.message || "Failed to update policy" };
  }
}
