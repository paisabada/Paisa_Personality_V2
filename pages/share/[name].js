// pages/share/[name].js
import Head from "next/head";

export async function getServerSideProps({ params, query, req }) {
  const name = params.name || query.name || "User";
  const type = query.type || "budget";

  const origin = (req.headers['x-forwarded-proto'] ? `${req.headers['x-forwarded-proto']}://` : 'https://') + (req.headers.host || 'paisa-personality-v2.vercel.app');
  const ogImage = `${origin}/api/og?type=${encodeURIComponent(type)}&name=${encodeURIComponent(name)}`;

  return {
    props: { name, type, origin, ogImage }
  };
}

export default function SharePage({ name, type, origin, ogImage }) {
  const url = `${origin}/share/${encodeURIComponent(name)}?type=${encodeURIComponent(type)}`;

  return (
    <>
      <Head>
        <title>{name} — Your result</title>

        {/* Required Open Graph */}
        <meta property="og:url" content={url} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={`${name} — Your result: ${type}`} />
        <meta property="og:description" content={`I tried the Paisa Personality quiz — ${name} — Your result: ${type}. Share and see yours!`} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:alt" content={`Result image for ${name}`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${name} — Your result: ${type}`} />
        <meta name="twitter:description" content={`I tried the Paisa Personality quiz — ${name} — Your result: ${type}.`} />
        <meta name="twitter:image" content={ogImage} />
        {/* Optional: add fb:app_id if you have one */}
        {/* <meta property="fb:app_id" content="YOUR_FB_APP_ID" /> */}
      </Head>

      <main>
        <h1>{name} — {type}</h1>
        <p>Share preview should show the generated image.</p>
      </main>
    </>
  );
}
