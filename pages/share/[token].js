// pages/share/[token].js
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import crypto from 'crypto';

// For demo: a simple in-memory store to map token to details.
// In production, store mapping (token -> { name, img, createdAt }) in DB.
const tokenStore = global.__tokenStore || (global.__tokenStore = {});

export async function getServerSideProps({ params, req, res, query }) {
  const token = params.token;

  // lookup token
  const data = tokenStore[token] || null;

  if (!data) {
    // token not found -> show 404-like page or redirect to homepage
    return { notFound: true };
  }

  const name = encodeURIComponent(data.name);
  const img = encodeURIComponent(data.img);

  // OG image URL points to our serverless generator
  const origin = (req.headers['x-forwarded-proto'] ? `${req.headers['x-forwarded-proto']}://` : `https://`) + req.headers.host;
  const ogImage = `${origin}/api/og?img=${img}&name=${name}&token=${token}`;

  return {
    props: {
      name: data.name,
      img: data.img,
      ogImage,
      shareUrl: `${origin}/share/${token}`
    }
  };
}

export default function SharePage({ name, img, ogImage, shareUrl }) {
  // Optionally open FB share dialog automatically (client)
  useEffect(() => {
    // auto-open FB sharer in new window (optional)
    // window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
  }, [shareUrl]);

  return (
    <>
      <Head>
        <title>Paisa result — {name}</title>
        <meta property="og:title" content={`${name} — Your Paisa Personality`} />
        <meta property="og:description" content="I tried the Paisa Personality quiz — it’s absolutely free" />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="twitter:card" content="summary_large_image" />
      </Head>
      <main style={{ padding: 40 }}>
        <h1>Your result is ready, {name}</h1>
        <p>Share this page to show your result.</p>
        <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noreferrer">Share on Facebook</a>
      </main>
    </>
  );
}
