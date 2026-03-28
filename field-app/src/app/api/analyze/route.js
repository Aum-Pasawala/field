// AI bullet points for any headline - powered by Claude

export async function POST(request) {
  try {
    const { headline, type } = await request.json();
    const key = process.env.ANTHROPIC_API_KEY;

    if (!key || key === "your_anthropic_key_here") {
      return Response.json({ bullets: [
        "Add your ANTHROPIC_API_KEY to Vercel Environment Variables to enable AI analysis.",
        "Go to Vercel → Settings → Environment Variables.",
        "Once added, bullet points will appear automatically for every headline.",
        "Analysis covers: what happened, why it matters, context, and impact.",
      ]});
    }

    const isSports = type === "sports";

    const prompt = isSports
      ? `Sports story: "${headline}"
Provide exactly 4 fact-based bullet points:
1. WHAT HAPPENED — one crisp factual sentence
2. WHY IT MATTERS — team or league significance
3. HISTORICAL CONTEXT — comparable precedent or record
4. COMPETITIVE IMPACT — effect on standings, odds, or season outlook
No opinions. Facts only. JSON array of 4 strings, no markdown.`
      : `News headline: "${headline}"
Provide exactly 4 fact-based bullet points:
1. WHAT HAPPENED — one crisp factual sentence summarizing the event
2. WHY IT MATTERS — real-world significance of this development
3. HISTORICAL CONTEXT — relevant background, precedent, or timeline
4. MARKET/GEOPOLITICAL IMPACT — concrete economic or strategic effect
No opinions or speculation. Facts and context only. JSON array of 4 strings, no markdown.`;

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 600,
        system: "You are a factual news analyst. No opinions, no speculation. Always respond with a valid JSON array of exactly 4 strings. No markdown, no backticks.",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await res.json();
    const text = data.content?.map(c => c.text || "").join("") || "[]";
    const bullets = JSON.parse(text.replace(/```json|```/g, "").trim());
    return Response.json({ bullets });
  } catch (e) {
    console.error("Analyze error", e);
    return Response.json({ bullets: ["Analysis temporarily unavailable."] });
  }
}
