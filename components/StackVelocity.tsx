"use client";

import { useEffect, useMemo, useState } from "react";

export type StackVelocityProps = {
  rows: string[][];
  speeds?: number[]; // seconds per full loop
};

export default function StackVelocity({ rows, speeds }: StackVelocityProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handle = () => setPrefersReducedMotion(mq.matches);
    handle();
    mq.addEventListener("change", handle);
    return () => mq.removeEventListener("change", handle);
  }, []);

  const doubled = useMemo(() => rows.map((row) => [...row, ...row]), [rows]);
  const resolvedSpeeds = useMemo(
    () => rows.map((_, i) => speeds?.[i] ?? (26 + i * 2) * 1.2),
    [rows, speeds]
  );

  return (
    <div
      className="space-y-1.5"
      style={{
        maskImage:
          "linear-gradient(90deg, transparent 0%, black 12%, black 88%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(90deg, transparent 0%, black 12%, black 88%, transparent 100%)",
      }}
    >
      {doubled.map((row, i) => (
        <div key={i} className="overflow-hidden">
          <div
            className="flex items-center gap-3 whitespace-nowrap text-[0.95rem] font-medium text-white"
            style={{
              animation: prefersReducedMotion
                ? "none"
                : `marquee-row-${i} ${resolvedSpeeds[i]}s linear infinite`,
            }}
          >
            {row.map((item, idx) => (
              <span
                key={`${i}-${idx}-${item}`}
                className="rounded-md bg-white/5 px-3 py-1"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      ))}

      <style jsx global>{`
        ${rows
          .map(
            (_, i) => `@keyframes marquee-row-${i} {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }`
          )
          .join("\n")}
      `}</style>
    </div>
  );
}
