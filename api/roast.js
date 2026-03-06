// api/roast.js — uses Groq (FREE, works everywhere)
// Get your free key at: console.groq.com

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt } = req.body;
  if (!prompt || typeof prompt !== "string" || prompt.length > 4000) {
    return res.status(400).json({ error: "Invalid prompt" });
  }
  if (!process.env.GROQ_API_KEY) {
    return res.status(500).json({ error: "API key not configured" });
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(response.status).json({
        error: err?.error?.message || `Groq API error ${response.status}`,
      });
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "";
    if (!text) return res.status(500).json({ error: "Empty response from Groq" });
    return res.status(200).json({ text });

  } catch (err) {
    console.error("Roast API error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}