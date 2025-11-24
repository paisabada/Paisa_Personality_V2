// components/SubmitForm.jsx
import { useState } from 'react';
import Router from 'next/router';

export default function SubmitForm({ initialResultType }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false);
  const resultType = initialResultType || 'budget';

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const r = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, mobile, resultType })
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || 'Submit failed');
      Router.push(data.shareUrl);
    } catch (err) {
      alert('Error: ' + err.message);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display:'grid', gap:8, maxWidth:420 }}>
      <input required placeholder="Name" value={name} onChange={e=>setName(e.target.value)} />
      <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input placeholder="Mobile" value={mobile} onChange={e=>setMobile(e.target.value)} />
      <button type="submit" disabled={loading}>{loading ? 'Please wait...' : 'Submit & Share'}</button>
    </form>
  );
}
