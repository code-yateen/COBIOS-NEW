const { Resend } = require("resend");
const env = require("../config/env");

class ResendService {
  constructor() {
    this.resend = null;
    if (env.RESEND_API_KEY) {
      this.resend = new Resend(env.RESEND_API_KEY);
    } else {
      console.warn("Resend API key not configured. Resend email service will not work.");
    }
  }

  async sendEmail(to, subject, html, text = null) {
    if (!this.resend) {
      console.warn("Resend service not configured. Email not sent.");
      return false;
    }

    try {
      const fromEmail = env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
      
      const { data, error } = await this.resend.emails.send({
        from: `Cobios Gym <${fromEmail}>`,
        to: [to],
        subject: subject,
        html: html,
        text: text || html.replace(/<[^>]*>/g, ""), // Strip HTML tags for text version
      });

      if (error) {
        console.error("Resend error:", error);
        return false;
      }

      console.log("Email sent via Resend:", data?.id);
      return true;
    } catch (error) {
      console.error("Error sending email via Resend:", error);
      return false;
    }
  }

  async sendMemberAccountCredentials(user, password) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Welcome to Cobios Gym!</h1>
        <p>Hi ${user.name},</p>
        <p>Your member account has been successfully created by the administrator.</p>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h2 style="color: #333; margin-top: 0;">Your Login Credentials:</h2>
          <p style="margin: 10px 0;"><strong>Email:</strong> ${user.email}</p>
          <p style="margin: 10px 0;"><strong>Password:</strong> ${password}</p>
        </div>
        <p>Please login using these credentials and change your password after your first login for security purposes.</p>
        <p style="color: #666; font-size: 12px; margin-top: 30px;">This is an automated email. Please do not reply to this message.</p>
      </div>
    `;

    const text = `
Welcome to Cobios Gym!

Hi ${user.name},

Your member account has been successfully created by the administrator.

Your Login Credentials:
Email: ${user.email}
Password: ${password}

Please login using these credentials and change your password after your first login for security purposes.

This is an automated email. Please do not reply to this message.
    `;

    return this.sendEmail(
      user.email,
      "Your Cobios Gym Member Account Credentials",
      html,
      text
    );
  }

  async sendTrainerAccountCredentials(user, password) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Welcome to Cobios Gym Trainer Portal!</h1>
        <p>Hi ${user.name},</p>
        <p>Your trainer account has been successfully created by the administrator.</p>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h2 style="color: #333; margin-top: 0;">Your Login Credentials:</h2>
          <p style="margin: 10px 0;"><strong>Email:</strong> ${user.email}</p>
          <p style="margin: 10px 0;"><strong>Password:</strong> ${password}</p>
        </div>
        <p>Please login using these credentials and change your password after your first login for security purposes.</p>
        <p style="color: #666; font-size: 12px; margin-top: 30px;">This is an automated email. Please do not reply to this message.</p>
      </div>
    `;

    const text = `
Welcome to Cobios Gym Trainer Portal!

Hi ${user.name},

Your trainer account has been successfully created by the administrator.

Your Login Credentials:
Email: ${user.email}
Password: ${password}

Please login using these credentials and change your password after your first login for security purposes.

This is an automated email. Please do not reply to this message.
    `;

    return this.sendEmail(
      user.email,
      "Your Cobios Gym Trainer Account Credentials",
      html,
      text
    );
  }
}

module.exports = new ResendService();

