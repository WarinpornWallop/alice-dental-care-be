const nodemailer = require("nodemailer");

async function sendEmail(to, subject, body) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASSWORD,
    },
  });

  if (!to || !subject || !body) {
    throw new Error("Missing required fields: to, subject, body");
  }

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: to,
    subject: subject,
    html: body,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
      return res.status(500).json({ error: "Failed to send email" });
    } else {
      console.log("Email sent:", info.response);
      return res.status(200).json({ message: "Email sent successfully" });
    }
  });
}

function getResetPasswordEmailBody(token) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Reset Password</title>
      <style>
        body {
          font-family: 'Segoe UI', sans-serif;
          background-color: #f9f9fb;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: auto;
          background: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
        }
        .header {
          padding: 30px;
          background: linear-gradient(to right, #6e3fb7, #79c9bb);
          color: white;
          text-align: center;
        }
        .content {
          padding: 30px;
          text-align: center;
        }
        .btn {
          display: inline-block;
          padding: 12px 24px;
          margin-top: 20px;
          background-color: #6e3fb7;
          color: #fff !important;
          text-decoration: none;
          border-radius: 8px;
          font-weight: bold;
        }
        .footer {
          padding: 20px;
          text-align: center;
          font-size: 13px;
          color: #999;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Alice Dental Care</h1>
        </div>
        <div class="content">
          <h2>Reset Your Password</h2>
          <p>We received a request to reset your password. Click the button below to proceed:</p>
          <a href="${process.env.RESET_PASSWORD_URL}/${token}" class="btn">Reset Password</a>
          <p>If you didn’t request a password reset, feel free to ignore this message.</p>
        </div>
        <div class="footer">
          &copy; 2025 Alice Dental Care
        </div>
      </div>
    </body>
    </html>
  `;
}

module.exports = {
  sendEmail,
  getResetPasswordEmailBody,
};
