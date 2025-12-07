// pages/api/lead.js
import { google } from "googleapis";

const auth = new google.auth.JWT(
  process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  null,
  (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
  ["https://www.googleapis.com/auth/spreadsheets"]
);

const sheets = google.sheets({ version: "v4", auth });

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { name, email, mobile, city, occupation, result } = req.body;

  if (!name || !mobile) return res.status(400).json({ error: "missing" });

  try {
    const values = [
      [new Date().toISOString(), name, email || "", mobile, city || "", occupation || "", result || ""]
    ];
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.SHEET_ID,
      range: "Leads!A:G", // make a Leads sheet or adjust
      valueInputOption: "USER_ENTERED",
      requestBody: { values }
    });

    // optional: generate a token or return a share url
    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/share?r=${encodeURIComponent(result)}`;

    res.json({ ok: true, shareUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
}
