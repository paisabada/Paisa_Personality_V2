// pages/share/[name].js
import Head from "next/head";

export async function getServerSideProps({ params, query, req }) {
  const { name } = params;
  // query.type default 'budget' if not provided
  const type = query.type || "budget";

  // Build absolute origin (works both locally and on Vercel)
  const protocol = req.headers["x-forwarded-proto"] || (req.headers.referer && req.headers.referer.split(":")[0]) || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const origin = `${protocol}://${host}`;

  const ogImage = `${origin}/api/og?type=${encodeURIComponent(type)}&name=${encodeURIComponent(name)}`;

  // pageTitle / description optional
  const title = `${name} — Your Paisa Personality Result`;
  const description = `I tried Paisa Personality quiz — my result: ${type}.`;

  return {
    props: {
      name,
      type,
      ogImage,
      title,
      description,
    },
  };
}

export default function SharePage({ name, type, ogImage, title, description }) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:alt" content={`Paisa Personality - ${type}`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={ogImage} />
      </Head>

      <main style={{display:"flex",alignItems:"center",justifyContent:"center",height:"70vh",flexDirection:"column"}}>
        <h1>{name}</h1>
        <p>Result: <b>{type}</b></p>
        <img src={ogImage} alt={`result ${type}`} style={{maxWidth:"90%",height:"auto"}}/>
        <p style={{marginTop:20}}>Click share to post on Facebook</p>
      </main>
    </>
  );
}
