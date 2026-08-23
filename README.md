# Lorenz Beglinger — Website

Astro static site, deployed as a Cloudflare Worker with static assets. The
worker also handles the contact form's `/api/contact` endpoint.

## Stack

- [Astro](https://astro.build) (static output, no client framework — interactivity is plain `<script>` per component)
- A Cloudflare Worker (`worker/index.ts`) that serves the built site as static
  assets and handles `POST /api/contact`, emailing submissions via [Web3Forms](https://web3forms.com)

Note: this project's Cloudflare dashboard deploy command runs `wrangler
deploy` (not `wrangler pages deploy`), so it's set up as a plain Worker with
a static-assets binding rather than a classic Pages project.

## Local development

```bash
pnpm install
pnpm dev              # http://localhost:4321 — site only, /api/contact is not served here
```

To test the contact form end-to-end locally (including the worker):

```bash
cp .dev.vars.example .dev.vars   # fill in real values, see below
pnpm worker:dev                  # builds + runs wrangler dev on the built output
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

## Contact form → email setup (Web3Forms)

1. In your [Web3Forms](https://web3forms.com) dashboard, the destination inbox
   for submissions is whatever you configured when you created the Access Key
   (e.g. `anfragen@lorenzbeglinger.com`) — there's no separate "to" setting
   here, it's tied to the key itself.
2. In the Cloudflare dashboard, on this Worker's settings → **Variables and
   Secrets**, add:
   - `WEB3FORMS_ACCESS_KEY` — your Access Key (add as **secret**)

Without it set, `/api/contact` returns a 500 and the form shows the error
banner. The submitter's own address is sent as `email`, which Web3Forms uses
as the Reply-To automatically — replying to the notification email goes
straight back to them.

## Deploying (GitHub + Cloudflare)

1. Push this repo to a GitHub repository under your account.
2. In the Cloudflare dashboard: **Workers & Pages → Create → Connect to Git**, pick the repo.
3. Build settings:
   - Build command: `pnpm build`
   - Deploy command: `npx wrangler deploy` (this is what actually reads `wrangler.toml`'s `main` + `[assets]` config)
4. Add the environment variable above.
5. Deploy. Cloudflare will auto-build on every push to `main`.

Alternatively, deploy from the CLI once `wrangler` is authenticated (`pnpm dlx wrangler login`):

```bash
pnpm worker:deploy
```

(`wrangler` isn't a committed dependency — `worker:dev`/`worker:deploy` fetch it on demand via `pnpm dlx` so it never runs during Cloudflare's own build step.)

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
worker/
  index.ts                  fetch handler: routes /api/contact, else serves ASSETS
  contact.ts                 validation + Web3Forms send logic
```
