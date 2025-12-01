// pages/index.js
import { useState } from "react";
import { useRouter } from "next/router";

export default function Quiz() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({});
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleAnswer = (q, val) => {
    setAnswers({ ...answers, [q]: val });
    setStep(step + 1);
  };

  const calculateResult = () => {
    // SIMPLE LOGIC (customize if needed)
    const score = Object.values(answers).reduce((a, b) => a + Number(b), 0);
    if (score >= 14) return "risky";
    if (score >= 8) return "panda";
    return "budget";
  };

  async function handleSubmitForm(e) {
    e.preventDefault();
    const result = calculateResult();
    setSubmitting(true);

    const r = await fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, mobile, result }),
    });

    const j = await r.json();
    router.push(j.shareUrl + "&quote=" + encodeURIComponent(j.quote));
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Paisa Personality Quiz</h1>

      {/* QUIZ QUESTIONS */}
      {step === 1 && (
        <button onClick={() => handleAnswer(1, 2)}>I save money</button>
      )}
      {step === 2 && (
        <button onClick={() => handleAnswer(2, 5)}>I like to invest often</button>
      )}
      {step === 3 && (
        <button onClick={() => handleAnswer(3, 0)}>I avoid risks</button>
      )}

      {/* DETAILS FORM */}
      {step === 4 && (
        <form onSubmit={handleSubmitForm}>
          <input
            required
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            placeholder="Mobile"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
          />
          <button type="submit" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit & View Result"}
          </button>
        </form>
      )}
    </div>
  );
}
