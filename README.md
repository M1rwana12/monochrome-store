<div align="center">

# ⬛ MONOCHROME

**Cinematic fashion e-commerce, where every pixel is AI-generated**

[![CI](https://github.com/M1rwana12/monochrome-store/actions/workflows/ci.yml/badge.svg)](https://github.com/M1rwana12/monochrome-store/actions/workflows/ci.yml)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![Lighthouse](https://img.shields.io/badge/Lighthouse-4×100-brightgreen?logo=lighthouse)
![Tests](https://img.shields.io/badge/tests-38_unit_+_12_e2e-brightgreen)
![Cloud Run](https://img.shields.io/badge/deployed-Cloud_Run-4285F4?logo=googlecloud&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-installable-5A0FC8?logo=pwa)

### [▶ Live demo](https://monochrome-store-117848350117.europe-central2.run.app) · Ukrainian-first, English at `/en`

<img src="docs/screenshots/home.jpeg" alt="MONOCHROME — full-screen AI-generated hero video" width="100%" />

</div>

---

## ✨ What makes it special

🧠 **A neural network in your browser.** Type *«щось тепле на холодний вечір»* — the
multilingual MiniLM model (via **Transformers.js**) embeds your query and every
product **on-device** and ranks the catalog by meaning, in Ukrainian or English.
No server. No API keys. Just WebAssembly.

🎬 **100% AI-generated media.** All 24 photos and 7 videos — hero film, editorial
lookbook, hover loops on product cards — were generated with
**[Higgsfield](https://higgsfield.ai)** under a single art direction: dark
graphite studio, dramatic light, film grain.

🖤 **Full commerce loop.** Customer accounts (scrypt + httpOnly sessions),
**MONO Club** bonus tiers (Silver → Graphite → Black) with a transaction ledger,
reviews with ratings, promo codes priced server-side, order status funnel —
all stored in **Firestore**, all demo (no payments taken).

🤖 **Telegram-operated.** New orders arrive in Telegram with **inline status
buttons** — the owner runs the shop from chat. Customers subscribe to their
order status via a deep link; a Cloud Scheduler digest lands every morning.

♿ **Accessible by construction.** Focus-trapped drawers, Esc everywhere, custom
ARIA-listbox filters, `prefers-reduced-motion` — and Lighthouse agrees:
**100 / 100 / 100 / 100**. Installable as a **PWA**.

## 📸 Screens

| Catalog — AI search & custom filters | Product — gallery, sizes, lightbox |
|:---:|:---:|
| ![Catalog](docs/screenshots/catalog.jpeg) | ![Product](docs/screenshots/product.jpeg) |

## 🛠 Stack

| Layer | Tech |
|---|---|
| UI | React 18 · TypeScript (strict) · Tailwind CSS v4 · Framer Motion (LazyMotion) |
| i18n | react-i18next · Ukrainian default + `/en` mirror · hreflang · ₴/$ pricing |
| ML | Transformers.js · paraphrase-multilingual-MiniLM-L12-v2 · cosine ranking |
| Backend | Express (static + REST) · Firestore · scrypt auth + HMAC httpOnly sessions |
| Commerce | Orders with status funnel · MONO Club bonus ledger · reviews · promo codes |
| Bot | Telegram webhook (secret-token) · inline status buttons · customer subscriptions · Cloud Scheduler digest |
| Quality | Vitest (38) · Playwright (12 E2E) · ESLint + Prettier · GitHub Actions CI |
| Media | Higgsfield (soul_2, nano_banana_pro, kling3_0_turbo) · WebP pipeline (−42%) |
| SEO / PWA | Product JSON-LD + AggregateRating · sitemap/robots · llms.txt · vite-plugin-pwa |
| Deploy | Docker (node build → Express) · Google Cloud Run |

## 🚀 Run locally

```bash
npm install
npm run dev        # dev server
npm test           # unit tests
npm run test:e2e   # Playwright E2E
npm run build      # typecheck + build (+ sitemap generation)
node server/index.mjs  # API + static with an in-memory store
```

Deploy: `gcloud run deploy --source .`. Env vars: `ADMIN_TOKEN`, `SESSION_SECRET`,
optionally `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID` + `TG_WEBHOOK_SECRET`.

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

*Portfolio project — demo orders only, no payments taken. © 2026*

</div>
