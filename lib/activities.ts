import { prisma } from './prisma';

export type Activity = {
  id: string;
  name: string;
  location: string;
  weather: string;
  duration: string;
  type: string[];
  hidden?: boolean;
};

export async function getActivities(): Promise<Activity[]> {
  const rows = await prisma.activity.findMany();
  return rows.map((r: any) => ({
    id: r.id,
    name: r.name,
    location: r.location,
    weather: r.weather,
    duration: r.duration,
    type: r.type,
    hidden: r.hidden,
  }));
}

export async function addActivity(activity: Omit<Activity, 'id'>): Promise<Activity> {
  const id = (Date.now() + Math.floor(Math.random() * 1000)).toString();
  const created = await prisma.activity.create({ data: { id, ...activity } });
  return created as unknown as Activity;
}

export async function updateActivity(id: string, patch: Partial<Activity>): Promise<Activity | null> {
  try {
    const updated = await prisma.activity.update({ where: { id }, data: patch as any });
    return updated as unknown as Activity;
  } catch (e) {
    return null;
  }
}

export async function deleteActivity(id: string): Promise<boolean> {
  try {
    await prisma.activity.delete({ where: { id } });
    return true;
  } catch (e) {
    return false;
  }
}
