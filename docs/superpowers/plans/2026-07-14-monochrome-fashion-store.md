# MONOCHROME Fashion Store — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Портфолио-сайт вымышленного fashion-бренда «MONOCHROME»: SPA-магазин с кинематографичным AI-визуалом из Higgsfield.

**Architecture:** React SPA без бэкенда. Товары — статичный JSON, корзина — Context + localStorage, роутинг — React Router. Все медиа генерируются через Higgsfield MCP и складываются в `public/media/`.

**Tech Stack:** React 18, Vite, Tailwind CSS v4 (`@tailwindcss/vite`), Framer Motion, React Router, Vitest + @testing-library/react.

## Global Constraints

- Язык интерфейса сайта: английский (high-fashion стиль). Валюта: USD (`$290`).
- Палитра: фон `#0a0a0a` (ink), текст `#f5f5f4` (paper), вторичный `#a3a3a3` (mist). Шрифты: Syne (display), Inter (body) через Google Fonts.
- Никакого бэкенда, реальной оплаты и авторизации.
- Все изображения — `loading="lazy"` (кроме hero), все видео — `muted loop playsInline autoPlay preload="metadata"` + `poster`.
- Пути медиа: `/media/...` из `public/media/`.
- Коммит после каждой задачи. Рабочая директория — корень проекта.

---

### Task 1: Scaffold проекта

**Files:**
- Create: `package.json`, `vite.config.js`, `index.html`, `src/main.jsx`, `src/App.jsx`, `src/index.css`
- Delete: дефолтные `src/App.css`, `src/assets/react.svg`, `public/vite.svg` после scaffold

**Interfaces:**
- Produces: рабочий dev-сервер и сборка; тема Tailwind с токенами `ink/paper/mist`, шрифтами `font-display`/`font-body`.

- [ ] **Step 1: Создать Vite-проект и поставить зависимости**

```powershell
npm create vite@latest . -- --template react
npm install
npm install tailwindcss @tailwindcss/vite framer-motion react-router-dom
npm install -D vitest jsdom @testing-library/react
```

(Каталог не пустой — есть `docs/` и `.git`; scaffold в текущую папку, на вопрос о непустой директории выбрать "Ignore files and continue".)

- [ ] **Step 2: Настроить `vite.config.js`**

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
```

- [ ] **Step 3: Заменить `index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="MONOCHROME — cinematic essentials. Concept fashion store." />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Syne:wght@600;700;800&display=swap" rel="stylesheet" />
    <title>MONOCHROME</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 4: Заменить `src/index.css`**

```css
@import "tailwindcss";

@theme {
  --color-ink: #0a0a0a;
  --color-coal: #141414;
  --color-paper: #f5f5f4;
  --color-mist: #a3a3a3;
  --font-display: "Syne", sans-serif;
  --font-body: "Inter", sans-serif;
}

html {
  scroll-behavior: smooth;
}

body {
  background-color: var(--color-ink);
  color: var(--color-paper);
  font-family: var(--font-body);
  -webkit-font-smoothing: antialiased;
}

::selection {
  background: var(--color-paper);
  color: var(--color-ink);
}
```

- [ ] **Step 5: Минимальные `src/main.jsx` и `src/App.jsx`** (провайдеры добавятся в задачах 4–5)

`src/main.jsx`:
```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

`src/App.jsx`:
```jsx
export default function App() {
  return <h1 className="font-display text-4xl p-8">MONOCHROME</h1>
}
```

Удалить `src/App.css`, `src/assets/react.svg`, `public/vite.svg` и импорты на них.

- [ ] **Step 6: Добавить script `"test": "vitest run"` в `package.json`, проверить сборку**

Run: `npm run build`
Expected: `vite build` завершается без ошибок, папка `dist/` создана.

- [ ] **Step 7: Создать `.gitignore` (Vite создаёт сам — проверить, что есть `node_modules`, `dist`) и закоммитить**

```powershell
git add -A
git commit -m "chore: scaffold Vite + React + Tailwind v4 + tooling"
```

---

### Task 2: Данные товаров

**Files:**
- Create: `src/data/products.json`
- Test: `src/data/products.test.js`

**Interfaces:**
- Produces: массив товаров. Форма записи: `{ id: string, name: string, category: 'outerwear'|'hoodies'|'tees'|'pants'|'accessories', price: number, sizes: string[], images: string[], description: string, isNew: boolean }`.

- [ ] **Step 1: Написать падающий тест `src/data/products.test.js`**

```js
import { describe, it, expect } from 'vitest'
import products from './products.json'

const CATEGORIES = ['outerwear', 'hoodies', 'tees', 'pants', 'accessories']

