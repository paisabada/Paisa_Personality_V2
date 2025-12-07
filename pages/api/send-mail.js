// pages/api/send-mail.js
import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, email, result } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailHtml = `
      <h2>Hi ${name},</h2>
      <p>Thank you for trying the <b>Paisa Personality Quiz</b> 🎉</p>
      <p>Your result is: <b>${result}</b></p>

      <p>
        Now unlock your <b>Paisabada Vault</b> and get your 
        <b>100 Coins</b> instantly:
      </p>

      <a href="https://paisabada.in/financial-health-check">
        👉 Click here to start Financial Health Check-up
      </a>

      <br><br>
      <p>Regards,<br>Paisabada Team</p>
    `;

    await transporter.sendMail({
      from: `"Paisabada" <no-reply@paisabada.in>`,
      to: email,
      subject: `Your Paisa Personality Result`,
      html: mailHtml,
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Email error:", error);
    res.status(500).json({ error: "Email failed" });
  }
}
