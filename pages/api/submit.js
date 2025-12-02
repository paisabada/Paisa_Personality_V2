// pages/api/submit.js
import crypto from "crypto";

const AIRTABLE_BASE = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TABLE = process.env.AIRTABLE_TABLE_NAME || "Responses";
const AIRTABLE_KEY = process.env.AIRTABLE_API_KEY;

const SENDGRID_KEY = process.env.SENDGRID_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM;
const EMAIL_REPLY = process.env.EMAIL_REPLY_TO;
const APP_BASE = process.env.NEXT_PUBLIC_APP_URL;

if (!AIRTABLE_KEY || !SENDGRID_KEY || !EMAIL_FROM || !APP_BASE) {
  console.warn("Missing required env vars for submit API");
}

function pickResultFromAnswers(answers = {}) {
  // Replace with your actual scoring logic.
  // Simple example: count picks and map to panda/budget/risky
  const counts = { panda: 0, budget: 0, risky: 0 };
  Object.values(answers).forEach((v) => {
    if (!v) return;
    const key = String(v).toLowerCase();
    if (key.includes("panda") || key === "panda") counts.panda++;
    else if (key.includes("budget") || key === "budget") counts.budget++;
    else if (key.includes("risky") || key === "risky") counts.risky++;
    else {
      // fallback random-ish mapping
      counts.panda++;
    }
  });
  // choose highest
  const winner = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  return winner ? winner[0] : "panda";
}

async function saveToAirtable(record) {
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE}/${encodeURIComponent(
    AIRTABLE_TABLE
  )}`;
  const body = { records: [{ fields: record }] };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${AIRTABLE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return data;
}

async function sendConfirmationEmail({ to, name, result, token }) {
  const shareUrl = `${APP_BASE}/share?token=${encodeURIComponent(token)}&r=${encodeURIComponent(result)}`;
  const imageUrl = `${APP_BASE}/ogs/${result}.png`;

  const payload = {
    personalizations: [
      {
        to: [{ email: to }],
        subject: `Your Paisa Personality result: ${result.toUpperCase()}`,
        dynamic_template_data: {},
      },
    ],
    from: { email: EMAIL_FROM, name: "PaisaBada" },
    reply_to: { email: EMAIL_REPLY || EMAIL_FROM },
    content: [
      {
        type: "text/plain",
        value: `Your result: ${result}\nOpen: ${shareUrl}`,
      },
      {
        type: "text/html",
        value: `
          <div style="font-family: Arial, sans-serif; color: #222;">
            <h2>Your Paisa Personality Result: ${result.toUpperCase()}</h2>
            <p>Hi ${name || ""},</p>
            <p>Thanks for trying the Paisa Personality Quiz. Your result is <strong>${result}</strong>.</p>
            <p><img src="${imageUrl}" alt="${result}" style="max-width:100%;height:auto;border:1px solid #ddd" /></p>
            <p><a href="${shareUrl}" target="_blank" rel="noopener">Click here to open your share page</a></p>
            <p>Share it on Facebook to reveal on the website.</p>
            <hr/>
            <small>If you didn't request this, ignore.</small>
          </div>
        `,
      },
    ],
  };

  const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SENDGRID_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("SendGrid failed:", res.status, text);
    throw new Error("SendGrid error");
  }

  return true;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Only POST" });

  try {
    const { name, email, phone, answers } = req.body;

    // basic validation
    if (!email) return res.status(400).json({ error: "Email required" });

    // compute result
    const result = pickResultFromAnswers(answers);

    // generate a token
    const token = crypto.randomBytes(12).toString("hex");

    // save to airtable
    const airtableRecord = {
      Name: name || "",
      Email: email,
      Phone: phone || "",
      Result: result,
      Token: token,
      Answers: JSON.stringify(answers || {}),
      SubmittedAt: new Date().toISOString(),
    };

    // attempt to save (wrap in try/catch so email still may send)
    try {
      await saveToAirtable(airtableRecord);
    } catch (err) {
      console.error("Airtable save failed:", err);
      // continue — we still want to send email (but better to log)
    }

    // send email via sendgrid
    try {
      await sendConfirmationEmail({ to: email, name, result, token });
    } catch (err) {
      console.error("Send email failed", err);
      // still return success so app works — show warning client-side
      return res.status(200).json({
        ok: true,
        emailSent: false,
        token,
        result,
      });
    }

    return res.status(200).json({ ok: true, emailSent: true, token, result });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}
