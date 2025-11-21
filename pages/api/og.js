// pages/api/og.js
import fs from "fs";
import path from "path";
import sharp from "sharp";

function escapeXml(unsafe) {
  return unsafe.replace(/[<>&'"]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;',"'":'&apos;','"':'&quot;'}[c]));
}

export default async function handler(req, res) {
  try {
    const { type = "budget", name = "" } = req.query;
    const fileMap = { budget: "budget.png", risky: "risky.png", panda: "panda.png" };
    const filename = fileMap[type] || fileMap.budget;
    const imgPath = path.join(process.cwd(), "public", "ogs", filename);

    if (!fs.existsSync(imgPath)) return res.status(404).send("Base image missing");

    const baseBuffer = fs.readFileSync(imgPath);
    const meta = await sharp(baseBuffer).metadata();
    const w = meta.width || 1200;
    const h = meta.height || 630;

    // per-type config: adjusts font-size and vertical position (top)
    const configs = {
      budget: { fontSize: Math.round(w * 0.10), topPct: 0.46 }, // tune
      risky:  { fontSize: Math.round(w * 0.11), topPct: 0.58 },
      panda:  { fontSize: Math.round(w * 0.10), topPct: 0.55 }
    };
    const cfg = configs[type] || configs.budget;

    if (!name) {
      res.setHeader("Content-Type", "image/png");
      res.setHeader("Cache-Control", "public, max-age=60, s-maxage=60");
      return res.status(200).send(baseBuffer);
    }

    // create SVG overlay (transparent background)
    const svg = `
      <svg width="${w}" height="${Math.round(cfg.fontSize * 1.4)}" xmlns="http://www.w3.org/2000/svg">
        <style>
          .t { font-family: 'Helvetica Neue', Arial, sans-serif; font-weight: 800;
              font-size: ${cfg.fontSize}px; fill:#ffffff; stroke:#000000; stroke-width:${Math.max(6, Math.round(cfg.fontSize*0.06))}; paint-order:stroke fill; }
        </style>
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" class="t">${escapeXml(name)}</text>
      </svg>`;

    const svgBuffer = Buffer.from(svg);

    // compute top in pixels
    const topPx = Math.round(h * cfg.topPct) - Math.round(cfg.fontSize / 2);

    const composed = await sharp(baseBuffer)
      .composite([{ input: svgBuffer, left: 0, top: topPx }])
      .png()
      .toBuffer();

    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=60, s-maxage=60");
    res.status(200).send(composed);

  } catch (err) {
    console.error("OG error:", err);
    res.status(500).json({ error: String(err) });
  }
}
