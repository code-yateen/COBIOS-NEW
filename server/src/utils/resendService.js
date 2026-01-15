const { Resend } = require("resend");
const env = require("../config/env");

class ResendService {
  constructor() {
    this.resend = null;
    if (env.RESEND_API_KEY) {
      this.resend = new Resend(env.RESEND_API_KEY);
    }
  }

  async sendEmail(to, subject, html, text = null) {
    if (!this.resend) {
      return false;
    }

    try {
      const fromEmail = env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
      
      const { data, error } = await this.resend.emails.send({
        from: `Cobios Gym <${fromEmail}>`,
        to: [to],
        subject: subject,
        html: html,
        text: text || html.replace(/<[^>]*>/g, ""),
      });

      if (error) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  async sendMemberAccountCredentials(user, password) {
    const websiteLink = "https://cobios-dashboard.vercel.app";
    const companyName = "Cobios Gym";

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <p>Hello <strong>${user.name}</strong>,</p>
        
        <p>Welcome to <strong>${companyName}</strong>! 🎉</p>
        
        <p>Your account has been successfully created.</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #007bff;">
          <h3 style="color: #333; margin-top: 0;">🔐 Temporary Login Credentials</h3>
          <p style="margin: 10px 0;"><strong>Username / Email:</strong> ${user.email}</p>
          <p style="margin: 10px 0;"><strong>Temporary Password:</strong> ${password}</p>
        </div>
        
        <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
          <p style="margin: 0; color: #856404;"><strong>👉 Important:</strong> For security reasons, this password is temporary.</p>
          <p style="margin: 10px 0 0 0; color: #856404;">Please log in and change your password immediately after your first login.</p>
        </div>
        
        <div style="margin: 30px 0;">
          <h3 style="color: #333;">🌐 Access Your Account</h3>
          <p>Click the link below to log in:</p>
          <a href="${websiteLink}" style="display: inline-block; background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Login to Your Account</a>
          <p style="margin-top: 10px; font-size: 14px; color: #666;">Or copy this link: ${websiteLink}</p>
        </div>
        
        <p style="font-size: 14px; color: #666;">If you did not request this account or believe this email was sent to you by mistake, please contact our support team immediately.</p>
        
        <p style="margin-top: 30px;">Best regards,<br><strong>${companyName}</strong></p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <p style="color: #999; font-size: 12px; text-align: center;">This is an automated email. Please do not reply to this message.</p>
      </div>
    `;

    const text = `
Hello ${user.name},

Welcome to ${companyName}! 🎉

Your account has been successfully created.

🔐 Temporary Login Credentials
- Username / Email: ${user.email}
- Temporary Password: ${password}

👉 Important: For security reasons, this password is temporary.
Please log in and change your password immediately after your first login.

🌐 Access Your Account
Click the link below to log in:
${websiteLink}

If you did not request this account or believe this email was sent to you by mistake, please contact our support team immediately.

Best regards,
${companyName}
    `;

    return this.sendEmail(
      user.email,
      `Welcome to ${companyName} - Your Account Credentials`,
      html,
      text
    );
  }

  async sendTrainerAccountCredentials(user, password) {
    const websiteLink = "https://cobios-dashboard.vercel.app";
    const companyName = "Cobios Gym";

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <p>Hello <strong>${user.name}</strong>,</p>
        
        <p>Welcome to <strong>${companyName} Trainer Portal</strong>! 🎉</p>
        
        <p>Your trainer account has been successfully created.</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
          <h3 style="color: #333; margin-top: 0;">🔐 Temporary Login Credentials</h3>
          <p style="margin: 10px 0;"><strong>Username / Email:</strong> ${user.email}</p>
          <p style="margin: 10px 0;"><strong>Temporary Password:</strong> ${password}</p>
        </div>
        
        <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
          <p style="margin: 0; color: #856404;"><strong>👉 Important:</strong> For security reasons, this password is temporary.</p>
          <p style="margin: 10px 0 0 0; color: #856404;">Please log in and change your password immediately after your first login.</p>
        </div>
        
        <div style="margin: 30px 0;">
          <h3 style="color: #333;">🌐 Access Your Account</h3>
          <p>Click the link below to log in:</p>
          <a href="${websiteLink}" style="display: inline-block; background-color: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Login to Trainer Portal</a>
          <p style="margin-top: 10px; font-size: 14px; color: #666;">Or copy this link: ${websiteLink}</p>
        </div>
        
        <p style="font-size: 14px; color: #666;">If you did not request this account or believe this email was sent to you by mistake, please contact our support team immediately.</p>
        
        <p style="margin-top: 30px;">Best regards,<br><strong>${companyName}</strong></p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <p style="color: #999; font-size: 12px; text-align: center;">This is an automated email. Please do not reply to this message.</p>
      </div>
    `;

    const text = `
Hello ${user.name},

Welcome to ${companyName} Trainer Portal! 🎉

Your trainer account has been successfully created.

🔐 Temporary Login Credentials
- Username / Email: ${user.email}
- Temporary Password: ${password}

👉 Important: For security reasons, this password is temporary.
Please log in and change your password immediately after your first login.

🌐 Access Your Account
Click the link below to log in:
${websiteLink}

If you did not request this account or believe this email was sent to you by mistake, please contact our support team immediately.

Best regards,
${companyName}
    `;

    return this.sendEmail(
      user.email,
      `Welcome to ${companyName} Trainer Portal - Your Account Credentials`,
      html,
      text
    );
  }
}

module.exports = new ResendService();