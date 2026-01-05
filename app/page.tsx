import ContactStepper from "@/components/ContactStepper";
import CertificatesSection from "@/components/CertificatesSection";
import StarBorder from "@/components/StarBorder";
import Link from "next/link";
import Hero from "./Hero";
import TopHero from "./TopHero";
import ProjectsShowcase from "../components/ProjectsShowcase";

export default function Home() {
  return (
    <div className="relative isolate overflow-hidden bg-linear-to-b from-black via-zinc-950 to-black text-white">
      <TopHero />

      <Hero />

      <ProjectsShowcase />

      <CertificatesSection />

      <section
        id="contact"
        className="relative z-10 mx-auto w-full max-w-5xl scroll-mt-28 px-6 pt-14 pb-24"
      >
        <p className="text-xs uppercase tracking-[0.3em] text-white/60">
          Contact
        </p>
        <h2 className="mt-3 text-2xl font-semibold text-white">
          Let’s build something
        </h2>
        <p className="mt-3 max-w-2xl text-sm text-white/80">
          Share a few details and I’ll get back to you.
        </p>

        <div className="mt-10">
          <StarBorder
            as="div"
            className="w-full"
            color="rgba(255,255,255,0.9)"
            thickness={2}
            speed="7s"
          >
            <div className="p-6 md:p-8 lg:p-10">
              <ContactStepper />
            </div>
          </StarBorder>
        </div>
      </section>

      <div className="pointer-events-none fixed bottom-5 right-5 z-50">
        <Link
          href="/signin?callbackUrl=/admin"
          aria-label="Admin login"
          className="group pointer-events-auto inline-flex items-center justify-center rounded-full p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
        >
          <span className="sr-only">Admin login</span>
          <span className="h-1.5 w-1.5 rounded-full bg-white/30 transition group-hover:bg-white/60" />
        </Link>
      </div>
    </div>
  );
}
