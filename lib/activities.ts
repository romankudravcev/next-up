import { promises as fs } from "fs";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "data", "activities.json");

export type Activity = {
  id: string;
  name: string;
  location: string;
  weather: string;
  duration: string; // e.g. "1-2 Stunden", "Halber Tag", "Tagesausflug"
  type: string[]; // categories
  hidden?: boolean;
};

async function readFile(): Promise<Activity[]> {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf-8");
    const parsed = JSON.parse(raw) as any[];
    // normalize entries: ensure `type` is array and `duration` uses descriptive buckets
    return parsed.map((p) => {
      const durRaw = p.duration;
      let duration = String(durRaw ?? "");
      // if numeric minutes, map to rough categories
      const n = parseInt(duration, 10);
      if (!isNaN(n)) {
        if (n <= 120) duration = "1-2 Stunden";
        else if (n <= 360) duration = "Halber Tag";
        else duration = "Tagesausflug";
      }
      const t = p.type;
      const type = Array.isArray(t) ? t : (t ? [t] : []);
      const hidden = Boolean(p.hidden === true);
      return { ...p, duration, type, hidden } as Activity;
    });
  } catch (e) {
    return [];
  }
}

async function writeFile(data: Activity[]) {
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), "utf-8");
}

export async function getActivities(): Promise<Activity[]> {
  return await readFile();
}

export async function addActivity(activity: Omit<Activity, "id">): Promise<Activity> {
  const list = await readFile();
  const id = (Date.now() + Math.floor(Math.random() * 1000)).toString();
  const newAct: Activity = { id, ...activity } as Activity;
  list.push(newAct);
  await writeFile(list);
  return newAct;
}

export async function updateActivity(id: string, patch: Partial<Activity>): Promise<Activity | null> {
  const list = await readFile();
  const idx = list.findIndex((a) => a.id === id);
  if (idx === -1) return null;
  const updated = { ...list[idx], ...patch } as Activity;
  list[idx] = updated;
  await writeFile(list);
  return updated;
}

export async function deleteActivity(id: string): Promise<boolean> {
  const list = await readFile();
  const next = list.filter((a) => a.id !== id);
  if (next.length === list.length) return false;
  await writeFile(next);
  return true;
}
