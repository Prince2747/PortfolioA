"use client";

import { useState } from "react";
import Stepper, { Step } from "@/components/Stepper";

export default function ContactStepper() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const contactEmail =
    process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() ||
    (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)[0] ||
    "";

  const subject = `Portfolio inquiry from ${name || "someone"}`;
  const body = `Name: ${name}\nEmail: ${email}\n\n${message}`;

  async function send() {
    setSendError(null);
    setSent(false);

    try {
      setSending(true);
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });

      const data = (await res.json().catch(() => null)) as {
        ok?: boolean;
        error?: string;
      } | null;

      if (!res.ok || !data?.ok) {
        setSendError(data?.error ?? "Failed to send. Please try again.");
        return;
      }

      setSent(true);
    } catch (err) {
      setSendError(err instanceof Error ? err.message : "Failed to send.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="w-full">
      <Stepper
        initialStep={1}
        backButtonText="Previous"
        nextButtonText="Next"
        hideNextOnLastStep
      >
        <Step>
          <h2 className="text-lg font-semibold text-white">Contact me</h2>
          <p className="mt-2 text-sm text-zinc-300">
            Quick 3-step message. I usually reply within 24–48 hours.
          </p>
        </Step>

        <Step>
          <h2 className="text-lg font-semibold text-white">Your name</h2>
          <p className="mt-2 text-sm text-zinc-300">
            So I know who I’m talking to.
          </p>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="mt-4 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-white/25"
          />
        </Step>

        <Step>
          <h2 className="text-lg font-semibold text-white">Your email</h2>
          <p className="mt-2 text-sm text-zinc-300">Where should I reply?</p>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            inputMode="email"
            className="mt-4 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-white/25"
          />
        </Step>

        <Step>
          <h2 className="text-lg font-semibold text-white">Message</h2>
          <p className="mt-2 text-sm text-zinc-300">
            A short note about your project.
          </p>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell me what you want to build…"
            rows={4}
            className="mt-4 w-full resize-none rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-white/25"
          />

          <div className="mt-4 rounded-xl border border-white/10 bg-black/30 p-3 text-xs text-zinc-300">
            Tip: On the final step you’ll get a ready-to-send email.
          </div>
        </Step>

        <Step>
          <h2 className="text-lg font-semibold text-white">Ready to send</h2>
          <p className="mt-2 text-sm text-zinc-300">Review, then send.</p>

          <div className="mt-4 rounded-xl border border-white/10 bg-black/30 p-4">
            <p className="text-xs uppercase tracking-wide text-zinc-400">
              Preview
            </p>
            <p className="mt-2 text-sm text-white">{subject}</p>
            <pre className="mt-3 whitespace-pre-wrap text-sm text-zinc-300">
              {body}
            </pre>
          </div>

          <button
            type="button"
            onClick={send}
            disabled={sending || sent}
            className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-white px-5 py-2 text-sm font-medium text-black transition hover:bg-zinc-200 disabled:opacity-60"
          >
            {sent ? "Sent" : sending ? "Sending…" : "Send"}
          </button>

          {sendError ? (
            <p className="mt-3 text-xs text-white/70">{sendError}</p>
          ) : null}
          {sent ? (
            <p className="mt-3 text-xs text-white/60">
              Message sent. I’ll reply to {email || "your email"}.
            </p>
          ) : null}
        </Step>
      </Stepper>
    </div>
  );
}
