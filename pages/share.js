// pages/share.js
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function SharePage({ type, name, absoluteImageUrl, quote }) {
  const router = useRouter();
  const pageUrl = typeof window !== "undefined" ? window.location.href : "";

  useEffect(() => {
    // if you want auto-open FB share dialog: (optional)
    // window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}&quote=${encodeURIComponent(quote)}`, "_blank","width=800,height=600");
  }, []);

  const shareFacebook = () => {
    const url = `${pageUrl}`;
    const fb = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(quote)}`;
    window.open(fb, "facebook-share-dialog", "width=800,height=600");
  };

  return (
    <>
      <Head>
        <title>{name} — Your result: {type}</title>
        <meta property="og:title" content={`${name} — Your result: ${type}`} />
        <meta property="og:description" content={`I tried the Paisa Personality quiz — My result: ${type}. Try it!`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={typeof window !== "undefined" ? window.location.href : ""} />
        {/* OG image must be absolute URL */}
        <meta property="og:image" content={absoluteImageUrl} />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>

      <main style={{textAlign:'center', padding: 20}}>
        <h1>Hey {name} — Your result: {type}</h1>
        <img src={absoluteImageUrl} alt={`Result ${type}`} style={{maxWidth: '100%'}} />
        <p>{quote}</p>

        <div style={{marginTop:20}}>
          <button onClick={shareFacebook}>Share on Facebook</button>
          {/* You can also show copy link button */}
          <button onClick={() => navigator.clipboard.writeText(pageUrl)}>Copy link</button>
        </div>
      </main>
    </>
  );
}

// server side props to build absolute og:image url
export async function getServerSideProps({ query, req }) {
  const { type = "budget", name = "You" } = query;
  const proto = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers.host; // vercel host
  const SITE = process.env.SITE_URL || `${proto}://${host}`;

  const absoluteImageUrl = `${SITE}/api/og?type=${encodeURIComponent(type)}&name=${encodeURIComponent(name)}`;
  const quote = `I tried the Paisa Personality quiz — My result: ${type.charAt(0).toUpperCase()+type.slice(1)}! Try it: ${SITE}/share?type=${encodeURIComponent(type)}&name=${encodeURIComponent(name)}`;

  return {
    props: {
      type,
      name,
      absoluteImageUrl,
      quote,
    },
  };
}
