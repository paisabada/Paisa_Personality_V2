// pages/api/submit.js
import crypto from "crypto";
import { google } from "googleapis";
import nodemailer from "nodemailer";

const APP_BASE = process.env.NEXT_PUBLIC_APP_URL || ""; // e.g. https://paisabada.in

// Google Sheets envs (service account)
const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY; // ensure \n are preserved
const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID; // spreadsheet id
const GOOGLE_SHEET_RANGE = process.env.GOOGLE_SHEET_RANGE || "Sheet1!A1"; // where to append

// SMTP / Mail envs
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT || 465);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const EMAIL_FROM = process.env.EMAIL_FROM || `no-reply@${process.env.DOMAIN || "paisabada.in"}`;
const EMAIL_REPLY = process.env.EMAIL_REPLY_TO || EMAIL_FROM;

if (!GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_PRIVATE_KEY || !GOOGLE_SHEET_ID) {
  console.warn("Missing Google Sheets envs: check GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_SHEET_ID");
}
if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
  console.warn("Missing SMTP envs: check SMTP_HOST, SMTP_USER, SMTP_PASS");
}

// ----- result logic -----
function pickResultFromAnswers(answers = {}) {
  const counts = { panda: 0, budget: 0, risky: 0 };
  try {
    Object.values(answers).forEach((v) => {
      if (!v) return;
      const key = String(v).toLowerCase();
      if (key.includes("panda") || key === "panda") counts.panda++;
      else if (key.includes("budget") || key === "budget") counts.budget++;
      else if (key.includes("risky") || key === "risky") counts.risky++;
      else counts.panda++;
    });
  } catch (e) {
    // fallback
    counts.panda++;
  }
  const winner = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  return winner ? winner[0] : "panda";
}

// ----- Google Sheets helper -----
async function appendToGoogleSheet(rowArray = []) {
  // rowArray must be an array of values matching the columns you want
  const privateKey = GOOGLE_PRIVATE_KEY ? GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n") : undefined;

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: privateKey,
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });

  const res = await sheets.spreadsheets.values.append({
    spreadsheetId: GOOGLE_SHEET_ID,
    range: GOOGLE_SHEET_RANGE,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [rowArray],
    },
  });

  return res.data;
}

// ----- Nodemailer helper -----
async function sendMailSMTP({ to, name, result, token }) {
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465, // true for 465, false for other ports
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  const shareUrl = `${APP_BASE.replace(/\/$/, "")}/share?token=${encodeURIComponent(token)}&r=${encodeURIComponent(result)}`;
  const imageUrl = `${APP_BASE.replace(/\/$/, "")}/ogs/${result}.png`;

  const html = `
    <div style="font-family: Arial, sans-serif; color: #222;">
      <h2>Your Paisa Personality Result: ${String(result).toUpperCase()}</h2>
      <p>Hi ${name || ""},</p>
      <p>Thanks for trying the Paisa Personality Quiz. Your result is <strong>${result}</strong>.</p>
      <p><img src="${imageUrl}" alt="${result}" style="max-width:100%;height:auto;border:1px solid #ddd" /></p>
      <p>
        <a href="${shareUrl}" target="_blank" rel="noopener" style="display:inline-block;padding:10px 14px;background:#28a745;color:#fff;text-decoration:none;border-radius:6px;">
          Open your share page & claim
        </a>
      </p>
      <p>Now you can unlock your Paisabada Vault and check your 100 coins balance.</p>
      <hr/>
      <small>If you didn't request this, ignore.</small>
    </div>
  `;

  const info = await transporter.sendMail({
    from: EMAIL_FROM,
    to,
    replyTo: EMAIL_REPLY,
    subject: `Your Paisa Personality result: ${String(result).toUpperCase()}`,
    text: `Your result: ${result}\nOpen: ${shareUrl}`,
    html,
  });

  return info;
}

// ----- API Handler -----
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Only POST allowed" });

  try {
    const { name, email, phone, answers = {}, token: incomingToken } = req.body || {};

    if (!email) return res.status(400).json({ error: "Email required" });

    // compute result and token
    const result = pickResultFromAnswers(answers);
    const token = incomingToken || crypto.randomBytes(12).toString("hex");
    const submittedAt = new Date().toISOString();

    // prepare sheet row
    const row = [
      submittedAt,
      name || "",
      email,
      phone || "",
      JSON.stringify(answers || {}),
      result,
      token,
      req.headers["x-forwarded-for"] || req.socket.remoteAddress || "",
    ];

    // try append to sheet (don't block email on sheet failure)
    let sheetOk = false;
    try {
      await appendToGoogleSheet(row);
      sheetOk = true;
    } catch (sheetErr) {
      console.error("Google Sheets append failed:", sheetErr);
      sheetOk = false;
    }

    // try send email via SMTP
    let emailOk = false;
    try {
      await sendMailSMTP({ to: email, name, result, token });
      emailOk = true;
    } catch (mailErr) {
      console.error("SMTP send failed:", mailErr);
      emailOk = false;
    }

    return res.status(200).json({
      ok: true,
      result,
      token,
      savedToSheet: sheetOk,
      emailSent: emailOk,
    });
  } catch (err) {
    console.error("submit API error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
