## Cursor Cloud specific instructions

**Vaktim Web** is a static marketing site for the Vaktim mobile app. It has zero npm dependencies — no `npm install` is needed.

### Pages

- `index.html` — Landing page
- `verify-email.html` — Email verification (calls external Supabase Edge Function)
- `davet/index.html` — Invite/referral page (reads invite code from URL path or `?code=` query param)
- `api/davet.js` — Vercel serverless function (only runs in Vercel environment)

### Dev Commands

- **Build:** `npm run build` — copies static files into `.vercel/output/static` for Vercel Build Output API
- **Serve locally:** `npx serve -l 3000 .` from the repo root
- No linting, no automated tests, no TypeScript in this project

### Caveats

- `/davet/CODE` paths (e.g. `/davet/ABC123`) require Vercel rewrites to work. Locally with `npx serve`, use query params instead: `/davet/?code=CODE`.
- `verify-email.html` calls an external Supabase Edge Function; it will show "Verification Failed" locally without a valid token — this is expected.
- The `api/davet.js` serverless function only works under Vercel's runtime (or `vercel dev`).
