const nodemailer = require("nodemailer");
const env = require("../config/env");

class EmailService {
  constructor() {
    this.transporter = null;
    if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS) {
      this.transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: parseInt(env.SMTP_PORT) || 587,
        secure: false,
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS,
        },
      });
    }
  }

  async sendEmail(to, subject, html, text = null) {
    if (!this.transporter) {
      console.warn("Email service not configured. Email not sent.");
      return false;
    }

    try {
      const info = await this.transporter.sendMail({
        from: `"Cobios Gym" <${env.SMTP_USER}>`,
        to,
        subject,
        text: text || html,
        html,
      });

      console.log("Email sent:", info.messageId);
      return true;
    } catch (error) {
      console.error("Error sending email:", error);
      return false;
    }
  }

  async sendWelcomeEmail(user) {
    const html = `
      <h1>Welcome to Cobios Gym!</h1>
      <p>Hi ${user.name},</p>
      <p>Your account has been successfully created.</p>
      <p>We're excited to have you on board!</p>
    `;

    return this.sendEmail(user.email, "Welcome to Cobios Gym", html);
  }

  async sendPasswordResetEmail(user, resetToken) {
    const resetUrl = `${env.CLIENT_URL}/reset-password/${resetToken}`;
    const html = `
      <h1>Password Reset Request</h1>
      <p>Hi ${user.name},</p>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `;

    return this.sendEmail(
      user.email,
      "Password Reset Request",
      html
    );
  }
}

module.exports = new EmailService();

