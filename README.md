# Lorenz Beglinger — Website

Astro static site + a Cloudflare Pages Function for the contact form.

## Stack

- [Astro](https://astro.build) (static output, no client framework — interactivity is plain `<script>` per component)
- Cloudflare Pages for hosting
- A Cloudflare Pages Function (`functions/api/contact.ts`) that emails form submissions via [Resend](https://resend.com)

## Local development

```bash
pnpm install
pnpm dev              # http://localhost:4321 — site only, /api/contact is not served here
```

To test the contact form end-to-end locally (including the Pages Function):

```bash
cp .dev.vars.example .dev.vars   # fill in real values, see below
pnpm pages:dev                   # builds + runs wrangler pages dev on the built output
```

## Media assets

All final. Notes on what was derived from your originals (via `ffmpeg`):

- `public/uploads/LB-Hero.jpg` — re-encoded from `LB-Hero.png` (2.97MB → 143KB) for hero load performance.
- `public/uploads/magie-am-tisch.jpg` — resized/re-compressed from your iPhone original (1.5MB → 232KB).
- `public/uploads/kindershow.jpg` — your `kindershow-teaser.jpeg`.
- `public/uploads/lorenz-video.mp4` — transcoded from `IMG_1853.mov` (HEVC, portrait) to H.264, scaled to 960px wide, audio stripped (video is muted/looping anyway). 5.3MB.
- `public/uploads/video-poster.jpg` — poster frame extracted from the same video at the 1s mark.

If you'd rather use a different frame as the poster, or want the video re-encoded at a different size/quality, just ask.

## Legal pages

`src/pages/impressum.astro` and `src/pages/datenschutz.astro` are stubs with `TODO` placeholders — fill in real Impressum (Art. 3 UWG) and Datenschutzerklärung text before launch.

## Contact form → email setup (Resend)

1. Create a free account at [resend.com](https://resend.com).
2. Verify a sending domain (or subdomain, e.g. `mail.lorenzbeglinger.ch`) — needed so `CONTACT_FROM_EMAIL` isn't rejected as spam.
3. Create an API key.
4. In the Cloudflare Pages project settings → **Environment variables**, add for both Preview and Production:
   - `RESEND_API_KEY` — the key from step 3 (mark as **secret**)
   - `CONTACT_TO_EMAIL` — the inbox that should receive Anfragen
   - `CONTACT_FROM_EMAIL` — a verified sender address on your domain, e.g. `anfrage@lorenzbeglinger.ch`

Without these three variables set, `/api/contact` returns a 500 and the form shows the error banner.

## Deploying (GitHub + Cloudflare Pages)

1. Push this repo to a new GitHub repository under your account.
2. In the Cloudflare dashboard: **Workers & Pages → Create → Pages → Connect to Git**, pick the repo.
3. Build settings:
   - Build command: `pnpm build`
   - Build output directory: `dist`
4. Add the three environment variables above.
5. Deploy. Cloudflare will auto-build on every push to `main`.

Alternatively, deploy from the CLI once `wrangler` is authenticated (`pnpm exec wrangler login`):

```bash
pnpm pages:deploy
```

## Project structure

```
src/
  layouts/Base.astro       fonts, meta, page shell
  components/
    Header.astro           nav + mobile menu
    Hero.astro
    Programs.astro         "Zwei Programme" cards
    About.astro             video/poster + bio
    ContactForm.astro       validation, success/error states, honeypot
    Footer.astro
    CookieBanner.astro      accept/reject, persisted in localStorage
  pages/
    index.astro
    impressum.astro
    datenschutz.astro
functions/
  api/contact.ts            Cloudflare Pages Function, sends via Resend
```
