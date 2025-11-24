// pages/share.js
import Head from 'next/head';
import { useRouter } from 'next/router';

export default function Share({ name, type, imageUrl, title, description }) {
  const router = useRouter();
  const absoluteUrl = imageUrl;

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={absoluteUrl} />
        <meta property="og:image:alt" content={`Result image for ${name}`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={absoluteUrl} />
      </Head>

      <main style={{ textAlign: 'center', padding: 40 }}>
        <h1>{title}</h1>
        <p>{description}</p>
        <img src={absoluteUrl} alt={`Result ${type}`} style={{ maxWidth: '100%', height: 'auto' }} />
        <div style={{ marginTop: 20 }}>
          <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent((process.env.NEXT_PUBLIC_SITE_URL || (`https://${process.env.VERCEL_URL || ''}`)) + router.asPath)}`} target="_blank" rel="noreferrer">
            Share on Facebook
          </a>
        </div>
      </main>
    </>
  );
}

export async function getServerSideProps({ query }) {
  const { name = 'You', type = 'budget' } = query;
  const site = process.env.NEXT_PUBLIC_SITE_URL || `https://${process.env.VERCEL_URL || ''}`;
  const imageUrl = `${site}/api/og?type=${encodeURIComponent(type)}&name=${encodeURIComponent(name)}`;

  const prettyType = type.charAt(0).toUpperCase() + type.slice(1);
  const title = `${name} — Your result: ${prettyType}`;
  const description = `I tried the Paisa Personality quiz — ${title}. Share and see yours!`;

  return { props: { name, type, imageUrl, title, description } };
}
