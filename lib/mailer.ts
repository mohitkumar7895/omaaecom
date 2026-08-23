import nodemailer from "nodemailer";

const smtpUser = process.env.SMTP_EMAIL || process.env.SMTP_USER;
const smtpPassword = process.env.SMTP_PASSWORD || process.env.SMTP_PASS;
const smtpFrom = process.env.SMTP_FROM || smtpUser;

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: smtpUser,
    pass: smtpPassword,
  }
});

export const sendOTP = async (email: string, otp: string) => {
  const mailOptions = {
    from: smtpFrom,
    to: email,
    subject: "Your OTP for OMAA Login",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #6b62d9; text-align: center;">OMAA Authentication</h2>
        <p style="font-size: 16px; color: #333;">Hello,</p>
        <p style="font-size: 16px; color: #333;">Your One-Time Password (OTP) for login is:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #333; background: #f4f5f8; padding: 15px 30px; border-radius: 8px;">
            ${otp}
          </span>
        </div>
        <p style="font-size: 14px; color: #666; text-align: center;">This OTP is valid for 5 minutes.</p>
        <p style="font-size: 14px; color: #999; text-align: center; margin-top: 40px;">If you didn't request this, please ignore this email.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};
