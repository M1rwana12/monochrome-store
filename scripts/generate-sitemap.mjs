// Generates public/sitemap.xml and public/robots.txt from the product catalog.
// Runs automatically before every build (see "prebuild" script).
import { readFile, writeFile } from 'node:fs/promises'

const SITE_URL = 'https://monochrome-store-117848350117.europe-central2.run.app'

const products = JSON.parse(await readFile('src/data/products.json', 'utf8'))

const staticRoutes = ['/', '/catalog', '/lookbook']
const routes = [...staticRoutes, ...products.map(p => `/product/${p.id}`)]

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map(r => `  <url><loc>${SITE_URL}${r}</loc></url>`).join('\n')}
</urlset>
`

const robots = `User-agent: *
Allow: /
Disallow: /admin

Sitemap: ${SITE_URL}/sitemap.xml
`

await writeFile('public/sitemap.xml', sitemap)
await writeFile('public/robots.txt', robots)
console.log(`sitemap.xml: ${routes.length} URLs, robots.txt written`)
