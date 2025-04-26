const nodemailer = require('nodemailer');

// Create a transporter object using SMTP transport
    const transporter = nodemailer.createTransport({
      service: 'gmail', // You can change this to another provider or use custom SMTP
      auth: {
        user: "tharunika0007@gmail.com",    
        pass: "ovsw onwu zfpw vxvm"       // your Gmail App Password or SMTP password
      }
    });

/**
 * Send an email notification
 * @param {Object} options - Email options
 * @param {string} options.recipient - Email recipient
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text version of email
 * @param {string} options.html - HTML version of email
 * @returns {Promise} - Promise that resolves when email is sent
 */
const sendEmailNotification = async (options) => {
  const { recipient, subject, text, html } = options;
  
  const mailOptions = {
    from: `"Asthma Care App" <${process.env.EMAIL_USER}>`,
    to: recipient,
    subject: subject,
    text: text,
    html: html
  };
  
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

module.exports = {
  sendEmailNotification
};
