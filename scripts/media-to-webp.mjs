// Converts all JPEGs in public/media to WebP (quality 82).
// hero-poster.jpg is kept alongside its WebP copy — Open Graph scrapers need JPEG.
// Usage: node scripts/media-to-webp.mjs
import sharp from 'sharp'
import { readdir, stat, unlink } from 'node:fs/promises'
import { join } from 'node:path'

const root = process.cwd()
const dirs = [join(root, 'public/media'), join(root, 'public/media/products')]
let totalBefore = 0
let totalAfter = 0

for (const dir of dirs) {
  const files = (await readdir(dir)).filter(f => f.endsWith('.jpg'))
  for (const f of files) {
    const src = join(dir, f)
    const out = src.replace(/\.jpg$/, '.webp')
    const before = (await stat(src)).size
    await sharp(src).webp({ quality: 82 }).toFile(out)
    const after = (await stat(out)).size
    totalBefore += before
    totalAfter += after
    console.log(`${f} -> webp  ${(before / 1024).toFixed(0)}KB -> ${(after / 1024).toFixed(0)}KB`)
    if (f !== 'hero-poster.jpg') await unlink(src)
  }
}
console.log(`TOTAL ${(totalBefore / 1024).toFixed(0)}KB -> ${(totalAfter / 1024).toFixed(0)}KB`)
