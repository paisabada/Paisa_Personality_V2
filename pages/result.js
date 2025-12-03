// pages/result.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function ResultPage() {
  const router = useRouter();
  // prefer router.query.result but fallback to 'panda'
  const { result: qResult = "panda", token } = router.query;
  const [result, setResult] = useState(qResult);
  const [fbLoaded, setFbLoaded] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(false);

  // keep result in sync if router changes
  useEffect(() => {
    if (qResult) setResult(qResult);
  }, [qResult]);

  // --- load FB SDK once ---
  useEffect(() => {
    if (typeof window === "undefined") return;
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

  function getShareUrl() {
    const base = window.location.origin;
    // ensure result is safe and lowercase (matches your /ogs filenames)
    const r = String(result || "panda").toLowerCase();
    // include token if available so share page can show proper OG from Airtable
    const tokenParam = token ? `&token=${encodeURIComponent(token)}` : "";
    return `${base}/share?r=${encodeURIComponent(r)}${tokenParam}`;
  }

  // use FB UI share dialog and depend on callback to detect post_id
  const shareToFacebook = () => {
    const shareUrl = getShareUrl();
    setLoading(true);

    if (window.FB && window.FB.ui) {
      window.FB.ui(
        {
          method: "share",
          href: shareUrl,
          quote: `I tried the Paisa Personality Quiz — my result: ${result}. Try it!`,
        },
        function (response) {
          setLoading(false);
          if (response && response.post_id) {
            // FB returned post_id => confirmed
            setRevealed(true);
          } else {
            // Not confirmed or browser blocking - show friendly fallback, don't show scary modal
            window.alert(
              "Facebook didn't return a confirmation. If a composer opened, finish the post there. Otherwise click 'I shared' to reveal."
            );
          }
        }
      );
      return;
    }

    // Fallback: open sharer.php and show manual confirm button
    // append cache-buster so Facebook doesn't show stale cached image
    const fallbackUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      shareUrl
    )}&quote=${encodeURIComponent(
      `I tried the Paisa Personality Quiz — my result: ${result}. Try it!`
    )}&v=${Date.now()}`;

    window.open(fallbackUrl, "_blank", "noopener,noreferrer,width=820,height=540");
    setLoading(false);
    window.alert(
      "A Facebook window opened. Complete the share there. If you completed it, click 'I shared — reveal my result'."
    );
  };

  // manual fallback button for users who can't share via sdk/popup
  const manualShared = () => {
    // Optionally you can call an API to verify/share server-side.
    setRevealed(true);
  };

  return (
    <div style={{ padding: 30, fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ textAlign: "right" }}>Your Result: {result}</h1>

      {/* If not revealed -> show CTA and small placeholder */}
      {!revealed ? (
        <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
          <div>
            {/* show a blurred/hidden preview placeholder (not the real OG image) */}
            <div
              style={{
                width: 500,
                height: 300,
                background: "#f0f0f0",
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#888",
                border: "1px solid #e0e0e0",
              }}
            >
              <div>Reveal after you share on Facebook</div>
            </div>
          </div>

          <div style={{ maxWidth: 360 }}>
            <p>
              To reveal your full result, please share your result on Facebook. (This keeps the quiz viral and helps us grow.)
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
              Tip: login to Facebook in this browser and allow popups for the best experience.
            </small>
          </div>
        </div>
      ) : (
        // revealed true -> show real result (no blur)
        <div style={{ marginTop: 20 }}>
          <img src={`/ogs/${String(result).toLowerCase()}.png`} alt={result} width="600" style={{ border: "1px solid #ddd" }} />
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
