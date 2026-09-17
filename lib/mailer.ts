import { sendEmail } from "./mail";

export const sendOTP = async (email: string, otp: string) => {
  await sendEmail({
    to: email,
    subject: `🔐 Your OMAA Login OTP: ${otp}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 20px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #4f46e5; font-size: 26px; font-weight: 800; margin: 0 0 6px;">OMAA Company</h1>
          <p style="color: #6b7280; font-size: 14px; margin: 0;">Customer Account Verification</p>
        </div>

        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; text-align: center; margin-bottom: 24px;">
          <p style="font-size: 14px; color: #475569; margin: 0 0 16px; font-weight: 600;">Your One-Time Password (OTP) for login & booking confirmation is:</p>
          <div style="display: inline-block; background: #4f46e5; color: #ffffff; font-size: 32px; font-weight: 900; letter-spacing: 8px; padding: 14px 28px; border-radius: 12px; font-family: monospace;">
            ${otp}
          </div>
          <p style="font-size: 12px; color: #94a3b8; margin: 16px 0 0;">⏱️ This security code will expire in <strong>5 minutes</strong>.</p>
        </div>

        <p style="font-size: 13px; color: #64748b; line-height: 1.6; margin: 0 0 8px;">
          Use this code to verify your booking, access order tracking, and activate your service warranty.
        </p>
        <p style="font-size: 12px; color: #94a3b8; margin: 24px 0 0; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 16px;">
          If you did not request this OTP, please disregard this email.
        </p>
      </div>
    `,
  });
};

