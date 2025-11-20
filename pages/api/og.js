// pages/api/og.js
import { ImageResponse } from '@vercel/og';

export const config = {
  runtime: 'edge',
};

const templates = {
  budget: '/ogs/budget.png',
  risky: '/ogs/risky.png',
  panda: '/ogs/panda.png'
};

function sanitizeName(s) {
  if (!s) return '';
  const clean = s.replace(/[^ \w\-À-ž]/g, '').trim();
  return clean.length > 20 ? clean.slice(0, 20) + '…' : clean;
}

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const rawName = searchParams.get('name') || '';
  const imgKey = searchParams.get('img') || 'budget';
  const name = sanitizeName(rawName);
  const tpl = templates[imgKey] || templates.budget;

  const positions = {
    budget: { x: 600, y: 460, fontSize: 120 },
    risky: { x: 600, y: 380, fontSize: 120 },
    panda: { x: 600, y: 500, fontSize: 120 }
  };
  const pos = positions[imgKey];

  const bgUrl = new URL(tpl, import.meta.url).toString();

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          backgroundImage: `url(${bgUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: `${pos.x}px`,
            top: `${pos.y}px`,
            transform: 'translate(-50%, -50%)',
            fontSize: `${pos.fontSize}px`,
            fontWeight: 700,
            color: '#fff',
            textShadow: '0 4px 10px rgba(0,0,0,0.6)',
            WebkitTextStroke: '5px rgba(0,0,0,0.5)',
            lineHeight: 1,
          }}
        >
          {name}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
