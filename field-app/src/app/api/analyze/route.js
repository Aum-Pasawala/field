export async function POST(request) {
  try {
    const { headline, type } = await request.json();
    const key = process.env.ANTHROPIC_API_KEY;

    if (!key || key === "your_anthropic_key_here") {
      return Response.json({ bullets: [
        "Add ANTHROPIC_API_KEY in Vercel → Settings → Environment Variables.",
        "Once added, AI analysis loads automatically for every headline.",
        "Analysis is strictly fact-based: what happened, why it matters, context, impact.",
        "No opinions, no speculation — only verified facts and real-world significance.",
      ]});
    }

    const prompt = type === "sports"
      ? `Sports news: "${headline}"
Write exactly 4 short fact-based bullet points:
1. WHAT — One sentence: exactly what happened (trade, signing, injury, etc.)
2. WHY IT MATTERS — Factual significance for the team or league
3. CONTEXT — Historical precedent or relevant background facts
4. IMPACT — Concrete effect on standings, salary cap, or competitive outlook
Zero opinions. Zero speculation. Facts only. Respond as JSON array of 4 strings, no markdown.`
      : `News: "${headline}"
Write exactly 4 short fact-based bullet points:
1. WHAT — One sentence: exactly what happened
2. WHY IT MATTERS — Real-world significance of this event
3. CONTEXT — Historical background or relevant precedent
4. IMPACT — Concrete economic, political, or strategic consequences
Zero opinions. Zero speculation. Facts only. JSON array of 4 strings, no markdown.`;

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 500,
        system: "You are a factual analyst. No opinions, no speculation, no fluff. Always return a valid JSON array of exactly 4 concise strings. No markdown, no backticks, no preamble.",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await res.json();
    const raw  = data.content?.map(c => c.text || "").join("") || "[]";
    const bullets = JSON.parse(raw.replace(/```json|```/g, "").trim());
    return Response.json({ bullets });
  } catch (e) {
    console.error("Analyze error:", e);
    return Response.json({ bullets: ["Analysis temporarily unavailable."] });
  }
}
