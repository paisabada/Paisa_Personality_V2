// pages/share.js
import Head from 'next/head';

export default function SharePage({ query }) {
  // fallback if SSR not present
  const type = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('type') : query?.type;
  const name = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('name') : query?.name;

  const title = `You — Your result: ${name ? name + ' — ' + (type || '') : `Your result: ${type}`}`;

  const imageUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/ogs/${type || 'panda'}.png`;

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta property="og:title" content={title} />
        <meta property="og:description" content={`I tried the Paisa Personality quiz — ${name || 'See your result!'}`} />
        <meta property="og:image" content={imageUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${process.env.NEXT_PUBLIC_BASE_URL}/share?type=${type}&name=${name}`} />
      </Head>

      <main style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <img src={imageUrl} alt={`Result ${type}`} style={{ maxWidth: '100%', borderRadius: 8 }} />
        <div style={{ marginTop: 16 }}>
          <h1>{title}</h1>
          <p>Share this result on Facebook</p>
          <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${process.env.NEXT_PUBLIC_BASE_URL}/share?type=${type}&name=${name}`)}`} target="_blank" rel="noreferrer">
            Share on Facebook
          </a>
        </div>
      </main>
    </>
  );
}

// SSR for OG-friendly meta when crawler requests
export async function getServerSideProps({ query }) {
  return { props: { query } };
}
