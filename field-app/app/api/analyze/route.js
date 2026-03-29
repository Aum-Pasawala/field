// AI Analysis via Groq (FREE) — uses Llama 4 Scout
// Get your free API key at https://console.groq.com
// Set GROQ_API_KEY in Vercel → Settings → Environment Variables

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const headline = body.headline || "";
    const type = body.type || "news";
    const category = body.category || null;
    const key = process.env.GROQ_API_KEY;

    if (!key || key === "your_groq_key_here") {
      return Response.json(getDemoAnalysis(type, category));
    }

    const isTrade   = type === "trade";
    const isSigning = type === "signing";
    const isSports  = ["trade","injury","signing","roster","news","award","storyline"].includes(type);
    const showGrade = isTrade || isSigning;

    let userPrompt;

    if (isSports && showGrade) {
      userPrompt = `Sports headline: "${headline}"
Analyze this ${type}. Respond ONLY with a valid JSON object (no markdown, no backticks, no extra text):
{
  "summary": "1-2 sentence plain-English summary of what happened — be specific with names, teams, numbers",
  "grade": "Letter grade A+ through F rating the move for the acquiring/signing team",
  "gradeReason": "1 sentence explaining why you gave that grade",
  "impact": "2-3 sentences on concrete team and league impact — cap space, roster fit, playoff chances, competitive balance",
  "context": "1-2 sentences of historical context — comparable trades/signings, franchise history, precedent"
}
Be factual and direct. Make the grade bold — take a real position.`;
    } else if (isSports) {
      userPrompt = `Sports headline: "${headline}"
Analyze this ${type || "sports news"}. Respond ONLY with a valid JSON object (no markdown, no backticks, no extra text):
{
  "summary": "1-2 sentence plain-English summary of what happened — be specific with names, teams, details",
  "impact": "2-3 sentences on how this concretely affects the team, season, and league — standings, depth, playoff implications",
  "context": "1-2 sentences of relevant historical context or comparable situations"
}
Be factual. No opinions, no speculation. Direct and concise.`;
    } else {
      const catLabel = { geo: "geopolitical", markets: "economic/financial", politics: "political", tech: "technology" }[category] || "world";
      userPrompt = `News headline: "${headline}"
Analyze this ${catLabel} news story. Respond ONLY with a valid JSON object (no markdown, no backticks, no extra text):
{
  "summary": "2-3 sentence plain-English summary — what happened, who's involved, what are the immediate facts",
  "impact": "2-3 sentences on real-world impact — economic consequences, geopolitical shifts, policy effects, who wins/loses",
  "context": "2-3 sentences of historical context — what led to this, precedents, why it matters in the bigger picture"
}
Be factual, authoritative, and concise. No fluff.`;
    }

    // Groq uses OpenAI-compatible API format
    const models = ["meta-llama/llama-4-scout-17b-16e-instruct", "llama-3.3-70b-versatile", "llama-3.1-8b-instant"];
    let res = null;
    let lastError = "";

    for (const model of models) {
      try {
        res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + key,
          },
          body: JSON.stringify({
            model,
            temperature: 0.3,
            max_tokens: 600,
            messages: [
              {
                role: "system",
                content: "You are a senior analyst providing factual, authoritative analysis. Always return valid JSON only — no markdown, no backticks, no preamble, no trailing text."
              },
              { role: "user", content: userPrompt }
            ],
          }),
        });

        if (res.ok) break;

        const errText = await res.text().catch(() => "");
        lastError = "HTTP " + res.status + " (" + model + "): " + errText.slice(0, 200);
        console.error("Groq error:", lastError);
        res = null;
      } catch (fetchErr) {
        lastError = "Fetch failed (" + model + "): " + fetchErr.message;
        console.error("Groq fetch error:", lastError);
        res = null;
      }
    }

    if (!res || !res.ok) {
      const demo = getDemoAnalysis(type, category);
      demo.summary = "Groq API error: " + lastError.slice(0, 200) + ". Showing placeholder below.";
      return Response.json(demo);
    }

    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content || "";

    if (!raw || raw.length < 5) {
      return Response.json({ summary: "AI returned an empty response." });
    }

    const cleaned = raw.replace(/```json|```/g, "").trim();

    let analysis;
    try {
      analysis = JSON.parse(cleaned);
    } catch {
      return Response.json({ summary: cleaned.slice(0, 500) });
    }

    if (!analysis || typeof analysis !== "object") {
      return Response.json({ summary: "AI response was not in expected format." });
    }
    if (!analysis.summary && !analysis.impact && !analysis.context) {
      return Response.json({ summary: JSON.stringify(analysis).slice(0, 500) });
    }

    return Response.json(analysis);
  } catch (e) {
    console.error("Analyze error:", e);
    return Response.json({ summary: "Analysis temporarily unavailable: " + (e.message || "").slice(0, 100) });
  }
}

function getDemoAnalysis(type, category) {
  const isTrade   = type === "trade";
  const isSigning = type === "signing";
  const showGrade = isTrade || isSigning;
  const isSports  = ["trade","injury","signing","roster","news","award","storyline"].includes(type);

  if (isSports && showGrade) {
    return {
      summary: "Get your free Groq API key at console.groq.com and add it as GROQ_API_KEY in Vercel environment variables.",
      grade: "?",
      gradeReason: "AI grading activates once your Groq API key is connected.",
      impact: "AI will analyze every trade and signing with roster fit, cap implications, and competitive impact breakdowns.",
      context: "Historical comparisons to similar moves and franchise precedent are generated automatically.",
    };
  }
  if (isSports) {
    return {
      summary: "Get your free Groq API key at console.groq.com and add it as GROQ_API_KEY in Vercel environment variables to unlock live AI analysis.",
      impact: "AI generates real-time impact analysis — team depth changes, playoff implications, and league-wide ripple effects.",
      context: "Each story is placed in historical context with comparable situations and franchise precedent.",
    };
  }
  return {
    summary: "Get your free Groq API key at console.groq.com and add it as GROQ_API_KEY in Vercel environment variables for AI-powered news analysis.",
    impact: "AI breaks down every story for economic, geopolitical, and social consequences — who wins, who loses, and what changes.",
    context: "Every story gets historical context: what led here, relevant precedents, and why it matters in the bigger picture.",
  };
}
