// pages/api/submit.js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { name, email, mobile, resultType } = req.body;

  if (!name || !resultType) {
    return res.status(400).json({ error: 'name and resultType required' });
  }

  const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
  const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
  const AIRTABLE_TABLE = process.env.AIRTABLE_TABLE || 'Responses';

  const airtableUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE)}`;

  // construct image url using your existing OG endpoint
  const resultImageUrl = `${process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL ? (process.env.NEXT_PUBLIC_SITE_URL || `https://${process.env.VERCEL_URL}`) : ''}/api/og?type=${encodeURIComponent(resultType)}&name=${encodeURIComponent(name)}`;

  const payload = {
    fields: {
      Name: name,
      Email: email || '',
      Mobile: mobile || '',
      ResultType: resultType,
      ResultImageUrl: resultImageUrl
    }
  };

  try {
    const r = await fetch(airtableUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${AIRTABLE_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    const data = await r.json();
    if (!r.ok) {
      return res.status(500).json({ error: 'Airtable error', details: data });
    }

    // Return share URL (you will create /share page below)
    const sharePath = `/share?type=${encodeURIComponent(resultType)}&name=${encodeURIComponent(name)}&id=${encodeURIComponent(data.id)}`;
    return res.status(200).json({ ok: true, shareUrl: sharePath, record: data });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
