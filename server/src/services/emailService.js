const nodemailer = require('nodemailer');

let transporter;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }
  return transporter;
}

async function sendOtpEmail(toEmail, otp) {
  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: toEmail,
    subject: 'Unique Designs – Password Reset OTP',
    text: `Your OTP for resetting your Unique Designs account password is:\n\n${otp}\n\nThis OTP will expire in 5 minutes.\n\nIf you did not request this password reset, please ignore this email.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
        <h2 style="color:#8b2f5e;">Unique Designs</h2>
        <p>Your OTP for resetting your account password is:</p>
        <p style="font-size: 28px; font-weight: bold; letter-spacing: 6px;">${otp}</p>
        <p>This OTP will expire in <strong>5 minutes</strong>.</p>
        <p style="color:#888; font-size: 13px;">If you did not request this password reset, please ignore this email.</p>
      </div>
    `,
  };

  await getTransporter().sendMail(mailOptions);
}

module.exports = { sendOtpEmail };
