"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import CreateActivityDialog from "./CreateActivityDialog";

type Activity = {
  id: string;
  name: string;
  location: string;
  weather: string;
  duration: string;
  type: string[];
};

export default function Manager({ onChange }: { onChange?: () => void }) {
  const [list, setList] = useState<Activity[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  async function fetchList() {
    const res = await fetch("/api/activities");
    const data = await res.json();
    setList(data);
  }

  useEffect(() => { fetchList(); }, []);

  // Manager now uses a creation dialog; this handler triggers a refresh
  function onCreated() {
    setRefreshKey((k) => k + 1);
    onChange?.();
  }

  async function del(id: string) {
    await fetch("/api/activities", { method: "DELETE", body: JSON.stringify({ id }), headers: { "Content-Type": "application/json" } });
    await fetchList();
    onChange?.();
  }

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <div className="bg-white/80 dark:bg-black/60 p-4 rounded-lg shadow min-w-[280px]">
        <h3 className="text-lg font-semibold">Neue Aktivität</h3>
        <div className="mt-3">
          <CreateActivityDialog onCreated={onCreated} />
        </div>
      </div>

      <div className="flex-1 bg-white/80 dark:bg-black/60 p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold">Aktivitäten</h3>
        <ul className="mt-3 space-y-3">
          {list.map((a) => (
            <li key={a.id} className="flex items-center justify-between gap-4">
              <div>
                <div className="font-medium">{a.name}</div>
                <div className="text-sm text-muted-foreground">{a.location} • {a.weather} • {a.duration} • {(Array.isArray(a.type) ? a.type.join(", ") : a.type)}</div>
              </div>
              <div>
                <Button onClick={() => del(a.id)} className="bg-red-500 hover:bg-red-600">Löschen</Button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
