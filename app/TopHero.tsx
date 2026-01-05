"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import Beams from "./Beams";
import StarBorder from "@/components/StarBorder";
import GradientText from "@/components/GradientText";

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

export default function TopHero() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [isMdUp, setIsMdUp] = useState(false);

  const prefersReducedMotion = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const media = window.matchMedia("(min-width: 768px)");
    const updateMedia = () => setIsMdUp(media.matches);
    updateMedia();

    if (media.addEventListener) media.addEventListener("change", updateMedia);
    else media.addListener(updateMedia);

    return () => {
      if (media.removeEventListener)
        media.removeEventListener("change", updateMedia);
      else media.removeListener(updateMedia);
    };
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const update = () => {
      const rect = section.getBoundingClientRect();
      const sectionTop = window.scrollY + rect.top;
      const sectionHeight = rect.height;

      // 0..1 while scrolling through the hero
      const start = sectionTop;
      const end = sectionTop + Math.max(1, sectionHeight - window.innerHeight);
      const t = clamp01((window.scrollY - start) / Math.max(1, end - start));
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

  // Keep scroll tracking for future hero effects.
  const t = prefersReducedMotion ? 0 : progress;

  return (
    <section ref={sectionRef} className="relative min-h-screen">
      <div className="pointer-events-none absolute inset-0 opacity-80">
        <Beams
          beamWidth={2}
          beamHeight={15}
          beamNumber={12}
          lightColor="#ffffff"
          speed={2}
          noiseIntensity={1.75}
          scale={0.2}
          rotation={0}
        />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 py-12 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-white/60">
          Developer Portfolio
        </p>
        <h1 className="mt-3 text-4xl font-semibold leading-tight md:text-5xl">
          <GradientText
            className="cursor-default"
            colors={["#6ef5c9", "#86a9ff", "#6ef5c9", "#86a9ff", "#6ef5c9"]}
            animationSpeed={3}
            showBorder={false}
            pauseOnHover={false}
          >
            Building thoughtful web experiences.
          </GradientText>
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-white/80">
          I design and ship reliable products with a focus on clean interfaces,
          clear systems, and fast performance.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="#projects"
            className="rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition hover:bg-white/80"
          >
            View projects
          </Link>
          <Link
            href="#contact"
            className="rounded-full border border-white/30 px-6 py-3 text-sm font-medium text-white transition hover:border-white/60"
          >
            Get in touch
          </Link>
        </div>

        <div className="mt-10 grid w-full grid-cols-1 gap-4 text-left text-sm text-white/80 md:grid-cols-3">
          <StarBorder
            as="div"
            className="w-full"
            color="rgba(255,255,255,0.9)"
            thickness={2}
            speed="7s"
          >
            <div className="rounded-2xl bg-white/5 p-4 backdrop-blur">
              <p className="text-xs text-white/60">What I do</p>
              <p className="mt-2 font-medium text-white">
                Full-stack web, design systems, and DX tooling.
              </p>
            </div>
          </StarBorder>

          <StarBorder
            as="div"
            className="w-full"
            color="rgba(255,255,255,0.9)"
            thickness={2}
            speed="7s"
          >
            <div className="rounded-2xl bg-white/5 p-4 backdrop-blur">
              <p className="text-xs text-white/60">Focus</p>
              <p className="mt-2 font-medium text-white">
                Accessible interfaces with reliable performance.
              </p>
            </div>
          </StarBorder>

          <StarBorder
            as="div"
            className="w-full"
            color="rgba(255,255,255,0.9)"
            thickness={2}
            speed="7s"
          >
            <div className="rounded-2xl bg-white/5 p-4 backdrop-blur">
              <p className="text-xs text-white/60">Currently</p>
              <p className="mt-2 font-medium text-white">
                Open for select freelance projects.
              </p>
            </div>
          </StarBorder>
        </div>
      </div>
    </section>
  );
}
