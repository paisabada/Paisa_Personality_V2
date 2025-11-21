import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  try {
    const { type = "budget", name = "" } = req.query;

    // Map result → image file
    const fileMap = {
      budget: "budget.png",
      risky: "risky.png",
      panda: "panda.png"
    };

    const filename = fileMap[type] || "budget.png";

    // Load base OG image
    const imgPath = path.join(process.cwd(), "public", "ogs", filename);
    const imgBuffer = fs.readFileSync(imgPath);

    // Just return static PNG for now
    res.setHeader("Content-Type", "image/png");
    res.status(200).send(imgBuffer);

  } catch (error) {
    console.error("OG ERROR:", error);
    res.status(500).json({ error: error.message });
  }
}
