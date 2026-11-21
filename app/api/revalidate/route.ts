import { timingSafeEqual } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { clearCategoriesCache } from '@/lib/categories';

// Chamado pelo gatilho do Supabase sempre que um artigo é criado, editado ou
// excluído. Invalida o cache de todas as páginas: cada uma é refeita na próxima
// visita, então um artigo novo aparece na hora, com SEO e prévia corretos.
export const dynamic = 'force-dynamic';

const isAuthorized = (req: Request): boolean => {
  const expected = process.env.REVALIDATE_SECRET;
  if (!expected) return false;

  const header = req.headers.get('authorization') || '';
  const received = header.startsWith('Bearer ') ? header.slice(7) : '';

  const a = Buffer.from(received);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
};

export async function POST(req: Request) {
  if (!isAuthorized(req)) {
    return Response.json({ ok: false }, { status: 401 });
  }

  clearCategoriesCache();
  // Home, artigos, editorias e o layout (menu de editorias do rodapé).
  revalidatePath('/', 'layout');
  // Sitemaps são route handlers: invalidados explicitamente.
  revalidatePath('/sitemap.xml');
  revalidatePath('/news-sitemap.xml');

  return Response.json({ ok: true, revalidatedAt: new Date().toISOString() });
}
