import { NextRequest } from 'next/server'

export function GET(_req: NextRequest, { params }: { params: { width: string; height: string } }) {
  const w = Math.max(1, parseInt(params.width, 10) || 300)
  const h = Math.max(1, parseInt(params.height, 10) || 150)
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#f3f4f6"/>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#9ca3af" font-family="Arial, sans-serif" font-size="14">${w}×${h}</text>
  <rect x="0" y="0" width="100%" height="100%" fill="none" stroke="#e5e7eb"/>
</svg>`
  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400, immutable',
    },
  })
}
