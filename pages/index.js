// pages/index.js
import { useState } from "react";
import { useRouter } from "next/router";

const QUESTIONS = [
  {
    id: "q1",
    text: "When you get extra money, you usually:",
    options: [
      { label: "Save it for safety", value: "panda" },
      { label: "Plan a strict budget", value: "budget" },
      { label: "Invest it in high-return ideas", value: "risky" },
    ],
  },
  {
    id: "q2",
    text: "Your investing horizon is:",
    options: [
      { label: "Long-term (5+ years)", value: "panda" },
      { label: "Medium (2-5 years)", value: "budget" },
      { label: "Short-term / trade often", value: "risky" },
    ],
  },
  {
    id: "q3",
    text: "If markets drop 20% tomorrow, you will:",
    options: [
      { label: "Take cover and reduce exposure", value: "panda" },
      { label: "Hold steady and follow plan", value: "budget" },
      { label: "Buy more aggressively", value: "risky" },
    ],
  },
  {
    id: "q4",
    text: "When choosing products you prefer:",
    options: [
      { label: "Low fees & low volatility", value: "panda" },
      { label: "Balanced mix of safety + returns", value: "budget" },
      { label: "Maximum returns even with risk", value: "risky" },
    ],
  },
  {
    id: "q5",
    text: "How often do you check your investments?",
    options: [
      { label: "Rarely — long term", value: "panda" },
      { label: "Monthly or quarterly", value: "budget" },
      { label: "Daily or multiple times a week", value: "risky" },
    ],
  },
  {
    id: "q6",
    text: "Your emergency fund should be:",
    options: [
      { label: "6+ months living expenses", value: "panda" },
      { label: "3-6 months", value: "budget" },
      { label: "I prefer to invest instead", value: "risky" },
    ],
  },
  {
    id: "q7",
    text: "If a friend suggests a hot stock, you:",
    options: [
      { label: "Research thoroughly before any move", value: "panda" },
      { label: "Consider adding small allocation", value: "budget" },
      { label: "Jump in quickly to capture gains", value: "risky" },
    ],
  },
  {
    id: "q8",
    text: "What's most important to you?",
    options: [
      { label: "Preserve capital", value: "panda" },
      { label: "Steady growth", value: "budget" },
      { label: "High upside", value: "risky" },
    ],
  },
  {
    id: "q9",
    text: "Your reaction to financial news headlines is to:",
    options: [
      { label: "Ignore unless it affects my plan", value: "panda" },
      { label: "Monitor, maybe adjust allocation", value: "budget" },
      { label: "Act quickly based on momentum", value: "risky" },
    ],
  },
];

function computeResultFromAnswers(answers) {
  const counts = { panda: 0, budget: 0, risky: 0 };
  for (const q of QUESTIONS) {
    const a = answers[q.id];
    if (a && counts[a] !== undefined) counts[a]++;
  }
  // pick winner; tie-breaker: panda > budget > risky (deterministic)
  const order = ["panda", "budget", "risky"];
  let winner = "panda";
  let max = -1;
  for (const k of order) {
    if (counts[k] > max) {
      max = counts[k];
      winner = k;
    }
  }
  return winner;
}

export default function QuizPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);

  const onSelect = (qId, val) => {
    setAnswers((s) => ({ ...s, [qId]: val }));
  };

  const validate = () => {
    if (!name.trim()) {
      alert("Please enter your name.");
      return false;
    }
    if (!email.trim()) {
      alert("Please enter email.");
      return false;
    }
    // basic email check
    if (!/\S+@\S+\.\S+/.test(email)) {
      alert("Please enter a valid email.");
      return false;
    }
    // ensure all questions answered
    for (const q of QUESTIONS) {
      if (!answers[q.id]) {
        alert("Please answer all questions (missing: " + q.text + ")");
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    // compute a pre-check result client-side (server will also compute)
    const result = computeResultFromAnswers(answers);

    try {
      const resp = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          answers,
        }),
      });
      const data = await resp.json();
      setLoading(false);

      if (!resp.ok) {
        console.error(data);
        alert(data.error || "Submission failed");
        return;
      }

      // data should contain token and result (server computed). fallback to client result
      const token = data.token;
      const serverResult = data.result || result;

      // redirect to result page (result preview will be blurred until share)
      router.push(`/result?result=${encodeURIComponent(serverResult)}&token=${encodeURIComponent(token)}`);
    } catch (err) {
      console.error(err);
      setLoading(false);
      alert("Network error. Try again.");
    }
  };

  return (
    <div style={styles.wrap}>
      <h1 style={styles.title}>Paisa Personality Quiz</h1>

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.row}>
          <label style={styles.label}>Name</label>
          <input style={styles.input} value={name} onChange={(e) => setName(e.target.value)} required />
        </div>

        <div style={styles.row}>
          <label style={styles.label}>Email</label>
          <input style={styles.input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>

        <div style={styles.row}>
          <label style={styles.label}>Mobile (optional)</label>
          <input style={styles.input} value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>

        <hr style={{ margin: "18px 0" }} />

        <div>
          {QUESTIONS.map((q, idx) => (
            <div key={q.id} style={styles.questionBox}>
              <div style={styles.qTitle}>
                {idx + 1}. {q.text}
              </div>
              <div style={styles.options}>
                {q.options.map((opt) => (
                  <label key={opt.label} style={styles.optionLabel}>
                    <input
                      type="radio"
                      name={q.id}
                      value={opt.value}
                      checked={answers[q.id] === opt.value}
                      onChange={() => onSelect(q.id, opt.value)}
                    />{" "}
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 20 }}>
          <button type="submit" style={styles.submitButton} disabled={loading}>
            {loading ? "Submitting…" : "Submit & Get Share Link"}
          </button>
        </div>

        <p style={{ color: "#666", marginTop: 12 }}>
          After submit you'll get a shareable result page. Full result is revealed after sharing on Facebook (or using the
          manual reveal button).
        </p>
      </form>
    </div>
  );
}

const styles = {
  wrap: {
    maxWidth: 900,
    margin: "24px auto",
    padding: 20,
    fontFamily: "Inter, Roboto, Arial, sans-serif",
  },
  title: {
    marginBottom: 12,
    textAlign: "center",
  },
  form: {
    background: "#fff",
    borderRadius: 8,
    padding: 18,
    boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
  },
  row: {
    display: "flex",
    flexDirection: "column",
    marginBottom: 12,
  },
  label: {
    marginBottom: 6,
    fontWeight: 600,
  },
  input: {
    padding: "10px 12px",
    borderRadius: 6,
    border: "1px solid #ddd",
    fontSize: 16,
  },
  questionBox: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 6,
    border: "1px solid #f0f0f0",
    background: "#fafafa",
  },
  qTitle: {
    fontWeight: 600,
    marginBottom: 8,
  },
  options: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  optionLabel: {
    cursor: "pointer",
    userSelect: "none",
  },
  submitButton: {
    padding: "12px 18px",
    background: "#0b74ff",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 16,
    cursor: "pointer",
  },
};
