import Anthropic from "@anthropic-ai/sdk";

const apiKey = process.env.CLAUDE_API_KEY;
const client = new Anthropic({ apiKey, baseURL: "https://api.anthropic.com" });

const MODEL = "claude-opus-4-8";

export type Lens = "monde" | "quebec";
export type Lang = "fr" | "en";

export type CategoryId =
  | "memes"
  | "slang"
  | "son"
  | "ecran"
  | "drama"
  | "esthetique";

export type Stage = "rising" | "peak" | "fading" | "over";

export interface Briefing {
  title: string;
  category: CategoryId;
  whatItIs: string;
  origin: string;
  whyItResonates: string;
  stage: Stage;
  age: string;
  example: string;
  whereToSee: string;
  verdict: string;
  late: boolean;
}

export interface WatchRequest {
  lens?: Lens;
  lang?: Lang;
  categories?: CategoryId[];
  count?: number;
}

export interface WatchResult {
  briefings: Briefing[];
  webSearchUsed: boolean;
  dated: boolean;
  asOf: string;
}

const CATEGORY_LABELS: Record<CategoryId, { fr: string; en: string }> = {
  memes: { fr: "memes / formats", en: "memes / formats" },
  slang: { fr: "slang / expressions", en: "slang / expressions" },
  son: { fr: "trends son / musique", en: "music / sound trends" },
  ecran: { fr: "discours film / télé", en: "film / TV discourse" },
  drama: { fr: "drama internet", en: "internet drama" },
  esthetique: { fr: "esthétiques / microtrends", en: "aesthetics / microtrends" },
};

const STAGE_ENUM: Stage[] = ["rising", "peak", "fading", "over"];
const CAT_ENUM: CategoryId[] = ["memes", "slang", "son", "ecran", "drama", "esthetique"];

// Forced structured-output tool. Claude must call this exactly once.
const SUBMIT_TOOL: Anthropic.Tool = {
  name: "submit_briefings",
  description:
    "Submit the finished set of trend briefings as structured data. Call this exactly once when you have gathered and explained the trends.",
  input_schema: {
    type: "object",
    properties: {
      briefings: {
        type: "array",
        minItems: 1,
        items: {
          type: "object",
          properties: {
            title: { type: "string", description: "The name of the trend/meme/format/expression." },
            category: { type: "string", enum: CAT_ENUM },
            whatItIs: { type: "string", description: "Plain one-to-two sentence description of what it actually is." },
            origin: { type: "string", description: "Where it came from: platform, person, video, event, date if known." },
            whyItResonates: { type: "string", description: "Why it's funny / resonant / spreading. The cultural read." },
            stage: { type: "string", enum: STAGE_ENUM, description: "rising | peak | fading | over." },
            age: { type: "string", description: "Approximate age / how long it's been alive, e.g. '~3 weeks', 'since Jan 2026'." },
            example: { type: "string", description: "A concrete example or the canonical instance of the trend." },
            whereToSee: { type: "string", description: "Where to actually go see it (platform, hashtag, account type, search term)." },
            verdict: { type: "string", description: "The 'are you late?' verdict — a punchy honest call." },
            late: { type: "boolean", description: "true if a normal person is already late to this." },
          },
          required: ["title", "category", "whatItIs", "origin", "whyItResonates", "stage", "age", "example", "whereToSee", "verdict", "late"],
          additionalProperties: false,
        },
      },
    },
    required: ["briefings"],
    additionalProperties: false,
  },
};

const WEB_SEARCH_TOOL: Anthropic.WebSearchTool20250305 = {
  type: "web_search_20250305",
  name: "web_search",
  max_uses: 6,
};

