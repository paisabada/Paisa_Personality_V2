// pages/share.js
import Head from "next/head";

/**
 * Server-rendered share page that provides proper OG tags for Facebook/Twitter.
 * - Uses getServerSideProps to look up token -> result (Airtable)
 * - Returns absolute og:image URL (must be reachable from the public internet)
 * - Provides additional tags (og:image:width/height, twitter card, canonical)
 *
 * Make sure:
 *  - You set NEXT_PUBLIC_APP_URL to your production origin (example: https://paisa-personality-v2.vercel.app)
 *  - Images exist under /public/ogs/<result>.png (and are reachable at `${NEXT_PUBLIC_APP_URL}/ogs/<result>.png`)
 *  - AIRTABLE_ env vars are set if you want token -> result mapping
 */

export default function SharePage({ title, desc, image, result }) {
  // if FB scrapers fetch this page they will pick up the head meta tags
  return (
    <>
      <Head>
        <title>{title}</title>

        {/* Open Graph */}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={desc} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={typeof window !== "undefined" ? window.location.href : undefined} />
        <meta property="og:image" content={image} />
        <meta property="og:image:secure_url" content={image} />
        {/* set known image dimensions (helps scrapers) */}
        <meta property="og:image:width" content="1280" />
        <meta property="og:image:height" content="853" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={desc} />
        <meta name="twitter:image" content={image} />

        {/* canonical */}
        <link rel="canonical" href={image.replace(/\/ogs\/[^/]+$/, "") + `/share?r=${encodeURIComponent(result)}`} />

        {/* small SEO/robots hint (optional) */}
        <meta name="robots" content="index,follow" />
      </Head>

      <main style={{ padding: 24, fontFamily: "Arial, sans-serif", textAlign: "center" }}>
        <h1>{title}</h1>
        <img src={image} alt={result} width="600" style={{ border: "1px solid #ddd" }} />
        <p style={{ maxWidth: 680, margin: "16px auto" }}>{desc}</p>
      </main>
    </>
  );
}

export async function getServerSideProps({ query }) {
  try {
    const token = typeof query.token === "string" ? query.token.trim() : null;
    let result = "panda"; // fallback result
    // Lookup Airtable if token present and env vars exist
    if (token && process.env.AIRTABLE_API_KEY && process.env.AIRTABLE_BASE_ID) {
      try {
        const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
        const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
        const AIRTABLE_TABLE_NAME = process.env.AIRTABLE_TABLE_NAME || "Responses";

        // Sanitize token - Airtable formula needs single quotes escaped
        const safeToken = token.replace(/'/g, "\\'");
        const apiURL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(
          AIRTABLE_TABLE_NAME
        )}?filterByFormula=({Token}='${safeToken}')&maxRecords=1`;

        const r = await fetch(apiURL, {
          headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` },
          // set a short timeout by using AbortController if you want (not included here)
        });

        if (r.ok) {
          const d = await r.json();
          if (d.records && d.records.length > 0) {
            // try common field names
            const fields = d.records[0].fields || {};
            result = (fields.Result || fields.result || fields.result_key || fields.ResultKey || "panda").toLowerCase();
          }
        } else {
          // failed airtable call - ignore and fallback
          console.warn("Airtable fetch failed:", r.status);
        }
      } catch (err) {
        console.warn("Airtable lookup error:", err.message);
      }
    }

    // base url MUST be set to your public origin
    const base = process.env.NEXT_PUBLIC_APP_URL || `https://your-deployment.vercel.app`;

    // ensure result maps to one of the expected images (safety)
    const ALLOWED = ["panda", "budget", "risky"];
    if (!ALLOWED.includes(result)) result = "panda";

    const image = `${base.replace(/\/$/, "")}/ogs/${encodeURIComponent(result)}.png`;
    const title = `Your Result: ${result}`;
    const desc = `I tried the Paisa Personality Quiz — my result: ${result}`;

    return {
      props: {
        title,
        desc,
        image,
        result,
      },
    };
  } catch (err) {
    // fail-safe: render a minimal page
    const base = process.env.NEXT_PUBLIC_APP_URL || `https://your-deployment.vercel.app`;
    return {
      props: {
        title: "Your Result: panda",
        desc: "I tried the Paisa Personality Quiz — my result: panda",
        image: `${base.replace(/\/$/, "")}/ogs/panda.png`,
        result: "panda",
      },
    };
  }
}
