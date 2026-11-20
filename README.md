# Yishu Liu (刘一树) · Academic Personal Homepage

Minimalist, de-containerized bilingual academic homepage (`zh-CN` / `en`) built with **Astro 5**, **Tailwind CSS v4**, and **Bun**.

## Local Development

```bash
# Install dependencies
bun install

# Start local dev server (http://localhost:4321)
bun run dev

# Build static production files into ./dist
bun run build
```

## Updating CV & Content

All bilingual profile information, publications, research experiences, open-source projects, education, honors are centrally maintained in:

- [`src/data/cv.ts`](./src/data/cv.ts)

## Deployment (Cloudflare Pages / Vercel)

- **Build command**: `bun run build`
- **Output directory**: `dist`
- **Custom Domain**: `www.juniortree.com`
