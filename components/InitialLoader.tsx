"use client";

import { useEffect, useRef, useState } from "react";

const MIN_VISIBLE_MS = 300;
const MAX_VISIBLE_MS = 1200;

export default function InitialLoader() {
  const [phase, setPhase] = useState<"enter" | "exit" | "gone">(() => {
    try {
      if (typeof window !== "undefined") {
        if (window.sessionStorage.getItem("ly:loaded") === "1") return "gone";

        return "enter";
      }
    } catch {
      // ignore
    }
    return "enter";
  });
  const finishedRef = useRef(false);
  const startedAtRef = useRef<number>(0);

  useEffect(() => {
    if (phase === "gone") return;

    if (!startedAtRef.current) {
      startedAtRef.current =
        typeof performance !== "undefined" ? performance.now() : Date.now();
    }

    const finish = () => {
      if (finishedRef.current) return;
      finishedRef.current = true;

      try {
        window.sessionStorage.setItem("ly:loaded", "1");
      } catch {
        // ignore
      }

      setPhase("exit");
      window.setTimeout(() => setPhase("gone"), 420);
    };

    const now =
      typeof performance !== "undefined" ? performance.now() : Date.now();
    const elapsed = Math.max(0, now - startedAtRef.current);
    const remainingToMin = Math.max(0, MIN_VISIBLE_MS - elapsed);

    const minTimer = window.setTimeout(finish, remainingToMin);
    const maxTimer = window.setTimeout(finish, MAX_VISIBLE_MS);

    return () => {
      window.clearTimeout(minTimer);
      window.clearTimeout(maxTimer);
    };
  }, [phase]);

  if (phase === "gone") return null;

  return (
    <div
      className={`ly-loader ${phase === "exit" ? "ly-loader--exit" : ""}`}
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <div className="ly-loader__mark" aria-hidden="true">
        <span className="ly-typing" aria-hidden="true">
          LY
        </span>
      </div>
    </div>
  );
}
