import Head from "next/head";

export default function Share({ title, desc, image }) {
  return (
    <>
      <Head>
        <meta property="og:title" content={title} />
        <meta property="og:description" content={desc} />
        <meta property="og:image" content={image} />
        <meta property="og:type" content="website" />
      </Head>

      <h1>{title}</h1>
      <img src={image} width="300" />
      <p>{desc}</p>
    </>
  );
}

export async function getServerSideProps({ query }) {
  const token = query.token || null;

  let result = "panda"; // fallback

  if (token) {
    const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
    const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
    const AIRTABLE_TABLE_NAME = process.env.AIRTABLE_TABLE_NAME || "Responses";

    const apiURL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}?filterByFormula=Token='${token}'`;

    const r = await fetch(apiURL, {
      headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` },
    });
    const d = await r.json();

    if (d.records?.length) result = d.records[0].fields.Result;
  }

  const base = process.env.NEXT_PUBLIC_APP_URL;
  return {
    props: {
      title: `Your Result: ${result}`,
      desc: `I tried the Paisa Personality Quiz — my result: ${result}`,
      image: `${base}/ogs/${result}.png`,
    },
  };
}
