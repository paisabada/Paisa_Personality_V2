// pages/share.js  (getServerSideProps example)
import fetch from "node-fetch";

export async function getServerSideProps({ query }) {
  const token = query.token || null;
  let record = null;
  if (token) {
    // query Airtable for record with Token=token
    const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
    const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
    const table = process.env.AIRTABLE_TABLE_NAME || "Responses";

    const q = `filterByFormula=Token='${token.replace(/'/g,"\\'")}'&maxRecords=1`;
    const r = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(table)}?${q}`, {
      headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` }
    });
    const d = await r.json();
    if (d.records && d.records.length) {
      record = d.records[0].fields;
    }
  }

  // default OG data
  const title = record ? `You — Your result: ${record.Result}` : "Try Paisa Personality";
  const description = record ? `I tried the Paisa Personality quiz — result: ${record.Result}` : "Take the Paisa Personality quiz";
  const imageUrl = record ? `${process.env.NEXT_PUBLIC_APP_URL}/ogs/${record.Result?.toLowerCase() || 'budget'}.png` : `${process.env.NEXT_PUBLIC_APP_URL}/ogs/budget.png`;

  return { props: { title, description, imageUrl } };
}

export default function SharePage({ title, description, imageUrl }) {
  return (
    <>
      <Head>
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={imageUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={typeof window !== "undefined" ? window.location.href : ""} />
        <title>{title}</title>
      </Head>
      <main>
        <h1>{title}</h1>
        <p>{description}</p>
      </main>
    </>
  );
}
