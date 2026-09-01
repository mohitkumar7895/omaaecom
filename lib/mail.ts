import { Resend } from "resend";
import nodemailer from "nodemailer";
import pool from "./db";

// Fallback email settings
const RESEND_FROM = process.env.RESEND_FROM_EMAIL || "OMAA Company <onboarding@resend.dev>";
const SMTP_USER = process.env.SMTP_EMAIL || process.env.SMTP_USER || "prtmohit.provisioningtech.com@gmail.com";
const SMTP_PASS = process.env.SMTP_PASSWORD || process.env.SMTP_PASS || "vkrdsipfchlkgyxj";
const DEFAULT_RECIPIENT_EMAIL = process.env.RECIPIENT_EMAILS || process.env.ADMIN_EMAIL || "prtmohit.provisioningtech.com@gmail.com";

function getSmtpTransporter() {
  if (!SMTP_USER || !SMTP_PASS) return null;
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
}

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey.trim() === "") return null;
  return new Resend(apiKey.trim());
}

export async function getAdminNotificationEmail(): Promise<string> {
  const envRecipients = process.env.RECIPIENT_EMAILS || process.env.ADMIN_EMAIL;
  if (envRecipients && envRecipients.trim() !== "") {
    return envRecipients.trim();
  }
  return DEFAULT_RECIPIENT_EMAIL;
}

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string | string[];
  subject: string;
  html: string;
}) {
  const recipients: string[] = Array.isArray(to)
    ? to
    : to.split(",").map((s) => s.trim()).filter((s) => s.length > 0 && s.includes("@"));
  let resendSuccess = false;

  // 1. Try sending via Resend if API Key is configured
  const resend = getResendClient();
  if (resend) {
    try {
      const { data, error } = await resend.emails.send({
        from: RESEND_FROM,
        to: recipients,
        subject,
        html,
      });

      if (!error && data) {
        console.log("✅ Email sent via Resend:", data.id);
        resendSuccess = true;
        return { success: true, provider: "resend", data };
      } else if (error) {
        console.warn("⚠️ Resend API returned error, falling back to Gmail SMTP:", error.message);
      }
    } catch (resendErr: any) {
      console.warn("⚠️ Resend sending failed, falling back to Gmail SMTP:", resendErr?.message);
    }
  }

  // 2. Fallback to Gmail SMTP (Nodemailer)
  const transporter = getSmtpTransporter();
  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: `"OMAA Company" <${SMTP_USER}>`,
        to: recipients.join(", "),
        subject,
        html,
      });
      console.log("✅ Email sent via Gmail SMTP:", info.messageId);
      return { success: true, provider: "smtp", data: info };
    } catch (smtpErr: any) {
      console.error("❌ SMTP sending failed:", smtpErr?.message);
      return { success: false, error: smtpErr?.message };
    }
  }

  console.log(`\n📧 [EMAIL SIMULATION] To: ${recipients.join(", ")}\nSubject: ${subject}\n`);
  return { success: true, simulated: true };
}

