export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const API_KEY = process.env.GEMINI_API_KEY;

  if (!API_KEY) {
    console.error("❌ GEMINI_API_KEY not found");
    return res.status(500).json({ error: "API key not configured" });
  }

  console.log("🔑 API Key found");

  try {
    console.log("🚀 Calling Gemini API...");

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    console.log("📡 Response status:", response.status);

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Gemini error:", JSON.stringify(data));
      return res.status(response.status).json(data);
    }

    console.log("✅ Gemini 2.5 Flash API SUCCESS!");
    return res.status(200).json(data);
  } catch (error) {
    console.error("💥 Error:", error.message);
    return res.status(500).json({
      error: "Request failed",
      details: error.message,
    });
  }
}
