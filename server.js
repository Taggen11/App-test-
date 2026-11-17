// Körkortskompis – liten server som serverar appen och kör AI-coachen.
// Starta: ANTHROPIC_API_KEY=... npm start   (öppna sedan http://localhost:3000 i mobilen)
import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Anthropic from "@anthropic-ai/sdk";

const here = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(here, "public");
const PORT = Number(process.env.PORT) || 3000;
const MODEL = "claude-opus-5-5";

// AI-coachen slås på när servern har Claude-uppgifter (ANTHROPIC_API_KEY, eller en `ant auth login`-profil).
let client = null;
try {
  client = new Anthropic();
} catch {
  client = null;
}

function hasCredentials() {
  return Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN || process.env.ANTHROPIC_PROFILE || client?.apiKey || client?.authToken);
}

const SYSTEM_PROMPT = `Du är "Kompis", en glad och tålmodig AI-coach i appen Körkortskompis som hjälper människor att ta svenskt B-körkort (personbil).

Så här jobbar du:
- Svara alltid på enkel, tydlig svenska. Korta meningar. Förklara svåra ord. Använd gärna emojis sparsamt.
- Alla ska kunna lära sig: anpassa dig om användaren ber om lättare språk, har dyslexi, är nybörjare eller har svenska som andraspråk.
- Hjälp användaren komma på idéer: minnesregler, ramsor, studieplaner, roliga utmaningar, vardagsövningar ("titta efter vägmärken när du åker buss") och scenarion att fundera på.
- Håll dig till svenska trafikregler enligt Trafikverket och Transportstyrelsen. Om du är osäker på en exakt siffra eller regel, säg det och tipsa om att kolla Trafikverket.se.
- Kunskapsprovet: 70 frågor varav 65 räknas, 50 minuter, minst 52 rätt för godkänt.
- Uppmuntra! Beröm framsteg, men var ärlig om fel.
- Håll svaren korta (oftast under 150 ord) om inte användaren ber om mer. Använd punktlistor när det hjälper.
- Prata bara om körkort, trafik, studieteknik och motivation. Styr vänligt tillbaka om ämnet glider iväg.`;

const QUIZ_SCHEMA = {
  type: "object",
  properties: {
    question: { type: "string" },
    options: { type: "array", items: { type: "string" } },
    correct: { type: "integer" },
    explanation: { type: "string" },
  },
  required: ["question", "options", "correct", "explanation"],
  additionalProperties: false,
};

function statsNote(stats) {
  if (!stats || typeof stats !== "object") return "";
  const safe = JSON.stringify(stats).slice(0, 1500);
  return `\n\n(Appdata om användarens framsteg, använd för att anpassa råd: ${safe})`;
}

async function askClaude({ messages, stats, mode }) {
  const history = (Array.isArray(messages) ? messages : [])
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-20)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }));
  if (!history.length || history[history.length - 1].role !== "user") {
    throw Object.assign(new Error("Sista meddelandet måste komma från användaren."), { status: 400 });
  }

  const request = {
    model: MODEL,
    max_tokens: 4000,
    system: SYSTEM_PROMPT + statsNote(stats),
    output_config: { effort: "low" },
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    messages: history,
  };
  if (mode === "quiz") {
    request.output_config.format = { type: "json_schema", schema: QUIZ_SCHEMA };
  }

  const response = await client.beta.messages.create(request);
  if (response.stop_reason === "refusal") {
    return { reply: "Det kan jag tyvärr inte hjälpa till med. Fråga mig gärna något om körkortet! 🚗" };
  }
  const text = response.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();

  if (mode === "quiz") {
    try {
      const quiz = JSON.parse(text);
      if (Array.isArray(quiz.options) && quiz.options.length >= 2 && quiz.correct >= 0 && quiz.correct < quiz.options.length) {
        return { quiz };
      }
    } catch {
      /* faller igenom */
    }
    return { reply: "Jag lyckades inte skapa en fråga just nu. Testa igen!" };
  }
  return { reply: text || "Hmm, jag hittade inget svar. Testa att fråga på ett annat sätt." };
}

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
};

function sendJson(res, status, body) {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body));
}

async function readBody(req) {
  let data = "";
  for await (const chunk of req) {
    data += chunk;
    if (data.length > 100_000) throw Object.assign(new Error("För stor förfrågan"), { status: 413 });
  }
  return JSON.parse(data || "{}");
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === "/api/health") {
    return sendJson(res, 200, { ai: Boolean(client) && hasCredentials() });
  }

  if (url.pathname === "/api/coach" && req.method === "POST") {
    if (!client) return sendJson(res, 503, { error: "AI-coachen är inte konfigurerad (saknar API-nyckel)." });
    try {
      const body = await readBody(req);
      return sendJson(res, 200, await askClaude(body));
    } catch (err) {
      if (err instanceof Anthropic.RateLimitError) return sendJson(res, 429, { error: "Kompis är upptagen, försök igen om en stund." });
      if (err instanceof Anthropic.AuthenticationError) return sendJson(res, 503, { error: "Fel API-nyckel på servern." });
      if (err instanceof Anthropic.APIConnectionError) return sendJson(res, 502, { error: "Kunde inte nå AI-tjänsten." });
      if (err instanceof Anthropic.APIError) {
        console.error("Claude-fel:", err.status, err.message);
        return sendJson(res, 502, { error: "AI-tjänsten svarade med ett fel." });
      }
      if (/authentication method/i.test(err.message || "")) {
        client = null; // inga uppgifter – växla till offline-läge
        return sendJson(res, 503, { error: "AI-coachen är inte konfigurerad (saknar API-nyckel)." });
      }
      return sendJson(res, err.status || 500, { error: err.message || "Något gick fel." });
    }
  }

  // Statiska filer
  let filePath = path.normalize(path.join(PUBLIC_DIR, decodeURIComponent(url.pathname)));
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    return res.end();
  }
  if (url.pathname.endsWith("/")) filePath = path.join(filePath, "index.html");
  try {
    const content = await fs.readFile(filePath);
    res.writeHead(200, { "content-type": MIME[path.extname(filePath)] || "application/octet-stream" });
    res.end(content);
  } catch {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end("Hittades inte");
  }
});

server.listen(PORT, () => {
  console.log(`🚗 Körkortskompis kör på http://localhost:${PORT}  (AI-coach: ${hasCredentials() ? "på" : "offline – sätt ANTHROPIC_API_KEY"})`);
});