describe('products.json', () => {
  it('has at least 12 products', () => {
    expect(products.length).toBeGreaterThanOrEqual(12)
  })
  it('every product has a valid shape', () => {
    for (const p of products) {
      expect(typeof p.id).toBe('string')
      expect(typeof p.name).toBe('string')
      expect(CATEGORIES).toContain(p.category)
      expect(p.price).toBeGreaterThan(0)
      expect(p.sizes.length).toBeGreaterThan(0)
      expect(p.images.length).toBeGreaterThan(0)
      expect(typeof p.description).toBe('string')
      expect(typeof p.isNew).toBe('boolean')
    }
  })
  it('ids are unique', () => {
    const ids = products.map(p => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
```

- [ ] **Step 2: Запустить тест — убедиться, что падает** (`npm test` → FAIL: cannot resolve `./products.json`)

- [ ] **Step 3: Создать `src/data/products.json`**

```json
[
  { "id": "p01", "name": "Oversized Wool Coat", "category": "outerwear", "price": 290, "sizes": ["S", "M", "L", "XL"], "images": ["/media/products/p01-a.jpg", "/media/products/p01-b.jpg"], "description": "Floor-skimming silhouette in dense Italian wool. Dropped shoulders, hidden placket, raw-edge hem.", "isNew": true },
  { "id": "p02", "name": "Leather Biker Jacket", "category": "outerwear", "price": 340, "sizes": ["S", "M", "L", "XL"], "images": ["/media/products/p02-a.jpg", "/media/products/p02-b.jpg"], "description": "Matte black lambskin with asymmetric zip. Cut boxy, worn heavy.", "isNew": true },
  { "id": "p03", "name": "Boxy Hoodie — Shadow", "category": "hoodies", "price": 95, "sizes": ["S", "M", "L", "XL"], "images": ["/media/products/p03-a.jpg", "/media/products/p03-b.jpg"], "description": "480 gsm brushed fleece. Cropped body, oversized hood, tonal embroidery.", "isNew": true },
  { "id": "p04", "name": "Zip Hoodie — Eclipse", "category": "hoodies", "price": 110, "sizes": ["S", "M", "L", "XL"], "images": ["/media/products/p04-a.jpg"], "description": "Full-zip heavyweight hoodie with storm collar and matte hardware.", "isNew": false },
  { "id": "p05", "name": "Heavy Tee — Blank", "category": "tees", "price": 45, "sizes": ["S", "M", "L", "XL"], "images": ["/media/products/p05-a.jpg"], "description": "250 gsm ring-spun cotton. No print, no logo. The blank canvas.", "isNew": false },
  { "id": "p06", "name": "Longsleeve — Static", "category": "tees", "price": 55, "sizes": ["S", "M", "L", "XL"], "images": ["/media/products/p06-a.jpg"], "description": "Slim longsleeve in washed black jersey with thumbhole cuffs.", "isNew": false },
  { "id": "p07", "name": "Oversized Tee — Noir", "category": "tees", "price": 48, "sizes": ["S", "M", "L", "XL"], "images": ["/media/products/p07-a.jpg"], "description": "Drop-shoulder tee in double-faced cotton. Falls like a frame from a film.", "isNew": false },
  { "id": "p08", "name": "Wide Cargo Pants", "category": "pants", "price": 120, "sizes": ["S", "M", "L", "XL"], "images": ["/media/products/p08-a.jpg", "/media/products/p08-b.jpg"], "description": "Parachute-wide leg, six pockets, adjustable hem toggles. Ripstop cotton.", "isNew": true },
  { "id": "p09", "name": "Tailored Wool Trousers", "category": "pants", "price": 135, "sizes": ["S", "M", "L", "XL"], "images": ["/media/products/p09-a.jpg"], "description": "High-rise pleated trousers in charcoal wool. Sharp crease, fluid drape.", "isNew": false },
  { "id": "p10", "name": "Beanie — Mono", "category": "accessories", "price": 35, "sizes": ["ONE"], "images": ["/media/products/p10-a.jpg"], "description": "Ribbed merino beanie with tonal woven label.", "isNew": false },
  { "id": "p11", "name": "Canvas Tote — 01", "category": "accessories", "price": 60, "sizes": ["ONE"], "images": ["/media/products/p11-a.jpg"], "description": "Heavy blackout canvas tote with interior zip pocket. Fits a life.", "isNew": false },
  { "id": "p12", "name": "Wool Scarf — Fog", "category": "accessories", "price": 35, "sizes": ["ONE"], "images": ["/media/products/p12-a.jpg"], "description": "Two meters of graphite boiled wool. Wrap twice, disappear.", "isNew": false }
]
```

- [ ] **Step 4: Запустить тесты — PASS** (`npm test`)

- [ ] **Step 5: Commit**

```powershell
git add src/data
git commit -m "feat: product catalog data with shape tests"
```

---

### Task 3: Утилиты фильтров, сортировки и цены

**Files:**
- Create: `src/utils/catalog.js`
- Test: `src/utils/catalog.test.js`

**Interfaces:**
- Produces:
  - `filterProducts(products, { category, size, maxPrice })` → массив; каждый параметр опционален (`'all'`/`null` = не фильтровать).
  - `sortProducts(products, sort)` где `sort ∈ 'new' | 'price-asc' | 'price-desc'`; возвращает новый массив, не мутируя вход.
  - `formatPrice(n)` → `'$290'`.
  - `cartTotal(cartItems, products)` → число; `cartItems: [{id, size, qty}]`.

- [ ] **Step 1: Написать падающий тест `src/utils/catalog.test.js`**

```js
import { describe, it, expect } from 'vitest'
import { filterProducts, sortProducts, formatPrice, cartTotal } from './catalog'

const P = [
  { id: 'a', price: 100, category: 'tees', sizes: ['S', 'M'], isNew: false },
  { id: 'b', price: 50, category: 'pants', sizes: ['L'], isNew: true },
  { id: 'c', price: 300, category: 'tees', sizes: ['M'], isNew: true },
]

describe('filterProducts', () => {
  it('filters by category', () => {
    expect(filterProducts(P, { category: 'tees' }).map(p => p.id)).toEqual(['a', 'c'])
  })
  it('filters by size', () => {
    expect(filterProducts(P, { size: 'M' }).map(p => p.id)).toEqual(['a', 'c'])
  })
  it('filters by maxPrice', () => {
    expect(filterProducts(P, { maxPrice: 100 }).map(p => p.id)).toEqual(['a', 'b'])
  })
  it('"all" and empty values are ignored', () => {
    expect(filterProducts(P, { category: 'all', size: 'all', maxPrice: null })).toHaveLength(3)
  })
})

describe('sortProducts', () => {
  it('price-asc', () => {
    expect(sortProducts(P, 'price-asc').map(p => p.id)).toEqual(['b', 'a', 'c'])
  })
  it('price-desc', () => {
    expect(sortProducts(P, 'price-desc').map(p => p.id)).toEqual(['c', 'a', 'b'])
  })
  it('new puts isNew first, keeps original order otherwise', () => {
    expect(sortProducts(P, 'new').map(p => p.id)).toEqual(['b', 'c', 'a'])
  })
  it('does not mutate input', () => {
    const copy = [...P]
    sortProducts(P, 'price-asc')
    expect(P).toEqual(copy)
  })
})

describe('formatPrice', () => {
  it('formats USD', () => expect(formatPrice(290)).toBe('$290'))
})

describe('cartTotal', () => {
  it('sums qty * price by product id', () => {
    const cart = [
      { id: 'a', size: 'S', qty: 2 },
      { id: 'b', size: 'L', qty: 1 },
    ]
    expect(cartTotal(cart, P)).toBe(250)
  })
  it('ignores unknown ids', () => {
    expect(cartTotal([{ id: 'zzz', size: 'S', qty: 5 }], P)).toBe(0)
  })
})
```

- [ ] **Step 2: Запустить — FAIL** (`npm test` → cannot resolve `./catalog`)

- [ ] **Step 3: Реализовать `src/utils/catalog.js`**

```js
export function filterProducts(products, { category, size, maxPrice } = {}) {
  return products.filter(p => {
    if (category && category !== 'all' && p.category !== category) return false
    if (size && size !== 'all' && !p.sizes.includes(size)) return false
    if (maxPrice && p.price > maxPrice) return false
    return true
  })
}

export function sortProducts(products, sort) {
  const arr = [...products]
  if (sort === 'price-asc') return arr.sort((a, b) => a.price - b.price)
  if (sort === 'price-desc') return arr.sort((a, b) => b.price - a.price)
  if (sort === 'new') return arr.sort((a, b) => Number(b.isNew) - Number(a.isNew))
  return arr
}

export function formatPrice(n) {
  return `$${n}`
}

export function cartTotal(cartItems, products) {
  return cartItems.reduce((sum, item) => {
    const product = products.find(p => p.id === item.id)
    return product ? sum + product.price * item.qty : sum
  }, 0)
}
```

- [ ] **Step 4: Запустить — PASS** (`npm test`)

- [ ] **Step 5: Commit**

```powershell
git add src/utils
git commit -m "feat: catalog filter/sort/price utilities"
```

---

### Task 4: Корзина (Context + localStorage)

**Files:**
- Create: `src/context/CartContext.jsx`
- Test: `src/context/CartContext.test.jsx`

**Interfaces:**
- Produces: `<CartProvider>`, хук `useCart()` → `{ items, addItem(id, size), removeItem(id, size), setQty(id, size, qty), clear(), count, isOpen, openCart(), closeCart() }`. `items: [{id, size, qty}]`. `addItem` открывает drawer (`isOpen = true`). Хранение — localStorage ключ `monochrome-cart`.

- [ ] **Step 1: Написать падающий тест `src/context/CartContext.test.jsx`**

```jsx
import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { CartProvider, useCart } from './CartContext'

const wrapper = ({ children }) => <CartProvider>{children}</CartProvider>

beforeEach(() => localStorage.clear())

describe('cart', () => {
  it('adds items and merges same id+size', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    act(() => result.current.addItem('p01', 'M'))
    act(() => result.current.addItem('p01', 'M'))
    act(() => result.current.addItem('p01', 'L'))
    expect(result.current.items).toEqual([
      { id: 'p01', size: 'M', qty: 2 },
      { id: 'p01', size: 'L', qty: 1 },
    ])
    expect(result.current.count).toBe(3)
  })

  it('addItem opens the drawer', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    expect(result.current.isOpen).toBe(false)
    act(() => result.current.addItem('p01', 'M'))
    expect(result.current.isOpen).toBe(true)
  })

  it('setQty updates and removes at qty < 1', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    act(() => result.current.addItem('p01', 'M'))
    act(() => result.current.setQty('p01', 'M', 5))
    expect(result.current.items[0].qty).toBe(5)
    act(() => result.current.setQty('p01', 'M', 0))
    expect(result.current.items).toHaveLength(0)
  })

  it('persists to localStorage and restores', () => {
    const first = renderHook(() => useCart(), { wrapper })
    act(() => first.result.current.addItem('p02', 'S'))
    first.unmount()
    const second = renderHook(() => useCart(), { wrapper })
    expect(second.result.current.items).toEqual([{ id: 'p02', size: 'S', qty: 1 }])
  })

  it('clear empties the cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    act(() => result.current.addItem('p01', 'M'))
    act(() => result.current.clear())
    expect(result.current.items).toHaveLength(0)
  })
})
```

- [ ] **Step 2: Запустить — FAIL**

- [ ] **Step 3: Реализовать `src/context/CartContext.jsx`**

```jsx
import { createContext, useContext, useEffect, useState } from 'react'

const CartContext = createContext(null)
const STORAGE_KEY = 'monochrome-cart'

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const addItem = (id, size) => {
    setItems(prev => {
      const found = prev.find(i => i.id === id && i.size === size)
      if (found) {
        return prev.map(i => (i === found ? { ...i, qty: i.qty + 1 } : i))
      }
      return [...prev, { id, size, qty: 1 }]
    })
    setIsOpen(true)
  }

  const removeItem = (id, size) =>
    setItems(prev => prev.filter(i => !(i.id === id && i.size === size)))

  const setQty = (id, size, qty) => {
    if (qty < 1) return removeItem(id, size)
    setItems(prev => prev.map(i => (i.id === id && i.size === size ? { ...i, qty } : i)))
  }

  const clear = () => setItems([])
  const count = items.reduce((sum, i) => sum + i.qty, 0)

  const value = {
    items, addItem, removeItem, setQty, clear, count,
    isOpen, openCart: () => setIsOpen(true), closeCart: () => setIsOpen(false),
  }
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
```

- [ ] **Step 4: Запустить — PASS** (`npm test`)

- [ ] **Step 5: Commit**

```powershell
git add src/context
git commit -m "feat: cart context with localStorage persistence"
```

---

### Task 5: Генерация медиа в Higgsfield

> Эта задача выполняется через Higgsfield MCP-инструменты (`generate_image`, `generate_video`, `job_status`). Перед генерацией проверить баланс (`balance`) и при сомнениях в выборе модели вызвать `models_explore(action:'recommend')`. Генерации асинхронные — запускать пачками, опрашивать статус, скачивать результат по URL в `public/media/`.

**Files:**
- Create: `public/media/hero.mp4`, `public/media/hero-poster.jpg`
- Create: `public/media/lookbook-1.mp4`, `public/media/lookbook-2.mp4` (постеры — `campaign-1.jpg`, `campaign-2.jpg`)
- Create: `public/media/campaign-1.jpg` … `campaign-4.jpg`
- Create: `public/media/products/p01-a.jpg` … `p12-a.jpg` + `p01-b.jpg`, `p02-b.jpg`, `p03-b.jpg`, `p08-b.jpg` (16 файлов)

**Interfaces:**
- Produces: все файлы по путям, на которые ссылаются `products.json` и страницы (hero, campaign, lookbook).

**Единый стиль-префикс для всех изображений (арт-дирекшн):**

> `High-fashion editorial photography, dark cinematic aesthetic, black and graphite studio backdrop, dramatic directional lighting, film grain, muted monochrome palette, shot on medium format, Vogue editorial style.`

- [ ] **Step 1: Проверить баланс и рекомендованные модели** (`balance`, `models_explore` для fashion editorial photo и image2video)

- [ ] **Step 2: Сгенерировать 16 фото товаров** (`generate_image`, aspect 3:4, батчами). Промпты = стиль-префикс + предметная часть:

| Файл | Предметная часть промпта |
|---|---|
| p01-a | full-body model wearing an oversized floor-length black wool coat, front view |
| p01-b | close-up detail of black wool coat fabric texture and hidden placket |
| p02-a | model wearing a matte black leather biker jacket with asymmetric zip, three-quarter view |
| p02-b | close-up of leather jacket zipper and collar detail |
| p03-a | model in a boxy cropped black hoodie with oversized hood, front view |
| p03-b | back view of boxy black hoodie, hood up, dramatic rim light |
| p04-a | model in a black full-zip heavyweight hoodie with storm collar |
| p05-a | model in a plain heavyweight black t-shirt, minimalist pose |
| p06-a | model in a slim washed-black longsleeve with thumbhole cuffs |
| p07-a | model in an oversized drop-shoulder black t-shirt, flowing fabric |
| p08-a | model wearing wide parachute cargo pants in black ripstop, full body |
| p08-b | detail shot of cargo pants pockets and hem toggles |
| p09-a | model in high-rise pleated charcoal wool trousers, sharp crease |
| p10-a | ribbed black merino beanie on a model, tight head-and-shoulders portrait |
| p11-a | heavy black canvas tote bag held by a model, studio still |
| p12-a | model wrapped in a long graphite boiled-wool scarf, wind-blown |

- [ ] **Step 3: Сгенерировать 4 кампейн-кадра + hero-постер** (aspect 16:9 для hero-poster, 3:4 или 4:5 для campaign):
  - `hero-poster.jpg`: group of three models in black MONOCHROME outerwear walking toward camera through fog, wide cinematic shot
  - `campaign-1.jpg`: model in oversized coat standing in an empty concrete hall, single spotlight
  - `campaign-2.jpg`: two models back to back in hoodies, hard shadow play on wall
  - `campaign-3.jpg`: model seated on a metal stool in full look, editorial pose
  - `campaign-4.jpg`: extreme close-up portrait, model in beanie and scarf, chiaroscuro light

- [ ] **Step 4: Сгенерировать 3 видео** (`generate_video`, image-to-video от готовых кадров, 5s, без звука):
  - `hero.mp4` ← из `hero-poster.jpg`: slow cinematic dolly-in, models walking, fog drifting
  - `lookbook-1.mp4` ← из `campaign-1.jpg`: slow camera orbit, fabric moving in air current
  - `lookbook-2.mp4` ← из `campaign-2.jpg`: models slowly turning heads, shadows shifting

- [ ] **Step 5: Скачать все файлы в `public/media/`** (PowerShell `Invoke-WebRequest -Uri <url> -OutFile public/media/...`), проверить: 16 файлов в `products/`, 5 jpg + 3 mp4 в корне `media/`.

- [ ] **Step 6: Commit**

```powershell
git add public/media
git commit -m "feat: AI-generated media assets (Higgsfield)"
```

---

### Task 6: Каркас приложения — роутер, Header, Footer, Reveal

**Files:**
- Create: `src/components/Header.jsx`, `src/components/Footer.jsx`, `src/components/Reveal.jsx`
- Create: `src/pages/Home.jsx`, `src/pages/Catalog.jsx`, `src/pages/Product.jsx`, `src/pages/Lookbook.jsx` (пока заглушки-заголовки)
- Modify: `src/App.jsx`, `src/main.jsx`

**Interfaces:**
- Consumes: `useCart()` из Task 4 (счётчик, `openCart`).
- Produces: маршруты `/`, `/catalog`, `/product/:id`, `/lookbook`; компонент `<Reveal delay?>` (framer-обёртка «появление при скролле») — используется всеми страницами.

- [ ] **Step 1: `src/main.jsx` — подключить Router и CartProvider**

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { CartProvider } from './context/CartContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <CartProvider>
        <App />
      </CartProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
```

- [ ] **Step 2: `src/App.jsx` — маршруты, скролл-ресет, каркас**

```jsx
import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import Product from './pages/Product'
import Lookbook from './pages/Lookbook'

export default function App() {
  const { pathname } = useLocation()
  useEffect(() => window.scrollTo(0, 0), [pathname])

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/product/:id" element={<Product />} />
          <Route path="/lookbook" element={<Lookbook />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
```

- [ ] **Step 3: `src/components/Header.jsx`**

```jsx
import { Link, NavLink } from 'react-router-dom'
import { useCart } from '../context/CartContext'

const nav = [
  { to: '/catalog', label: 'Catalog' },
  { to: '/lookbook', label: 'Lookbook' },
]

export default function Header() {
  const { count, openCart } = useCart()
  return (
    <header className="fixed top-0 inset-x-0 z-40 mix-blend-difference text-paper">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="font-display font-800 tracking-[0.3em] text-lg">
          MONOCHROME
        </Link>
        <nav className="flex items-center gap-6 text-sm uppercase tracking-widest">
          {nav.map(n => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                `hover:opacity-60 transition-opacity ${isActive ? 'underline underline-offset-8' : ''}`
              }
            >
              {n.label}
            </NavLink>
          ))}
          <button
            onClick={openCart}
            className="hover:opacity-60 transition-opacity cursor-pointer uppercase tracking-widest"
            aria-label="Open cart"
          >
            Cart ({count})
          </button>
        </nav>
      </div>
    </header>
  )
}
```

- [ ] **Step 4: `src/components/Footer.jsx`**

```jsx
export default function Footer() {
  return (
    <footer className="border-t border-white/10 mt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 flex flex-col sm:flex-row gap-4 items-center justify-between text-xs text-mist uppercase tracking-widest">
        <span className="font-display tracking-[0.3em] text-paper">MONOCHROME</span>
        <span>Concept store — portfolio project. No real orders.</span>
        <span>© 2026</span>
      </div>
    </footer>
  )
}
```

- [ ] **Step 5: `src/components/Reveal.jsx`**

```jsx
import { motion } from 'framer-motion'

export default function Reveal({ children, delay = 0, className = '' }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
```

- [ ] **Step 6: Страницы-заглушки** (одинаковый паттерн, свой заголовок):

```jsx
export default function Home() {
  return <div className="pt-32 px-6 font-display text-3xl">Home</div>
}
```
(аналогично `Catalog.jsx` → `Catalog`, `Product.jsx` → `Product`, `Lookbook.jsx` → `Lookbook`)

- [ ] **Step 7: Проверить**: `npm run dev` — навигация по 4 маршрутам работает, счётчик Cart (0) в шапке. `npm test` — прежние тесты зелёные. `npm run build` — ок.

- [ ] **Step 8: Commit** — `git add -A; git commit -m "feat: app shell — routing, header, footer, reveal animation"`

---

### Task 7: Корзина-drawer с фейковым чекаутом

**Files:**
- Create: `src/components/CartDrawer.jsx`
- Modify: `src/App.jsx` (вставить `<CartDrawer />` после `<Footer />`)

**Interfaces:**
- Consumes: `useCart()`, `cartTotal`, `formatPrice`, `products.json`.
- Produces: drawer со стадиями `cart → checkout → done`. Кнопка Checkout видна при непустой корзине; форма (name, email, address — все `required`); после submit — `clear()` и экран «Order placed».

- [ ] **Step 1: Реализовать `src/components/CartDrawer.jsx`**

```jsx
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useCart } from '../context/CartContext'
import { cartTotal, formatPrice } from '../utils/catalog'
import products from '../data/products.json'

export default function CartDrawer() {
  const { items, isOpen, closeCart, setQty, removeItem, clear } = useCart()
  const [stage, setStage] = useState('cart') // 'cart' | 'checkout' | 'done'
  const total = cartTotal(items, products)

  const close = () => {
    closeCart()
    setTimeout(() => setStage('cart'), 300)
  }

  const submitOrder = e => {
    e.preventDefault()
    clear()
    setStage('done')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/60 z-50"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={close}
          />
          <motion.aside
            className="fixed right-0 top-0 h-full w-full max-w-md bg-coal z-50 flex flex-col"
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            role="dialog" aria-label="Shopping cart"
          >
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="font-display text-lg tracking-widest uppercase">
                {stage === 'checkout' ? 'Checkout' : stage === 'done' ? 'Thank you' : 'Cart'}
              </h2>
              <button onClick={close} className="text-mist hover:text-paper cursor-pointer" aria-label="Close cart">✕</button>
            </div>

            {stage === 'cart' && (
              <>
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {items.length === 0 && <p className="text-mist">Your cart is empty.</p>}
                  {items.map(item => {
                    const p = products.find(x => x.id === item.id)
                    if (!p) return null
                    return (
                      <div key={`${item.id}-${item.size}`} className="flex gap-4">
                        <img src={p.images[0]} alt={p.name} className="w-20 h-24 object-cover" loading="lazy" />
                        <div className="flex-1">
                          <p className="text-sm">{p.name}</p>
                          <p className="text-xs text-mist mt-1">Size {item.size} · {formatPrice(p.price)}</p>
                          <div className="flex items-center gap-3 mt-2 text-sm">
                            <button onClick={() => setQty(item.id, item.size, item.qty - 1)} className="w-6 h-6 border border-white/20 cursor-pointer" aria-label="Decrease quantity">−</button>
                            <span>{item.qty}</span>
                            <button onClick={() => setQty(item.id, item.size, item.qty + 1)} className="w-6 h-6 border border-white/20 cursor-pointer" aria-label="Increase quantity">+</button>
                            <button onClick={() => removeItem(item.id, item.size)} className="ml-auto text-xs text-mist hover:text-paper cursor-pointer uppercase">Remove</button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
                {items.length > 0 && (
                  <div className="p-6 border-t border-white/10 space-y-4">
                    <div className="flex justify-between text-sm uppercase tracking-widest">
                      <span>Total</span><span>{formatPrice(total)}</span>
                    </div>
                    <button onClick={() => setStage('checkout')} className="w-full bg-paper text-ink py-3 uppercase tracking-widest text-sm hover:bg-mist transition-colors cursor-pointer">
                      Checkout
                    </button>
                  </div>
                )}
              </>
            )}

            {stage === 'checkout' && (
              <form onSubmit={submitOrder} className="flex-1 p-6 space-y-4 overflow-y-auto">
                {[
                  { name: 'name', label: 'Full name', type: 'text' },
                  { name: 'email', label: 'Email', type: 'email' },
                  { name: 'address', label: 'Address', type: 'text' },
                ].map(f => (
                  <label key={f.name} className="block text-xs uppercase tracking-widest text-mist">
                    {f.label}
                    <input
                      name={f.name} type={f.type} required
                      className="mt-2 w-full bg-transparent border border-white/20 p-3 text-paper text-sm focus:border-paper outline-none"
                    />
                  </label>
                ))}
                <div className="flex justify-between text-sm uppercase tracking-widest pt-4">
                  <span>Total</span><span>{formatPrice(total)}</span>
                </div>
                <button type="submit" className="w-full bg-paper text-ink py-3 uppercase tracking-widest text-sm hover:bg-mist transition-colors cursor-pointer">
                  Place order
                </button>
                <p className="text-xs text-mist">Demo checkout — no payment, no data stored.</p>
              </form>
            )}

            {stage === 'done' && (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6 text-center">
                <p className="font-display text-2xl tracking-widest uppercase">Order placed</p>
                <p className="text-sm text-mist">This is a portfolio demo — nothing was charged.</p>
                <button onClick={close} className="mt-4 border border-white/20 px-8 py-3 uppercase tracking-widest text-sm hover:border-paper transition-colors cursor-pointer">
                  Continue
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
```

- [ ] **Step 2: Подключить в `src/App.jsx`** — импорт и `<CartDrawer />` последним элементом обёртки.

- [ ] **Step 3: Ручная проверка** (`npm run dev`): открыть drawer из шапки; пустая корзина показывает «Your cart is empty»; чекаут-форма валидирует пустые поля; после submit — «Order placed», корзина пуста и после F5.

- [ ] **Step 4: `npm test` зелёный, commit** — `git commit -m "feat: cart drawer with fake checkout flow"`

---

### Task 8: Карточка товара (компонент) + Главная страница

**Files:**
- Create: `src/components/ProductCard.jsx`
- Modify: `src/pages/Home.jsx`

**Interfaces:**
- Consumes: `Reveal`, `formatPrice`, медиа из Task 5.
- Produces: `<ProductCard product />` — ссылка на `/product/:id`, hover-смена фото (если есть `images[1]`), бейдж NEW. Используется в Home, Catalog, Product (related).

- [ ] **Step 1: `src/components/ProductCard.jsx`**

```jsx
import { Link } from 'react-router-dom'
import { formatPrice } from '../utils/catalog'

export default function ProductCard({ product }) {
  const [main, alt] = product.images
  return (
    <Link to={`/product/${product.id}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden bg-coal">
        <img
          src={main} alt={product.name} loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {alt && (
          <img
            src={alt} alt="" loading="lazy" aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />
        )}
        {product.isNew && (
          <span className="absolute top-3 left-3 bg-paper text-ink text-[10px] uppercase tracking-widest px-2 py-1">
            New
          </span>
        )}
      </div>
      <div className="mt-3 flex items-baseline justify-between text-sm">
        <span>{product.name}</span>
        <span className="text-mist">{formatPrice(product.price)}</span>
      </div>
    </Link>
  )
}
```

- [ ] **Step 2: `src/pages/Home.jsx`** — hero-видео, «New Collection», лента кампейн-кадров, CTA:

```jsx
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import products from '../data/products.json'
import ProductCard from '../components/ProductCard'
import Reveal from '../components/Reveal'

