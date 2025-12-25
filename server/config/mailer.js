import nodemailer from "nodemailer";
import dotenv from 'dotenv'

dotenv.config()


export const transporter = nodemailer.createTransport({
    
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // REQUIRED
  auth: {
    user: process.env.EMAIL_USER?.trim(),
    pass: process.env.EMAIL_PASS?.trim(),
  },
});
