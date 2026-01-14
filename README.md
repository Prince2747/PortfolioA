# Portfolio (Next.js)

Personal portfolio built with the Next.js App Router, modern motion/3D UI, a contact form that sends email via Resend, and an optional Firebase-backed admin dashboard to manage projects + certifications.

## Highlights

- **App Router** (Next.js 16)
- **Motion & animation** with Framer Motion / Motion + GSAP
- **3D/visuals** with Three.js, React Three Fiber, Drei
- **Contact form** that calls `POST /api/contact` and sends email via **Resend**
- **Admin dashboard** (`/admin`) using **Firebase Auth + Firestore** to create/update/delete:
	- Projects (title, badge, summary, tags, images)
	- Certifications (title, issuer, date, URL, image)

## Tech Stack

- Next.js (App Router), React, TypeScript
- Tailwind CSS
- Firebase (Auth + Firestore)
- Resend (email)
- Three.js ecosystem + animation libraries (R3F/Drei, GSAP, Framer Motion)

## Routes

- `/` — main portfolio
- `/admin/login` — email/password sign-in (Firebase)
- `/admin` — admin dashboard (requires auth)
- `/api/contact` — server route that sends email (Resend)

## Getting Started

```bash
npm install
npm run dev
```

Then open http://localhost:3000

## Environment Variables

Create a `.env.local` file in the project root.

### Contact email (Resend)

Required for the contact form to send email:

```bash
RESEND_API_KEY="your_resend_api_key"
CONTACT_FROM_EMAIL="Your Name <onboarding@resend.dev>"  # or a verified sender/domain
CONTACT_TO_EMAIL="you@example.com"
```

### Firebase (optional, for admin + editable content)

If these are missing, the site still runs, but the admin dashboard won’t work and Firestore-backed content won’t load.

```bash
NEXT_PUBLIC_FIREBASE_API_KEY="..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="..."
NEXT_PUBLIC_FIREBASE_PROJECT_ID="..."

# Optional (depending on your Firebase app config)
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="..."
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="..."
NEXT_PUBLIC_FIREBASE_APP_ID="..."
```

### Admin access control (recommended)

```bash
# Comma-separated allowlist. If unset/empty, any signed-in user is treated as admin.
NEXT_PUBLIC_ADMIN_EMAILS="you@example.com,other@example.com"

# Optional: used by the UI as a display/pre-fill hint.
NEXT_PUBLIC_CONTACT_EMAIL="you@example.com"
```

## Firebase Setup (Admin Dashboard)

1. Create a Firebase project
2. Enable **Authentication → Email/Password**
3. Create a Firestore database
4. Create at least one user in Firebase Auth (or sign up via your own flow if you add one)
5. Set `NEXT_PUBLIC_ADMIN_EMAILS` to your account email(s)

### Firestore security rules (important)

The admin UI runs on the client, so Firestore rules are what actually protect your data.

Recommended approaches:

- **Best**: use Firebase **custom claims** (e.g. `admin: true`) and restrict writes to admins.
- **Simple**: restrict writes to a specific email.

Example (simple, single admin email):

```txt
rules_version = '2';
service cloud.firestore {
	match /databases/{database}/documents {
		match /projects/{doc} {
			allow read: if true;
			allow write: if request.auth != null && request.auth.token.email == "you@example.com";
		}
		match /certifications/{doc} {
			allow read: if true;
			allow write: if request.auth != null && request.auth.token.email == "you@example.com";
		}
	}
}
```

## Scripts

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run start` — start production server
- `npm run lint` — lint

## Deployment

Deploy to Vercel (or any Node-compatible host). Make sure to add the same environment variables in your hosting provider settings.

## License

This project is intended as a personal portfolio. Add a license if you plan to redistribute.
