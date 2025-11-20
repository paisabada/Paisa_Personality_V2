// pages/api/og.js
import { ImageResponse } from '@vercel/og';

export const config = {
  runtime: 'edge', // run at edge
};

const templates = {
  budget: '/ogs/budget.png',
  risky: '/ogs/risky.png',
  panda: '/ogs/panda.png'
};

// helper: sanitize name
function sanitizeName(s) {
  if (!s) return '';
  // limit length to avoid overflow — trimming to 20 chars (you can adjust)
  const clean = s.replace(/[^ \w\-À-ž]/g, '').trim();
  return clean.length > 20 ? clean.slice(0, 20) + '…' : clean;
}

export default async function handler(req) {
  try {
    const { searchParams } = new URL(req.url);
    const rawName = searchParams.get('name') || '';
    const imgKey = searchParams.get('img') || 'budget';
    const name = sanitizeName(rawName);
    const tpl = templates[imgKey] || templates.budget;

    // Load background image from /public
    // Vercel allows relative path here — using new URL to load asset
    const bgUrl = new URL(tpl, import.meta.url).toString();

    // Choose Y offset per template (locked positions you tested)
    const positions = {
      budget: { x: 600, y: 460, fontSize: 120 },
      risky: { x: 600, y: 380, fontSize: 120 },
      panda: { x: 600, y: 500, fontSize: 120 }
    };
    const pos = positions[imgKey] || positions.budget;

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
            fontFamily: 'Inter, Arial, sans-serif',
            // background image
            backgroundImage: `url(${bgUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Name overlay — centered at locked coordinates (we use absolute positioning) */}
          <div
            style={{
              position: 'absolute',
              left: `${pos.x}px`,
              top: `${pos.y}px`,
              transform: 'translate(-50%, -50%)',
              // we render the text with stroke / shadow for readability — no white box
              fontSize: `${pos.fontSize}px`,
              fontWeight: 700,
              color: '#ffffff',
              textAlign: 'center',
              textShadow: '0 4px 10px rgba(0,0,0,0.6)',
              WebkitTextStroke: '5px rgba(0,0,0,0.5)',
              padding: '0 12px',
              lineHeight: 1
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
  } catch (e) {
    return new Response(`Failed to generate image: ${e.message}`, { status: 500 });
  }
}
