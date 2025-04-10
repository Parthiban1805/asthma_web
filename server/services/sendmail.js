const nodemailer = require('nodemailer');

const sendEmail = async (recipientEmail, subject, text) => {
  let transporter = nodemailer.createTransport({
    service: 'gmail', // or another mail provider
    auth: {
        user: "parthi.s1805@gmail.com",    
        pass: "wfgq pjza qkpf pshv"       // your Gmail App Password or SMTP password
    }
  });

  const mailOptions = {
    from: 'parthi.s1805@gmail.com',  // sender address
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
