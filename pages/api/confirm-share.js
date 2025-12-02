// pages/api/confirm-share.js
import { airtableFindByToken, airtableUpdateRecord } from "../../lib/airtable";

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL;

async function sendConfirmationEmail(to, name, resultKey, token) {
  if (!SENDGRID_API_KEY) return;

  const image = `${APP_URL}/ogs/${resultKey}.png`;
  const subject = `Your Paisa Personality result — ${resultKey}`;
  const text = `Hi ${name},\n\nThanks for sharing your result! Your result: ${resultKey}\n\nView: ${APP_URL}/result?token=${token}\n`;
  const html = `<p>Hi ${name},</p><p>Thanks for sharing your result! Your result: <b>${resultKey}</b></p><p><img src="${image}" width="400" /></p><p>View result: <a href="${APP_URL}/result?token=${token}">${APP_URL}/result?token=${token}</a></p>`;

  await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SENDGRID_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: FROM_EMAIL },
      subject,
      content: [
        { type: "text/plain", value: text },
        { type: "text/html", value: html },
      ],
    }),
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { token, post_id, manual } = req.body;
  if (!token) return res.status(400).json({ error: "Missing token" });

  const rec = await airtableFindByToken(token);
  if (!rec) return res.status(404).json({ error: "Not found" });

  const fields = {
    Share_confirmed: true,
    SharedAt: new Date().toISOString(),
    Post_id: post_id || "",
    Share_manual_confirm: manual ? true : false,
  };

  await airtableUpdateRecord(rec.id, fields);

  // send confirmation mail (async)
  try {
    const email = rec.fields.Email;
    const name = rec.fields.Name || "User";
    const resultKey = rec.fields.Result || "panda";
    if (email) await sendConfirmationEmail(email, name, resultKey, token);
  } catch (e) {
    console.error("email send error", e);
  }

  return res.json({ ok: true });
}
