// pages/share/[token].js
import Head from "next/head";
import React from "react";

export async function getServerSideProps({ params, query, req }) {
  // token from URL: /share/<token>
  const token = params?.token || "";

  // allow query params override like ?type=budget&name=Ravi
  const qType = query?.type;
  const qName = query?.name;

  // simple mapping: token can encode which template (optional)
  // If you pass type in query it wins, otherwise try to infer from token
  const inferredType = token.includes("risky") ? "risky" : token.includes("panda") ? "panda" : "budget";
  const type = qType || inferredType || "budget";

  // default name if not provided
  const name = qName || (token ? decodeURIComponent(token) : "Friend");

  // Build absolute URL for the OG image API route (must be accessible publicly)
  const host = req.headers.host; // vercel domain or localhost:3000
  const proto = req.headers["x-forwarded-proto"] || "https";
  const imageUrl = `${proto}://${host}/api/og?type=${encodeURIComponent(type)}&name=${encodeURIComponent(name)}`;

  // Page title + description (customize as needed)
  const title = `${name} — Your result: ${type === "budget" ? "Budget Boss" : type === "risky" ? "Risky Rockstar" : "Rockstar"}`;
  const description = `I tried the Paisa Personality quiz — ${title}. Share and see yours!`;

  return {
    props: { title, description, imageUrl, name, type, token },
  };
}

export default function SharePage({ title, description, imageUrl, name, type }) {
  // share URL will be the current page URL
  // On server render, window won't exist; client JS computes it.
  const shareOnFacebook = () => {
    const u = typeof window !== "undefined" ? window.location.href : "";
    const fb = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(u)}`;
    window.open(fb, "fbshare", "width=600,height=400");
  };

  return (
    <>
      <Head>
        <title>{title}</title>

        {/* Standard Open Graph tags (server-side) */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        {/* MUST be absolute URL */}
        <meta property="og:image" content={imageUrl} />
        <meta property="og:image:secure_url" content={imageUrl} />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:alt" content={`Result image for ${name}`} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={imageUrl} />
      </Head>

      <main style={{ fontFamily: "system-ui, sans-serif", textAlign: "center", padding: 24 }}>
        <h1 style={{ marginBottom: 6 }}>{title}</h1>
        <p style={{ marginTop: 0, color: "#444" }}>{description}</p>

        <div style={{ margin: "20px auto", maxWidth: 720 }}>
          <img
            src={imageUrl}
            alt={`Result image for ${name}`}
            style={{ width: "100%", height: "auto", borderRadius: 8, boxShadow: "0 6px 18px rgba(0,0,0,0.12)" }}
          />
        </div>

        <div style={{ marginTop: 12 }}>
          <button
            onClick={shareOnFacebook}
            style={{
              background: "#1877F2",
              color: "white",
              border: "none",
              padding: "12px 18px",
              borderRadius: 6,
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Share on Facebook
          </button>
        </div>

        <p style={{ marginTop: 18, color: "#666" }}>
          Or copy this link:{" "}
          <code style={{ background: "#f5f5f5", padding: "4px 8px", borderRadius: 4 }}>
            {typeof window !== "undefined" ? window.location.href : "This page's URL will work"}
          </code>
        </p>
      </main>
    </>
  );
}
