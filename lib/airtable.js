// lib/airtable.js
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TABLE_NAME = process.env.AIRTABLE_TABLE_NAME || "Responses";

const baseUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(
  AIRTABLE_TABLE_NAME
)}`;

async function airtableCreate(fields) {
  const r = await fetch(baseUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${AIRTABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fields }),
  });
  return r.json();
}

async function airtableFindByToken(token) {
  const url = `${baseUrl}?filterByFormula=Token='${encodeURIComponent(token)}'&maxRecords=1`;
  const r = await fetch(url, {
    headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` },
  });
  const d = await r.json();
  return d.records?.[0] || null;
}

async function airtableUpdateRecord(recordId, fields) {
  const url = `${baseUrl}/${recordId}`;
  const r = await fetch(url, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${AIRTABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fields }),
  });
  return r.json();
}

module.exports = { airtableCreate, airtableFindByToken, airtableUpdateRecord };
