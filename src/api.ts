import type { Lang, WatchRequest, WatchResult } from "./types";

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

export type { Lang };
