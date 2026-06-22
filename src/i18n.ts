import type { CategoryId, Lang, Stage } from "./types";

export const CATEGORIES: { id: CategoryId; fr: string; en: string; emoji: string }[] = [
  { id: "memes", fr: "Memes & formats", en: "Memes & formats", emoji: "🌀" },
  { id: "slang", fr: "Slang & expressions", en: "Slang & expressions", emoji: "💬" },
  { id: "son", fr: "Son & musique", en: "Music & sound", emoji: "🎧" },
  { id: "ecran", fr: "Film & télé", en: "Film & TV", emoji: "🎬" },
  { id: "drama", fr: "Drama internet", en: "Internet drama", emoji: "🔥" },
  { id: "esthetique", fr: "Esthétiques", en: "Aesthetics", emoji: "✨" },
];

export const STAGE_META: Record<Stage, { fr: string; en: string; cls: string }> = {
  rising: { fr: "EN MONTÉE", en: "RISING", cls: "text-void bg-stage-rising" },
  peak: { fr: "AU SOMMET", en: "PEAK", cls: "text-cloud bg-stage-peak" },
  fading: { fr: "EN BAISSE", en: "FADING", cls: "text-void bg-stage-fading" },
  over: { fr: "C'EST FINI", en: "OVER", cls: "text-cloud bg-stage-over" },
};

type Dict = Record<string, { fr: string; en: string }>;

const T: Dict = {
  tagline: {
    fr: "Le radar des tendances. On va voir ce qui bouillonne — pis on te l'explique.",
    en: "The trend radar. We go find what's bubbling — and explain it to you.",
  },
  lensMonde: { fr: "Internet mondial", en: "Global internet" },
  lensQuebec: { fr: "Québec / francophone", en: "Québec / francophone" },
  scan: { fr: "Lancer le radar", en: "Run the radar" },
  rescan: { fr: "Rafraîchir", en: "Refresh" },
  scanning: { fr: "Le radar fouille le web…", en: "The radar is sweeping the web…" },
  collection: { fr: "Mon glossaire", en: "My glossary" },
  feed: { fr: "Le radar", en: "The radar" },
  empty: {
    fr: "Choisis tes catégories pis lance le radar. On revient avec ce que t'as manqué.",
    en: "Pick your categories and run the radar. We come back with what you missed.",
  },
  emptyCollection: {
    fr: "Ton glossaire est vide. Sauvegarde les tendances que tu veux garder en mémoire.",
    en: "Your glossary is empty. Save the trends you want to keep on file.",
  },
  save: { fr: "Garder", en: "Save" },
  saved: { fr: "Gardé", en: "Saved" },
  remove: { fr: "Retirer", en: "Remove" },
  whatItIs: { fr: "C'est quoi", en: "What it is" },
  origin: { fr: "D'où ça vient", en: "Where it's from" },
  why: { fr: "Pourquoi ça pogne", en: "Why it resonates" },
  example: { fr: "Exemple", en: "Example" },
  where: { fr: "Où le voir", en: "Where to see it" },
  verdict: { fr: "T'es en retard ?", en: "Are you late?" },
  age: { fr: "Âge", en: "Age" },
  expand: { fr: "Le décodeur complet", en: "Full explainer" },
  collapse: { fr: "Replier", en: "Collapse" },
  lateYes: { fr: "Oui, t'es en retard", en: "Yes, you're late" },
  lateNo: { fr: "Non, t'es à temps", en: "No, you're on time" },
  allCats: { fr: "Toutes", en: "All" },
  count: { fr: "Combien", en: "How many" },
  webLive: { fr: "Web en direct", en: "Live web" },
  webDated: {
    fr: "Recherche web indisponible — basé sur la mémoire du modèle, peut être daté.",
    en: "Web search unavailable — from model memory, may be dated.",
  },
  webLiveFull: {
    fr: "Trouvé en direct sur le web",
    en: "Pulled live from the web",
  },
  asOf: { fr: "en date du", en: "as of" },
  error: { fr: "Aïe. Le radar a planté", en: "Oops. The radar crashed" },
  retry: { fr: "Réessayer", en: "Retry" },
  onbTitle: { fr: "L'Air du temps", en: "L'Air du temps" },
  onb1Title: { fr: "Le radar des références", en: "The reference radar" },
  onb1: {
    fr: "On part chercher ce qui bouillonne maintenant — memes, formats, slang, sons, microtrends — pis on t'explique chaque affaire.",
    en: "We go find what's bubbling now — memes, formats, slang, sounds, microtrends — and explain each one.",
  },
  onb2Title: { fr: "Mondial ou d'icitte", en: "Global or local" },
  onb2: {
    fr: "Bascule entre l'internet mondial pis la culture web québécoise / francophone. Nos tendances comptent aussi.",
    en: "Switch between the global internet and Québécois / francophone web culture. Our trends count too.",
  },
  onb3Title: { fr: "Le décodeur, pas le feed", en: "The decoder, not the feed" },
  onb3: {
    fr: "Pas un feed sans fin. Chaque tendance = une fiche : d'où ça vient, pourquoi ça marche, pis si t'es déjà trop tard. Garde-les dans ton glossaire.",
    en: "Not an endless feed. Each trend = one card: where it's from, why it works, and whether you're already too late. Keep them in your glossary.",
  },
  onbStart: { fr: "Allons-y", en: "Let's go" },
  onbSkip: { fr: "Passer", en: "Skip" },
  next: { fr: "Suivant", en: "Next" },
  langSwitch: { fr: "EN", en: "FR" },
  pickAtLeast: { fr: "Choisis au moins une catégorie", en: "Pick at least one category" },
};

export function t(key: keyof typeof T, lang: Lang): string {
  return T[key]?.[lang] ?? key;
}

export function catLabel(id: CategoryId, lang: Lang): string {
  return CATEGORIES.find((c) => c.id === id)?.[lang] ?? id;
}
