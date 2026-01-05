"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { getFirebaseAuth, isAdminEmail } from "@/lib/firebase";
import {
  createProject,
  fetchProjects,
  removeProject,
  updateProject,
  type Project,
} from "@/lib/projects";
import {
  createCertification,
  fetchCertifications,
  removeCertification,
  updateCertification,
  type Certification,
} from "@/lib/certifications";

function getErrorMessage(err: unknown, fallback: string) {
  if (err instanceof Error) return err.message || fallback;
  if (typeof err === "string") return err || fallback;
  return fallback;
}

function splitCsv(value: string): string[] {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function AdminPage() {
  const router = useRouter();
  const auth = useMemo(() => getFirebaseAuth(), []);

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authResolved, setAuthResolved] = useState(false);

  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loadingCerts, setLoadingCerts] = useState(true);

  const [title, setTitle] = useState("");
  const [badge, setBadge] = useState("");
  const [summary, setSummary] = useState("");
  const [tags, setTags] = useState("");
  const [images, setImages] = useState("");

  const [certTitle, setCertTitle] = useState("");
  const [certIssuer, setCertIssuer] = useState("");
  const [certDate, setCertDate] = useState("");
  const [certUrl, setCertUrl] = useState("");
  const [certImage, setCertImage] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingCertId, setEditingCertId] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [certError, setCertError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    setLoadingProjects(true);
    try {
      const data = await fetchProjects();
      setProjects(data ?? []);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to load projects"));
    } finally {
      setLoadingProjects(false);
    }
  }, []);

  const loadCerts = useCallback(async () => {
    setCertError(null);
    setLoadingCerts(true);
    try {
      const data = await fetchCertifications();
      setCertifications(data ?? []);
    } catch (err: unknown) {
      setCertError(getErrorMessage(err, "Failed to load certifications"));
    } finally {
      setLoadingCerts(false);
    }
  }, []);

  useEffect(() => {
    if (!auth) return;

    const unsub = onAuthStateChanged(auth, (user) => {
      setAuthResolved(true);
      if (!user) {
        router.replace("/admin/login");
        return;
      }

      const email = user.email ?? null;
      setUserEmail(email);
      const admin = isAdminEmail(email);
      setIsAdmin(admin);

      if (admin) {
        load();
        loadCerts();
      }
    });

    return () => unsub();
  }, [auth, load, loadCerts, router]);

  async function onSignOut() {
    if (!auth) return;
    await signOut(auth);
    router.replace("/admin/login");
  }

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      setBusy(true);
      const payload = {
        title: title.trim(),
        badge: badge.trim(),
        summary: summary.trim(),
        tags: splitCsv(tags),
        images: splitCsv(images),
      };

      if (editingId) {
        await updateProject(editingId, payload);
      } else {
        await createProject(payload);
      }

      setEditingId(null);
      setTitle("");
      setBadge("");
      setSummary("");
      setTags("");
      setImages("");

      await load();
    } catch (err: unknown) {
      setError(
        getErrorMessage(
          err,
          editingId ? "Failed to update project" : "Failed to create project"
        )
      );
    } finally {
      setBusy(false);
    }
  }

  async function onCreateCert(e: React.FormEvent) {
    e.preventDefault();
    setCertError(null);

    try {
      setBusy(true);
      const payload = {
        title: certTitle.trim(),
        issuer: certIssuer.trim(),
        date: certDate.trim() || undefined,
        url: certUrl.trim() || undefined,
        image: certImage.trim() || undefined,
      };

      if (editingCertId) {
        await updateCertification(editingCertId, payload);
      } else {
        await createCertification(payload);
      }

      setEditingCertId(null);
      setCertTitle("");
      setCertIssuer("");
      setCertDate("");
      setCertUrl("");
      setCertImage("");

      await loadCerts();
    } catch (err: unknown) {
      setCertError(
        getErrorMessage(
          err,
          editingCertId
            ? "Failed to update certification"
            : "Failed to create certification"
        )
      );
    } finally {
      setBusy(false);
    }
  }

  function onEdit(project: Project) {
    setError(null);
    setEditingId(project.id);
    setTitle(project.title ?? "");
    setBadge(project.badge ?? "");
    setSummary(project.summary ?? "");
    setTags((project.tags ?? []).join(", "));
    setImages((project.images ?? []).join(", "));
  }

  function onCancelEdit() {
    setEditingId(null);
    setTitle("");
    setBadge("");
    setSummary("");
    setTags("");
    setImages("");
    setError(null);
  }

  function onEditCert(cert: Certification) {
    setCertError(null);
    setEditingCertId(cert.id);
    setCertTitle(cert.title ?? "");
    setCertIssuer(cert.issuer ?? "");
    setCertDate(cert.date ?? "");
    setCertUrl(cert.url ?? "");
    setCertImage(cert.image ?? "");
  }

  function onCancelEditCert() {
    setEditingCertId(null);
    setCertTitle("");
    setCertIssuer("");
    setCertDate("");
    setCertUrl("");
    setCertImage("");
    setCertError(null);
  }

  async function onDelete(id: string) {
    setError(null);
    try {
      setBusy(true);
      await removeProject(id);
      await load();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to delete project"));
    } finally {
      setBusy(false);
    }
  }

  async function onDeleteCert(id: string) {
    setCertError(null);
    try {
      setBusy(true);
      await removeCertification(id);
      await loadCerts();
    } catch (err: unknown) {
      setCertError(getErrorMessage(err, "Failed to delete certification"));
    } finally {
      setBusy(false);
    }
  }

  if (!auth) {
    return (
      <main className="mx-auto w-full max-w-3xl px-6 py-16 text-white">
        <h1 className="text-2xl font-semibold">Admin</h1>
        <p className="mt-3 text-sm text-white/70">
          Firebase is not configured. Add NEXT_PUBLIC_FIREBASE_* env vars first.
        </p>
      </main>
    );
  }

  if (!authResolved) {
    return (
      <main className="mx-auto w-full max-w-3xl px-6 py-16 text-white">
        <h1 className="text-2xl font-semibold">Admin</h1>
        <p className="mt-3 text-sm text-white/70">Checking session…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-16 text-white">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/60">
            Admin
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            Projects
          </h1>
          <p className="mt-2 text-sm text-white/70">
            Signed in as {userEmail ?? "(unknown)"}
          </p>
        </div>

        <button
          onClick={onSignOut}
          className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/20"
        >
          Sign out
        </button>
      </div>

      {!isAdmin ? (
        <div className="mt-10 rounded-2xl border border-white/10 bg-black/40 p-6">
          <p className="text-sm text-white/80">Access denied.</p>
          <p className="mt-2 text-xs text-white/60">
            Add your email to NEXT_PUBLIC_ADMIN_EMAILS to allow access.
          </p>
        </div>
      ) : (
        <>
          <form
            onSubmit={onCreate}
            className="mt-10 rounded-3xl border border-white/10 bg-black/40 p-6 backdrop-blur md:p-8"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs uppercase tracking-[0.3em] text-white/60">
                  Title
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none ring-1 ring-white/5 focus:ring-white/15"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.3em] text-white/60">
                  Badge
                </label>
                <input
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none ring-1 ring-white/5 focus:ring-white/15"
                  placeholder="Case study / Shipped / etc"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs uppercase tracking-[0.3em] text-white/60">
                  Summary
                </label>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  required
                  rows={4}
                  className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none ring-1 ring-white/5 focus:ring-white/15"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.3em] text-white/60">
                  Tags (comma-separated)
                </label>
                <input
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none ring-1 ring-white/5 focus:ring-white/15"
                  placeholder="Next.js, TypeScript, ..."
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.3em] text-white/60">
                  Images (comma-separated URLs)
                </label>
                <input
                  value={images}
                  onChange={(e) => setImages(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none ring-1 ring-white/5 focus:ring-white/15"
                  placeholder="https://... , https://..."
                />
              </div>
            </div>

            {error ? (
              <p className="mt-4 text-sm text-white/80">{error}</p>
            ) : null}

            <div className="mt-6 flex items-center justify-between">
              <p className="text-xs text-white/50">
                Saves to Firestore collection:{" "}
                <span className="text-white/70">projects</span>
              </p>
              <button
                type="submit"
                disabled={busy}
                className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-white/90 disabled:opacity-60"
              >
                {busy ? "Saving…" : editingId ? "Save changes" : "Add project"}
              </button>
            </div>

            {editingId ? (
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={onCancelEdit}
                  disabled={busy}
                  className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/20 disabled:opacity-60"
                >
                  Cancel edit
                </button>
              </div>
            ) : null}
          </form>

          <div className="mt-10">
            <div className="flex items-end justify-between">
              <h2 className="text-lg font-semibold">Existing projects</h2>
              <button
                onClick={load}
                disabled={busy}
                className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/20 disabled:opacity-60"
              >
                Refresh
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {loadingProjects ? (
                <div className="rounded-2xl border border-white/10 bg-black/30 p-5 text-sm text-white/70">
                  Loading…
                </div>
              ) : projects.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-black/30 p-5 text-sm text-white/70">
                  No projects yet.
                </div>
              ) : (
                projects.map((p) => (
                  <div
                    key={p.id}
                    className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/30 p-5 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <div className="text-sm font-semibold text-white">
                        {p.title}
                      </div>
                      <div className="mt-1 text-xs text-white/60">
                        {p.badge}
                      </div>
                      <div className="mt-2 text-xs text-white/50">
                        {p.tags.slice(0, 6).join(" · ")}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onEdit(p)}
                        disabled={busy}
                        className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/20 disabled:opacity-60"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(p.id)}
                        disabled={busy}
                        className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/20 disabled:opacity-60"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-14 border-t border-white/10 pt-10">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                  Admin
                </p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight">
                  Certifications
                </h2>
                <p className="mt-2 text-sm text-white/70">
                  Add or edit certificates shown on the public page.
                </p>
              </div>
              <button
                onClick={loadCerts}
                disabled={busy}
                className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/20 disabled:opacity-60"
              >
                Refresh
              </button>
            </div>

            <form
              onSubmit={onCreateCert}
              className="mt-8 rounded-3xl border border-white/10 bg-black/40 p-6 backdrop-blur md:p-8"
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="text-xs uppercase tracking-[0.3em] text-white/60">
                    Title
                  </label>
                  <input
                    value={certTitle}
                    onChange={(e) => setCertTitle(e.target.value)}
                    required
                    className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none ring-1 ring-white/5 focus:ring-white/15"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.3em] text-white/60">
                    Issuer
                  </label>
                  <input
                    value={certIssuer}
                    onChange={(e) => setCertIssuer(e.target.value)}
                    required
                    className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none ring-1 ring-white/5 focus:ring-white/15"
                    placeholder="Coursera, AWS, etc"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.3em] text-white/60">
                    Date (optional)
                  </label>
                  <input
                    value={certDate}
                    onChange={(e) => setCertDate(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none ring-1 ring-white/5 focus:ring-white/15"
                    placeholder="2026"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.3em] text-white/60">
                    Image URL (optional)
                  </label>
                  <input
                    value={certImage}
                    onChange={(e) => setCertImage(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none ring-1 ring-white/5 focus:ring-white/15"
                    placeholder="https://..."
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs uppercase tracking-[0.3em] text-white/60">
                    Link URL (optional)
                  </label>
                  <input
                    value={certUrl}
                    onChange={(e) => setCertUrl(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none ring-1 ring-white/5 focus:ring-white/15"
                    placeholder="Certificate or badge link"
                  />
                </div>
              </div>

              {certError ? (
                <p className="mt-4 text-sm text-white/80">{certError}</p>
              ) : null}

              <div className="mt-6 flex items-center justify-between">
                <p className="text-xs text-white/50">
                  Saves to Firestore collection: <span className="text-white/70">certifications</span>
                </p>
                <button
                  type="submit"
                  disabled={busy}
                  className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-white/90 disabled:opacity-60"
                >
                  {busy
                    ? "Saving…"
                    : editingCertId
                    ? "Save changes"
                    : "Add certification"}
                </button>
              </div>

              {editingCertId ? (
                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={onCancelEditCert}
                    disabled={busy}
                    className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/20 disabled:opacity-60"
                  >
                    Cancel edit
                  </button>
                </div>
              ) : null}
            </form>

            <div className="mt-6 space-y-3">
              {loadingCerts ? (
                <div className="rounded-2xl border border-white/10 bg-black/30 p-5 text-sm text-white/70">
                  Loading…
                </div>
              ) : certifications.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-black/30 p-5 text-sm text-white/70">
                  No certifications yet.
                </div>
              ) : (
                certifications.map((c) => (
                  <div
                    key={c.id}
                    className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/30 p-5 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <div className="text-sm font-semibold text-white">
                        {c.title}
                      </div>
                      <div className="mt-1 text-xs text-white/60">
                        {c.issuer}
                      </div>
                      <div className="mt-2 text-xs text-white/50">
                        {c.date || ""}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onEditCert(c)}
                        disabled={busy}
                        className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/20 disabled:opacity-60"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDeleteCert(c.id)}
                        disabled={busy}
                        className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/20 disabled:opacity-60"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </main>
  );
}
