"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Home, TreeDeciduous, Building, Paintbrush, Coffee, Compass, Castle, Beer, Sun, CloudRain, Map, Martini, Dumbbell } from "lucide-react";

const CATEGORIES = [
  { key: "daheim", label: "Daheim", icon: Home },
  { key: "natur", label: "Natur", icon: TreeDeciduous },
  { key: "stadt", label: "Stadt", icon: Building },
  { key: "kreativ", label: "Kreativ", icon: Paintbrush },
  { key: "entspannt", label: "Entspannt", icon: Coffee },
  { key: "entdecken", label: "Entdecken", icon: Compass },
  { key: "ausgehen", label: "Ausgehen", icon: Martini },
  { key: "sport", label: "Sport", icon: Dumbbell },
];

export default function CreateActivityDialog({ onCreated }: { onCreated?: () => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("Heidelberg");
  const [weather, setWeather] = useState("egal");
  const [duration, setDuration] = useState("1-2 Stunden");
  const [types, setTypes] = useState<string[]>([]);
  const toggleType = (k: string) => setTypes((s) => (s.includes(k) ? s.filter((x) => x !== k) : [...s, k]));

  async function submit(e?: React.FormEvent) {
    e?.preventDefault();
    const body = { name, location, weather, duration, type: types, hidden: true };
    const res = await fetch("/api/activities", { method: "POST", body: JSON.stringify(body), headers: { "Content-Type": "application/json" } });
    if (res.ok) {
      setOpen(false);
      setName("");
      setTypes([]);
      onCreated?.();
    } else {
      const err = await res.json();
      alert(err.error || "Fehler");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Neue Aktivität</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Neue Aktivität erstellen</DialogTitle>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label htmlFor="act-name" className="block text-sm mb-1">Name</label>
            <input id="act-name" required placeholder="z. B. Spaziergang" value={name} onChange={(e) => setName(e.target.value)} className="input w-full" />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm mb-1">Ort</label>
              <Select defaultValue={location} onValueChange={(v) => setLocation(v)}>
                <SelectTrigger size="default" className="w-full">
                  <SelectValue>{location}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Heidelberg"><span className="inline-flex items-center gap-2"><Castle className="size-4" />Heidelberg</span></SelectItem>
                    <SelectItem value="München"><span className="inline-flex items-center gap-2"><Beer className="size-4" />München</span></SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <label className="block text-sm mb-1">Dauer</label>
              <Select defaultValue={duration} onValueChange={(v) => setDuration(v)}>
                <SelectTrigger size="default" className="w-full">
                  <SelectValue>{duration}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-2 Stunden">1-2 Stunden</SelectItem>
                  <SelectItem value="Halber Tag">Halber Tag</SelectItem>
                  <SelectItem value="Tagesausflug">Tagesausflug</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1">Wetter</label>
            <div className="grid grid-cols-3 gap-2">
              <button type="button" onClick={() => setWeather('sonnig')} className={`flex flex-col items-center justify-center h-12 rounded-lg border p-2 ${weather==='sonnig' ? 'bg-indigo-600 text-white' : 'bg-transparent'}`}>
                <Sun className="size-5 mb-1" />
                <span>Gut</span>
              </button>
              <button type="button" onClick={() => setWeather('regnerisch')} className={`flex flex-col items-center justify-center h-12 rounded-lg border p-2 ${weather==='regnerisch' ? 'bg-indigo-600 text-white' : 'bg-transparent'}`}>
                <CloudRain className="size-5 mb-1" />
                <span>Schlecht</span>
              </button>
              <button type="button" onClick={() => setWeather('egal')} className={`flex flex-col items-center justify-center h-12 rounded-lg border p-2 ${weather==='egal' ? 'bg-indigo-600 text-white' : 'bg-transparent'}`}>
                <Map className="size-5 mb-1" />
                <span>Egal</span>
              </button>
            </div>
          </div>

          <div>
            <div className="mb-2 text-sm">Kategorien (mehrfach auswählbar)</div>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => {
                const Icon = c.icon;
                const active = types.includes(c.key);
                return (
                  <button type="button" key={c.key} onClick={() => toggleType(c.key)} className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${active ? "bg-primary text-white" : "bg-transparent"}`}>
                    <Icon className="size-4" />
                    <span className="text-sm">{c.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <DialogFooter>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setOpen(false)}>Abbrechen</Button>
              <Button type="submit" onClick={(e) => submit(e)}>Erstellen</Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