const campaigns = ['/media/campaign-1.jpg', '/media/campaign-2.jpg', '/media/campaign-3.jpg', '/media/campaign-4.jpg']

export default function Home() {
  const featured = products.filter(p => p.isNew)
  return (
    <>
      <section className="relative h-svh overflow-hidden">
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src="/media/hero.mp4" poster="/media/hero-poster.jpg"
          autoPlay muted loop playsInline preload="metadata"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/40" />
        <div className="relative h-full flex flex-col items-center justify-end pb-24 text-center px-6">
          <motion.h1
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-5xl sm:text-7xl md:text-8xl tracking-[0.2em]"
          >
            MONOCHROME
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.8 }}
            className="mt-4 text-mist uppercase tracking-[0.4em] text-xs sm:text-sm"
          >
            Cinematic essentials — FW26
          </motion.p>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 1.2 }}>
            <Link to="/catalog" className="mt-8 inline-block border border-paper/40 px-10 py-4 uppercase tracking-[0.3em] text-xs hover:bg-paper hover:text-ink transition-colors">
              Shop the collection
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-24">
        <Reveal>
          <h2 className="font-display text-2xl sm:text-3xl uppercase tracking-widest mb-10">New collection</h2>
        </Reveal>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {featured.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.08}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
      </section>

      <section className="py-12">
        <div className="flex gap-4 overflow-x-auto px-4 sm:px-6 snap-x">
          {campaigns.map(src => (
            <img
              key={src} src={src} alt="MONOCHROME campaign" loading="lazy"
              className="h-[60vh] w-auto object-cover snap-start shrink-0"
            />
          ))}
        </div>
        <Reveal className="text-center mt-10">
          <Link to="/lookbook" className="uppercase tracking-[0.3em] text-xs border-b border-mist pb-1 hover:text-mist transition-colors">
            View lookbook
          </Link>
        </Reveal>
      </section>
    </>
  )
}
```

- [ ] **Step 3: Проверить в браузере** — hero-видео играет, 4 новинки с hover-сменой фото, лента скроллится. `npm run build` ок.

- [ ] **Step 4: Commit** — `git commit -m "feat: home page with hero video and product card"`

---

### Task 9: Каталог с фильтрами в URL

**Files:**
- Modify: `src/pages/Catalog.jsx`

**Interfaces:**
- Consumes: `filterProducts`, `sortProducts`, `ProductCard`, `Reveal`.
- Produces: страница `/catalog`; состояние фильтров в search params: `?category=&size=&max=&sort=` (пустое значение = параметр удалён из URL).

- [ ] **Step 1: Реализовать `src/pages/Catalog.jsx`**

```jsx
import { useSearchParams } from 'react-router-dom'
import products from '../data/products.json'
import { filterProducts, sortProducts } from '../utils/catalog'
import ProductCard from '../components/ProductCard'
import Reveal from '../components/Reveal'

