// const nodemailer = require('nodemailer');

// let transporter;

// function getTransporter() {
//   if (!transporter) {
//     transporter = nodemailer.createTransport({
//       host: process.env.SMTP_HOST,
//       port: Number(process.env.SMTP_PORT) || 587,
//       secure: Number(process.env.SMTP_PORT) === 465,
//       auth: {
//         user: process.env.SMTP_USER,
//         pass: process.env.SMTP_PASSWORD,
//       },
//     });
//   }
//   return transporter;
// }

const RESEND_API_URL = 'https://api.resend.com/emails';

async function sendOtpEmail(toEmail, otp) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;

  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not configured');
  }

  if (!from) {
    throw new Error('RESEND_FROM is not configured');
  }

  const response = await fetch(RESEND_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [toEmail],
      subject: 'Unique Designs – Password Reset OTP',
      text: `Your OTP for resetting your Unique Designs account password is:

${otp}

This OTP will expire in 5 minutes.

If you did not request this password reset, please ignore this email.`,

      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 20px;">
          <h2 style="color: #8b2f5e;">Unique Designs</h2>

          <p>Your OTP for resetting your account password is:</p>

          <div style="
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 8px;
            padding: 20px;
            text-align: center;
            background: #f5f5f5;
            border-radius: 10px;
            margin: 20px 0;
          ">
            ${otp}
          </div>

          <p>
            This OTP will expire in <strong>5 minutes</strong>.
          </p>

          <p style="color: #888; font-size: 13px;">
            If you did not request this password reset, please ignore this email.
          </p>

          <hr />

          <p style="font-size: 12px; color: #999;">
            © Unique Designs
          </p>
        </div>
      `,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('Resend API error:', data);

    throw new Error(
      data?.message ||
      data?.name ||
      'Failed to send OTP email'
    );
  }

  console.log('OTP email sent successfully:', data.id);

  return data;
}

module.exports = {
  sendOtpEmail,
};

// async function sendOtpEmail(toEmail, otp) {
//   const mailOptions = {
//     from: process.env.SMTP_FROM || process.env.SMTP_USER,
//     to: toEmail,
//     subject: 'Unique Designs – Password Reset OTP',
//     text: `Your OTP for resetting your Unique Designs account password is:\n\n${otp}\n\nThis OTP will expire in 5 minutes.\n\nIf you did not request this password reset, please ignore this email.`,
//     html: `
//       <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
//         <h2 style="color:#8b2f5e;">Unique Designs</h2>
//         <p>Your OTP for resetting your account password is:</p>
//         <p style="font-size: 28px; font-weight: bold; letter-spacing: 6px;">${otp}</p>
//         <p>This OTP will expire in <strong>5 minutes</strong>.</p>
//         <p style="color:#888; font-size: 13px;">If you did not request this password reset, please ignore this email.</p>
//       </div>
//     `,
//   };

//   await getTransporter().sendMail(mailOptions);
// }

// module.exports = { sendOtpEmail };
