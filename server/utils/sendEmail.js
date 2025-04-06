const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail', // You can change this to another provider or use custom SMTP
      auth: {
        user: process.env.EMAIL_USER,    
        pass: process.env.EMAIL_PASS       // your Gmail App Password or SMTP password
      }
    });

    const mailOptions = {
      from: ` <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html, // optional, for rich email formatting
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ', info.messageId);
  } catch (err) {
    console.error('Failed to send email:', err);
  }
};

module.exports = sendEmail;
