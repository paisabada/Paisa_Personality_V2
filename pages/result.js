// pages/result.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function ResultPage() {
  const router = useRouter();
  const { result = "panda", token } = router.query;
  const [fbLoaded, setFbLoaded] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(false);

  // --- load FB SDK once ---
  useEffect(() => {
    if (window.FB) {
      setFbLoaded(true);
      return;
    }
    const id = "facebook-jssdk";
    if (document.getElementById(id)) {
      setFbLoaded(true);
      return;
    }
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

  // quotes mapping (for share text)
  const QUOTES = {
    panda:
      "I tried the Paisa Personality Quiz — my result: PANDA 🐼💸. Check yours & see what kind of investor you are!",
    budget:
      "I tried the Paisa Personality Quiz — my result: BUDGETER 🧾💰. Try it — find out your money-personality and share!",
    risky:
      "I tried the Paisa Personality Quiz — my result: RISK-LOVER 🔥📈. Dare to check yours and compare with friends!",
  };

  function getShareUrl() {
    // share page should be accessible and contain OG tags
    const base = window.location.origin;
    const tokenParam = token ? `token=${encodeURIComponent(token)}` : "";
    const rParam = `r=${encodeURIComponent(result)}`;
    const q = [tokenParam, rParam].filter(Boolean).join("&");
    const url = `${base}/share${q ? "?" + q : ""}`;
    return url;
  }

  // Use FB UI share dialog and detect response (post_id)
  const shareToFacebook = () => {
    const shareUrl = getShareUrl();
    setLoading(true);

    // If FB SDK available, use share_open_graph for better control
    if (window.FB && window.FB.ui) {
      window.FB.ui(
        {
          method: "share_open_graph",
          action_type: "og.shares",
          action_properties: JSON.stringify({
            object: {
              "og:url": shareUrl,
              "og:title": `Your Result: ${result}`,
              "og:description": QUOTES[result] || QUOTES.panda,
              // NOTE: og:image should be present in the /share page OG tags,
              // but we can also pass a direct image URL (absolute) here if needed:
              // "og:image": `${window.location.origin}/ogs/${result}.png`
            },
          }),
        },
        function (response) {
          setLoading(false);
          // If FB returns post_id => success
          if (response && response.post_id) {
            setRevealed(true);
            return;
          }

          // Some platforms/browsers won't return post_id even if posted (unreliable)
          // Fallback: show manual "I shared" option
          alert(
            "Share was not confirmed automatically. If the composer opened, complete the post in Facebook. Then click 'I shared' to reveal your result."
          );
        }
      );
      return;
    }

    // Fallback: open sharer.php in a new tab (can't detect post_id)
    const sharer = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      shareUrl
    )}&quote=${encodeURIComponent(QUOTES[result] || QUOTES.panda)}`;

    window.open(sharer, "_blank", "noopener,noreferrer,width=820,height=540");
    setLoading(false);
    alert(
      "If the FB share window opened, complete the share. Then click 'I shared' to reveal your result."
    );
  };

  // manual fallback button for users who can't share via sdk/popup
  const manualShared = () => {
    // Optionally, you could verify server-side (not possible with public FB share)
    setRevealed(true);
  };

  return (
    <div style={{ padding: 30, fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ textAlign: "right" }}>Your Result: {result}</h1>

      {/* If not revealed -> show CTA and preview placeholder (do NOT show real image) */}
      {!revealed ? (
        <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
          <div>
            {/* DO NOT show the actual /ogs/{result}.png here.
                Show a neutral blurred placeholder or hidden box to avoid spoiling. */}
            <div
              style={{
                width: 500,
                height: 300,
                background: "#f3f3f3",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#999",
                border: "1px solid #ddd",
                borderRadius: 6,
              }}
            >
              <div>
                <div style={{ fontSize: 16, marginBottom: 8 }}>Share to reveal</div>
                <div style={{ fontSize: 12, color: "#bbb" }}>
                  Your result will be revealed after Facebook share is confirmed.
                </div>
              </div>
            </div>
          </div>

          <div style={{ maxWidth: 360 }}>
            <p>
              To reveal your full result, please share your result on Facebook.
              (This keeps the quiz viral and helps us grow.)
            </p>

            <button
              onClick={shareToFacebook}
              disabled={loading}
              style={{
                padding: "12px 18px",
                background: "#1877f2",
                color: "#fff",
                border: "none",
                cursor: "pointer",
                fontSize: 16,
                borderRadius: 6,
              }}
            >
              {loading ? "Opening Facebook..." : "Share on Facebook"}
            </button>

            <div style={{ marginTop: 12 }}>
              <button
                onClick={manualShared}
                style={{
                  padding: "8px 12px",
                  background: "#eee",
                  border: "1px solid #ccc",
                  cursor: "pointer",
                }}
              >
                I shared — reveal my result
              </button>
            </div>

            <small style={{ display: "block", marginTop: 10, color: "#666" }}>
              Tip: allow popups and make sure you're logged into Facebook in this browser.
            </small>
          </div>
        </div>
      ) : (
        // revealed true -> show real result (no blur)
        <div style={{ marginTop: 20 }}>
          <img src={`/ogs/${result}.png`} alt={result} width="600" style={{ border: "1px solid #ddd" }} />
          <p style={{ marginTop: 12 }}>I tried the Paisa Personality Quiz — my result: {result}</p>

          <div style={{ marginTop: 12 }}>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getShareUrl())}`}
              target="_blank"
              rel="noreferrer"
              style={{
                padding: "10px 16px",
                background: "#1877f2",
                color: "#fff",
                textDecoration: "none",
                borderRadius: 6,
              }}
            >
              Share again
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
