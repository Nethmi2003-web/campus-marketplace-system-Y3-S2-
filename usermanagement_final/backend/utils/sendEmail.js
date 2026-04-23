const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, htmlContent) => {
  // Create transporter — uses Gmail SMTP by default
  // For production, switch to a service like SendGrid or Mailgun
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Campus Marketplace" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent to ${to}`);
    return true;
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    
    // Developer Fallback: Print OTP to the terminal if it exists in the html
    const otpMatch = htmlContent.match(/\b\d{6}\b/);
    if (otpMatch) {
      console.log(`\n======================================================`);
      console.log(`🚀 DEVELOPER FALLBACK: Since you haven't set up Gmail`);
      console.log(`   credentials in .env, here is the OTP code for ${to}:`);
      console.log(`   --> ${otpMatch[0]} <--`);
      console.log(`======================================================\n`);
      return true; // We pretend it succeeded so the frontend moves to OTP screen
    }
    
    return false;
  }
};

module.exports = sendEmail;
