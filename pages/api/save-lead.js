// pages/api/save-lead.js
import { google } from "googleapis";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      name,
      email,
      mobile,
      city,
      occupation,
      answers,
      result,
      token,
      timestamp,
    } = req.body;

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "Sheet1!A1",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [
          [
            new Date().toISOString(),
            name,
            email,
            mobile,
            city,
            occupation,
            JSON.stringify(answers),
            result,
            token,
            timestamp,
          ],
        ],
      },
    });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Google Sheet Error:", err);
    res.status(500).json({ error: "Failed to save lead" });
  }
}
