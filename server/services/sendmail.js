const nodemailer = require('nodemailer');

const sendEmail = async (recipientEmail, subject, text) => {
  let transporter = nodemailer.createTransport({
    service: 'gmail', // or another mail provider
    auth: {
        user: "tharunika0007@gmail.com",    
        pass: "ovsw onwu zfpw vxvm"       // your Gmail App Password or SMTP password
    }
  });

  const mailOptions = {
    from: 'tharunika0007@gmail.com',  // sender address
    to: recipientEmail,  // recipient address
    subject: subject,  // email subject
    text: text          // email body
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

module.exports = sendEmail;
