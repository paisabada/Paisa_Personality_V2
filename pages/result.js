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
    const url = `${window.location.origin}/share?token=${encodeURIComponent(token || "undefined")}&r=${encodeURIComponent(result)}`;
    return url;
  }

  // use FB UI share dialog and depend on callback to detect post_id
  const shareToFacebook = () => {
    // open fallback if sdk not loaded
    const shareUrl = getShareUrl();
    setLoading(true);

    if (window.FB && window.FB.ui) {
      window.FB.ui(
        {
          method: "share",
          href: shareUrl,
          quote: QUOTES[result] || QUOTES.panda,
        },
        function (response) {
          setLoading(false);
          // When user successfully posted, FB returns a response with post_id
          // If post_id exists => assume success
          if (response && response.post_id) {
            // reveal result
            setRevealed(true);
          } else {
            // user cancelled or no post_id
            // Show message or fallback to manual confirmation
            alert("Share cancelled or not completed. Try again or use 'I shared' fallback.");
          }
        }
      );
      return;
    }

    // Fallback: open sharer.php and also show manual 'I shared' button
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(
        QUOTES[result] || QUOTES.panda
      )}`,
      "_blank",
      "noopener,noreferrer,width=820,height=540"
    );
    setLoading(false);
    alert("If FB popup opened, complete the share. Then click 'I shared' to reveal result.");
  };

  // manual fallback button for users who can't share via sdk/popup
  const manualShared = () => {
    // You can optionally verify server-side (not possible with public FB share),
    // so this is a manual trust-based fallback.
    setRevealed(true);
  };

  return (
    <div style={{ padding: 30, fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ textAlign: "right" }}>Your Result: {result}</h1>

      {/* If not revealed -> show CTA and preview image (could be blurred) */}
      {!revealed ? (
        <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
          <div>
            {/* show OG image as preview (but blurred) */}
            <img
              src={`/ogs/${result}.png`}
              alt={result}
              width="500"
              style={{ filter: "blur(4px)", border: "1px solid #ddd" }}
            />
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
              Note: for best experience, allow popups and login to Facebook in the same browser.
            </small>
          </div>
        </div>
      ) : (
        // revealed true -> show real result (no blur)
        <div style={{ marginTop: 20 }}>
          <img src={`/ogs/${result}.png`} alt={result} width="600" style={{ border: "1px solid #ddd" }} />
          <p style={{ marginTop: 12 }}>I tried the Paisa Personality Quiz — my result: {result}</p>

          {/* Optionally show share again or save to airtable etc */}
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
