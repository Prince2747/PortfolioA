"use client";

import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import { useRouter, useSearchParams } from "next/navigation";

function getErrorMessage(err: unknown, fallback: string) {
  if (err instanceof Error) return err.message || fallback;
  if (typeof err === "string") return err || fallback;
  return fallback;
}

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const auth = useMemo(() => getFirebaseAuth(), []);

  const callbackUrl = searchParams.get("callbackUrl") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    if (!auth) return;
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace(callbackUrl);
        return;
      }

      setCheckingSession(false);
    });
    return () => unsub();
  }, [auth, callbackUrl, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!auth) {
      setError(
        "Firebase is not configured. Add NEXT_PUBLIC_FIREBASE_* env vars first."
      );
      return;
    }

    try {
      setBusy(true);
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.replace(callbackUrl);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Login failed"));
    } finally {
      setBusy(false);
    }
  }

  if (auth && checkingSession) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-88px)] w-full max-w-md flex-col justify-center px-6 py-16">
        <h1 className="text-2xl font-semibold text-white">Admin login</h1>
        <p className="mt-2 text-sm text-white/70">Checking session…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-88px)] w-full max-w-md flex-col justify-center px-6 py-16">
      <h1 className="text-2xl font-semibold text-white">Admin login</h1>
      <p className="mt-2 text-sm text-white/70">
        Sign in to add or update projects.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div>
          <label className="text-xs uppercase tracking-[0.3em] text-white/60">
            Email
          </label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
            className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none ring-1 ring-white/5 focus:ring-white/15"
            placeholder="you@example.com"
            autoComplete="email"
          />
        </div>

        <div>
          <label className="text-xs uppercase tracking-[0.3em] text-white/60">
            Password
          </label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
            className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none ring-1 ring-white/5 focus:ring-white/15"
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </div>

        {error ? <p className="text-sm text-white/80">{error}</p> : null}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-white/90 disabled:opacity-60"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="mt-8 text-xs text-white/50">
        Tip: set NEXT_PUBLIC_ADMIN_EMAILS to restrict access.
      </p>
    </main>
  );
}