// -------------------------------------------------------------
// 1. BOOKING EMAIL
// -------------------------------------------------------------
export async function sendBookingEmail(booking: {
  orderId: string;
  name: string;
  mobile: string;
  address: string;
  category: string;
  services: any[];
  total: number | string;
  paymentMethod?: string;
  bookingDate?: string;
  timeSlot?: string;
  userEmail?: string;
}) {
  const adminEmail = await getAdminNotificationEmail();

  const servicesHtml = Array.isArray(booking.services)
    ? booking.services
      .filter((s: any) => {
        const title = (s.title || s.name || "").toLowerCase();
        return !title.includes("power issue") && !title.includes("check-up") && !title.includes("checkup");
      })
      .map(
        (s: any) =>
          `<tr>
              <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; color: #1f2937;">${s.title || s.name || "Service Item"}</td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; text-align: right; font-weight: bold; color: #111827;">₹${s.price || s.final_price || 0}</td>
            </tr>`
      )
      .join("")
    : `<tr><td colspan="2" style="padding: 8px 12px; font-size: 14px;">${booking.category}</td></tr>`;

  const emailHtml = `
    <div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #1e293b, #0f172a); padding: 24px; color: #ffffff; text-align: center;">
        <h2 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 0.5px;">OMAA COMPANY</h2>
        <p style="margin: 6px 0 0 0; font-size: 14px; color: #94a3b8;">🎉 New Service Booking Received!</p>
      </div>

      <div style="padding: 24px;">
        <div style="background-color: #f8fafc; border-left: 4px solid #6366f1; padding: 14px 16px; margin-bottom: 20px; border-radius: 4px;">
          <p style="margin: 0; font-size: 13px; color: #64748b; font-weight: bold; text-transform: uppercase;">Order ID</p>
          <p style="margin: 4px 0 0 0; font-size: 18px; font-weight: 800; color: #1e293b; font-family: monospace;">${booking.orderId}</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="padding: 6px 0; font-size: 13px; color: #64748b; width: 140px; font-weight: bold;">Customer Name:</td>
            <td style="padding: 6px 0; font-size: 14px; color: #1e293b; font-weight: bold;">${booking.name}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: bold;">Mobile Number:</td>
            <td style="padding: 6px 0; font-size: 14px; color: #1e293b;"><a href="tel:${booking.mobile}" style="color: #6366f1; text-decoration: none; font-weight: bold;">+91 ${booking.mobile}</a></td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: bold;">Service Category:</td>
            <td style="padding: 6px 0; font-size: 14px; color: #1e293b;">${booking.category}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: bold;">Address:</td>
            <td style="padding: 6px 0; font-size: 14px; color: #1e293b;">${booking.address}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: bold;">Date & Slot:</td>
            <td style="padding: 6px 0; font-size: 14px; color: #1e293b;">${booking.bookingDate || "Instant"} • ${booking.timeSlot || "Standard"}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: bold;">Payment Method:</td>
            <td style="padding: 6px 0; font-size: 14px; color: #1e293b; text-transform: capitalize;">${booking.paymentMethod || "Cash on Book"}</td>
          </tr>
        </table>

        <h3 style="font-size: 15px; font-weight: bold; color: #1e293b; margin-bottom: 10px; border-bottom: 2px solid #f1f5f9; padding-bottom: 6px;">Service Inclusions</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          ${servicesHtml}
          <tr>
            <td style="padding: 12px; font-size: 15px; font-weight: 800; color: #1e293b; border-top: 2px solid #e2e8f0;">Total Amount:</td>
            <td style="padding: 12px; font-size: 18px; font-weight: 900; color: #059669; text-align: right; border-top: 2px solid #e2e8f0;">₹${booking.total}</td>
          </tr>
        </table>
      </div>

      <div style="background-color: #f8fafc; padding: 16px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
        © 2026 OMAA Company • Doorstep Home Appliance Services
      </div>
    </div>
  `;

  // Send to Admin
  await sendEmail({
    to: adminEmail,
    subject: `🔔 [New Booking] Order #${booking.orderId} - ${booking.name} (₹${booking.total})`,
    html: emailHtml,
  });

  // If customer provided an email address, send confirmation to customer too!
  if (booking.userEmail && booking.userEmail.includes("@")) {
    await sendEmail({
      to: booking.userEmail,
      subject: `Order Confirmation - #${booking.orderId} | OMAA Company`,
      html: emailHtml,
    });
  }
}

