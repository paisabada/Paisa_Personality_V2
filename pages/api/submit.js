// pages/api/submit.js
import Airtable from 'airtable';

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
const TABLE = process.env.AIRTABLE_TABLE_NAME || 'Responses';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || '';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { name, email, mobile, result } = req.body;

    if (!name || !result) return res.status(400).json({ error: 'Missing name or result' });

    // create a record
    const created = await base(TABLE).create([
      {
        fields: {
          Name: name,
          Email: email || '',
          Mobile: mobile || '',
          Result: result,
        },
      },
    ]);

    const record = created[0];
    const recordId = record.id;

    // create a sharable url (we'll use /share route that accepts result & name)
    const shareUrl = `${BASE_URL}/share?type=${encodeURIComponent(result.toLowerCase())}&name=${encodeURIComponent(name)}&rid=${encodeURIComponent(recordId)}`;

    // update record with share url (optional)
    await base(TABLE).update(recordId, { SharedUrl: shareUrl });

    return res.status(200).json({ ok: true, shareUrl, recordId });
  } catch (err) {
    console.error('submit err', err);
    return res.status(500).json({ error: 'Server error', details: String(err) });
  }
}
