// pages/share.js
import React from "react";

export default function SharePage({ result, imageUrl, title, description }) {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <title>{title}</title>
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={imageUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={process.env.NEXT_PUBLIC_APP_URL + `/share?r=${encodeURIComponent(result)}`} />
        <meta name="twitter:card" content="summary_large_image" />
      </head>
      <body>
        <div style={{padding:40, fontFamily:'Inter, Arial'}}>
          <h1>Your Result: {result}</h1>
          <img src={imageUrl} alt={result} style={{maxWidth:'600px',border:'1px solid #ddd'}}/>
          <p>{description}</p>
        </div>
      </body>
    </html>
  );
}

// server-side
export async function getServerSideProps({ query, req }) {
  const r = (query.r || "panda").toString().toLowerCase();
  // map result -> image file (in /public/ogs/)
  const allowed = { risky: "risky.png", panda: "panda.png", budget: "budget.png", boss:"budget.png" };
  const filename = allowed[r] || "panda.png";
  const origin = process.env.NEXT_PUBLIC_APP_URL || `https://${req.headers.host}`;
  const imageUrl = `${origin}/ogs/${filename}`;
  const title = `I am a ${r} — Paisa Personality Quiz`;
  const description = `I tried the Paisa Personality Quiz — my result: ${r}. Try it!`;

  return { props: { result: r, imageUrl, title, description } };
}
