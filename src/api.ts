import type { Briefing, Lang, WatchRequest, WatchResult } from "./types";

/**
 * The engine streams NDJSON: keepalive heartbeats (bare newlines) keep the
 * connection alive during the slow Opus + web_search call (can run 40–90s), then
 * a final JSON line carries { result } or { error }. We read the stream
 * progressively and parse the last non-empty line. Falls back to plain-JSON.
 */
export async function fetchBriefings(req: WatchRequest): Promise<WatchResult> {
  const en = req.lang === "en";
  const res = await fetch("/api/watch", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });

  // Read the stream to its end (heartbeats are bare newlines we discard).
  let raw = "";
  const reader = res.body?.getReader();
  if (reader) {
    const dec = new TextDecoder();
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      raw += dec.decode(value, { stream: true });
    }
    raw += dec.decode();
  } else {
    raw = await res.text();
  }

  const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);
  const last = lines[lines.length - 1] ?? "";

  let parsed: { result?: WatchResult; error?: string } | null = null;
  try {
    parsed = last ? JSON.parse(last) : null;
  } catch {
    parsed = null;
  }

  const invalid = en ? "Invalid response from the server." : "Réponse invalide du serveur.";

  if (!res.ok) {
    const fallback = en ? `Error ${res.status}` : `Erreur ${res.status}`;
    const msg = parsed?.error ?? fallback;
    throw new Error(msg);
  }
  if (!parsed) throw new Error(invalid);
  if (parsed.error) throw new Error(parsed.error);
  if (parsed.result) return parsed.result;
  throw new Error(invalid);
}

/* ------------------------------------------------------------------ *
 * Batched radar
 *
 * One giant Opus + web_search call for many trends runs longer than the
 * function wall (~45–55s) and gets killed mid-stream, so the client never
 * sees a result line ("Invalid response from the server"). Instead we fan
 * out several SMALL calls (2 trends each), run a couple concurrently, and
 * surface each batch as it lands. Each call finishes well under the wall,
 * a single failed batch never blanks the screen, and results stream in.
 * ------------------------------------------------------------------ */

const BATCH_SIZE = 2;
const CONCURRENCY = 2;
// Lifecycle angles rotated across batches so parallel calls diverge instead of
// returning the same handful of obvious trends.
const ANGLES = ["rising", "fading", "mainstream", "niche", "peak", "over"];

const normTitle = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9àâäéèêëîïôöùûüç]+/gi, " ").trim();

export interface BatchedCallbacks {
  /** Called with fresh (deduped) briefings each time a batch resolves. */
  onBatch: (briefings: Briefing[]) => void;
  /** Called once, with metadata from the first successful batch. */
  onMeta?: (meta: { webSearchUsed: boolean; dated: boolean; asOf: string }) => void;
}

export interface BatchedOutcome {
  total: number;
  failed: number;
  batches: number;
}

export async function fetchBriefingsBatched(
  req: WatchRequest,
  cb: BatchedCallbacks,
): Promise<BatchedOutcome> {
  const target = Math.max(1, Math.min(req.count, 12));
  // Parallel batches can't see each other's `avoid` list, so some trends repeat
  // and get deduped — which would leave us short. Over-provision a few extra
  // batches and stop the moment we've collected `target` unique briefings.
  const maxBatches = Math.ceil(target / BATCH_SIZE) + 3;

  const seen = new Set<string>();
  let metaSent = false;
  let total = 0;
  let failed = 0;
  let launched = 0;
  let done = false;

  async function worker() {
    while (!done) {
      const i = launched++;
      if (i >= maxBatches) return;

      try {
        const res = await fetchBriefings({
          lens: req.lens,
          lang: req.lang,
          categories: req.categories,
          count: BATCH_SIZE,
          // Snapshot of titles found so far → fewer cross-batch duplicates.
          avoid: [...seen].slice(-30),
          angle: ANGLES[i % ANGLES.length],
        });

        if (!metaSent) {
          metaSent = true;
          cb.onMeta?.({ webSearchUsed: res.webSearchUsed, dated: res.dated, asOf: res.asOf });
        }

        const fresh = res.briefings.filter((b) => {
          const k = normTitle(b.title);
          if (!k || seen.has(k)) return false;
          seen.add(k);
          return true;
        });
        if (fresh.length) {
          total += fresh.length;
          cb.onBatch(fresh);
        }
      } catch {
        failed += 1;
      }

      if (total >= target) done = true;
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, maxBatches) }, () => worker()),
  );

  return { total, failed, batches: launched };
}

export type { Lang };
