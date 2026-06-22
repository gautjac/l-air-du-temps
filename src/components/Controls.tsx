import type { CategoryId, Lang, Lens } from "../types";
import { CATEGORIES, t } from "../i18n";

interface Props {
  lang: Lang;
  lens: Lens;
  onLens: (l: Lens) => void;
  selected: Set<CategoryId>;
  onToggleCat: (id: CategoryId) => void;
  onAllCats: () => void;
  count: number;
  onCount: (n: number) => void;
  onScan: () => void;
  loading: boolean;
  hasResults: boolean;
}

export function Controls({
  lang,
  lens,
  onLens,
  selected,
  onToggleCat,
  onAllCats,
  count,
  onCount,
  onScan,
  loading,
  hasResults,
}: Props) {
  const allOn = selected.size === CATEGORIES.length;

  return (
    <div className="rounded-2xl border border-void-line bg-void-soft/70 p-4 backdrop-blur-sm sm:p-5">
      {/* Lens toggle */}
      <div className="mb-4">
        <div className="label mb-2">{lang === "fr" ? "Lentille" : "Lens"}</div>
        <div className="relative grid grid-cols-2 gap-1 rounded-full border border-void-line bg-void p-1">
          <span
            aria-hidden
            className="absolute inset-y-1 w-[calc(50%-0.25rem)] rounded-full bg-gradient-to-r from-magenta to-magenta-deep shadow-neon transition-transform duration-300"
            style={{ transform: lens === "quebec" ? "translateX(calc(100% + 0.25rem))" : "none" }}
          />
          <button
            onClick={() => onLens("monde")}
            className={`relative z-10 rounded-full px-3 py-2 text-xs font-bold uppercase tracking-wide transition ${
              lens === "monde" ? "text-void" : "text-muted hover:text-cloud"
            }`}
          >
            🌍 {t("lensMonde", lang)}
          </button>
          <button
            onClick={() => onLens("quebec")}
            className={`relative z-10 rounded-full px-3 py-2 text-xs font-bold uppercase tracking-wide transition ${
              lens === "quebec" ? "text-void" : "text-muted hover:text-cloud"
            }`}
          >
            ⚜ {t("lensQuebec", lang)}
          </button>
        </div>
      </div>

      {/* Categories */}
      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="label">{lang === "fr" ? "Catégories" : "Categories"}</div>
          <button
            onClick={onAllCats}
            className={`text-[0.62rem] font-bold uppercase tracking-wide transition ${
              allOn ? "text-cyan" : "text-muted hover:text-cyan"
            }`}
          >
            {t("allCats", lang)}
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => {
            const on = selected.has(c.id);
            return (
              <button
                key={c.id}
                onClick={() => onToggleCat(c.id)}
                aria-pressed={on}
                className={`chip ${
                  on
                    ? "border-cyan/60 bg-cyan/10 text-cyan"
                    : "border-void-line text-muted hover:border-cloud/40 hover:text-cloud"
                }`}
              >
                <span aria-hidden>{c.emoji}</span>
                {c[lang]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Count + scan */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <label className="block">
          <span className="label mb-1 block">
            {t("count", lang)} — <span className="text-cloud">{count}</span>
          </span>
          <input
            type="range"
            min={4}
            max={12}
            step={1}
            value={count}
            onChange={(e) => onCount(Number(e.target.value))}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-void-line accent-magenta sm:w-44"
          />
        </label>
        <button
          onClick={onScan}
          disabled={loading || selected.size === 0}
          className="group relative overflow-hidden rounded-full bg-gradient-to-r from-magenta via-magenta to-cyan px-7 py-3 text-sm font-bold uppercase tracking-wide text-void shadow-neon transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span className="relative z-10">
            {loading
              ? `${t("scanning", lang)}`
              : hasResults
                ? `↻ ${t("rescan", lang)}`
                : `▸ ${t("scan", lang)}`}
          </span>
          {loading && (
            <span className="absolute inset-0 z-0 -translate-x-full animate-sweep bg-gradient-to-r from-transparent via-white/40 to-transparent" />
          )}
        </button>
      </div>
      {selected.size === 0 && (
        <p className="mt-2 text-right text-xs font-semibold text-amber">{t("pickAtLeast", lang)}</p>
      )}
    </div>
  );
}
