import { useRouter } from "next/router";

export default function ResultPage() {
  const router = useRouter();
  const { result, token } = router.query;

  // ---- Facebook Share Function ----
  function shareToFacebook(resultKey, token) {
    const QUOTES = {
      panda:
        "I tried the Paisa Personality Quiz — my result: PANDA 🐼💸. Check yours & see what kind of investor you are!",
      budget:
        "I tried the Paisa Personality Quiz — my result: BUDGETER 🧾💰. Try it — find out your money-personality and share!",
      risky:
        "I tried the Paisa Personality Quiz — my result: RISK-LOVER 🔥📈. Dare to check yours and compare with friends!",
    };

    const shareUrl = encodeURIComponent(
      `${window.location.origin}/share?token=${token}`
    );
    const quote = encodeURIComponent(QUOTES[resultKey] || QUOTES["panda"]);

    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&quote=${quote}`;

    window.open(fbUrl, "_blank", "noopener,noreferrer,width=820,height=540");
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Your Result: {result}</h1>

      <img
        src={`/ogs/${result}.png`}
        alt="result"
        width="400"
        style={{ marginTop: 20 }}
      />

      <p style={{ marginTop: 20 }}>
        I tried the Paisa Personality Quiz — my result: {result}
      </p>

      {/* --- SHARE BUTTON --- */}
      <button
        style={{
          marginTop: 30,
          padding: "12px 22px",
          border: "1px solid #000",
          background: "#fff",
          cursor: "pointer",
        }}
        onClick={() => shareToFacebook(result, token)}
      >
        Share on Facebook
      </button>
    </div>
  );
}
