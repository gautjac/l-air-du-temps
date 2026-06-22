import type { Lang } from "../types";
import { t } from "../i18n";

const PHRASES_FR = [
  "On fouille TikTok…",
  "On lit les commentaires (désolé)…",
  "On décode le slang…",
  "On vérifie si c'est déjà mort…",
  "On scrolle pour toi…",
  "On demande aux ados…",
];
const PHRASES_EN = [
  "Digging through TikTok…",
  "Reading the comments (sorry)…",
  "Decoding the slang…",
  "Checking if it's already dead…",
  "Doomscrolling for you…",
  "Asking the teens…",
];

export function Loading({ lang }: { lang: Lang }) {
  const phrases = lang === "fr" ? PHRASES_FR : PHRASES_EN;
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="relative mb-6 h-24 w-24">
        <span className="absolute inset-0 rounded-full border-2 border-magenta/30" />
        <span className="absolute inset-2 animate-pulseGlow rounded-full border-2 border-cyan/40" />
        <span className="absolute inset-4 rounded-full border-2 border-lime/30" />
        <span className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 animate-pulseGlow rounded-full bg-magenta shadow-neon" />
        {/* sweeping radar line */}
        <span
          className="absolute left-1/2 top-1/2 h-px w-1/2 origin-left bg-gradient-to-r from-cyan to-transparent"
          style={{ animation: "spin 1.8s linear infinite" }}
        />
      </div>
      <p className="display text-lg text-cloud">{t("scanning", lang)}</p>
      <ul className="mt-4 space-y-1 text-sm text-muted">
        {phrases.map((p, i) => (
          <li
            key={i}
            className="animate-pulseGlow"
            style={{ animationDelay: `${i * 0.25}s`, animationDuration: "2.4s" }}
          >
            {p}
          </li>
        ))}
      </ul>
      <style>{`@keyframes spin { to { transform: translate(-2px,-50%) rotate(360deg); } }`}</style>
    </div>
  );
}
