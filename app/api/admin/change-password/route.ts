import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "@/lib/db";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret_please_change_in_env";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { currentPassword, newPassword, confirmPassword } = body;

    // 1. Basic validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { error: "All password fields are required." },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "New password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: "New password and confirmation password do not match." },
        { status: 400 }
      );
    }

    if (currentPassword === newPassword) {
      return NextResponse.json(
        { error: "New password cannot be the same as current password." },
        { status: 400 }
      );
    }

    // 2. Identify the logged-in admin from token or database
    let adminId: number | null = null;
    const token = req.cookies.get("admin_token")?.value;

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { id?: number; email?: string };
        if (decoded?.id) {
          adminId = decoded.id;
        }
      } catch (err) {
        console.warn("Invalid or expired admin token:", err);
      }
    }

    // Fallback: If no token id, retrieve by email from token or the first admin in database
    let admin: any = null;
    if (adminId) {
      const [rows]: any = await pool.query("SELECT * FROM admins WHERE id = ?", [adminId]);
      admin = rows[0];
    } else {
      const [rows]: any = await pool.query("SELECT * FROM admins ORDER BY id ASC LIMIT 1");
      admin = rows[0];
    }

    if (!admin) {
      return NextResponse.json(
        { error: "Admin account not found. Please log in again." },
        { status: 404 }
      );
    }

    // 3. Verify current password
    const isCurrentValid = await bcrypt.compare(currentPassword, admin.password);
    if (!isCurrentValid) {
      return NextResponse.json(
        { error: "Current password is incorrect. Please enter your valid existing password." },
        { status: 401 }
      );
    }

    // 4. Hash new password and update
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE admins SET password = ? WHERE id = ?", [
      hashedNewPassword,
      admin.id,
    ]);

    return NextResponse.json({
      success: true,
      message: "Admin password has been changed successfully!",
    });
  } catch (error: any) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update password. Please try again." },
      { status: 500 }
    );
  }
}