// -------------------------------------------------------------
// 2. TECHNICIAN / PROFESSIONAL REGISTRATION EMAIL
// -------------------------------------------------------------
export async function sendRegistrationEmail(reg: {
  name: string;
  mobile: string;
  workCompany: string;
  location: string;
  experience: string;
}) {
  const adminEmail = await getAdminNotificationEmail();

  const emailHtml = `
    <div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 24px; color: #ffffff; text-align: center;">
        <h2 style="margin: 0; font-size: 22px; font-weight: 800;">OMAA COMPANY</h2>
        <p style="margin: 6px 0 0 0; font-size: 14px; color: #fef3c7;">👨‍🔧 New Professional / Technician Registration!</p>
      </div>

      <div style="padding: 24px;">
        <p style="font-size: 14px; color: #475569; margin-top: 0;">A new technician has registered on the platform:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="padding: 8px 0; font-size: 13px; color: #64748b; width: 140px; font-weight: bold;">Technician Name:</td>
            <td style="padding: 8px 0; font-size: 14px; color: #1e293b; font-weight: bold;">${reg.name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-size: 13px; color: #64748b; font-weight: bold;">Mobile Number:</td>
            <td style="padding: 8px 0; font-size: 14px; color: #1e293b;"><a href="tel:${reg.mobile}" style="color: #d97706; text-decoration: none; font-weight: bold;">+91 ${reg.mobile}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-size: 13px; color: #64748b; font-weight: bold;">Skill / Work:</td>
            <td style="padding: 8px 0; font-size: 14px; color: #1e293b; font-weight: bold;">${reg.workCompany}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-size: 13px; color: #64748b; font-weight: bold;">Location / City:</td>
            <td style="padding: 8px 0; font-size: 14px; color: #1e293b;">${reg.location}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-size: 13px; color: #64748b; font-weight: bold;">Experience Level:</td>
            <td style="padding: 8px 0; font-size: 14px; color: #1e293b;">${reg.experience}</td>
          </tr>
        </table>

        <div style="text-align: center; margin-top: 20px;">
          <a href="https://wa.me/91${reg.mobile.replace(/\D/g, "")}" style="display: inline-block; background-color: #25d366; color: #ffffff; padding: 10px 20px; border-radius: 8px; font-size: 13px; font-weight: bold; text-decoration: none;">
            Chat on WhatsApp
          </a>
        </div>
      </div>

      <div style="background-color: #f8fafc; padding: 14px; text-align: center; font-size: 12px; color: #64748b;">
        Review in Admin Panel: <a href="https://omaacompany.com/admin/registration-records" style="color: #6366f1;">/admin/registration-records</a>
      </div>
    </div>
  `;

  await sendEmail({
    to: adminEmail,
    subject: `👷 [New Partner] ${reg.name} - ${reg.workCompany} (${reg.location})`,
    html: emailHtml,
  });
}

// -------------------------------------------------------------
// 3. CONTACT FORM INQUIRY EMAIL
// -------------------------------------------------------------
export async function sendContactEmail(contact: {
  name: string;
  phone?: string;
  email?: string;
  subject?: string;
  message: string;
}) {
  const adminEmail = await getAdminNotificationEmail();

  const emailHtml = `
    <div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #6366f1, #4f46e5); padding: 24px; color: #ffffff; text-align: center;">
        <h2 style="margin: 0; font-size: 22px; font-weight: 800;">OMAA COMPANY</h2>
        <p style="margin: 6px 0 0 0; font-size: 14px; color: #e0e7ff;">📬 New Contact Inquiry Received!</p>
      </div>

      <div style="padding: 24px;">
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="padding: 6px 0; font-size: 13px; color: #64748b; width: 130px; font-weight: bold;">Sender Name:</td>
            <td style="padding: 6px 0; font-size: 14px; color: #1e293b; font-weight: bold;">${contact.name}</td>
          </tr>
          ${contact.phone
      ? `<tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: bold;">Phone:</td>
                  <td style="padding: 6px 0; font-size: 14px; color: #1e293b;"><a href="tel:${contact.phone}" style="color: #6366f1; text-decoration: none; font-weight: bold;">+91 ${contact.phone}</a></td>
                </tr>`
      : ""
    }
          ${contact.email
      ? `<tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: bold;">Email:</td>
                  <td style="padding: 6px 0; font-size: 14px; color: #1e293b;"><a href="mailto:${contact.email}" style="color: #6366f1; text-decoration: none;">${contact.email}</a></td>
                </tr>`
      : ""
    }
          ${contact.subject
      ? `<tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: bold;">Subject:</td>
                  <td style="padding: 6px 0; font-size: 14px; color: #1e293b; font-weight: bold;">${contact.subject}</td>
                </tr>`
      : ""
    }
        </table>

        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin-top: 10px;">
          <p style="margin: 0 0 6px 0; font-size: 12px; color: #64748b; font-weight: bold; text-transform: uppercase;">Message Content:</p>
          <p style="margin: 0; font-size: 14px; color: #334155; line-height: 1.6; white-space: pre-wrap;">${contact.message}</p>
        </div>
      </div>

      <div style="background-color: #f8fafc; padding: 14px; text-align: center; font-size: 12px; color: #64748b;">
        Manage Inquiries: <a href="https://omaacompany.com/admin/contacts" style="color: #6366f1;">/admin/contacts</a>
      </div>
    </div>
  `;

  await sendEmail({
    to: adminEmail,
    subject: `💬 [Contact Us] ${contact.name}: ${contact.subject || "New Inquiry"}`,
    html: emailHtml,
  });
}

