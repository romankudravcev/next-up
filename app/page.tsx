"use client";

import React, { act, useEffect, useState } from "react";
import Wheel from "../components/Wheel";
import Manager from "../components/Manager";
import CreateActivityDialog from "../components/CreateActivityDialog";
import Confetti from "../components/Confetti";
import QuestionDialog from "../components/QuestionDialog";
import WheelDialog from "../components/WheelDialog";
import AnimatedTitle from "../components/AnimatedTitle";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { Eye } from "lucide-react";

type Activity = {
  id: string;
  name: string;
  location: string;
  weather: string;
  duration: string;
  type: string[];
  hidden?: boolean;
};

export default function Home() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [tab, setTab] = useState<number>(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<Activity | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [filtered, setFiltered] = useState<Activity[] | null>(null);
  const [wheelDialogOpen, setWheelDialogOpen] = useState(false);

  async function load() {
    try {
      const res = await fetch("/api/activities");
      const data = await res.json();
      setActivities(data);
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onFinish(a: Activity) {
    // If the activity was hidden, unhide it on the server so it becomes visible
    if (a.hidden) {
      try {
        await fetch("/api/activities", { method: "PATCH", body: JSON.stringify({ id: a.id, hidden: false }), headers: { "Content-Type": "application/json" } });
        await load();
      } catch (e) {
        console.error(e);
      }
    }
    setSelected(a);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 5000);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">

        <div className="bg-white/80 dark:bg-black/70 rounded-xl shadow-lg p-6">
          <AnimatedTitle text="Willkommen Louisa" />
            <div className="flex flex-col items-center justify-center h-full px-4">
              <div className="flex gap-3">
                <Button onClick={() => setDialogOpen(true)}>Was machen wir heute</Button>
                <CreateActivityDialog onCreated={load} />
              </div>

              <div className="w-full mt-6">
                <h4 className="text-md font-medium mb-3">Aktivitäten ({activities.length})</h4>
                <ul className="space-y-3 max-h-[300px] overflow-auto pr-2">
                  {activities.map((a) => (
                    <li key={a.id} className="flex items-center justify-between dark:bg-black/40 p-3 rounded-md">
                      <div>
                        <div className="font-medium">{a.hidden ? "???" : a.name}</div>
                        <div className="text-sm text-muted-foreground">{a.location} • {a.duration} • {Array.isArray(a.type) ? a.type.join(", ") : a.type}</div>
                      </div>
                      <div className="flex gap-2 items-center">
                        <Button aria-label="Vorschau" variant="ghost" size="icon" onClick={() => { alert(a.name); }}>
                          <Eye />
                        </Button>
                        
                        <Button
                          aria-label="Löschen"
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-700"
                          onClick={async () => {
                            if (confirm("Löschen?")) {
                              await fetch("/api/activities", { method: "DELETE", body: JSON.stringify({ id: a.id }), headers: { "Content-Type": "application/json" } });
                              await load();
                            }
                          }}
                        >
                          <Trash />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
          </div>
        </div>

        <Confetti play={showConfetti} />

        <QuestionDialog
          open={dialogOpen}
          activities={activities}
          onClose={() => setDialogOpen(false)}
          onComplete={(list) => {
            setFiltered(list);
            setWheelDialogOpen(true);
            setTab(0);
            setDialogOpen(false);
          }}
        />

        <WheelDialog
          open={wheelDialogOpen}
          onOpenChange={(v) => setWheelDialogOpen(v)}
          activities={filtered ?? activities}
          onFinish={onFinish}
        />
      </div>
    </div>
  );
}
