"use client";

import React, { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sun, CloudRain, Clock, Map, Home, TreeDeciduous, Building, Paintbrush, Coffee, Compass, ArrowLeft, ArrowRight, Play, Castle, Beer, Martini, Dumbbell } from "lucide-react";

type Activity = { id: string; name: string; location: string; weather: string; duration: string; type: string[] };

export default function QuestionDialog({ open, activities, onClose, onComplete }: { open: boolean; activities: Activity[]; onClose: ()=>void; onComplete: (filtered: Activity[])=>void; }) {
  const [step, setStep] = useState(0);
  const [location, setLocation] = useState('any');
  const [weather, setWeather] = useState('any');
  const [maxDuration, setMaxDuration] = useState('any');
  const [atypes, setAtypes] = useState<string[]>([]);

  const activitiesArray = Array.isArray(activities) ? activities : [];
  const locations = Array.from(new Set(activitiesArray.map(a=>a.location))).filter(Boolean)
  const weathers = Array.from(new Set(activitiesArray.map(a=>a.weather))).filter(Boolean)
  const types = Array.from(new Set(activitiesArray.flatMap(a=>Array.isArray(a.type)?a.type:[]))).filter(Boolean)

  function next() { setStep(s=>Math.min(s+1,3)); }
  function back() { setStep(s=>Math.max(s-1,0)); }

  function reset() {
    setStep(0);
    setLocation('any');
    setWeather('any');
    setMaxDuration('any');
    setAtypes([]);
  }

  function closeAndReset() {
    reset();
    onClose();
  }

  function finish() {
    let filtered = activitiesArray.slice();
    if (location !== 'any') filtered = filtered.filter(a=>a.location===location);
    if (weather !== 'any') {
      if (weather === 'gutes') {
        filtered = filtered.filter(a => ['sonnig','warm','egal'].includes((a.weather||'').toLowerCase()));
      } else if (weather === 'schlechtes') {
        filtered = filtered.filter(a => ['regnerisch','kalt','egal'].includes((a.weather||'').toLowerCase()));
      } else {
        filtered = filtered.filter(a=>a.weather===weather || a.weather==='egal');
      }
    }
    if (maxDuration !== 'any') filtered = filtered.filter(a=>a.duration===maxDuration);
    if (atypes.length > 0) filtered = filtered.filter(a=>Array.isArray(a.type) ? a.type.some(t=>atypes.includes(t)) : false);
    // do not fallback to full list; allow empty to surface "no ideas" message
    onComplete(filtered);
    reset();
  }

  const steps = ['Ort','Wetter','Dauer','Typ'];

  return (
    <Dialog open={open} onOpenChange={(v)=>{ if(!v) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Fragen zur Auswahl</DialogTitle>
        </DialogHeader>

        <div className="mt-3">
          <div className="flex gap-2 mb-2">
            {steps.map((s,i)=> (
              <button key={s} type="button" onClick={()=>setStep(i)} className={`flex-1 text-center py-2 text-sm rounded ${i===step? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700'}`}>{s}</button>
            ))}
          </div>


          {step===0 && (
            <div className="space-y-2">
              <div className="block text-sm mb-2">Bevorzugter Ort</div>
              <div className="grid grid-cols-3 gap-3">
                <button type="button" onClick={() => { setLocation('Heidelberg'); next(); }} className={`flex flex-col items-center justify-center h-20 rounded-lg border p-2 ${location==='Heidelberg' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-black/30'}`}>
                  <Castle className="size-6 mb-1" />
                  <span>Heidelberg</span>
                </button>
                <button type="button" onClick={() => { setLocation('München'); next(); }} className={`flex flex-col items-center justify-center h-20 rounded-lg border p-2 ${location==='München' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-black/30'}`}>
                  <Beer className="size-6 mb-1" />
                  <span>München</span>
                </button>
                <button type="button" onClick={() => { setLocation('any'); next(); }} className={`flex flex-col items-center justify-center h-20 rounded-lg border p-2 ${location==='any' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-black/30'}`}>
                  <Map className="size-6 mb-1" />
                  <span>Egal</span>
                </button>
              </div>
              <p className="text-xs text-muted-foreground">Wähle einen Ort oder "Egal".</p>
            </div>
          )}

          {step===1 && ( 
            <div className="space-y-2">
              <div className="block text-sm mb-2">Wetter</div>
              <div className="grid grid-cols-3 gap-3">
                <button type="button" onClick={() => { setWeather('gutes'); next(); }} className={`flex flex-col items-center justify-center h-20 rounded-lg border p-2 ${weather==='gutes' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-black/30'}`}>
                  <Sun className="w-6 h-6 mb-1" />
                  <span>Gut</span>
                </button>
                <button type="button" onClick={() => { setWeather('schlechtes'); next(); }} className={`flex flex-col items-center justify-center h-20 rounded-lg border p-2 ${weather==='schlechtes' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-black/30'}`}>
                  <CloudRain className="w-6 h-6 mb-1" />
                  <span>Schlecht</span>
                </button>
                <button type="button" onClick={() => { setWeather('any'); next(); }} className={`flex flex-col items-center justify-center h-20 rounded-lg border p-2 ${weather==='any' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-black/30'}`}>
                  <Map className="w-6 h-6 mb-1" />
                  <span>Egal</span>
                </button>
              </div>
              <p className="text-xs text-muted-foreground">Wähle, ob das Wetter gut, schlecht oder egal sein soll.</p>
            </div>
          )}

          {step===2 && (
            <div className="space-y-2">
              <div className="block text-sm mb-2">Dauer</div>
              <div className="grid grid-cols-3 gap-3">
                <button type="button" onClick={() => { setMaxDuration('1-2 Stunden'); next(); }} className={`flex flex-col items-center justify-center h-20 rounded-lg border p-2 ${maxDuration==='1-2 Stunden' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-black/30'}`}>
                  <Clock className="w-6 h-6 mb-1" />
                  <span>1-2 Stunden</span>
                </button>
                <button type="button" onClick={() => { setMaxDuration('Halber Tag'); next(); }} className={`flex flex-col items-center justify-center h-20 rounded-lg border p-2 ${maxDuration==='Halber Tag' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-black/30'}`}>
                  <Sun className="w-6 h-6 mb-1" />
                  <span>Halber Tag</span>
                </button>
                <button type="button" onClick={() => { setMaxDuration('Tagesausflug'); next(); }} className={`flex flex-col items-center justify-center h-20 rounded-lg border p-2 ${maxDuration==='Tagesausflug' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-black/30'}`}>
                  <Map className="w-6 h-6 mb-1" />
                  <span>Tagesausflug</span>
                </button>
              </div>
              <p className="text-xs text-muted-foreground">Wähle die ungefähre Dauer.</p>
            </div>
          )}

          {step===3 && (
            <div className="space-y-2">
              <div className="block text-sm mb-2">Typ (mehrfach auswählbar)</div>
              <div className="grid grid-cols-3 gap-3">
                <button type="button" onClick={() => setAtypes(s => s.includes('daheim') ? s.filter(x=>x!=='daheim') : [...s,'daheim'])} className={`flex flex-col items-center justify-center h-20 rounded-lg border p-2 ${atypes.includes('daheim') ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-black/30'}`}>
                  <Home className="w-6 h-6 mb-1" />
                  <span>Daheim</span>
                </button>
                <button type="button" onClick={() => setAtypes(s => s.includes('natur') ? s.filter(x=>x!=='natur') : [...s,'natur'])} className={`flex flex-col items-center justify-center h-20 rounded-lg border p-2 ${atypes.includes('natur') ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-black/30'}`}>
                  <TreeDeciduous className="w-6 h-6 mb-1" />
                  <span>Natur</span>
                </button>
                <button type="button" onClick={() => setAtypes(s => s.includes('stadt') ? s.filter(x=>x!=='stadt') : [...s,'stadt'])} className={`flex flex-col items-center justify-center h-20 rounded-lg border p-2 ${atypes.includes('stadt') ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-black/30'}`}>
                  <Building className="w-6 h-6 mb-1" />
                  <span>Stadt</span>
                </button>
                <button type="button" onClick={() => setAtypes(s => s.includes('kreativ') ? s.filter(x=>x!=='kreativ') : [...s,'kreativ'])} className={`flex flex-col items-center justify-center h-20 rounded-lg border p-2 ${atypes.includes('kreativ') ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-black/30'}`}>
                  <Paintbrush className="w-6 h-6 mb-1" />
                  <span>Kreativ</span>
                </button>
                <button type="button" onClick={() => setAtypes(s => s.includes('entspannt') ? s.filter(x=>x!=='entspannt') : [...s,'entspannt'])} className={`flex flex-col items-center justify-center h-20 rounded-lg border p-2 ${atypes.includes('entspannt') ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-black/30'}`}>
                  <Coffee className="w-6 h-6 mb-1" />
                  <span>Entspannt</span>
                </button>
                <button type="button" onClick={() => setAtypes(s => s.includes('entdecken') ? s.filter(x=>x!=='entdecken') : [...s,'entdecken'])} className={`flex flex-col items-center justify-center h-20 rounded-lg border p-2 ${atypes.includes('entdecken') ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-black/30'}`}>
                  <Compass className="w-6 h-6 mb-1" />
                  <span>Entdecken</span>
                </button>
                <button type="button" onClick={() => setAtypes(s => s.includes('ausgehen') ? s.filter(x=>x!=='ausgehen') : [...s,'ausgehen'])} className={`flex flex-col items-center justify-center h-20 rounded-lg border p-2 ${atypes.includes('ausgehen') ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-black/30'}`}>
                  <Martini className="w-6 h-6 mb-1" />
                  <span>Ausgehen</span>
                </button>
                <button type="button" onClick={() => setAtypes(s => s.includes('sport') ? s.filter(x=>x!=='sport') : [...s,'sport'])} className={`flex flex-col items-center justify-center h-20 rounded-lg border p-2 ${atypes.includes('sport') ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-black/30'}`}>
                  <Dumbbell className="w-6 h-6 mb-1" />
                  <span>Sport</span>
                </button>
              </div>
            </div>
          )}

          {/* summary step removed - final choices are applied on finish; unanswered fields mean 'Egal' */}
        </div>

        <DialogFooter>
          <div className="flex w-full justify-between">
            <div>
              {step>0 ? <Button variant="ghost" onClick={back}>Zurück</Button> : <Button variant="ghost" onClick={closeAndReset}>Abbrechen</Button>}
            </div>
            <div>
              {step<3 ? <Button onClick={next}>Weiter</Button> : <Button variant="default" onClick={()=>{ finish(); closeAndReset(); }}>Starte Glücksrad</Button>}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
