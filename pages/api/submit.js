// pages/api/submit.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { name, email, mobile, result } = req.body;
  if (!name || !result) return res.status(400).json({ error: "Missing" });

  const token = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2,9)}`;

  const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
  const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
  const AIRTABLE_TABLE_NAME = process.env.AIRTABLE_TABLE_NAME || "Responses";

  try {
    const resp = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fields: {
            Name: name,
            Email: email || "",
            Mobile: mobile || "",
            Result: result,
            Token: token
          }
        })
      }
    );

    const data = await resp.json();
    if (!resp.ok) return res.status(500).json({ error: data });

    // return share url
    const origin = process.env.NEXT_PUBLIC_APP_URL || `https://${req.headers.host}`;
    const shareUrl = `${origin}/share?token=${encodeURIComponent(token)}`;

    return res.status(200).json({ ok: true, shareUrl, token });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
