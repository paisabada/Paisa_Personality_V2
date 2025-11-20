import { randomUUID } from 'crypto';

const store = global.__tokenStore || (global.__tokenStore = {});

export default function handler(req, res) {
  const { name, result } = req.body;
  const token = randomUUID();

  store[token] = {
    name,
    img: result // "budget" / "risky" / "panda"
  };

  res.json({
    shareUrl: `/share/${token}`
  });
}
