const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, htmlContent) => {
  try {
    // If Gmail credentials match the placeholder, we use Ethereal automatically!
    if (process.env.EMAIL_USER === 'your_email@gmail.com') {
      console.log('⚡ Generating a free Temporary Mailbox (Ethereal Email) for testing...');
      
      // Auto-generate a test account dynamically on the fly
      const etherealAccount = await nodemailer.createTestAccount();
      
      const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: etherealAccount.user, // generated ethereal user
          pass: etherealAccount.pass, // generated ethereal password
        },
      });

      const mailOptions = {
        from: '"Campus Marketplace system" <admin@sliit.lk>',
        to,
        subject,
        html: htmlContent,
      };

      const info = await transporter.sendMail(mailOptions);
      
      const emailUrl = nodemailer.getTestMessageUrl(info);
      console.log('\n======================================================');
      console.log('📨 MESSAGE SUCCESSFULLY DISPATCHED TO FAKE INBOX!');
      console.log('🔗 CLICK THIS LINK TO VIEW THE GRAPHICAL EMAIL:');
      console.log(`-->  ${emailUrl}  <--`);
      console.log('======================================================\n');
      
      return { success: true, emailUrl };
    } else {
      // Regular Gmail dispatch logic
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

      await transporter.sendMail(mailOptions);
      console.log(`📧 Real Email sent to ${to}`);
      return { success: true, emailUrl: null };
    }
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    return false;
  }
};

module.exports = sendEmail;
