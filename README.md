# Lorenz Beglinger — Website

Fully static Astro site, deployed on Cloudflare Pages. No backend: the
contact form submits directly from the browser to Web3Forms.

## Stack

- [Astro](https://astro.build) (static output, no client framework — interactivity is plain `<script>` per component)
- Cloudflare Pages for hosting (static assets only, no Functions/Worker)
- [Web3Forms](https://web3forms.com) for the contact form — the client-side
  script in `ContactForm.astro` posts straight to their API

Note on history: this project went through two broken setups before landing
here. First a Cloudflare Worker (`wrangler deploy`) that the dashboard never
actually deployed — the live site stayed on the old Pages project with no
`/api/contact` route at all. Then a Cloudflare Pages Function calling
Web3Forms server-side — but Web3Forms' free plan rejects server-to-server
submissions with a 403 ("Use our API in client side or contact support with
server IP address (Pro plan is required)"). Both are gone now; the form talks
to Web3Forms directly from the browser, which is what their free plan
actually expects.

## Local development

```bash
pnpm install
pnpm dev              # http://localhost:4321 — form works fully, incl. submissions
```

No separate backend dev server is needed — the form talks to Web3Forms
directly, the same way in dev, preview, and production.

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
2. Open `src/components/ContactForm.astro` and set `WEB3FORMS_ACCESS_KEY` (in
   the `<script>` block) to that Access Key.
3. Rebuild/redeploy.

> Web3Forms Access Keys are meant to be public in this client-side model —
> they're tied to your destination inbox and rate-limited, not a secret.
> **Don't** set it as a Cloudflare environment variable/secret — Web3Forms'
> free plan rejects server-to-server submissions with a 403, which is exactly
> the failure this setup replaced.

Without a valid key, Web3Forms responds with `success: false` and the form
shows the error banner. The submitter's own address is sent as `email`, which
Web3Forms uses as the Reply-To automatically — replying to the notification
email goes straight back to them.

## Deploying (GitHub + Cloudflare Pages)

1. Push this repo to a GitHub repository under your account.
2. In the Cloudflare dashboard: **Workers & Pages → Create → Pages → Connect to Git**, pick the repo.
3. Build settings:
   - Build command: `pnpm build`
   - Build output directory: `dist`
4. Deploy. Cloudflare will auto-build on every push to `main`. No environment
   variables needed — it's a static build.

Alternatively, deploy from the CLI once `wrangler` is authenticated (`pnpm dlx wrangler login`):

```bash
pnpm pages:deploy
```

(`wrangler` isn't a committed dependency — `pages:deploy` fetches it on demand via `pnpm dlx` so it never runs during Cloudflare's own build step.)

## Project structure

```
src/
  layouts/Base.astro       fonts, meta, page shell
  components/
    Header.astro           nav + mobile menu
    Hero.astro
    Programs.astro         "Zwei Programme" cards
    About.astro             video/poster + bio
    ContactForm.astro       validation, success/error states, honeypot,
                            posts directly to Web3Forms (no backend)
    Footer.astro
    CookieBanner.astro      accept/reject, persisted in localStorage
  pages/
    index.astro
    impressum.astro
    datenschutz.astro
```
