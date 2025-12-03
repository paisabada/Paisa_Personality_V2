// pages/index.js
import { useState } from "react";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();

  // Four final questions (same text as your HTML)
  const questions = [
    { id: "q1", q: "How do you usually decide your monthly savings?", a: ["I save what's left.", "I plan and allocate in advance.", "Depends on the month."] },
    { id: "q2", q: "What's your first reaction when you get a bonus?", a: ["Shopping spree!", "Invest it smartly.", "Treat myself a bit, save the rest."] },
    { id: "q3", q: "What does 'budget' mean to you?", a: ["Too restrictive.", "My best friend.", "Something I try to follow."] },
    { id: "q4", q: "Your biggest money goal is:", a: ["Live comfortably now.", "Build long-term wealth.", "Balance today and tomorrow."] },
  ];

  // map option index -> result tag (we'll keep deterministic mapping)
  // option 0 -> 'risky', option 1 -> 'panda' (investor), option 2 -> 'budget'
  const optToResult = ["risky", "panda", "budget"];

  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState([]); // store selected index per question
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [occupation, setOccupation] = useState("");
  const [sending, setSending] = useState(false);

  function selectAnswer(index) {
    setAnswers(prev => {
      const next = [...prev];
      next[currentQ] = index;
      return next;
    });
    setCurrentQ(prev => prev + 1);
  }

  function computeResultFromAnswers(ans) {
    // count occurrences of result types
    const counts = { panda: 0, budget: 0, risky: 0 };
    for (let i = 0; i < ans.length; i++) {
      const sel = ans[i];
      const tag = optToResult[sel] || "panda";
      counts[tag] = (counts[tag] || 0) + 1;
    }
    // deterministic tiebreaker: panda > budget > risky
    const order = ["panda", "budget", "risky"];
    let winner = order[0];
    let max = -1;
    for (const k of order) {
      if (counts[k] > max) { max = counts[k]; winner = k; }
    }
    return winner;
  }

  async function submitForm() {
    // ensure answers length = 4 and all fields filled
    if (answers.length < questions.length || answers.some(v => v === undefined)) {
      alert("Please answer all questions.");
      return;
    }
    if (!name || !mobile || !email || !city || !occupation) {
      alert("Please fill all required fields.");
      return;
    }

    setSending(true);
    const resultTag = computeResultFromAnswers(answers);

    // call your API which saves to Airtable + sends email (pages/api/submit.js)
    try {
      const resp = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, email, phone: mobile, city, occupation,
          answers: questions.map((q, i) => ({ q: q.q, selectedIndex: answers[i], selectedText: q.a[answers[i]] })),
        }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        console.error("submit error", data);
        alert(data.error || "Submission failed");
        setSending(false);
        return;
      }
      const token = data.token;
      // optional: generate pdf client-side (like your old flow) and auto-download
      await generatePDF(name, resultTag);

      // redirect to result page (FB share flow)
      router.push(`/result?result=${encodeURIComponent(resultTag)}&token=${encodeURIComponent(token)}`);
    } catch (err) {
      console.error(err);
      alert("Network error. Try again.");
      setSending(false);
    }
  }

  // optional PDF generation (uses jspdf from CDN if loaded)
  async function generatePDF(name, resultTag) {
    try {
      if (!window.jspdf) return;
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.text("Your Paisa Personality Report", 20, 20);
      doc.setFontSize(14);
      doc.text(`Name: ${name}`, 20, 40);
      doc.text(`Personality: ${resultTag}`, 20, 50);
      doc.text("Insights:", 20, 65);
      doc.setFontSize(12);
      doc.text("This personality reflects your unique approach to money!", 20, 75, { maxWidth: 170 });
      const fileName = `paisa_personality_${(name || "user").replace(/\s+/g,"_")}.pdf`;
      doc.save(fileName);
    } catch (e) {
      console.warn("pdf gen failed", e);
    }
  }

  // render question block or final form
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#f4f8f7", minHeight: "100vh", padding: 24 }}>
      <div style={{ maxWidth: 600, margin: "40px auto", background: "#fff", borderRadius: 12, padding: 24, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
        <div id="quiz">
          {currentQ < questions.length ? (
            <div id="question-step">
              <div className="question" style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>{questions[currentQ].q}</div>
              <div className="options" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {questions[currentQ].a.map((opt, idx) => (
                  <div key={idx}
                    className="option"
                    onClick={() => selectAnswer(idx)}
                    style={{ background: "#e8f5e9", padding: 12, borderRadius: 8, cursor: "pointer", transition: "all .3s" }}
                  >
                    {opt}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="form-container">
              <h2 style={{ marginTop: 0 }}>Almost Done! Tell us about you:</h2>
              <input style={{ display: "block", width: "100%", padding: 10, marginBottom: 12, border: "1px solid #ccc", borderRadius: 6 }} value={name} onChange={e => setName(e.target.value)} placeholder="Name" required />
              <input style={{ display: "block", width: "100%", padding: 10, marginBottom: 12, border: "1px solid #ccc", borderRadius: 6 }} value={mobile} onChange={e => setMobile(e.target.value)} placeholder="Mobile Number" required />
              <input style={{ display: "block", width: "100%", padding: 10, marginBottom: 12, border: "1px solid #ccc", borderRadius: 6 }} value={email} onChange={e => setEmail(e.target.value)} placeholder="Email Address" required />
              <input style={{ display: "block", width: "100%", padding: 10, marginBottom: 12, border: "1px solid #ccc", borderRadius: 6 }} value={city} onChange={e => setCity(e.target.value)} placeholder="City" required />
              <input style={{ display: "block", width: "100%", padding: 10, marginBottom: 12, border: "1px solid #ccc", borderRadius: 6 }} value={occupation} onChange={e => setOccupation(e.target.value)} placeholder="Occupation" required />
              <button onClick={submitForm} disabled={sending} className="submit-btn" style={{ background: "#28a745", color: "#fff", border: "none", padding: "12px 24px", fontSize: 16, borderRadius: 6, cursor: "pointer" }}>
                {sending ? "Submitting..." : "Get My Paisa Personality"}
              </button>
            </div>
          )}
        </div>
      </div>

      <div style={{ textAlign: "center", color: "#888", marginTop: 8 }}>
        <small>Tip: Allow popups for Facebook share on the next screen.</small>
      </div>
    </div>
  );
}
