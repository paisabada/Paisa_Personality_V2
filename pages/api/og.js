import { ImageResponse } from '@vercel/og';

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  const { searchParams } = new URL(req.url);

  const name = searchParams.get("name")?.slice(0, 20) || "";  
  const type = searchParams.get("type") || "budget";

  const baseUrl = `${req.headers.get("host")}/ogs`;

  const imgMap = {
    budget: "budget.png",
    risky: "risky.png",
    panda: "panda.png",
  };

  const selectedImage = imgMap[type] || imgMap["budget"];

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          position: "relative",
          fontFamily: "Arial",
        }}
      >
        {/* Background OG Template */}
        <img
          src={`https://${baseUrl}/${selectedImage}`}
          style={{
            position: "absolute",
            width: "1200px",
            height: "630px",
            top: 0,
            left: 0,
            objectFit: "cover",
          }}
        />

        {/* NAME TEXT (COMMON SAFE POSITION) */}
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: "70px",
            fontWeight: "700",
            color: "white",
            textShadow: "0 4px 12px rgba(0,0,0,0.50)",
            letterSpacing: "2px",
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
