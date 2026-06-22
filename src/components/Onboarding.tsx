import { useState } from "react";
import type { Lang } from "../types";
import { t } from "../i18n";

interface Props {
  lang: Lang;
  onLang: (l: Lang) => void;
  onDone: () => void;
}

export function Onboarding({ lang, onLang, onDone }: Props) {
  const [step, setStep] = useState(0);

  const steps = [
    { title: t("onb1Title", lang), body: t("onb1", lang), emoji: "📡", glow: "magenta" },
    { title: t("onb2Title", lang), body: t("onb2", lang), emoji: "🌍", glow: "cyan" },
    { title: t("onb3Title", lang), body: t("onb3", lang), emoji: "🃏", glow: "lime" },
  ];
  const last = step === steps.length - 1;
  const s = steps[step];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-void/95 p-5 backdrop-blur">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-void-line bg-void-card p-7 shadow-lift">
        {/* electric corner glows */}
        <div className="pointer-events-none absolute -left-16 -top-16 h-40 w-40 rounded-full bg-magenta/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -right-16 h-40 w-40 rounded-full bg-cyan/25 blur-3xl" />

        <div className="relative">
          <div className="mb-5 flex items-center justify-between">
            <span className="display text-sm tracking-tight text-magenta neon-text">L'AIR DU TEMPS</span>
            <button
              onClick={() => onLang(lang === "fr" ? "en" : "fr")}
              className="chip border-void-line text-muted hover:border-cyan hover:text-cyan"
            >
              {t("langSwitch", lang)}
            </button>
          </div>

          <div className="mb-1 text-5xl" aria-hidden>
            {s.emoji}
          </div>
          <h2
            className={`display mt-2 text-2xl leading-tight ${
              s.glow === "cyan" ? "text-cyan cyan-text" : "text-cloud"
            }`}
          >
            {s.title}
          </h2>
          <p className="mt-3 text-[0.95rem] leading-relaxed text-cloud/85">{s.body}</p>

          <div className="mt-7 flex items-center justify-between">
            <div className="flex gap-2" aria-hidden>
              {steps.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === step ? "w-6 bg-magenta" : "w-1.5 bg-void-line"
                  }`}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onDone}
                className="px-2 py-2 text-xs font-semibold uppercase tracking-wide text-muted transition hover:text-cloud"
              >
                {t("onbSkip", lang)}
              </button>
              <button
                onClick={() => (last ? onDone() : setStep((v) => v + 1))}
                className="rounded-full bg-magenta px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-void shadow-neon transition hover:bg-magenta-hot active:scale-95"
              >
                {last ? t("onbStart", lang) : t("next", lang)}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
