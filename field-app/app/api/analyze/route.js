export async function POST(request) {
  try {
    const { headline, type, category } = await request.json();
    const key = process.env.ANTHROPIC_API_KEY;

    if (!key || key === "your_anthropic_key_here") {
      // Return demo analysis when no key is set
      return Response.json(getDemoAnalysis(type, category));
    }

    const isTrade   = type === "trade";
    const isSigning = type === "signing";
    const isSports  = ["trade","injury","signing","roster","news","award","storyline"].includes(type);
    const showGrade = isTrade || isSigning;

    let prompt;

    if (isSports && showGrade) {
      prompt = `Sports headline: "${headline}"
Analyze this ${type}. Respond ONLY with a valid JSON object (no markdown, no backticks):
{
  "summary": "1-2 sentence plain-English summary of what happened — be specific with names, teams, numbers",
  "grade": "Letter grade A+ through F rating the move for the acquiring/signing team",
  "gradeReason": "1 sentence explaining why you gave that grade",
  "impact": "2-3 sentences on concrete team and league impact — cap space, roster fit, playoff chances, competitive balance",
  "context": "1-2 sentences of historical context — comparable trades/signings, franchise history, precedent"
}
Be factual and direct. No fluff, no hedging. Make the grade bold — take a real position.`;
    } else if (isSports) {
      prompt = `Sports headline: "${headline}"
Analyze this ${type || "sports news"}. Respond ONLY with a valid JSON object (no markdown, no backticks):
{
  "summary": "1-2 sentence plain-English summary of what happened — be specific with names, teams, details",
  "impact": "2-3 sentences on how this concretely affects the team, season, and league — standings, depth, playoff implications",
  "context": "1-2 sentences of relevant historical context or comparable situations"
}
Be factual. No opinions, no speculation. Direct and concise.`;
    } else {
      // World/political/economic/tech news
      const catLabel = {
        geo: "geopolitical",
        markets: "economic/financial",
        politics: "political",
        tech: "technology",
      }[category] || "world";

      prompt = `News headline: "${headline}"
Analyze this ${catLabel} news story. Respond ONLY with a valid JSON object (no markdown, no backticks):
{
  "summary": "2-3 sentence plain-English summary — what happened, who's involved, what are the immediate facts",
  "impact": "2-3 sentences on real-world impact — economic consequences, geopolitical shifts, policy effects, who wins/loses",
  "context": "2-3 sentences of historical context — what led to this, precedents, why it matters in the bigger picture"
}
Be factual, authoritative, and concise. Write like a senior analyst at a think tank. No fluff.`;
    }

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
        system: "You are a senior analyst providing factual, authoritative analysis. Always return valid JSON only — no markdown, no backticks, no preamble, no trailing text. Be direct and take clear positions when grading.",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await res.json();
    const raw  = data.content?.map(c => c.text || "").join("") || "{}";
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const analysis = JSON.parse(cleaned);

    return Response.json(analysis);
  } catch (e) {
    console.error("Analyze error:", e);
    return Response.json({
      summary: "Analysis temporarily unavailable. Try again in a moment.",
    });
  }
}

function getDemoAnalysis(type, category) {
  const isTrade   = type === "trade";
  const isSigning = type === "signing";
  const showGrade = isTrade || isSigning;
  const isSports  = ["trade","injury","signing","roster","news","award","storyline"].includes(type);

  if (isSports && showGrade) {
    return {
      summary: "Add your ANTHROPIC_API_KEY in Vercel → Settings → Environment Variables to get real-time AI analysis for every headline.",
      grade: "?",
      gradeReason: "AI grading activates once your API key is connected.",
      impact: "Once enabled, Claude will analyze every trade and signing — grading the move, breaking down roster fit, cap implications, and competitive impact.",
      context: "Analysis includes historical comparisons to similar moves and franchise precedent.",
    };
  }
  if (isSports) {
    return {
      summary: "Add your ANTHROPIC_API_KEY in Vercel → Settings → Environment Variables to unlock AI analysis.",
      impact: "Claude will provide real-time impact analysis for every sports headline — team depth, playoff implications, and league-wide effects.",
      context: "Historical context and comparable situations are generated automatically for every story.",
    };
  }
  return {
    summary: "Add your ANTHROPIC_API_KEY in Vercel → Settings → Environment Variables for AI-powered news analysis.",
    impact: "Claude analyzes every headline for real-world economic, geopolitical, and social consequences — who wins, who loses, and what changes.",
    context: "Every story gets historical context: what led to this moment, relevant precedents, and why it matters in the bigger picture.",
  };
}
