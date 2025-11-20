import Head from 'next/head';

const tokenStore = global.__tokenStore || (global.__tokenStore = {});

export async function getServerSideProps({ params, req }) {
  const token = params.token;
  const data = tokenStore[token];

  if (!data) {
    return { notFound: true };
  }

  const { name, img } = data;

  const origin =
    (req.headers['x-forwarded-proto'] ? req.headers['x-forwarded-proto'] + '://' : 'https://') +
    req.headers.host;

  const ogImage = `${origin}/api/og?img=${img}&name=${encodeURIComponent(name)}`;

  return {
    props: {
      name,
      img,
      ogImage,
      shareUrl: `${origin}/share/${token}`
    }
  };
}

export default function SharePage({ name, ogImage, shareUrl }) {
  return (
    <>
      <Head>
        <title>{name} – Paisa Personality</title>
        <meta property="og:title" content={`${name} — Paisa Personality Result`} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="twitter:card" content="summary_large_image" />
      </Head>

      <main style={{ padding: 40 }}>
        <h1>Share your result, {name}</h1>
        <a
          target="_blank"
          rel="noreferrer"
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
        >
          Share to Facebook
        </a>
      </main>
    </>
  );
}
