// src/app/api/news/route.js
// Fetches top world headlines from NewsAPI and categorizes them.

const CATEGORIES = {
  geo: ["iran", "war", "military", "nato", "ukraine", "russia", "israel", "conflict", "missile", "troops", "strait", "nuclear"],
  markets: ["oil", "inflation", "fed", "rate", "stocks", "market", "economy", "gdp", "recession", "dollar", "bitcoin", "crypto"],
  politics: ["congress", "senate", "president", "election", "policy", "bill", "vote", "supreme court", "white house", "legislation"],
  tech: ["ai", "openai", "google", "apple", "microsoft", "quantum", "chip", "semiconductor", "robot", "startup", "meta"],
};

function categorize(title = "", description = "") {
  const text = (title + " " + description).toLowerCase();
  for (const [cat, keywords] of Object.entries(CATEGORIES)) {
    if (keywords.some(k => text.includes(k))) return cat;
  }
  return "geo"; // default
}

export async function GET() {
  try {
    const apiKey = process.env.NEWS_API_KEY;

    if (!apiKey || apiKey === "your_newsapi_key_here") {
      // Return sample data if no API key yet
      return Response.json({ articles: getSampleNews() });
    }

    const url = `https://newsapi.org/v2/top-headlines?language=en&pageSize=20&apiKey=${apiKey}`;
    const res = await fetch(url, { next: { revalidate: 300 } }); // cache 5 min
    const data = await res.json();

    if (!data.articles) return Response.json({ articles: getSampleNews() });

    const articles = data.articles
      .filter(a => a.title && a.title !== "[Removed]")
      .slice(0, 12)
      .map((a, i) => ({
        id: `w${i + 1}`,
        headline: a.title,
        source: a.source?.name || "News",
        time: timeAgo(a.publishedAt),
        region: a.source?.name || "Global",
        category: categorize(a.title, a.description),
        rank: i < 5 ? i + 1 : null,
        url: a.url,
      }));

    return Response.json({ articles });
  } catch (err) {
    console.error("News API error:", err);
    return Response.json({ articles: getSampleNews() });
  }
}

function timeAgo(dateStr) {
  if (!dateStr) return "Recently";
  const diff = (Date.now() - new Date(dateStr)) / 1000 / 60;
  if (diff < 60) return `${Math.floor(diff)}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
}

function getSampleNews() {
  return [
    { id: "w1", category: "geo", rank: 1, headline: "Iran-Israel tensions escalate as US deploys carrier group to Persian Gulf", source: "Reuters", time: "1h ago", region: "Middle East" },
    { id: "w2", category: "markets", rank: 2, headline: "Oil prices surge 8% on Iran strait closure fears, Brent hits $97/barrel", source: "Bloomberg", time: "2h ago", region: "Global Markets" },
    { id: "w3", category: "politics", rank: 3, headline: "Senate passes sweeping AI regulation bill in bipartisan 67-33 vote", source: "AP News", time: "3h ago", region: "Washington D.C." },
    { id: "w4", category: "tech", rank: 4, headline: "OpenAI unveils GPT-5 with real-time video understanding and autonomous agents", source: "The Verge", time: "4h ago", region: "San Francisco" },
    { id: "w5", category: "geo", rank: 5, headline: "NATO activates Article 4 consultations after cross-border attack on member state", source: "BBC", time: "5h ago", region: "Eastern Europe" },
    { id: "w6", category: "markets", rank: null, headline: "Fed signals two more rate cuts in 2025 as inflation drops to 2.1%", source: "WSJ", time: "3h ago", region: "U.S. Economy" },
    { id: "w7", category: "politics", rank: null, headline: "Supreme Court hears landmark social media free speech case", source: "NYT", time: "6h ago", region: "Washington D.C." },
    { id: "w8", category: "tech", rank: null, headline: "China unveils quantum computing breakthrough, claims 1M qubit processor", source: "Financial Times", time: "7h ago", region: "Beijing" },
  ];
}
