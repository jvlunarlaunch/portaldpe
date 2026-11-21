import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Roda como servidor Node (Docker na VPS). As páginas são geradas sob demanda
  // e ficam em cache (ISR); a rota /api/revalidate/ atualiza na hora quando um
  // artigo muda no admin.
  output: 'standalone',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
