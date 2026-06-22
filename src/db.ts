import Dexie, { type Table } from "dexie";
import type { Briefing, Lens, SavedBriefing } from "./types";

class AirDuTempsDB extends Dexie {
  saved!: Table<SavedBriefing, string>;

  constructor() {
    super("air-du-temps");
    this.version(1).stores({
      saved: "id, savedAt, category, stage, lens",
    });
  }
}

export const db = new AirDuTempsDB();

/** Stable id so the same trend doesn't get saved twice. */
export function briefingKey(b: Briefing): string {
  return b.title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export async function saveBriefing(b: Briefing, lens: Lens, asOf: string): Promise<void> {
  const id = briefingKey(b);
  await db.saved.put({ ...b, id, savedAt: Date.now(), lens, asOf });
}

export async function removeBriefing(id: string): Promise<void> {
  await db.saved.delete(id);
}
