"use client";

import Link from "next/link";
import Particles from "./Particles";
import { useEffect, useState } from "react";
import { fetchCertifications, type Certification } from "@/lib/certifications";

function getImageUrl(url?: string) {
  if (!url) return undefined;
  const trimmed = url.trim();
  if (!/^https?:\/\//i.test(trimmed)) return undefined;
  return trimmed;
}

function getExternalUrl(url?: string) {
  if (!url) return undefined;
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  // Fallback: assume https if missing protocol
  return `https://${trimmed}`;
}

export default function CertificatesSection() {
  const [certifications, setCertifications] = useState<Certification[] | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const data = await fetchCertifications();
        if (mounted) {
          setCertifications(data ?? []);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section
      id="certificates"
      className="relative z-10 min-h-screen w-full scroll-mt-28 bg-white text-black"
      style={{
        backgroundImage: "none",
        backgroundSize: "40px 40px",
      }}
    >
      <div className="absolute inset-0 pointer-events-none opacity-80">
        <Particles
          particleColors={["#000000", "#0a0a0a"]}
          particleCount={476}
          particleSpread={10}
          speed={0.1}
          particleBaseSize={96}
          moveParticlesOnHover
          alphaParticles={false}
          disableRotation={false}
          sizeRandomness={0.8}
          cameraDistance={20}
          particleHoverFactor={1}
          pixelRatio={1}
        />
      </div>
      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-6 py-20">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-black/60">
            Certificates
          </p>
          <h2 className="mt-3 text-4xl font-semibold leading-tight text-black md:text-5xl">
            My certificates.
          </h2>
          <p className="mt-4 max-w-2xl text-lg text-black/75 md:max-w-3xl mx-auto">
            Programs, courses, and certifications I've completed.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <div className="col-span-full text-center text-sm text-black/60">
              Loading certifications…
            </div>
          ) : certifications && certifications.length > 0 ? (
            certifications.map((cert) => (
              <div
                key={cert.id || `${cert.title}-${cert.issuer}`}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                {getImageUrl(cert.image) && (
                  <div className="overflow-hidden">
                    <img
                      src={getImageUrl(cert.image)}
                      alt={`${cert.title} certificate`}
                      className="block h-56 w-full object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                )}
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.25em] text-black/50">
                    <span>{cert.issuer}</span>
                    {cert.date && <span>{cert.date}</span>}
                  </div>
                  <h3 className="mt-3 text-xl font-semibold text-black group-hover:text-black/80 transition-colors">
                    {cert.title}
                  </h3>
                  {getExternalUrl(cert.url) && (
                    <Link
                      href={getExternalUrl(cert.url)!}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="mt-4 inline-flex items-center justify-center rounded-full bg-black px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-black/80"
                    >
                      View Certificate
                    </Link>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center text-sm text-black/60">
              No certifications yet. Add one in admin.
            </div>
          )}
        </div>

        <div className="mt-12 text-center text-xs uppercase tracking-[0.35em] text-black/50">
          {String(Math.max(certifications?.length ?? 0, 0)).padStart(2, "0")}{" "}
          items
        </div>
      </div>
    </section>
  );
}
