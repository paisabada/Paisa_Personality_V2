// pages/result.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function ResultPage() {
  const router = useRouter();
  const { result = "panda", token } = router.query;

  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(false);

  // -----------------------------
  // Quotes for each result
  // -----------------------------
  const QUOTES = {
    panda: "I tried the Paisa Personality Quiz — my result: PANDA 🐼💸. Check yours & see what kind of investor you are!",
    budget: "I tried the Paisa Personality Quiz — my result: BUDGETER 🧾💰. Find your money personality too!",
    risky: "I tried the Paisa Personality Quiz — my result: RISK-LOVER 🔥📈. Check yours and compare with friends!",
  };

  // -----------------------------
  // SHARE URL (your share page)
  // -----------------------------
  function getShareUrl() {
    return `${window.location.origin}/share?token=${encodeURIComponent(
      token || "undefined"
    )}&r=${encodeURIComponent(result)}`;
  }

  // -----------------------------
  // FACEBOOK SHARE (no SDK, reliable)
  // Waits until popup closes → then reveals
  // -----------------------------
  function shareToFacebook() {
    const shareUrl = getShareUrl();
    const quote = QUOTES[result] || QUOTES.panda;

    const fbShare = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      shareUrl
    )}&quote=${encodeURIComponent(quote)}`;

    // Open popup in center
    const w = 820,
      h = 540;
    const left = window.screenX + (window.outerWidth - w) / 2;
    const top = window.screenY + (window.outerHeight - h) / 2;

    setLoading(true);

    const popup = window.open(
      fbShare,
      "_blank",
      `toolbar=0,status=0,resizable=1,width=${w},height=${h},left=${left},top=${top}`
    );

    if (!popup) {
      alert("Popup blocked — allow popups and try again.");
      setLoading(false);
      return;
    }

    // Check every 600ms if user closed the popup
    const timer = setInterval(() => {
      if (popup.closed) {
        clearInterval(timer);
        setLoading(false);
        setRevealed(true); // Unlock result
      }
    }, 600);
  }

  return (
    <div style={{ padding: 30, fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ textAlign: "right" }}>Your Result: {result}</h1>

      {/* BEFORE SHARE (locked state) */}
      {!revealed ? (
        <div style={{ display: "flex", gap: 25, alignItems: "center" }}>
          {/* Blurred result image */}
          <img
            src={`/ogs/${result}.png`}
            alt={result}
            width="520"
            style={{
              filter: "blur(6px)",
              opacity: 0.7,
              border: "1px solid #ccc",
            }}
          />

          <div style={{ maxWidth: 350 }}>
            <p style={{ marginBottom: 20 }}>
              To reveal your full result, please share your result on Facebook.
            </p>

            <button
              onClick={shareToFacebook}
              disabled={loading}
              style={{
                padding: "12px 18px",
                background: "#1877f2",
                color: "white",
                border: "none",
                cursor: "pointer",
                fontSize: 16,
                borderRadius: 6,
                width: "100%",
              }}
            >
              {loading ? "Opening Facebook..." : "Share on Facebook"}
            </button>

            <small style={{ display: "block", marginTop: 10, color: "#777" }}>
              Tip: If popup doesn’t open, allow popups or disable browser blocking.
            </small>
          </div>
        </div>
      ) : (
        // AFTER SHARE (unlocked)
        <div style={{ marginTop: 20 }}>
          <img
            src={`/ogs/${result}.png`}
            alt={result}
            width="600"
            style={{ border: "1px solid #ddd" }}
          />

          <p style={{ marginTop: 12 }}>
            I tried the Paisa Personality Quiz — my result: {result}
          </p>

          {/* Optional share again */}
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
              getShareUrl()
            )}`}
            target="_blank"
            rel="noreferrer"
            style={{
              padding: "10px 16px",
              background: "#1877f2",
              color: "#fff",
              textDecoration: "none",
              borderRadius: 6,
              display: "inline-block",
              marginTop: 10,
            }}
          >
            Share again
          </a>
        </div>
      )}
    </div>
  );
}
