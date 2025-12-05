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
  const [notice, setNotice] = useState("");

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
    // origin
    const base = typeof window !== "undefined" ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL || "";
    // ensure result is safe and lowercase (matches your /ogs filenames)
    const r = String(result || "panda").toLowerCase();
    // include token if available so share page can show proper OG from Airtable
    const tokenParam = token ? `&token=${encodeURIComponent(token)}` : "";
    // cache-buster to force FB to re-fetch OG tags when necessary
    const v = `&v=${Date.now()}`;

    return `${base}/share?r=${encodeURIComponent(r)}${tokenParam}${v}`;
  }

  // use FB UI share dialog and depend on callback to detect post_id
  const shareToFacebook = () => {
    const shareUrl = getShareUrl();
    setLoading(true);
    setNotice("");

    try {
      if (window.FB && typeof window.FB.ui === "function") {
        window.FB.ui(
          {
            method: "share",
            href: shareUrl,
            quote: `I tried the Paisa Personality Quiz — my result: ${result}. Try it!`,
          },
          function (response) {
            setLoading(false);
            // If FB returns post_id -> they posted
            if (response && response.post_id) {
              setRevealed(true);
              setNotice("");
            } else {
              // FB didn't return post_id (common when composer opened but no callback)
              // Show non-blocking hint for user to finish post manually and click reveal.
              setNotice(
                "If a Facebook composer opened, finish posting there. If you completed the post, click \"I shared — reveal my result\" below."
              );
            }
          }
        );
        return;
      }
    } catch (err) {
      console.warn("FB.ui failed:", err);
      setLoading(false);
      // fallthrough to fallback
    }

    // Fallback: open sharer.php and show manual confirm button
    // include cache-buster in shareUrl (already included in getShareUrl)
    const fallbackUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      shareUrl
    )}&quote=${encodeURIComponent(`I tried the Paisa Personality Quiz — my result: ${result}. Try it!`)}`;

    window.open(fallbackUrl, "_blank", "noopener,noreferrer,width=820,height=540");
    setLoading(false);
    setNotice(
      "A Facebook window opened. Complete the share there. If you completed it, click 'I shared — reveal my result'."
    );
  };

  // manual fallback button for users who can't share via sdk/popup
  const manualShared = () => {
    // Optionally you can call an API to verify/share server-side.
    setRevealed(true);
    setNotice("");
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

            {notice && (
              <div style={{ marginTop: 12, color: "#444", background: "#fff7cc", padding: 10, borderRadius: 6 }}>
                {notice}
              </div>
            )}

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
