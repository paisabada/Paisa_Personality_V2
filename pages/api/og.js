// pages/api/og.js
import fs from "fs";
import path from "path";
import sharp from "sharp";

export default async function handler(req, res) {
  try {
    const { type = "budget", name = "" } = req.query;

    // Map types -> filenames
    const fileMap = {
      budget: "budget.png",
      risky: "risky.png",
      panda: "panda.png"
    };
    const filename = fileMap[type] || "budget.png";
    const imgPath = path.join(process.cwd(), "public", "ogs", filename);

    // ensure file exists
    if (!fs.existsSync(imgPath)) {
      return res.status(404).send("Base image not found");
    }

    // Build SVG overlay with the name, centered and with stroke for visibility
    const svgText = (text, width) => {
      const fontSize = 110; // adjust if needed per image
      // basic responsive svg, center text horizontally + vertically offset
      return `
      <svg width="${width}" height="300" xmlns="http://www.w3.org/2000/svg">
        <style>
          .title {
            font-family: "Helvetica Neue", Arial, sans-serif;
            font-weight: 700;
            font-size: ${fontSize}px;
            fill: #ffffff;
            stroke: #000000;
            stroke-width: 8;
            paint-order: stroke fill;
          }
        </style>
        <rect x="0" y="0" width="${width}" height="300" fill="transparent" />
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" class="title">${escapeXml(text)}</text>
      </svg>`;
    };

    // read base image to know width
    const baseBuffer = fs.readFileSync(imgPath);
    const meta = await sharp(baseBuffer).metadata();
    const w = meta.width || 1200;

    // if no name provided, just return base image
    if (!name) {
      res.setHeader("Content-Type", "image/png");
      return res.status(200).send(baseBuffer);
    }

    // create svg as buffer
    const svgBuffer = Buffer.from(svgText(name, w));

    // composite svg onto the base image. Adjust top offset as needed.
    const composed = await sharp(baseBuffer)
      .composite([
        {
          input: svgBuffer,
          top: Math.round(meta.height * 0.50) - 60, // change vertical position; tweak as needed
          left: 0
        }
      ])
      .png()
      .toBuffer();

    res.setHeader("Content-Type", "image/png");
    // optional caching (short)
    res.setHeader("Cache-Control", "public, max-age=60, s-maxage=60");
    res.status(200).send(composed);

  } catch (err) {
    console.error("OG error:", err);
    res.status(500).json({ error: String(err) });
  }
}

// helper to escape xml special chars in name
function escapeXml(unsafe) {
  return unsafe.replace(/[<>&'"]/g, function (c) {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case "'": return '&apos;';
      case '"': return '&quot;';
    }
  });
}
