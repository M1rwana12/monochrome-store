<div align="center">

# ⬛ MONOCHROME

**Cinematic fashion e-commerce, where every pixel is AI-generated**

[![CI](https://github.com/M1rwana12/monochrome-store/actions/workflows/ci.yml/badge.svg)](https://github.com/M1rwana12/monochrome-store/actions/workflows/ci.yml)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![Lighthouse](https://img.shields.io/badge/Lighthouse-4×100-brightgreen?logo=lighthouse)
![Tests](https://img.shields.io/badge/tests-28_unit_+_7_e2e-brightgreen)
![Cloud Run](https://img.shields.io/badge/deployed-Cloud_Run-4285F4?logo=googlecloud&logoColor=white)

### [▶ Live demo](https://monochrome-store-117848350117.europe-central2.run.app)

<img src="docs/screenshots/home.jpeg" alt="MONOCHROME — full-screen AI-generated hero video" width="100%" />

</div>

---

## ✨ What makes it special

🧠 **A neural network in your browser.** Type *“something warm for a cold evening”*
into the catalog search — the all-MiniLM-L6-v2 model (via **Transformers.js**)
embeds your query and every product **on-device** and ranks the catalog by
meaning. No server. No API keys. Just WebAssembly.

🎬 **100% AI-generated media.** All 24 photos and 7 videos — hero film, editorial
lookbook, hover loops on product cards — were generated with
**[Higgsfield](https://higgsfield.ai)** under a single art direction: dark
graphite studio, dramatic light, film grain. Hover a new-collection card and
the photo comes alive.

♿ **Accessible by construction.** Focus-trapped cart drawer, Esc everywhere,
custom ARIA-listbox filters with full keyboard navigation,
`prefers-reduced-motion` support — and Lighthouse agrees: **100 / 100 / 100 / 100**.

📦 **Real orders, real admin.** Checkout stores orders in **Firestore** through an
Express API (same Cloud Run container), fires an optional **Telegram** notification,
and a token-protected `/admin` page lists orders with status management.
Demo store — no payments taken.

## 📸 Screens

| Catalog — AI search & custom filters | Product — gallery, sizes, lightbox |
|:---:|:---:|
| ![Catalog](docs/screenshots/catalog.jpeg) | ![Product](docs/screenshots/product.jpeg) |

## 🛠 Stack

| Layer | Tech |
|---|---|
| UI | React 18 · TypeScript (strict) · Tailwind CSS v4 · Framer Motion (LazyMotion) |
| ML | Transformers.js · all-MiniLM-L6-v2 · cosine similarity ranking |
| Backend | Express (static + REST API) · Firestore (orders) · Telegram notifications |
| State | React Context + localStorage (cart, favorites) · URL search params (filters) |
| Quality | Vitest (28) · Playwright (7 E2E) · ESLint + Prettier · GitHub Actions CI |
| Media | Higgsfield (soul_2, nano_banana_pro, kling3_0_turbo) · WebP pipeline (−42%) |
| SEO | schema.org Product JSON-LD · generated sitemap/robots · OG tags · llms.txt |
| Deploy | Docker (node → nginx, SPA fallback) · Google Cloud Run |

## 🚀 Run locally

```bash
npm install
npm run dev        # dev server
npm test           # unit tests
npm run test:e2e   # Playwright E2E
npm run build      # typecheck + build (+ sitemap generation)
```

Deploy: `gcloud run deploy --source .` (Dockerfile: node build → Express serving
static + `/api`). Env vars: `ADMIN_TOKEN` (admin access), optionally
`TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID` for order notifications. Locally the
server runs with an in-memory store: `node server/index.mjs`.

## 🎭 How it's made (a war story)

The very first prompt said *“Vogue editorial style”* — and the image model took
it literally: product shots came back as **full VOGUE magazine covers**, with
mastheads, fake headlines and barcodes. Negative prompts (“no text, no logos”)
didn’t help — the dark-editorial look is welded to magazine layouts in the
training data.

The fix: switch the model (`soul_2` → `nano_banana_pro`) and reframe the
vocabulary — *“editorial photograph”* became *“cinematic fashion film still”*.
Every regenerated frame came out clean. **Prompt vocabulary carries hidden
layout priors** — a lesson worth the credits it cost.

---

<div align="center">

*Portfolio project — no real orders, no payments taken. © 2026*

</div>
