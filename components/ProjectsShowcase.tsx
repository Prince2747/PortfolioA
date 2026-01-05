"use client";

import { useEffect, useMemo, useState } from "react";
import StarBorder from "./StarBorder";
import DomeGallery from "./DomeGallery";
import { fetchProjects, type Project } from "@/lib/projects";

const PROJECTS: Project[] = [
  {
    id: "p1",
    title: "Project One",
    badge: "Case study",
    summary:
      "Performance-first web experience with crisp UI, smooth interactions, and measurable UX gains.",
    tags: ["Next.js", "TypeScript", "Supabase"],
    images: [
      "https://images.unsplash.com/photo-1755569309049-98410b94f66d?q=80&w=900&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1755353985163-c2a0fe5ac3d8?q=80&w=900&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1752588975228-21f44630bb3c?q=80&w=900&auto=format&fit=crop",
    ],
  },
  {
    id: "p2",
    title: "Project Two",
    badge: "Shipped",
    summary:
      "Shipped production app with real-time data, resilient API layer, and sleek visual system.",
    tags: ["C#", "PostgreSQL", "React"],
    images: [
      "https://images.unsplash.com/photo-1755331039789-7e5680e26e8f?q=80&w=900&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1755497595318-7e5e3523854f?q=80&w=900&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1745965976680-d00be7dc0377?q=80&w=900&auto=format&fit=crop",
    ],
  },
];

export default function ProjectsShowcase() {
  const [projects, setProjects] = useState<Project[]>(PROJECTS);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const data = await fetchProjects();
        if (cancelled) return;

        // If Firebase isn't configured, fetchProjects returns null.
        // Keep the built-in fallback list in that case.
        if (data && data.length > 0) {
          setProjects(data);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const openProject = useMemo(
    () => projects.find((p) => p.id === openId),
    [openId, projects]
  );

  return (
    <section
      id="projects"
      className="relative z-10 mx-auto w-full max-w-5xl scroll-mt-28 px-6 py-24"
    >
      <StarBorder
        as="div"
        className="w-full"
        color="rgba(255,255,255,0.9)"
        thickness={2}
        speed="7s"
      >
        <div className="relative overflow-hidden rounded-3xl bg-black/35 p-6 backdrop-blur md:p-10">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-80"
            style={{
              backgroundImage:
                "repeating-linear-gradient(135deg, rgba(255,255,255,0.10) 0px, rgba(255,255,255,0.10) 2px, transparent 2px, transparent 10px)",
            }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-10 left-0 right-0 h-px bg-white/15"
            style={{ transform: "skewY(-6deg)" }}
          />

          <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-white/60">
                Projects
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-4xl">
                Built for speed.
              </h2>
              <p className="mt-3 max-w-2xl text-sm text-white/80">
                Click a project to open full details and a 3D dome gallery.
              </p>
            </div>
            <div className="text-xs uppercase tracking-[0.35em] text-white/60">
              {String(Math.max(projects.length, 0)).padStart(2, "0")} selected
            </div>
          </div>

          {!openProject ? (
            <div className="relative mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
              {loading ? (
                <div className="rounded-2xl border border-white/10 bg-black/40 p-6 text-sm text-white/70">
                  Loading projects…
                </div>
              ) : null}

              {projects.map((project, idx) => (
                <StarBorder
                  key={project.id}
                  as="div"
                  className="w-full"
                  color="rgba(255,255,255,0.9)"
                  thickness={2}
                  speed="7s"
                >
                  <button
                    onClick={() => setOpenId(project.id)}
                    className="group relative flex min-h-60 w-full cursor-pointer flex-col overflow-hidden rounded-2xl bg-black/45 p-6 text-left backdrop-blur-3xl backdrop-saturate-200 ring-1 ring-white/15 shadow-lg shadow-black/50 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:scale-[0.99] md:hover:-translate-y-0.5 md:hover:bg-black/45 md:hover:ring-white/25 md:hover:shadow-lg md:hover:shadow-black/50"
                  >
                    <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-white/15 via-white/5 to-black/70 opacity-70" />
                    <div className="relative flex items-start justify-between gap-6">
                      <div>
                        <div className="text-xs uppercase tracking-[0.35em] text-white/60">
                          {String(idx + 1).padStart(2, "0")}
                        </div>
                        <h3 className="mt-2 text-lg font-semibold text-white">
                          {project.title}
                        </h3>
                      </div>
                      <div className="text-[10px] uppercase tracking-[0.35em] text-white/60">
                        {project.badge?.trim() ? project.badge : "Project"}
                      </div>
                    </div>

                    <p
                      className="relative mt-4 text-sm text-white/80"
                      style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {project.summary}
                    </p>

                    <div className="relative mt-auto pt-5">
                      <div className="flex flex-wrap gap-2">
                        {(project.tags?.length
                          ? project.tags.slice(0, 6)
                          : ["No tags"]
                        ).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-200"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </button>
                </StarBorder>
              ))}
            </div>
          ) : (
            <div className="relative mt-10">
              <StarBorder
                as="div"
                className="w-full"
                color="rgba(255,255,255,0.9)"
                thickness={2}
                speed="7s"
              >
                <div className="rounded-3xl bg-black/45 p-6 backdrop-blur-3xl backdrop-saturate-200 ring-1 ring-white/15 shadow-lg shadow-black/50 md:p-10">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.35em] text-white/60">
                        {openProject.badge}
                      </p>
                      <h3 className="mt-2 text-2xl font-semibold text-white">
                        {openProject.title}
                      </h3>
                      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/80">
                        {openProject.summary}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {openProject.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-200"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => setOpenId(null)}
                      className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white transition hover:bg-white/20"
                    >
                      Close
                    </button>
                  </div>

                  <div className="mt-6 rounded-2xl border border-white/10 bg-black/60 p-2">
                    {openProject.images && openProject.images.length > 0 ? (
                      <div className="h-[80vh] w-full overflow-hidden rounded-xl border border-white/5 bg-black">
                        <DomeGallery
                          images={openProject.images}
                          fit={0.55}
                          fitBasis="width"
                          minRadius={420}
                          maxRadius={800}
                          padFactor={0.22}
                          openedImageWidth="520px"
                          openedImageHeight="520px"
                          imageBorderRadius="20px"
                          openedImageBorderRadius="20px"
                          overlayBlurColor="#000"
                          grayscale={false}
                          edgeFade={false}
                        />
                      </div>
                    ) : (
                      <div className="flex h-[320px] w-full items-center justify-center rounded-xl border border-white/5 bg-black/40 text-center text-sm text-white/70">
                        No images provided for this project.
                      </div>
                    )}
                  </div>
                </div>
              </StarBorder>
            </div>
          )}
        </div>
      </StarBorder>
    </section>
  );
}