function buildPrompt(req: Required<WatchRequest>, today: string): string {
  const { lens, lang, categories, count } = req;
  const catList = categories.map((c) => `- ${CATEGORY_LABELS[c][lang]} (id: ${c})`).join("\n");

  const lensBlock =
    lens === "quebec"
      ? lang === "fr"
        ? `LENTILLE: Québec / francophonie. Concentre-toi sur la culture internet québécoise et francophone — memes d'ici, expressions, slang québécois (le joual moderne, TikTok QC, l'humour local), artistes et créateurs d'ici, le discours sur la télé/cinéma québécois, les chicanes Twitter/X francophones. Pas juste des traductions de tendances anglo : trouve ce qui bouillonne ICI. Mentionne les comptes, les créateurs, les villes quand c'est pertinent.`
        : `LENS: Québec / francophone. Focus on Québécois and francophone internet culture — local memes, expressions, Québec slang, local creators and artists, Québec TV/film discourse, francophone Twitter/X drama. Not just translations of anglo trends: surface what is bubbling HERE.`
      : lang === "fr"
        ? `LENTILLE: Internet mondial. Couvre la culture internet anglophone/globale dominante — TikTok, Instagram, X, YouTube, Reddit, Twitch, Discord. Ce qui pogne mondialement en ce moment.`
        : `LENS: Global internet. Cover the dominant global/anglophone internet culture — TikTok, Instagram, X, YouTube, Reddit, Twitch, Discord. What is popping worldwide right now.`;

  const voice =
    lang === "fr"
      ? `Écris en français québécois, vif et internet-native, mais clair et juste. Tutoie le lecteur ("t'es en retard", "ça vient de"). Sois honnête : si une tendance est déjà morte, dis-le. Pas de jargon creux, pas d'inventions.`
      : `Write in lively, internet-native English. Be honest: if a trend is already dead, say so. No empty jargon, no fabrications.`;

  return `Today is ${today}. You are the editorial brain of "L'Air du temps", a culture radar for a Québécois filmmaker/musician who wants to understand the references he's missing — RIGHT NOW.

${lensBlock}

Use the web_search tool to actually find what is CURRENTLY bubbling on the internet (last few weeks). Search for current memes, formats, slang, sound/music trends, discourse, drama, and microtrends. Do NOT rely on stale memory — search the live web. Run several searches across the requested categories before answering.

REQUESTED CATEGORIES (only return briefings in these):
${catList}

Produce about ${count} briefings total, spread across the requested categories. For EACH trend, fully EXPLAIN it — the explainer is the product. Each briefing must answer: what is it, where did it come from, why does it resonate, what lifecycle stage is it at (rising/peak/fading/over) with an approximate age, a concrete example, where to go see it, and an honest "are you late?" verdict.

${voice}

Pick real, specific, currently-relevant trends — not evergreen generic ones. Prefer things a culture-literate friend would actually text you about this month. Vary the lifecycle stages (some rising, some peaking, some fading, a couple already over so the reader knows what to skip).

When done, call submit_briefings exactly once with the structured set. Do not write a prose answer.`;
}

interface RunOpts {
  useWebSearch: boolean;
}

async function runOnce(req: Required<WatchRequest>, today: string, opts: RunOpts): Promise<Briefing[]> {
  const tools: Anthropic.ToolUnion[] = opts.useWebSearch
    ? [WEB_SEARCH_TOOL, SUBMIT_TOOL]
    : [SUBMIT_TOOL];

  // We force the final structured output via submit_briefings. When web search is
  // on we use tool_choice:auto so Claude can search first, then submit. When it's
  // off we force the submit tool directly.
  const tool_choice: Anthropic.ToolChoice = opts.useWebSearch
    ? { type: "auto" }
    : { type: "tool", name: "submit_briefings" };

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 8000,
    tools,
    tool_choice,
    messages: [{ role: "user", content: buildPrompt(req, today) }],
  });

  const block = message.content.find(
    (b): b is Anthropic.ToolUseBlock => b.type === "tool_use" && b.name === "submit_briefings",
  );
  if (!block) {
    throw new Error("no_submit_block");
  }
  const input = block.input as { briefings?: Briefing[] };
  const briefings = (input.briefings ?? []).filter((b) => b && b.title && b.whatItIs);
  if (briefings.length === 0) throw new Error("empty_briefings");
  return briefings.map((b) => ({
    ...b,
    category: CAT_ENUM.includes(b.category) ? b.category : req.categories[0],
    stage: STAGE_ENUM.includes(b.stage) ? b.stage : "peak",
    late: Boolean(b.late),
  }));
}

export async function watch(reqIn: WatchRequest): Promise<WatchResult> {
  if (!apiKey) throw new Error("Server missing CLAUDE_API_KEY");

  const req: Required<WatchRequest> = {
    lens: reqIn.lens === "quebec" ? "quebec" : "monde",
    lang: reqIn.lang === "en" ? "en" : "fr",
    categories:
      reqIn.categories && reqIn.categories.length
        ? reqIn.categories.filter((c) => CAT_ENUM.includes(c))
        : [...CAT_ENUM],
    count: Math.min(Math.max(reqIn.count ?? 8, 3), 12),
  };
  if (req.categories.length === 0) req.categories = [...CAT_ENUM];

  const today = new Date().toISOString().slice(0, 10);

  // Try web search first; fall back to model knowledge (clearly labelled as dated).
  try {
    const briefings = await runOnce(req, today, { useWebSearch: true });
    return { briefings, webSearchUsed: true, dated: false, asOf: today };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    // If web search isn't enabled on the key, the API rejects the tool. Fall back.
    const noSearch =
      msg.includes("web_search") ||
      msg.includes("not_found") ||
      msg.includes("tool") ||
      msg.includes("invalid") ||
      msg.includes("permission") ||
      msg.includes("400") ||
      msg.includes("404");
    if (!noSearch) {
      // a non-tool error on the search path — still try the fallback once.
    }
    const briefings = await runOnce(req, today, { useWebSearch: false });
    return { briefings, webSearchUsed: false, dated: true, asOf: today };
  }
}
