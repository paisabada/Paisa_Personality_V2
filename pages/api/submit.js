// pages/api/submit.js
import fetch from "node-fetch";

const AIRTABLE_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TABLE = process.env.AIRTABLE_TABLE_NAME || "Responses";
const SITE_URL = process.env.SITE_URL || "https://paisa-personality-v2.vercel.app";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { name, email, mobile, result } = req.body || {};

  if (!name || !result) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    // Save to Airtable
    const airtableRes = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE}/${encodeURIComponent(AIRTABLE_TABLE)}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AIRTABLE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fields: {
          Name: name,
          Email: email || "",
          Mobile: mobile || "",
          Result: result,
        },
      }),
    });

    const airtableJson = await airtableRes.json();

    // Build share URL (public page)
    // We'll include a quote param for auto message in FB share dialog
    const shareUrl = `${SITE_URL}/share?type=${encodeURIComponent(result)}&name=${encodeURIComponent(name)}`;
    const quote = `I tried the Paisa Personality quiz — My result: ${result.charAt(0).toUpperCase() + result.slice(1)}! Try it: ${shareUrl}`;

    // Optionally update Airtable record with share_url
    if (airtableJson && airtableJson.id) {
      await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE}/${encodeURIComponent(AIRTABLE_TABLE)}/${airtableJson.id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${AIRTABLE_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fields: {
            share_url: shareUrl,
          },
        }),
      }).catch(() => {});
    }

    return res.status(200).json({ ok: true, shareUrl, quote });
  } catch (err) {
    console.error("submit error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
