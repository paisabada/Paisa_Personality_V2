// components/SubmitForm.jsx
import { useState } from "react";
import { useRouter } from "next/router";

export default function SubmitForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [result, setResult] = useState(""); // set result from quiz (budget|panda|risky)
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name || !result) return alert("Please fill name and finish quiz.");

    setLoading(true);
    try {
      const r = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, mobile, result }),
      });
      const j = await r.json();
      if (!r.ok) throw j;
      // Redirect to share page with quote param (optional)
      const redirectUrl = `${j.shareUrl}&quote=${encodeURIComponent(j.quote)}`;
      // Use router push so share page OG tags are served server-side
      router.push(redirectUrl);
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Try again.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Name" required />
      <input value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Email" />
      <input value={mobile} onChange={(e)=>setMobile(e.target.value)} placeholder="Mobile" />
      {/* result should be set by quiz logic; here's a quick selector for testing */}
      <select value={result} onChange={(e)=>setResult(e.target.value)} required>
        <option value="">Pick result</option>
        <option value="budget">Budget</option>
        <option value="panda">Panda</option>
        <option value="risky">Risky</option>
      </select>

      <button type="submit" disabled={loading}>{loading ? "Saving..." : "Submit & Share"}</button>
    </form>
  );
}
