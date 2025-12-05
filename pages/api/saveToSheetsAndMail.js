// pages/api/saveToSheetsAndMail.js
import { google } from 'googleapis';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

function getAuthClient() {
  const key = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY || '{}');
  const auth = new google.auth.GoogleAuth({
    credentials: key,
    scopes: SCOPES,
  });
  return auth;
}

async function appendRow(values) {
  const auth = await getAuthClient();
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = process.env.SPREADSHEET_ID;
  const res = await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: 'Sheet1!A1', // change sheet name / range if needed
    valueInputOption: 'RAW',
    requestBody: {
      values: [values],
    },
  });
  return res.data;
}

function createToken() {
  return crypto.randomBytes(8).toString('hex'); // 16 char hex token
}

async function sendMailSMTP({ to, subject, text, html }) {
  if (process.env.SEND_EMAIL_ENABLED !== 'true') {
    console.log('SEND_EMAIL_ENABLED not true — skipping email send.');
    return { skipped: true };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: String(process.env.SMTP_PORT) === '465', // true for 465, false for others (587)
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    text,
    html,
  });

  return info;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, email, mobile, city, occupation, result } = req.body || {};
  if (!name || !email || !mobile || !result) {
    return res.status(400).json({ error: 'Missing required fields (name,email,mobile,result)' });
  }

  try {
    // create short token for this record
    const token = createToken();

    // Append to sheet: timestamp, name, email, mobile, city, occupation, result, token
    const ts = new Date().toISOString();
    await appendRow([ts, name, email, mobile, city || '', occupation || '', result, token]);

    // Prepare checkup link and mail
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || (`https://${req.headers.host}`);
    const checkupLink = `${appUrl}/financial-checkup?source=email&token=${encodeURIComponent(token)}`;

    const subject = `Your Paisa Personality result — ${result}`;
    const text = `Hi ${name},

Thank you for trying the Paisa Personality Quiz — your result: ${result}.

Unlock your Paisabada vault and check your 100 coins balance here:
${checkupLink}

Best,
Team Paisabada
`;
    const html = `<p>Hi ${name},</p>
<p>Thank you for trying the <strong>Paisa Personality Quiz</strong> — your result: <strong>${result}</strong>.</p>
<p><a href="${checkupLink}">Click here to unlock your Paisabada vault and check your 100 coins balance →</a></p>
<p>Also try our <a href="${appUrl}/financial-checkup">Financial Health Checkup</a>.</p>
<p>— Team Paisabada</p>`;

    // send mail
    const mailInfo = await sendMailSMTP({ to: email, subject, text, html });

    // return token to frontend
    return res.status(200).json({ ok: true, token, mailInfo: mailInfo ? (mailInfo.accepted || mailInfo.messageId) : null });
  } catch (err) {
    console.error('saveToSheetsAndMail error', err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
}
