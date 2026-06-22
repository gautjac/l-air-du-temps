import { useEffect, useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import type { Briefing, CategoryId, Lang, Lens, WatchResult } from "./types";
import { CATEGORIES, t } from "./i18n";
import { fetchBriefings } from "./api";
import { briefingKey, db, removeBriefing, saveBriefing } from "./db";
import { BriefingCard } from "./components/BriefingCard";
import { Controls } from "./components/Controls";
import { Onboarding } from "./components/Onboarding";
import { Loading } from "./components/Loading";

type View = "feed" | "collection";

const LS = {
  onboarded: "adt.onboarded",
  lang: "adt.lang",
  lens: "adt.lens",
};

const MARQUEE_FR = "MEMES · FORMATS · SLANG · MICROTRENDS · DRAMA · SONS QUI POGNENT · ESTHÉTIQUES · CE QUE T'AS MANQUÉ · ";
const MARQUEE_EN = "MEMES · FORMATS · SLANG · MICROTRENDS · DRAMA · SOUNDS · AESTHETICS · WHAT YOU MISSED · ";

export default function App() {
  const [lang, setLang] = useState<Lang>(() => (localStorage.getItem(LS.lang) as Lang) || "fr");
  const [lens, setLens] = useState<Lens>(() => (localStorage.getItem(LS.lens) as Lens) || "monde");
  const [onboarded, setOnboarded] = useState<boolean>(() => localStorage.getItem(LS.onboarded) === "1");
  const [view, setView] = useState<View>("feed");

  const [selected, setSelected] = useState<Set<CategoryId>>(() => new Set(CATEGORIES.map((c) => c.id)));
  const [count, setCount] = useState(8);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<WatchResult | null>(null);

  useEffect(() => localStorage.setItem(LS.lang, lang), [lang]);
  useEffect(() => localStorage.setItem(LS.lens, lens), [lens]);

  const savedRows = useLiveQuery(() => db.saved.orderBy("savedAt").reverse().toArray(), [], []);
  const savedIds = useMemo(() => new Set((savedRows ?? []).map((r) => r.id)), [savedRows]);

  function finishOnboarding() {
    localStorage.setItem(LS.onboarded, "1");
    setOnboarded(true);
  }

  function toggleCat(id: CategoryId) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  function allCats() {
    setSelected((prev) => (prev.size === CATEGORIES.length ? new Set() : new Set(CATEGORIES.map((c) => c.id))));
  }

  async function scan() {
    if (selected.size === 0 || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetchBriefings({
        lens,
        lang,
        categories: [...selected],
        count,
      });
      setResult(res);
      setView("feed");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  async function toggleSave(b: Briefing) {
    const id = briefingKey(b);
    if (savedIds.has(id)) await removeBriefing(id);
    else await saveBriefing(b, lens, result?.asOf ?? new Date().toISOString().slice(0, 10));
  }

  const marquee = lang === "fr" ? MARQUEE_FR : MARQUEE_EN;
  const briefings = result?.briefings ?? [];

  return (
    <div className="min-h-dvh">
      {!onboarded && <Onboarding lang={lang} onLang={setLang} onDone={finishOnboarding} />}

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-void-line bg-void/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <button
            onClick={() => setView("feed")}
            className="flex items-baseline gap-2 text-left"
            aria-label="L'Air du temps"
          >
            <span className="display text-lg text-magenta neon-text sm:text-xl">L'AIR</span>
            <span className="display text-lg text-cyan cyan-text sm:text-xl">DU&nbsp;TEMPS</span>
          </button>

          <div className="flex items-center gap-2">
            <nav className="flex rounded-full border border-void-line bg-void-soft p-1 text-xs">
              <button
                onClick={() => setView("feed")}
                className={`rounded-full px-3 py-1.5 font-bold uppercase tracking-wide transition ${
                  view === "feed" ? "bg-magenta text-void" : "text-muted hover:text-cloud"
                }`}
              >
                {t("feed", lang)}
              </button>
              <button
                onClick={() => setView("collection")}
                className={`flex items-center gap-1 rounded-full px-3 py-1.5 font-bold uppercase tracking-wide transition ${
                  view === "collection" ? "bg-cyan text-void" : "text-muted hover:text-cloud"
                }`}
              >
                {t("collection", lang)}
                {(savedRows?.length ?? 0) > 0 && (
                  <span
                    className={`rounded-full px-1.5 text-[0.6rem] ${
                      view === "collection" ? "bg-void/25 text-void" : "bg-void-line text-cloud"
                    }`}
                  >
                    {savedRows?.length}
                  </span>
                )}
              </button>
            </nav>
            <button
              onClick={() => setLang(lang === "fr" ? "en" : "fr")}
              className="rounded-full border border-void-line px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-muted transition hover:border-cyan hover:text-cyan"
            >
              {t("langSwitch", lang)}
            </button>
          </div>
        </div>

        {/* marquee strip */}
        <div className="overflow-hidden border-t border-void-line/70 bg-void-soft/60">
          <div className="flex w-max animate-marquee whitespace-nowrap py-1 font-mono text-[0.65rem] tracking-widest text-muted">
            <span>{marquee.repeat(2)}</span>
            <span aria-hidden>{marquee.repeat(2)}</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-24 pt-6 sm:px-6">
        {view === "feed" ? (
          <>
            <div className="mb-6">
              <h1 className="display text-3xl leading-none sm:text-5xl">
                <span className="text-cloud">Ce qui </span>
                <span className="text-magenta neon-text">bouillonne</span>
                <span className="text-cloud"> </span>
                <span className="text-cyan cyan-text">maintenant</span>
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-muted sm:text-base">{t("tagline", lang)}</p>
            </div>

            <div className="mb-6">
              <Controls
                lang={lang}
                lens={lens}
                onLens={setLens}
                selected={selected}
                onToggleCat={toggleCat}
                onAllCats={allCats}
                count={count}
                onCount={setCount}
                onScan={scan}
                loading={loading}
                hasResults={briefings.length > 0}
              />
            </div>

            {result && !loading && (
              <div className="mb-5 flex flex-wrap items-center gap-2 text-xs">
                {result.webSearchUsed ? (
                  <span className="chip border-lime/50 bg-lime/10 text-lime">
                    <span className="h-2 w-2 animate-pulseGlow rounded-full bg-lime" />
                    {t("webLiveFull", lang)} · {t("asOf", lang)} {result.asOf}
                  </span>
                ) : (
                  <span className="chip border-amber/50 bg-amber/10 text-amber">⚠ {t("webDated", lang)}</span>
                )}
              </div>
            )}

            {loading && <Loading lang={lang} />}

            {error && !loading && (
              <div className="rounded-2xl border border-amber/40 bg-amber/[0.07] p-5 text-center">
                <p className="display text-lg text-amber">{t("error", lang)}</p>
                <p className="mt-2 text-sm text-cloud/80">{error}</p>
                <button
                  onClick={scan}
                  className="mt-4 rounded-full bg-amber px-5 py-2 text-sm font-bold uppercase tracking-wide text-void transition hover:brightness-110"
                >
                  {t("retry", lang)}
                </button>
              </div>
            )}

            {!loading && !error && briefings.length === 0 && (
              <div className="rounded-2xl border border-dashed border-void-line bg-void-soft/40 p-10 text-center">
                <div className="mb-3 text-5xl" aria-hidden>
                  📡
                </div>
                <p className="mx-auto max-w-md text-sm text-muted">{t("empty", lang)}</p>
              </div>
            )}

            {!loading && briefings.length > 0 && (
              <div className="grid gap-4 sm:grid-cols-2">
                {briefings.map((b, i) => (
                  <BriefingCard
                    key={`${briefingKey(b)}-${i}`}
                    briefing={b}
                    lang={lang}
                    saved={savedIds.has(briefingKey(b))}
                    onToggleSave={() => toggleSave(b)}
                    index={i}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="mb-6">
              <h1 className="display text-3xl leading-none sm:text-5xl">
                <span className="text-cyan cyan-text">{t("collection", lang)}</span>
              </h1>
              <p className="mt-3 text-sm text-muted">
                {lang === "fr"
                  ? "Ton glossaire perso des références. Gardé en local, juste à toi."
                  : "Your personal glossary of references. Stored locally, yours only."}
              </p>
            </div>

            {(savedRows?.length ?? 0) === 0 ? (
              <div className="rounded-2xl border border-dashed border-void-line bg-void-soft/40 p-10 text-center">
                <div className="mb-3 text-5xl" aria-hidden>
                  🗂️
                </div>
                <p className="mx-auto max-w-md text-sm text-muted">{t("emptyCollection", lang)}</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {(savedRows ?? []).map((b, i) => (
                  <BriefingCard
                    key={b.id}
                    briefing={b}
                    lang={lang}
                    saved
                    onToggleSave={() => removeBriefing(b.id)}
                    index={i}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <footer className="border-t border-void-line/60 py-6 text-center">
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted">
          L'Air du temps · {lang === "fr" ? "fait à la main" : "handmade"} · local-first
        </p>
      </footer>
    </div>
  );
}
