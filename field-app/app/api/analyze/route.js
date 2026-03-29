export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const headline = body.headline || "";
    const type = body.type || "news";
    const category = body.category || null;
    const key = process.env.ANTHROPIC_API_KEY;

    if (!key || key === "your_anthropic_key_here") {
      return Response.json(getDemoAnalysis(headline, type, category));
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
      const catLabel = { geo: "geopolitical", markets: "economic/financial", politics: "political", tech: "technology" }[category] || "world";
      prompt = `News headline: "${headline}"
Analyze this ${catLabel} news story. Respond ONLY with a valid JSON object (no markdown, no backticks):
{
  "summary": "2-3 sentence plain-English summary — what happened, who's involved, what are the immediate facts",
  "impact": "2-3 sentences on real-world impact — economic consequences, geopolitical shifts, policy effects, who wins/loses",
  "context": "2-3 sentences of historical context — what led to this, precedents, why it matters in the bigger picture"
}
Be factual, authoritative, and concise. Write like a senior analyst at a think tank. No fluff.`;
    }

    // Try the API call — attempt with claude-haiku-4-5-20251001, fallback to claude-3-haiku-20240307
    let res;
    let lastError = "";

    for (const model of ["claude-haiku-4-5-20251001", "claude-3-haiku-20240307"]) {
      try {
        res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": key,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model,
            max_tokens: 600,
            system: "You are a senior analyst. Always return valid JSON only — no markdown, no backticks, no preamble.",
            messages: [{ role: "user", content: prompt }],
          }),
        });

        if (res.ok) break; // Success — stop trying

        // Read the error body for debugging
        const errBody = await res.text().catch(() => "");
        lastError = "HTTP " + res.status + " with model " + model + ": " + errBody.slice(0, 200);
        console.error("Analyze API error:", lastError);
        res = null; // Mark as failed so we try next model
      } catch (fetchErr) {
        lastError = "Fetch failed for " + model + ": " + fetchErr.message;
        console.error("Analyze fetch error:", lastError);
        res = null;
      }
    }

    if (!res || !res.ok) {
      // All models failed — return the demo analysis with the error appended
      const demo = getDemoAnalysis(headline, type, category);
      demo.summary = "API Error: " + lastError.slice(0, 150) + ". Showing placeholder analysis below.";
      return Response.json(demo);
    }

    const data = await res.json();
    const raw = (data.content || []).map(c => c.text || "").join("") || "";

    if (!raw || raw.length < 5) {
      return Response.json({ summary: "AI returned an empty response. The headline may be too short to analyze." });
    }

    const cleaned = raw.replace(/```json|```/g, "").trim();

    let analysis;
    try {
      analysis = JSON.parse(cleaned);
    } catch {
      // If JSON parse fails, use the raw text as the summary
      return Response.json({ summary: cleaned.slice(0, 500) });
    }

    // Validate that we got at least one useful field
    if (!analysis || typeof analysis !== "object") {
      return Response.json({ summary: "AI response was not in expected format." });
    }
    if (!analysis.summary && !analysis.impact && !analysis.context) {
      return Response.json({ summary: JSON.stringify(analysis).slice(0, 500) });
    }

    return Response.json(analysis);
  } catch (e) {
    console.error("Analyze error:", e);
    return Response.json({ summary: "Analysis temporarily unavailable." });
  }
}

function getDemoAnalysis(headline, type, category) {
  const isTrade   = type === "trade";
  const isSigning = type === "signing";
  const showGrade = isTrade || isSigning;
  const isSports  = ["trade","injury","signing","roster","news","award","storyline"].includes(type);

  if (isSports && showGrade) {
    return {
      summary: "Connect your Anthropic API key in Vercel environment variables to get real-time AI trade grades and analysis for every headline.",
      grade: "?",
      gradeReason: "AI grading activates once your API key is connected.",
      impact: "Claude will analyze every trade and signing with roster fit, cap implications, and competitive impact breakdowns.",
      context: "Historical comparisons to similar moves and franchise precedent are generated automatically.",
    };
  }
  if (isSports) {
    return {
      summary: "Connect your Anthropic API key in Vercel environment variables to unlock live AI analysis for every sports headline.",
      impact: "Claude generates real-time impact analysis — team depth changes, playoff implications, and league-wide ripple effects.",
      context: "Each story is placed in historical context with comparable situations and franchise precedent.",
    };
  }
  return {
    summary: "Connect your Anthropic API key in Vercel environment variables for AI-powered news analysis on every headline.",
    impact: "Claude breaks down every story for economic, geopolitical, and social consequences — who wins, who loses, and what changes.",
    context: "Every story gets historical context: what led here, relevant precedents, and why it matters in the bigger picture.",
  };
}
