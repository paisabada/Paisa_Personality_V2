// pages/result.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function ResultPage({ initialRecord }) {
  const router = useRouter();
  const token = router.query.token || router.query.t || (initialRecord?.fields?.Token ?? null);
  const result = initialRecord?.fields?.Result || "panda";
  const [fbLoaded, setFbLoaded] = useState(false);
  const [revealed, setRevealed] = useState(Boolean(initialRecord?.fields?.Share_confirmed));
  const [loading, setLoading] = useState(false);

  // load FB SDK
  useEffect(() => {
    if (window.FB) return setFbLoaded(true);
    const id = "facebook-jssdk";
    if (document.getElementById(id)) return setFbLoaded(true);

    window.fbAsyncInit = function () {
      window.FB.init({
        appId: process.env.NEXT_PUBLIC_FB_APP_ID || "YOUR_FB_APP_ID",
        xfbml: false,
        version: "v16.0",
      });
      setFbLoaded(true);
    };

    const s = document.createElement("script");
    s.id = id;
    s.src = "https://connect.facebook.net/en_US/sdk.js";
    s.async = true;
    document.body.appendChild(s);
  }, []);

  function getShareUrl() {
    return `${window.location.origin}/share?token=${encodeURIComponent(token)}`;
  }

  async function confirmShareOnServer(post_id, manual = false) {
    await fetch("/api/confirm-share", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, post_id, manual }),
    });
    setRevealed(true);
  }

  const shareToFacebook = async () => {
    setLoading(true);
    const shareUrl = getShareUrl();

    if (window.FB && window.FB.ui) {
      window.FB.ui(
        {
          method: "share",
          href: shareUrl,
          quote: `I tried the Paisa Personality Quiz — my result: ${result}`,
        },
        function (response) {
          setLoading(false);
          if (response && response.post_id) {
            // Confirm on server
            confirmShareOnServer(response.post_id, false);
          } else {
            alert("Share cancelled or not completed. Use 'I shared' if you did share.");
          }
        }
      );
      return;
    }

    // fallback to sharer.php
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(
        `I tried the Paisa Personality Quiz — my result: ${result}`
      )}`,
      "_blank",
      "noopener,noreferrer,width=820,height=540"
    );
    setLoading(false);
    alert("If FB popup opened, please complete the share and then click 'I shared' to reveal.");
  };

  const manualShared = async () => {
    // optional: ask user to paste post url or just trust
    const ok = confirm("If you have posted on Facebook, click OK to reveal. This is a trust fallback.");
    if (!ok) return;
    setLoading(true);
    await confirmShareOnServer("", true);
    setLoading(false);
  };

  return (
    <div style={{ padding: 30 }}>
      <h1 style={{ textAlign: "right" }}>Your Result: {result}</h1>

      {!revealed ? (
        <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
          <div>
            {/* blurred preview */}
            <img src={`/ogs/${result}.png`} alt={result} width="500" style={{ filter: "blur(6px)", border: "1px solid #ddd" }} />
          </div>

          <div style={{ maxWidth: 360 }}>
            <p>To reveal your full result, please share your result on Facebook.</p>

            <button onClick={shareToFacebook} disabled={loading} style={{ padding: "12px 18px", background: "#1877f2", color: "#fff", border: "none", cursor: "pointer", fontSize: 16, borderRadius: 6 }}>
              {loading ? "Opening Facebook..." : "Share on Facebook"}
            </button>

            <div style={{ marginTop: 12 }}>
              <button onClick={manualShared} style={{ padding: "8px 12px", background: "#eee", border: "1px solid #ccc", cursor: "pointer" }}>
                I shared — reveal my result
              </button>
            </div>

            <small style={{ display: "block", marginTop: 10, color: "#666" }}>
              Tip: allow popups and ensure you're logged into Facebook in this browser.
            </small>
          </div>
        </div>
      ) : (
        <div style={{ marginTop: 20 }}>
          <img src={`/ogs/${result}.png`} alt={result} width="600" style={{ border: "1px solid #ddd" }} />
          <p style={{ marginTop: 12 }}>I tried the Paisa Personality Quiz — my result: {result}</p>
          <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getShareUrl())}`} target="_blank" rel="noreferrer" style={{ padding: "10px 16px", background: "#1877f2", color: "#fff", textDecoration: "none", borderRadius: 6 }}>
            Share again
          </a>
        </div>
      )}
    </div>
  );
}

import { airtableFindByToken } from "../lib/airtable";

export async function getServerSideProps({ query }) {
  const token = query.token || null;
  if (!token) {
    // anti-skip: redirect to homepage if no token
    return { redirect: { destination: "/", permanent: false } };
  }
  const rec = await airtableFindByToken(token);
  if (!rec) {
    return { redirect: { destination: "/", permanent: false } };
  }
  return { props: { initialRecord: rec } };
}
