import nodemailer from 'nodemailer';
import dotenv from "dotenv";

dotenv.config();

class EmailTransporter {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, 
      },
    });
  }

  async sendEmail(to, subject, text) {
    try {
      const mailOptions = {
        from: `"AB Creation" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        text,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent:', info.response);
      return info;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }
}

export default new EmailTransporter();
