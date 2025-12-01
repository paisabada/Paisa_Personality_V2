// components/SubmitForm.jsx (simplified)
import { useState } from "react";

export default function SubmitForm({ result }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, mobile, result })
    });
    const data = await res.json();
    setLoading(false);
    if (data?.shareUrl) {
      // open Facebook share dialog with quote param (prefill message)
      const quote = `I tried the Paisa Personality quiz — my result: ${result}. Try now!`;
      const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(data.shareUrl)}&quote=${encodeURIComponent(quote)}`;
      window.open(fbUrl, "_blank", "width=800,height=600");
    } else {
      alert("Something went wrong");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input required value={name} onChange={e=>setName(e.target.value)} placeholder="Name" />
      <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email"/>
      <input value={mobile} onChange={e=>setMobile(e.target.value)} placeholder="Mobile"/>
      <button type="submit" disabled={loading}>Share on Facebook</button>
    </form>
  );
}
