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

module.exports = {
  sendEmail,
};
