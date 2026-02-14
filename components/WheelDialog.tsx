"use client";

import React from "react";
import Wheel from "./Wheel";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Activity = { id: string; name: string; hidden?: boolean };

export default function WheelDialog({ open, onOpenChange, activities, onFinish }: { open: boolean; onOpenChange: (v: boolean) => void; activities: Activity[]; onFinish: (a: any) => void; }) {
  const [spinKey, setSpinKey] = React.useState(0);
  const [result, setResult] = React.useState<Activity | null>(null);
  const [spunOnce, setSpunOnce] = React.useState(false);
  const [isSpinning, setIsSpinning] = React.useState(false);

  async function handleFinish(a: Activity) {
    setIsSpinning(false);
    // if the activity was hidden, unhide it via API and use the updated object
    if (a.hidden) {
      try {
        const res = await fetch("/api/activities", { method: "PATCH", body: JSON.stringify({ id: a.id, hidden: false }), headers: { "Content-Type": "application/json" } });
        if (res.ok) {
          const updated = await res.json();
          setResult(updated);
          setSpunOnce(true);
          onFinish(updated);
          return;
        }
      } catch (e) {
        console.error(e);
      }
    }

    setResult(a);
    setSpunOnce(true);
    onFinish(a);
  }

  function startSpin() {
    setResult(null);
    setSpunOnce(false);
    setIsSpinning(true);
    setSpinKey(k => k + 1);
  }

  function handleClose() {
    setResult(null);
    setSpunOnce(false);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={(v)=>{ if(!v) handleClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Glücksrad</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center">
          <div className="w-full max-w-lg">
            {activities.length === 0 ? (
              <div className="p-6 text-center">
                <div className="text-lg font-semibold">Schade — da haben wir noch keine Ideen</div>
                <div className="text-sm text-muted-foreground mt-2">Überlegt euch etwas und fügt neue Aktivitäten hinzu!</div>
                <div className="mt-4 flex justify-center">
                  <Button onClick={() => handleClose()}>Schließen</Button>
                </div>
              </div>
            ) : (
              <div>
                <Wheel activities={activities} onFinish={handleFinish} spinKey={spinKey} showControls={false} />

                <div className="mt-4 flex items-center justify-center gap-3">
                  {!spunOnce && !isSpinning ? (
                    <Button onClick={() => startSpin()}>Drehen!</Button>
                  ) : isSpinning ? (
                    <Button disabled>... Dreht</Button>
                  ) : (
                    <>
                      <Button onClick={() => startSpin()}>Erneut drehen</Button>
                      <Button variant="ghost" onClick={() => { /* mark done - could call API here */ onOpenChange(false); }}>Abhaken</Button>
                      <Button variant="secondary" onClick={() => handleClose()}>Schließen</Button>
                    </>
                  )}
                </div>
                {result && (
                  <div className="mt-3 text-center">
                    <div className="font-semibold">Gewählt: {result.name}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