const CATEGORIES = ['all', 'outerwear', 'hoodies', 'tees', 'pants', 'accessories']
const SIZES = ['all', 'S', 'M', 'L', 'XL', 'ONE']
const PRICES = [
  { value: '', label: 'Any price' },
  { value: '50', label: 'Under $50' },
  { value: '100', label: 'Under $100' },
  { value: '150', label: 'Under $150' },
]
const SORTS = [
  { value: 'new', label: 'New first' },
  { value: 'price-asc', label: 'Price ↑' },
  { value: 'price-desc', label: 'Price ↓' },
]

export default function Catalog() {
  const [params, setParams] = useSearchParams()
  const category = params.get('category') || 'all'
  const size = params.get('size') || 'all'
  const max = params.get('max') || ''
  const sort = params.get('sort') || 'new'

  const setParam = (key, value, defaultValue) => {
    const next = new URLSearchParams(params)
    if (!value || value === defaultValue) next.delete(key)
    else next.set(key, value)
    setParams(next, { replace: true })
  }

  const shown = sortProducts(
    filterProducts(products, { category, size, maxPrice: max ? Number(max) : null }),
    sort,
  )

  const selectCls = 'bg-ink border border-white/20 px-3 py-2 text-xs uppercase tracking-widest focus:border-paper outline-none cursor-pointer'

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-28 pb-16">
      <Reveal>
        <h1 className="font-display text-3xl sm:text-4xl uppercase tracking-widest">Catalog</h1>
      </Reveal>

      <div className="mt-8 flex flex-wrap gap-3 items-center">
        <select aria-label="Category" value={category} onChange={e => setParam('category', e.target.value, 'all')} className={selectCls}>
          {CATEGORIES.map(c => <option key={c} value={c}>{c === 'all' ? 'All categories' : c}</option>)}
        </select>
        <select aria-label="Size" value={size} onChange={e => setParam('size', e.target.value, 'all')} className={selectCls}>
          {SIZES.map(s => <option key={s} value={s}>{s === 'all' ? 'All sizes' : s}</option>)}
        </select>
        <select aria-label="Max price" value={max} onChange={e => setParam('max', e.target.value, '')} className={selectCls}>
          {PRICES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
        <select aria-label="Sort" value={sort} onChange={e => setParam('sort', e.target.value, 'new')} className={`${selectCls} ml-auto`}>
          {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      <p className="mt-6 text-xs text-mist uppercase tracking-widest">{shown.length} items</p>

      <div className="mt-6 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {shown.map((p, i) => (
          <Reveal key={p.id} delay={Math.min(i * 0.05, 0.3)}>
            <ProductCard product={p} />
          </Reveal>
        ))}
      </div>

      {shown.length === 0 && (
        <p className="mt-16 text-center text-mist">Nothing matches these filters.</p>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Проверить**: фильтры меняют URL (`/catalog?category=tees&sort=price-asc`), прямой заход по такой ссылке восстанавливает состояние, пустой результат показывает заглушку. `npm test`, `npm run build` — ок.

- [ ] **Step 3: Commit** — `git commit -m "feat: catalog page with URL-driven filters and sorting"`

---

### Task 10: Страница товара

**Files:**
- Modify: `src/pages/Product.jsx`

**Interfaces:**
- Consumes: `useCart().addItem`, `formatPrice`, `ProductCard`, `Reveal`.
- Produces: страница `/product/:id` — галерея, выбор размера (обязателен до добавления), «Add to cart», блок «Wear it with» (до 4 товаров той же категории, исключая текущий; если меньше — добить другими товарами).

- [ ] **Step 1: Реализовать `src/pages/Product.jsx`**

```jsx
import { useParams, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import products from '../data/products.json'
import { formatPrice } from '../utils/catalog'
import { useCart } from '../context/CartContext'
import ProductCard from '../components/ProductCard'
import Reveal from '../components/Reveal'

export default function Product() {
  const { id } = useParams()
  const product = products.find(p => p.id === id)
  const { addItem } = useCart()
  const [size, setSize] = useState(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    setSize(product && product.sizes.length === 1 ? product.sizes[0] : null)
    setError(false)
  }, [id])

  if (!product) {
    return (
      <div className="pt-40 text-center">
        <p className="font-display text-2xl uppercase tracking-widest">Not found</p>
        <Link to="/catalog" className="text-mist text-sm underline underline-offset-4 mt-4 inline-block">
          Back to catalog
        </Link>
      </div>
    )
  }

  const related = [
    ...products.filter(p => p.category === product.category && p.id !== product.id),
    ...products.filter(p => p.category !== product.category),
  ].slice(0, 4)

  const add = () => {
    if (!size) return setError(true)
    addItem(product.id, size)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-28 pb-16">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
        <div className="space-y-4">
          {product.images.map(src => (
            <img key={src} src={src} alt={product.name} loading="lazy" className="w-full aspect-[3/4] object-cover bg-coal" />
          ))}
        </div>

        <div className="md:sticky md:top-28 self-start">
          <Reveal>
            {product.isNew && <span className="text-[10px] uppercase tracking-widest bg-paper text-ink px-2 py-1">New</span>}
            <h1 className="font-display text-3xl sm:text-4xl uppercase tracking-wide mt-4">{product.name}</h1>
            <p className="mt-2 text-xl text-mist">{formatPrice(product.price)}</p>
            <p className="mt-6 text-sm leading-relaxed text-paper/80 max-w-md">{product.description}</p>

            <div className="mt-8">
              <p className="text-xs uppercase tracking-widest text-mist mb-3">Size</p>
              <div className="flex gap-2 flex-wrap">
                {product.sizes.map(s => (
                  <button
                    key={s}
                    onClick={() => { setSize(s); setError(false) }}
                    className={`min-w-12 px-3 py-3 border text-sm cursor-pointer transition-colors ${
                      size === s ? 'border-paper bg-paper text-ink' : 'border-white/20 hover:border-paper'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              {error && <p className="mt-2 text-xs text-red-400 uppercase tracking-widest">Select a size first</p>}
            </div>

            <button onClick={add} className="mt-8 w-full sm:w-80 bg-paper text-ink py-4 uppercase tracking-[0.3em] text-xs hover:bg-mist transition-colors cursor-pointer">
              Add to cart — {formatPrice(product.price)}
            </button>
          </Reveal>
        </div>
      </div>

      <section className="mt-24">
        <Reveal>
          <h2 className="font-display text-xl uppercase tracking-widest mb-8">Wear it with</h2>
        </Reveal>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {related.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>
    </div>
  )
}
```

- [ ] **Step 2: Проверить**: `/product/p01` — галерея из 2 фото, «Add to cart» без размера показывает ошибку, с размером — открывает drawer с товаром; `/product/p10` — размер ONE выбран автоматически; `/product/nope` — «Not found». `npm run build` ок.

- [ ] **Step 3: Commit** — `git commit -m "feat: product detail page with size selection"`

---

### Task 11: Lookbook

**Files:**
- Modify: `src/pages/Lookbook.jsx`

**Interfaces:**
- Consumes: `Reveal`, медиа из Task 5 (`lookbook-1.mp4`, `lookbook-2.mp4`, `campaign-1..4.jpg`).
- Produces: редакторская страница `/lookbook` — чередование полноэкранных видео и кадров со scroll-анимациями, CTA в каталог.

- [ ] **Step 1: Реализовать `src/pages/Lookbook.jsx`**

```jsx
import { Link } from 'react-router-dom'
import Reveal from '../components/Reveal'

const blocks = [
  { type: 'video', src: '/media/lookbook-1.mp4', poster: '/media/campaign-1.jpg', caption: 'I. Presence' },
  { type: 'image', src: '/media/campaign-3.jpg', caption: 'II. Stillness' },
  { type: 'video', src: '/media/lookbook-2.mp4', poster: '/media/campaign-2.jpg', caption: 'III. Contrast' },
  { type: 'image', src: '/media/campaign-4.jpg', caption: 'IV. Close' },
]

export default function Lookbook() {
  return (
    <div className="pt-16">
      <div className="py-20 text-center px-6">
        <Reveal>
          <h1 className="font-display text-4xl sm:text-6xl uppercase tracking-[0.2em]">FW26 Lookbook</h1>
          <p className="mt-4 text-mist uppercase tracking-[0.4em] text-xs">Cinematic essentials</p>
        </Reveal>
      </div>

      <div className="space-y-6">
        {blocks.map(b => (
          <Reveal key={b.src}>
            <figure className="relative">
              {b.type === 'video' ? (
                <video
                  src={b.src} poster={b.poster}
                  autoPlay muted loop playsInline preload="metadata"
                  className="w-full h-[80vh] object-cover"
                />
              ) : (
                <img src={b.src} alt={b.caption} loading="lazy" className="w-full h-[80vh] object-cover" />
              )}
              <figcaption className="absolute bottom-6 left-6 font-display uppercase tracking-[0.3em] text-sm mix-blend-difference">
                {b.caption}
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>

      <div className="py-24 text-center">
        <Reveal>
          <Link to="/catalog" className="border border-paper/40 px-10 py-4 uppercase tracking-[0.3em] text-xs hover:bg-paper hover:text-ink transition-colors">
            Shop the collection
          </Link>
        </Reveal>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Проверить**: видео играют, блоки появляются при скролле. `npm run build` ок.

- [ ] **Step 3: Commit** — `git commit -m "feat: lookbook editorial page"`

---

### Task 12: Полировка, деплой-конфиг, README

**Files:**
- Create: `vercel.json`, `public/_redirects`, `README.md`

**Interfaces:**
- Produces: SPA-fallback для Vercel и Netlify; README с описанием проекта и скриптами.

- [ ] **Step 1: SPA-fallback**

`vercel.json`:
```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

`public/_redirects`:
```
/* /index.html 200
```

- [ ] **Step 2: Пройти сайт целиком** на десктопной и мобильной ширине (DevTools, 375px): шапка не перекрывает контент, drawer на мобильном во всю ширину, сетки складываются в 2 колонки, hero-видео покрывает экран. Исправить найденные мелочи.

- [ ] **Step 3: `README.md`**

```markdown
# MONOCHROME — concept fashion store

Portfolio project: a cinematic fashion e-commerce SPA.
All visuals (photos & videos) are AI-generated with Higgsfield.

## Stack
React 18 · Vite · Tailwind CSS v4 · Framer Motion · React Router · Vitest

## Features
- Full-screen AI hero video, editorial lookbook
- Catalog with URL-driven filters (category / size / price / sort)
- Product pages with size selection
- Cart drawer with localStorage persistence and demo checkout

## Run
npm install
npm run dev

## Test & build
npm test
npm run build
```

- [ ] **Step 4: Финальная проверка**: `npm test` (все зелёные), `npm run build` (без ошибок), `npm run preview` — прокликать все страницы на собранной версии.

- [ ] **Step 5: Commit** — `git add -A; git commit -m "chore: deploy config, README, responsive polish"`
