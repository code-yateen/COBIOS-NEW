import { transporter } from "../config/mailer.js";

export const sendEmail = async (email, userId, password) => {
  try {
    const info = await transporter.sendMail({
      from: {
        address: "<Enter cobios email>",
        name: "Cobios Team",
      },
      to: email,
      subject: "Your Login Credentials",
      text: `Welcome to Cobios!

Your credentials are:
User ID: ${userId}
Password: ${password}

Please change your password after login.
`,
      html: `
        <h2>Welcome to Cobios</h2>
        <p><b>User ID:</b> ${userId}</p>
        <p><b>Password:</b> ${password}</p>
        <p>Please change your password after login.</p>
      `,
    });

    console.log("Message sent successfully:", info.messageId);
  } catch (err) {
    console.error("Error while sending mail:", err);
  }
};
