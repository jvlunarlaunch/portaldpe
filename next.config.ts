import type { NextConfig } from 'next';

// Só o Storage do Supabase entra no otimizador de imagens (ver lib/image.ts).
const supabaseUrl = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || '');
  } catch {
    return null;
  }
})();

const nextConfig: NextConfig = {
  // Roda como servidor Node (Docker na VPS). As páginas são geradas sob demanda
  // e ficam em cache (ISR); a rota /api/revalidate/ atualiza na hora quando um
  // artigo muda no admin.
  output: 'standalone',
  trailingSlash: true,
  images: {
    // O servidor redimensiona e converte para WebP; o resultado fica em cache
    // em .next/cache/images. AVIF ficou de fora: comprime um pouco mais, mas
    // gasta bem mais CPU/memória no container de 1 GB.
    // As capas não mudam depois de enviadas (nome único no upload).
    minimumCacheTTL: 60 * 60 * 24 * 7,
    remotePatterns: supabaseUrl
      ? [
          {
            protocol: 'https',
            hostname: supabaseUrl.hostname,
            pathname: '/storage/v1/object/public/**',
          },
        ]
      : [],
  },
};

export default nextConfig;
