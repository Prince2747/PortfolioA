import Link from "next/link";

export default function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="pointer-events-none flex justify-center px-3 py-3">
        <div className="pointer-events-auto relative flex w-[min(92vw,50vw)] md:w-[min(92vw,25vw)] items-center justify-between overflow-hidden rounded-full bg-black/45 px-4 py-2 backdrop-blur-3xl backdrop-saturate-200 ring-1 ring-white/15 shadow-lg shadow-black/50">
          <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-white/15 via-white/5 to-black/70 opacity-80" />
          <div className="pointer-events-none absolute -inset-10 bg-linear-to-tr from-white/18 via-white/0 to-white/0 opacity-60 mix-blend-screen" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-linear-to-t from-white/10 to-transparent opacity-50" />
          <div className="flex items-center gap-2">
            <Link href="/" className="text-sm font-medium text-white">
              LY
            </Link>
          </div>

          <nav
            aria-label="Primary"
            className="relative flex items-center gap-4 text-sm text-white/80"
          >
            <a href="#projects" className="transition hover:text-white">
              Projects
            </a>
            <a href="#contact" className="transition hover:text-white">
              Contact
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
