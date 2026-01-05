import { NextResponse } from "next/server";

type ContactPayload = {
  name?: string;
  email?: string;
  message?: string;
};

function getEnv(name: string): string {
  const value = process.env[name];
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(req: Request) {
  const RESEND_API_KEY = getEnv("RESEND_API_KEY");
  const CONTACT_FROM_EMAIL = getEnv("CONTACT_FROM_EMAIL");
  const CONTACT_TO_EMAIL = getEnv("CONTACT_TO_EMAIL");

  if (!RESEND_API_KEY || !CONTACT_FROM_EMAIL || !CONTACT_TO_EMAIL) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Server email is not configured. Set RESEND_API_KEY, CONTACT_FROM_EMAIL, and CONTACT_TO_EMAIL.",
      },
      { status: 500 }
    );
  }

  let payload: ContactPayload;
  try {
    payload = (await req.json()) as ContactPayload;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON" },
      { status: 400 }
    );
  }

  const name = String(payload?.name ?? "").trim();
  const email = String(payload?.email ?? "").trim();
  const message = String(payload?.message ?? "").trim();

  if (!email || !message) {
    return NextResponse.json(
      { ok: false, error: "Email and message are required." },
      { status: 400 }
    );
  }

  const subject = `Portfolio inquiry from ${name || "someone"}`;
  const text = `Name: ${name || "(not provided)"}\nEmail: ${email}\n\n${message}`;

  try {
    // Lazy import so the app still boots even if the dependency isn't installed yet.
    const { Resend } = await import("resend");
    const resend = new Resend(RESEND_API_KEY);

    await resend.emails.send({
      from: CONTACT_FROM_EMAIL,
      to: CONTACT_TO_EMAIL,
      subject,
      text,
      replyTo: email,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error:
          err instanceof Error
            ? err.message
            : "Failed to send message. Please try again.",
      },
      { status: 500 }
    );
  }
}
