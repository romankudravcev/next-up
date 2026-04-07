"use client";
import React, { useEffect, useRef } from "react";

export default function Confetti({ play = false }: { play?: boolean }) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    let particles: any[] = [];
    let raf = 0;
    let finished = false;

    function init() {
      particles = [];
      for (let i = 0; i < 120; i++) {
        particles.push({ x: Math.random() * w, y: Math.random() * -h * Math.random(), vx: (Math.random() - 0.5) * 6, vy: Math.random() * 4 + 2, c: `hsl(${Math.random()*360},80%,60%)`, done: false });
      }
      finished = false;
    }

    function draw() {
      ctx!.clearRect(0,0,w,h);
      let active = 0;
      for (const p of particles) {
        if (p.done) continue;
        p.x += p.vx; p.y += p.vy; p.vy += 0.05;
        ctx!.fillStyle = p.c;
        ctx!.fillRect(p.x, p.y, 6, 10);
        if (p.y > h + 50) { p.done = true; }
        if (!p.done) active++;
      }
      if (active === 0) {
        finished = true;
        cancelAnimationFrame(raf);
        // clear canvas after short delay so it appears to fall away
        setTimeout(() => { ctx!.clearRect(0,0,w,h); }, 300);
        return;
      }
      raf = requestAnimationFrame(draw);
    }

    function onResize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', onResize);
    if (play) {
      init();
      draw();
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      if (ctx) ctx.clearRect(0,0,canvas.width,canvas.height);
    };
  }, [play]);

  return <canvas ref={ref} style={{position:'fixed',left:0,top:0,pointerEvents:'none',zIndex:1000}} />;
}
