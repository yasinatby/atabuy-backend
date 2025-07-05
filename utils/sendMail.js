const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendMail({ to, subject, text }) {
  try {
    const info = await transporter.sendMail({
      from: `"ATABUY Security" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
    });

    console.log('📧 Mail gesendet:', info.messageId);
  } catch (err) {
    console.error('❌ Mailversand fehlgeschlagen:', err.message);
    throw err;
  }
}

module.exports = sendMail;
