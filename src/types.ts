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

export interface WatchResult {
  briefings: Briefing[];
  webSearchUsed: boolean;
  dated: boolean;
  asOf: string;
}

export interface WatchRequest {
  lens: Lens;
  lang: Lang;
  categories: CategoryId[];
  count: number;
  /** Titles already covered by sibling batches — avoid repeating them. */
  avoid?: string[];
  /** Lifecycle angle to emphasise for this batch (cross-batch diversity). */
  angle?: string;
}

/** A briefing saved to the local glossary collection. */
export interface SavedBriefing extends Briefing {
  id: string;
  savedAt: number;
  lens: Lens;
  asOf: string;
}
