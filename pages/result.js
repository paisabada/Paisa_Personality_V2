import { useState } from "react";

export default function ResultPage({ result }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, mobile, result })
    });

    const data = await res.json();

    if (data.shareUrl) {
      const quote = `I tried Paisa Personality — my result: ${result}`;
      const fb = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(data.shareUrl)}&quote=${encodeURIComponent(quote)}`;
      window.location.href = fb;
    } else {
      alert("Error submitting");
    }
  };

  return (
    <div>
      <h1>Paisa Personality Quiz</h1>

      <form onSubmit={handleSubmit}>
        <input placeholder="Name" onChange={(e) => setName(e.target.value)} />
        <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
        <input placeholder="Mobile" onChange={(e) => setMobile(e.target.value)} />
        <button type="submit">Submit & Share</button>
      </form>
    </div>
  );
}

export function getServerSideProps({ query }) {
  return { props: { result: query.result || "panda" } };
}