// -------------------------------------------------------------
// 4. COMPLAINT SUBMISSION EMAIL
// -------------------------------------------------------------
export async function sendComplaintEmail(complaint: {
  name: string;
  phone: string;
  orderId?: string;
  subject: string;
  message: string;
}) {
  const adminEmail = await getAdminNotificationEmail();

  const emailHtml = `
    <div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #fee2e2; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #ef4444, #dc2626); padding: 24px; color: #ffffff; text-align: center;">
        <h2 style="margin: 0; font-size: 22px; font-weight: 800;">OMAA COMPANY</h2>
        <p style="margin: 6px 0 0 0; font-size: 14px; color: #fee2e2;">🚨 Customer Complaint Lodged</p>
      </div>

      <div style="padding: 24px;">
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="padding: 6px 0; font-size: 13px; color: #64748b; width: 130px; font-weight: bold;">Customer Name:</td>
            <td style="padding: 6px 0; font-size: 14px; color: #1e293b; font-weight: bold;">${complaint.name}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: bold;">Mobile:</td>
            <td style="padding: 6px 0; font-size: 14px; color: #1e293b;"><a href="tel:${complaint.phone}" style="color: #ef4444; text-decoration: none; font-weight: bold;">+91 ${complaint.phone}</a></td>
          </tr>
          ${complaint.orderId
      ? `<tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: bold;">Order ID:</td>
                  <td style="padding: 6px 0; font-size: 14px; color: #1e293b; font-family: monospace; font-weight: bold;">${complaint.orderId}</td>
                </tr>`
      : ""
    }
          <tr>
            <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: bold;">Subject:</td>
            <td style="padding: 6px 0; font-size: 14px; color: #1e293b; font-weight: bold;">${complaint.subject}</td>
          </tr>
        </table>

        <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 14px;">
          <p style="margin: 0 0 6px 0; font-size: 12px; color: #991b1b; font-weight: bold; text-transform: uppercase;">Complaint Details:</p>
          <p style="margin: 0; font-size: 14px; color: #7f1d1d; line-height: 1.6; white-space: pre-wrap;">${complaint.message}</p>
        </div>
      </div>

      <div style="background-color: #f8fafc; padding: 14px; text-align: center; font-size: 12px; color: #64748b;">
        Resolve Complaint: <a href="https://omaacompany.com/admin/complaints" style="color: #ef4444;">/admin/complaints</a>
      </div>
    </div>
  `;

  await sendEmail({
    to: adminEmail,
    subject: `🚨 [Complaint Alert] ${complaint.name}: ${complaint.subject}`,
    html: emailHtml,
  });
}

// -------------------------------------------------------------
// 5. ADMIN PASSWORD CHANGE OTP EMAIL
// -------------------------------------------------------------
export async function sendPasswordOtpEmail({
  to,
  otp,
}: {
  to: string;
  otp: string;
}) {
  const emailHtml = `
    <div style="font-family: Arial, Helvetica, sans-serif; max-width: 500px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #1e293b, #0f172a); padding: 24px; color: #ffffff; text-align: center;">
        <h2 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 0.5px;">OMAA COMPANY</h2>
        <p style="margin: 6px 0 0 0; font-size: 14px; color: #94a3b8;">🔐 Admin Security Verification</p>
      </div>

      <div style="padding: 30px 24px; text-align: center;">
        <h3 style="margin: 0 0 10px 0; font-size: 18px; color: #1e293b;">Password Change Request</h3>
        <p style="margin: 0 0 24px 0; font-size: 14px; color: #64748b; line-height: 1.5;">
          A request was made to change your OMAA Admin Password. Please use the 6-digit OTP below to authenticate:
        </p>

        <div style="background-color: #f1f5f9; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 18px 24px; display: inline-block; margin-bottom: 24px;">
          <span style="font-family: monospace; font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #4f46e5;">${otp}</span>
        </div>

        <p style="margin: 0; font-size: 13px; color: #94a3b8;">
          ⏳ This OTP is valid for <strong>10 minutes</strong>. If you did not request this, please ignore this email.
        </p>
      </div>

      <div style="background-color: #f8fafc; padding: 14px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;">
        © 2026 OMAA Company • Admin Security Control
      </div>
    </div>
  `;

  return await sendEmail({
    to,
    subject: `🔐 Your OMAA Admin Password OTP: ${otp}`,
    html: emailHtml,
  });
}
