import { useState } from "react";
import type { Briefing, Lang } from "../types";
import { CATEGORIES, STAGE_META, catLabel, t } from "../i18n";

interface Props {
  briefing: Briefing;
  lang: Lang;
  saved: boolean;
  onToggleSave: () => void;
  index: number;
}

function StageBadge({ briefing, lang }: { briefing: Briefing; lang: Lang }) {
  const meta = STAGE_META[briefing.stage];
  return (
    <span className={`chip border-transparent ${meta.cls}`} title={t("age", lang)}>
      <span
        className={`inline-block h-2 w-2 rounded-full ${
          briefing.stage === "rising" || briefing.stage === "peak" ? "animate-pulseGlow" : ""
        }`}
        style={{ background: "currentColor" }}
      />
      {meta[lang]}
    </span>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-void-line/70 pt-3">
      <div className="label mb-1">{label}</div>
      <p className="text-sm leading-relaxed text-cloud/90">{children}</p>
    </div>
  );
}

export function BriefingCard({ briefing, lang, saved, onToggleSave, index }: Props) {
  const [open, setOpen] = useState(false);
  const cat = CATEGORIES.find((c) => c.id === briefing.category);

  return (
    <article
      className="group relative flex animate-riseIn flex-col overflow-hidden rounded-2xl border border-void-line bg-void-card/80 p-5 shadow-lift backdrop-blur-sm transition hover:border-magenta/60"
      style={{ animationDelay: `${Math.min(index * 55, 600)}ms` }}
    >
      {/* top sweep accent */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px overflow-hidden">
        <div className="h-px w-1/2 bg-gradient-to-r from-transparent via-cyan to-transparent opacity-60 group-hover:animate-sweep" />
      </div>

      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="chip border-void-line text-muted">
              <span aria-hidden>{cat?.emoji}</span>
              {catLabel(briefing.category, lang)}
            </span>
            <StageBadge briefing={briefing} lang={lang} />
          </div>
          <h3 className="display text-xl leading-tight text-cloud sm:text-2xl">{briefing.title}</h3>
        </div>
        <button
          onClick={onToggleSave}
          aria-pressed={saved}
          aria-label={saved ? t("remove", lang) : t("save", lang)}
          className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition ${
            saved
              ? "border-lime bg-lime/15 text-lime"
              : "border-void-line text-muted hover:border-cyan hover:text-cyan"
          }`}
        >
          {saved ? `★ ${t("saved", lang)}` : `☆ ${t("save", lang)}`}
        </button>
      </header>

      <p className="mt-3 text-[0.95rem] leading-relaxed text-cloud/90">{briefing.whatItIs}</p>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <span className="chip border-void-line text-muted">⏳ {briefing.age}</span>
        <span
          className={`chip ${
            briefing.late
              ? "border-amber/50 bg-amber/10 text-amber"
              : "border-lime/50 bg-lime/10 text-lime"
          }`}
        >
          {briefing.late ? `⚠ ${t("lateYes", lang)}` : `✓ ${t("lateNo", lang)}`}
        </span>
      </div>

      {/* verdict — always visible, the punchline */}
      <div className="mt-4 rounded-xl border border-magenta/30 bg-magenta/[0.07] p-3">
        <div className="label mb-1 text-magenta-hot">{t("verdict", lang)}</div>
        <p className="text-sm font-medium leading-relaxed text-cloud">{briefing.verdict}</p>
      </div>

      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="mt-4 inline-flex items-center gap-1.5 self-start text-xs font-bold uppercase tracking-wide text-cyan transition hover:text-cyan-hot"
      >
        <span
          className="inline-block transition-transform"
          style={{ transform: open ? "rotate(90deg)" : "none" }}
          aria-hidden
        >
          ▸
        </span>
        {open ? t("collapse", lang) : t("expand", lang)}
      </button>

      {open && (
        <div className="mt-4 flex animate-riseIn flex-col gap-3">
          <Row label={t("origin", lang)}>{briefing.origin}</Row>
          <Row label={t("why", lang)}>{briefing.whyItResonates}</Row>
          <Row label={t("example", lang)}>{briefing.example}</Row>
          <Row label={t("where", lang)}>{briefing.whereToSee}</Row>
        </div>
      )}
    </article>
  );
}
