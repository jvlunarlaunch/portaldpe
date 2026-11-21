/**
 * Quais imagens passam pelo otimizador do Next (redimensiona, converte para
 * WebP/AVIF e guarda em cache na VPS): as do próprio site (/logo.png) e as do
 * Storage do Supabase. Imagens de outros domínios (ex.: link colado no admin)
 * são exibidas como estão, para não abrir o otimizador para qualquer site.
 */
const SUPABASE_HOST = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || '').hostname;
  } catch {
    return '';
  }
})();

export const STORAGE_PATH = '/storage/v1/object/public/';

export const canOptimizeImage = (src?: string | null): boolean => {
  if (!src) return false;
  if (src.startsWith('/') && !src.startsWith('//')) return true;
  if (!SUPABASE_HOST) return false;
  try {
    const url = new URL(src);
    return url.protocol === 'https:' && url.hostname === SUPABASE_HOST && url.pathname.startsWith(STORAGE_PATH);
  } catch {
    return false;
  }
};
