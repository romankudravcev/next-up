"use client";

import React, { useEffect, useState } from "react";

export default function AnimatedTitle({ text }: { text: string }) {
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    setVisible(0);
    let i = 0;
    const interval = setInterval(() => {
      i += 1;
      setVisible(i);
      if (i >= text.length) clearInterval(interval);
    }, 120);
    return () => clearInterval(interval);
  }, [text]);

  return (
    <div className="mb-6 flex justify-center">
      <h2 className="text-3xl font-bold">
        {text.split("").map((ch, idx) => (
          <span
            key={idx}
            className={`inline-block transform transition-opacity transition-transform duration-100 ease-out ${idx < visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}
            style={{ transitionDelay: `${idx * 1}ms` }}
          >
            {ch === " " ? "\u00A0" : ch}
          </span>
        ))}
      </h2>
    </div>
  );
}
