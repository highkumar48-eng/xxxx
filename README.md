# VidShare

A responsive dark media gallery with public playback, full-text search, topic filters, creator-only uploads, image support, and an admin studio. Built with Next.js **15.5.26** (upgraded from the PRD's v14 with your approval because v14 has unpatched security advisories), React 18, Tailwind, Supabase and React Player.

## Local preview

Requires Node.js 22 or newer.

```sh
npm ci
npm run dev
```

Open http://localhost:3000. Without Supabase settings, public pages show a clearly labeled, read-only demo collection. Demo cards use illustrative Unsplash photography and the public Big Buck Bunny sample film. They are not your uploaded media and demo views are not persisted. Admin access is disabled until configured.

## Connect your Supabase project

1. Copy `.env.example` to `.env.local`.
2. Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and the server-only `SUPABASE_SERVICE_ROLE_KEY` from your project API settings.
3. Set `DATABASE_URL` to your Supabase PostgreSQL connection string (the session pooler connection works on IPv4 networks). URL-encode special characters in its password. This is used only by the setup script; do not expose it in browser variables.
4. Set a unique `ADMIN_PASSWORD`. Wrap the complete value in double quotes in `.env.local` whenever it contains `#`, `!`, or other shell punctuation. Avoid `$` in this value because dotenv treats it as variable interpolation. Do not reuse the example password from the PRD.
5. Generate `ADMIN_JWT_SECRET` with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.
6. Run `npm run setup`. It applies `supabase/schema.sql` and verifies public reads and both storage buckets. Alternatively, execute the SQL manually in the Supabase SQL editor; no database URL is required at runtime.
7. Restart the app and open `/admin` to sign in.

Only published database records are publicly selectable. There are no public Storage write policies. Admin API handlers independently verify the signed, expiring, httpOnly cookie and the request origin, in addition to middleware and dashboard authentication. Service-role credentials remain in server-only modules. Login attempts are limited atomically in PostgreSQL to 10 per 15 minutes per Vercel-provided IP (one shared local bucket outside Vercel).

Uploads use `/api/admin/upload` to issue a signed, two-hour upload capability, then transfer files directly to Supabase Storage, then persist validated metadata. This avoids sending 50 MB files through Vercel functions. Videos accept MP4, WebM and QuickTime MOV up to 50 MB; images and thumbnails accept JPEG, PNG and WebP up to 5 MB. MOV playback depends on the browser codec; MP4 is the most portable choice. The client attempts cleanup on failure. If a tab closes during upload, orphan objects may need manual removal from Storage.

**Visibility:** As requested in the PRD, both Storage buckets are public. Hiding an item removes it from gallery/search/detail pages, but an already-shared raw file URL still works. Use private buckets and signed read URLs if confidential drafts are needed.

Views increment through a server-only RPC. An httpOnly one-hour cookie suppresses repeat counts in the same browser. This is an approximate counter, not fraud-resistant analytics.

## Vercel

Import this directory as a Next.js project. Use `npm run build` and Node.js 22+. Set the environment values from `.env.example` in Vercel, with a strong unique admin password and JWT secret. Set `NEXT_PUBLIC_APP_URL` to the exact HTTPS origin of the deployment (no path), since mutation requests check this origin. Preview deployments need their own matching URL. Run database setup once before using admin sign-in. Never prefix the service role key, database URL, or admin secrets with `NEXT_PUBLIC_`.

## Netlify

The repository includes `netlify.toml` for the Next.js runtime and Node 22. Create a new site from this repository and set the variables from `.env.example` in Netlify's site environment settings. Set `NEXT_PUBLIC_APP_URL` to the exact deployed HTTPS URL before testing sign-in or uploads; when it is left at the local default, the app also recognizes Netlify's `DEPLOY_PRIME_URL`/`URL` automatically. `DATABASE_URL` is only needed when you want to re-run `npm run setup`; the running app uses the Supabase URL, anon key, and service role key.

Before applying for advertising, upload original media, add a clear site name and description, verify the privacy/contact pages required by your ad provider, and replace the AdStark placeholders with the approved publisher, client, and slot values. Do not apply with an empty collection or demo-only media.

## AdStark

Ad slots render intentional placeholders until configured. Set the publisher/client IDs and header/feed/player/sidebar slot IDs from your approved account. The script URL and `ins` attributes implement the PRD-provided embed contract; confirm them against your actual AdStark embed before enabling. No unverified advertising script is loaded by default. In-feed placements appear after every six items when more follow.

## Checks

```sh
npm test
npm run build
# Start the app in another terminal, then:
npm run test:smoke
```

Tests cover upload validation, metadata allowlisting, JWT signature/expiry/audience validation, SQL idempotence, real PostgreSQL full-text search, row-level security, RPC permissions, atomic view increments and login throttling. PostgreSQL tests use an ephemeral PGlite database with stubbed Supabase roles and the bucket catalog. They do not substitute for testing the live Supabase Storage API.

The HTTP smoke test checks home, search, image filtering, media detail, not-found handling, dashboard redirects and rejected unauthorized/cross-origin mutations. Use a configured Supabase project to test the full upload/edit/hide/delete lifecycle.

## Main files

- `src/app`: public/admin pages and API routes
- `src/components`: gallery, player, navigation and studio
- `src/lib`: server/browser Supabase clients, auth and validation
- `supabase/schema.sql`: tables, full-text index, RLS, RPCs and buckets
- `scripts/setup-supabase.mjs`: database and bucket setup
- `.env.example`: all required and optional settings

Demo imagery: [Unsplash](https://unsplash.com). Demo film: [Big Buck Bunny](https://peach.blender.org/), Blender Foundation, CC BY 3.0. Replace the read-only demo collection with your own uploaded content by connecting Supabase.
