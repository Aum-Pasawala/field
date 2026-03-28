// src/app/api/analyze/route.js
// Generates AI bullet points for any headline using Claude.

export async function POST(request) {
  try {
    const { headline, type } = await request.json();
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey || apiKey === "your_anthropic_key_here") {
      return Response.json({
        bullets: [
          "AI analysis requires an Anthropic API key — add it to your .env.local file.",
          "Sign up at console.anthropic.com to get your key.",
          "Once added, bullet points will auto-generate for every headline.",
          "Analysis covers: what happened, why it matters, historical context, and impact.",
        ]
      });
    }

    const isSports = type === "sports";

    const prompt = isSports
      ? `You are a sharp sports analyst. For this story: "${headline}"
Give exactly 4 bullet points:
1. What happened (1 crisp sentence)
2. Why it matters (team/league significance)
3. Historical context (comparable moves or precedent)
4. Competitive impact (effect on standings, odds, or season)
Respond ONLY as a JSON array of 4 strings. No markdown, no backticks.`
      : `You are a sharp news analyst. For this headline: "${headline}"
Give exactly 4 bullet points:
1. What happened (1 crisp sentence)
2. Why it matters (broader significance)
3. Historical context (brief background or precedent)
4. Market or geopolitical impact (economic or strategic effect)
Respond ONLY as a JSON array of 4 strings. No markdown, no backticks.`;

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 500,
        system: "You are a concise analyst. Always respond with a valid JSON array of exactly 4 short strings. No markdown.",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await res.json();
    const text = data.content?.map(c => c.text || "").join("") || "[]";
    const bullets = JSON.parse(text.replace(/```json|```/g, "").trim());

    return Response.json({ bullets });
  } catch (err) {
    console.error("Analyze error:", err);
    return Response.json({ bullets: ["Analysis temporarily unavailable."] });
  }
}
