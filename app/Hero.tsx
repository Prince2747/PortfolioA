"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ScrollBallOverlay from "@/components/ScrollBallOverlay";
import ScrollVelocity from "@/components/ScrollVelocity";

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

export default function Hero() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [progress, setProgress] = useState(0);

  const prefersReducedMotion = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const update = () => {
      const rect = section.getBoundingClientRect();
      // Progress starts as soon as the section enters the viewport,
      // so text/model respond earlier instead of feeling "late".
      const total = Math.max(1, rect.height + window.innerHeight);
      const t = clamp01((window.innerHeight - rect.top) / total);
      setProgress(t);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <section ref={sectionRef} className="relative min-h-screen bg-black">
      <div className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-16">
        <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2">
          <div className="text-center md:text-left">
            <p className="text-xs uppercase tracking-[0.3em] text-white/60">
              Full‑Stack Developer
            </p>
            <h1 className="mt-3 text-4xl font-semibold leading-tight md:text-5xl">
              {"Design-led interfaces. Production-ready engineering."
                .split(" ")
                .map((word, i) => (
                  <span
                    key={i}
                    className="mr-2 inline-block transition-all duration-500"
                    style={{
                      opacity: prefersReducedMotion
                        ? 1
                        : Math.min(1, Math.max(0, progress * 3 - i * 0.1)),
                      transform: prefersReducedMotion
                        ? "none"
                        : `translateY(${
                            (1 -
                              Math.min(
                                1,
                                Math.max(0, progress * 3 - i * 0.1)
                              )) *
                            20
                          }px)`,
                    }}
                  >
                    {word === "interfaces." ? (
                      <>
                        {word}
                        <br className="hidden md:block" />
                      </>
                    ) : (
                      word
                    )}
                  </span>
                ))}
            </h1>
            <p className="mt-4 max-w-xl text-lg text-white/80">
              {"I build modern web apps that feel premium: fast, accessible, and scalable — from crisp UI to reliable backend integration. Bachelor in Information Systems, focused on practical, production-ready delivery."
                .split(" ")
                .map((word, i) => (
                  <span
                    key={i}
                    className="mr-1 inline-block transition-all duration-500"
                    style={{
                      opacity: prefersReducedMotion
                        ? 1
                        : Math.min(
                            1,
                            Math.max(0, (progress - 0.15) * 4 - i * 0.05)
                          ),
                      transform: prefersReducedMotion
                        ? "none"
                        : `translateY(${
                            (1 -
                              Math.min(
                                1,
                                Math.max(0, (progress - 0.15) * 4 - i * 0.05)
                              )) *
                            10
                          }px)`,
                    }}
                  >
                    {word}
                  </span>
                ))}
            </p>

            <div className="mt-6 max-w-xl space-y-2 text-sm text-white/60">
              <ScrollVelocity
                texts={[
                  "C#  •  JavaScript  •  TypeScript  •  Java  •  Python  •  C++  •  Next.js  •  React  •  Tailwind",
                  "PostgreSQL  •  Supabase  •  Three.js  •  Framer Motion  •  R3F",
                  "MySQL  •  SQL  •  Adobe Photoshop  •  Adobe Illustrator",
                ]}
                velocity={44}
                className="px-3 py-1 text-sm font-medium text-white"
              />
            </div>
          </div>

          <div className="pointer-events-none">
            <div
              className="relative mx-auto h-105 w-full max-w-130 overflow-hidden md:h-130"
              style={{ minHeight: "420px" }}
            >
              <div className="relative z-20 h-full w-full">
                <ScrollBallOverlay
                  modelUrl="/old_computer/scene.gltf"
                  progress={prefersReducedMotion ? 0 : progress}
                  scaleMin={2.82}
                  scaleMax={2.82}
                  tiltX={0}
                  baseRotationY={0}
                  xAmplitude={0.45}
                  xOffset={0.2}
                  fitMargin={1.08}
                  idleWobble={0.09}
                  idleWobbleSpeed={0.95}
                  idleYawAmplitude={Math.PI / 4}
                  idleYawSpeed={0.35}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
