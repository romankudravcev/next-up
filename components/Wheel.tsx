"use client";
import React, { useRef, useState, useCallback, useEffect } from "react";

type Activity = { id: string; name: string; hidden?: boolean };

const COLORS = [
  "hsl(0, 85%, 60%)",
  "hsl(35, 90%, 55%)",
  "hsl(55, 85%, 50%)",
  "hsl(130, 60%, 45%)",
  "hsl(200, 80%, 50%)",
  "hsl(260, 70%, 55%)",
  "hsl(310, 70%, 55%)",
  "hsl(15, 85%, 55%)",
  "hsl(170, 70%, 45%)",
  "hsl(230, 65%, 60%)",
  "hsl(345, 80%, 55%)",
  "hsl(80, 65%, 45%)",
];

export default function Wheel({ activities, onFinish, spinKey, showControls = true }: { activities: Activity[]; onFinish: (a: Activity) => void; spinKey?: number; showControls?: boolean; }) {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [selected, setSelected] = useState<Activity | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const currentRotation = useRef(0);
  const lastSpinRef = useRef<number | null>(null);

  const options = activities.map((a) => (a.hidden ? "???" : a.name));

  const drawWheel = useCallback(
    (ctx: CanvasRenderingContext2D, size: number) => {
      const center = size / 2;
      const radius = center - 8;
      const sliceAngle = (2 * Math.PI) / options.length;

      ctx.clearRect(0, 0, size, size);

      // Draw shadow
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.3)";
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(center, center, radius, 0, 2 * Math.PI);
      ctx.fillStyle = "#333";
      ctx.fill();
      ctx.restore();

      options.forEach((option, i) => {
        const startAngle = i * sliceAngle;
        const endAngle = startAngle + sliceAngle;

        // Segment
        ctx.beginPath();
        ctx.moveTo(center, center);
        ctx.arc(center, center, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = COLORS[i % COLORS.length];
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.4)";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Text: wrap into multiple lines and auto-scale to fit segment arc width
        ctx.save();
        ctx.translate(center, center);
        ctx.rotate(startAngle + sliceAngle / 2);
        ctx.textAlign = "right";
        ctx.fillStyle = "#fff";
        ctx.shadowColor = "rgba(0,0,0,0.5)";
        ctx.shadowBlur = 3;

        const textRadius = radius - 16;
        const arcLength = sliceAngle * textRadius; // approximate available width along arc
        const maxWidth = Math.max(40, Math.min(arcLength - 8, textRadius - 12)); // ensure text doesn't cross center

        let fontSize = Math.max(8, Math.min(16, 200 / options.length));

        const wrapText = (text: string) => {
          ctx.font = `bold ${fontSize}px system-ui, sans-serif`;
          const words = text.split(/\s+/);
          const lines: string[] = [];
          let current = words[0] || '';
          for (let w = 1; w < words.length; w++) {
            const test = current + ' ' + words[w];
            if (ctx.measureText(test).width <= maxWidth) {
              current = test;
            } else {
              lines.push(current);
              current = words[w];
            }
          }
          if (current) lines.push(current);
          return lines;
        };

        // Try reducing font until the longest line fits or min font reached
        let lines = wrapText(option);
        let longest = lines.length ? Math.max(...lines.map(l => ctx.measureText(l).width)) : 0;
        while (longest > maxWidth && fontSize > 8) {
          fontSize -= 1;
          lines = wrapText(option);
          longest = Math.max(...lines.map(l => ctx.measureText(l).width));
        }

        // If still too long, force truncate lines
        if (longest > maxWidth) {
          lines = lines.map(l => {
            let t = l;
            while (ctx.measureText(t + '…').width > maxWidth && t.length > 3) t = t.slice(0, -1);
            return t.length < l.length ? t + '…' : t;
          });
        }

        ctx.font = `bold ${fontSize}px system-ui, sans-serif`;
        ctx.textBaseline = 'middle';
        const lineHeight = fontSize + 2;
        const startY = -((lines.length - 1) * lineHeight) / 2;
        for (let li = 0; li < lines.length; li++) {
          ctx.fillText(lines[li], textRadius, startY + li * lineHeight);
        }

        ctx.restore();
      });

      // Center circle
      ctx.beginPath();
      ctx.arc(center, center, 22, 0, 2 * Math.PI);
      ctx.fillStyle = "#fff";
      ctx.fill();
      ctx.strokeStyle = "#ddd";
      ctx.lineWidth = 2;
      ctx.stroke();
    },
    [options]
  );

  // Draw on mount and when options change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || options.length < 1) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawWheel(ctx, canvas.width);
  }, [options, drawWheel]);

  useEffect(() => {
    if (spinKey == null) return;
    if (lastSpinRef.current === spinKey) return;
    lastSpinRef.current = spinKey;
    spin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spinKey]);

  const spin = () => {
    if (spinning || options.length < 1) return;
    setSpinning(true);

    const extraSpins = 5 + Math.random() * 5; // 5-10 full rotations
    const randomAngle = Math.random() * 360;
    const totalRotation = extraSpins * 360 + randomAngle;
    const newRotation = currentRotation.current + totalRotation;

    setRotation(newRotation);
    currentRotation.current = newRotation;

    setTimeout(() => {
      const finalAngle = newRotation % 360;
      const pointerAngle = (360 - finalAngle + 270) % 360;
      const sliceDeg = 360 / options.length;
      const winnerIndex = Math.floor(pointerAngle / sliceDeg) % options.length;
      const winnerName = options[winnerIndex];
      const winnerActivity = activities[winnerIndex] || activities[0];
      onFinish(winnerActivity);
      setSelected(winnerActivity);
      setSpinning(false);
    }, 4200);
  };

  return (
    <div className="relative flex flex-col items-center gap-6">
      {/* Pointer */}
      <div className="absolute top-0 z-10" style={{ transform: "translateY(-4px)" }}>
        <svg width="32" height="32" viewBox="0 0 32 32">
          <polygon points="16,28 6,4 26,4" fill="hsl(0, 85%, 55%)" stroke="#fff" strokeWidth="2" />
        </svg>
      </div>

      {/* Wheel */}
      <div
        className="mt-4"
        style={{
          transition: spinning ? "transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)" : "none",
          transform: `rotate(${rotation}deg)`,
        }}
      >
        <canvas ref={canvasRef} width={340} height={340} className="w-[340px] h-[340px] max-w-[85vw] max-h-[85vw]" />
      </div>

      {/* Spin button (optional) */}
      {showControls !== false && (
        <button
          onClick={spin}
          disabled={spinning || options.length < 2}
          className="mt-2 px-8 py-3 text-lg font-bold rounded-full bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-400 text-gray-900 shadow-lg transition hover:scale-105 disabled:cursor-not-allowed"
        >
          {spinning ? "Spinning…" : "🎰 SPIN!"}
        </button>
      )}
    </div>
  );
}
