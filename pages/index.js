// pages/index.js
import { useState } from "react";
import { useRouter } from "next/router";

export default function QuizPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [resultKey, setResultKey] = useState("panda"); // controlled by quiz logic
  const [loading, setLoading] = useState(false);

  // TODO: replace with real quiz logic that sets resultKey = 'panda'|'budget'|'risky'
  // For demo we show a simple selector
  return (
    <div style={{ padding: 30 }}>
      <h1>Paisa Personality Quiz (demo)</h1>

      <div style={{ marginBottom: 12 }}>
        <label>Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} style={{ marginLeft: 8 }} />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label>Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} style={{ marginLeft: 8 }} />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label>Phone</label>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} style={{ marginLeft: 8 }} />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label>Pick result (demo)</label>
        <select value={resultKey} onChange={(e) => setResultKey(e.target.value)} style={{ marginLeft: 8 }}>
          <option value="panda">panda</option>
          <option value="budget">budget</option>
          <option value="risky">risky</option>
        </select>
      </div>

      <div>
        <button
          onClick={async () => {
            if (!name || !email) return alert("Name and email required");
            setLoading(true);
            const r = await fetch("/api/submit", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name, email, phone, resultKey }),
            }).then((r) => r.json());
            setLoading(false);
            if (r?.token) {
              router.push(`/result?token=${r.token}`);
            } else alert("Error saving response");
          }}
          disabled={loading}
        >
          {loading ? "Saving..." : "Submit & see result"}
        </button>
      </div>
    </div>
  );
}
