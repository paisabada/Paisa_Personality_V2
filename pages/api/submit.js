import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { name, email, mobile, result } = req.body;

  const token = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

  const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
  const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
  const AIRTABLE_TABLE_NAME = process.env.AIRTABLE_TABLE_NAME || "Responses";

  const airtableURL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`;

  const r = await fetch(airtableURL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${AIRTABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fields: { Name: name, Email: email, Mobile: mobile, Result: result, Token: token }
    }),
  });

  const data = await r.json();

  if (!r.ok) return res.status(500).json({ error: data });

  const origin = process.env.NEXT_PUBLIC_APP_URL || `https://${req.headers.host}`;
  const shareUrl = `${origin}/share?token=${token}`;

  return res.status(200).json({ ok: true, shareUrl });
}
