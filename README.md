# MONOCHROME — concept fashion store

Portfolio project: a cinematic fashion e-commerce SPA.
All visuals (21 photos & 3 videos) are AI-generated with [Higgsfield](https://higgsfield.ai).

## Stack

React 18 · TypeScript · Vite · Tailwind CSS v4 · Framer Motion · React Router ·
Transformers.js · Vitest · Playwright

## Features

- **On-device semantic search**: a neural network (all-MiniLM-L6-v2 via Transformers.js)
  runs entirely in the visitor's browser — type "something warm for a cold evening"
  and products are ranked by meaning, not keywords. No server, no API keys.
- Full-screen AI hero video, editorial lookbook
- Catalog with URL-driven filters (category / size / price / sort) — shareable links
- Product pages with size selection and related items
- Cart drawer with localStorage persistence and demo checkout
- Accessible drawer: focus trap, Esc to close, `aria-modal`
- `prefers-reduced-motion` support (videos and animations pause)
- Route-level code splitting + LazyMotion (90 KB gzip main bundle)
- WebP media pipeline (`scripts/media-to-webp.mjs`, −42% image weight)
- CI: tests + build on every push (GitHub Actions)

## Run

```bash
npm install
npm run dev
```

## Test & build

```bash
npm test
npm run build
```

## Deploy

The repo is deploy-ready for both platforms — just import it:

- **Vercel:** [vercel.com/new](https://vercel.com/new) → Import this repo → Deploy (SPA rewrites in `vercel.json`).
- **Netlify:** [app.netlify.com/start](https://app.netlify.com/start) → Import → build `npm run build`, publish `dist` (`public/_redirects` included).

## How it's made

Every image and video was generated with Higgsfield models under a single art direction
(dark graphite studio, dramatic light, film grain):

- **Photos:** `soul_2` and `nano_banana_pro` (text-to-image)
- **Videos:** `kling3_0_turbo` (image-to-video from generated stills, 5s loops)
- **Hero poster:** upscaled to 2K with `bytedance_image_upscale`

**Fun production story:** the first prompt included the phrase *“Vogue editorial style”* —
and the model took it literally, rendering most product shots as full VOGUE magazine
covers, complete with mastheads, fake headlines and barcodes. Negative instructions
(“no text, no logos”) didn’t help: the dark-editorial aesthetic is so strongly associated
with magazine covers in the training data that the layout kept coming back. The fix was
switching model (`soul_2` → `nano_banana_pro`) and reframing the prompt from *“editorial
photograph”* to *“cinematic fashion film still”* — every regenerated frame came out clean.
A good reminder that prompt vocabulary carries hidden layout priors.

All media lives in `public/media/` and is optimized to WebP at build-prep time.
