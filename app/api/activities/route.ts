import { NextResponse } from "next/server";
import { getActivities, addActivity, deleteActivity, updateActivity } from "../../../lib/activities";

export async function GET() {
  const list = await getActivities();
  return NextResponse.json(list);
}

export async function POST(request: Request) {
  const body = await request.json();
  const required = ["name", "location", "weather", "duration", "type"];
  for (const k of required) {
    if (!body[k]) return NextResponse.json({ error: `Missing ${k}` }, { status: 400 });
  }
  // validate location
  const allowedLocations = ["Heidelberg", "München"];
  if (!allowedLocations.includes(body.location)) return NextResponse.json({ error: `Invalid location` }, { status: 400 });
  // validate duration
  const allowedDurations = ["1-2 Stunden", "Halber Tag", "Tagesausflug"];
  if (!allowedDurations.includes(body.duration)) return NextResponse.json({ error: `Invalid duration` }, { status: 400 });
  // type should be an array of categories
  if (!Array.isArray(body.type) || body.type.length === 0) return NextResponse.json({ error: `Invalid type` }, { status: 400 });

  const created = await addActivity(body);
  return NextResponse.json(created, { status: 201 });
}

export async function PATCH(request: Request) {
  const body = await request.json();
  if (!body?.id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const updated = await updateActivity(body.id, body);
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(request: Request) {
  const body = await request.json();
  if (!body?.id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const ok = await deleteActivity(body.id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
